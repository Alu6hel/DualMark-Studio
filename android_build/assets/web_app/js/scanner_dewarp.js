/**
 * DualMark Studio — Dual Optical Decoder & Document Dewarping Engine
 * Scans 1D UPC and 2D GS1 Digital Link barcodes concurrently from live camera or photos.
 * Performs 4-point homography perspective dewarping & document binarization for FDA FSMA records.
 */
(function(window) {
  'use strict';

  function ScannerDewarpStudio(previewCanvas, dewarpCanvas) {
    this.previewCanvas = previewCanvas;
    this.previewCtx = previewCanvas ? previewCanvas.getContext('2d') : null;

    this.dewarpCanvas = dewarpCanvas;
    this.dewarpCtx = dewarpCanvas ? dewarpCanvas.getContext('2d') : null;

    this.videoElem = null;
    this.stream = null;
    this.isScanning = false;
    this.animFrameId = null;

    // 4-point corners for document perspective dewarping (normalized 0.0 - 1.0)
    this.corners = [
      { x: 0.1, y: 0.1 }, // Top-Left
      { x: 0.9, y: 0.1 }, // Top-Right
      { x: 0.9, y: 0.9 }, // Bottom-Right
      { x: 0.1, y: 0.9 }  // Bottom-Left
    ];
    this.activeCornerIndex = -1;
    this.sourceImage = null; // Stored image for dewarping

    this.continuousTracking = false;
    this.hasBarcodeDetector = ('BarcodeDetector' in window);
    if (this.hasBarcodeDetector) {
      try {
        this.barcodeDetector = new window.BarcodeDetector({
          formats: ['upc_a', 'ean_13', 'code_128', 'itf', 'qr_code', 'data_matrix']
        });
      } catch (e) {
        this.barcodeDetector = null;
      }
    }

    this.calibratedMmPerPx = 0.35;
    this.cameraIntrinsics = null;
    this.initIntrinsics();
  }

  ScannerDewarpStudio.prototype = {
    initIntrinsics: function() {
      if (window.DualMarkBridge && typeof window.DualMarkBridge.getCameraIntrinsics === 'function') {
        try {
          var data = JSON.parse(window.DualMarkBridge.getCameraIntrinsics());
          if (data && data.focalLengthMm) {
            this.cameraIntrinsics = data;
          }
        } catch (e) {}
      }
    },

    setCalibration: function(mmPerPx) {
      if (typeof mmPerPx === 'number' && mmPerPx > 0) {
        this.calibratedMmPerPx = mmPerPx;
      }
    },

    calibrateWithFiducial: function(targetType) {
      var c = this.previewCanvas;
      if (!c) return null;
      var ctx = this.previewCtx;
      if (!ctx) return null;
      var imgData = ctx.getImageData(0, 0, c.width, c.height);
      var gray = new Uint8Array(c.width * c.height);
      for (var i = 0; i < gray.length; i++) {
        var idx = i * 4;
        gray[i] = Math.round(0.2126 * imgData.data[idx] + 0.7152 * imgData.data[idx + 1] + 0.0722 * imgData.data[idx + 2]);
      }
      if (window.DualMarkCV && typeof window.DualMarkCV.detectFiducialTarget === 'function') {
        var res = window.DualMarkCV.detectFiducialTarget(gray, c.width, c.height, targetType || 'standard_card', this.cameraIntrinsics || {});
        if (res && res.scaleMmPerPx > 0) {
          this.setCalibration(res.scaleMmPerPx);
          return res;
        }
      }
      return null;
    },

    // 1. Camera Lifecycle
    startCamera: function(videoElem, onScanResult, onError) {
      var self = this;
      this.videoElem = videoElem;
      this.isScanning = true;

      var constraints = {
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };

      navigator.mediaDevices.getUserMedia(constraints)
        .then(function(stream) {
          self.stream = stream;
          videoElem.srcObject = stream;
          videoElem.setAttribute('playsinline', true);
          videoElem.play().then(function() {
            self.runScanLoop(onScanResult);
          });
        })
        .catch(function(err) {
          self.isScanning = false;
          if (onError) onError(err);
        });
    },

    stopCamera: function() {
      this.isScanning = false;
      if (this.animFrameId) {
        cancelAnimationFrame(this.animFrameId);
        this.animFrameId = null;
      }
      if (this.stream) {
        this.stream.getTracks().forEach(function(t) { t.stop(); });
        this.stream = null;
      }
      if (this.videoElem) {
        this.videoElem.srcObject = null;
      }
    },

    // 2. Continuous Optical Scan Loop
    runScanLoop: function(callback) {
      var self = this;
      if (!this.isScanning || !this.videoElem || this.videoElem.readyState < 2) {
        if (this.isScanning) {
          this.animFrameId = requestAnimationFrame(function() { self.runScanLoop(callback); });
        }
        return;
      }

      var video = this.videoElem;
      var c = this.previewCanvas;
      var ctx = this.previewCtx;

      if (c && ctx) {
        var targetW = video.videoWidth || 640;
        var targetH = video.videoHeight || 480;
        if (c.width !== targetW || c.height !== targetH) {
          c.width = targetW;
          c.height = targetH;
        }
        ctx.drawImage(video, 0, 0, c.width, c.height);

        // Draw HUD targeting reticle & 50mm laser scan guide
        this.drawHudOverlay(ctx, c.width, c.height);
      }

      // Perform Optical Detection
      this.detectBarcodes(c || video)
        .then(function(detected) {
          if (detected && detected.length > 0 && callback) {
            callback(detected);
          }
          if (self.isScanning) {
            self.animFrameId = requestAnimationFrame(function() { self.runScanLoop(callback); });
          }
        })
        .catch(function() {
          if (self.isScanning) {
            self.animFrameId = requestAnimationFrame(function() { self.runScanLoop(callback); });
          }
        });
    },

    drawHudOverlay: function(ctx, w, h) {
      // 1D Laser line overlay in cyan
      ctx.strokeStyle = '#00F0FF';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(w * 0.15, h * 0.4);
      ctx.lineTo(w * 0.85, h * 0.4);
      ctx.stroke();

      // 2D QR Target Box in emerald
      var boxSize = Math.min(w, h) * 0.35;
      var boxX = (w - boxSize) / 2;
      var boxY = h * 0.5;
      ctx.strokeStyle = '#10B981';
      ctx.lineWidth = 3;
      ctx.strokeRect(boxX, boxY, boxSize, boxSize);

      // HUD Text
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 12px "JetBrains Mono", monospace';
      ctx.fillText('DUAL OPTICAL IMAGER ACTIVE [1D + 2D]', 20, 30);

      // Continuous 50mm Live Tracking Caliper Overlay
      if (this.continuousTracking) {
        var y1d = h * 0.4;
        var y2d = boxY;
        var distPx = Math.abs(y2d - y1d);

        var mmPerPx = this.calibratedMmPerPx || 0.35;
        if (this.cameraIntrinsics && this.cameraIntrinsics.focalLengthMm && this.cameraIntrinsics.sensorWidthMm) {
          var workingDistMm = 180.0; // Nominal handheld barcode scan distance (180mm)
          if (window.DualMarkCV && typeof window.DualMarkCV.calcOpticalScale === 'function') {
            mmPerPx = window.DualMarkCV.calcOpticalScale(workingDistMm, this.cameraIntrinsics.focalLengthMm, this.cameraIntrinsics.sensorWidthMm, w);
          } else {
            mmPerPx = (this.cameraIntrinsics.sensorWidthMm / w) * (workingDistMm / this.cameraIntrinsics.focalLengthMm);
          }
        }
        var distMm = (distPx * mmPerPx).toFixed(1);
        var isPass = parseFloat(distMm) >= 50.0;

        ctx.save();
        ctx.strokeStyle = isPass ? '#10B981' : '#EF4444';
        ctx.fillStyle = isPass ? '#10B981' : '#EF4444';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);

        var caliperX = Math.max(30, w * 0.84);
        ctx.beginPath();
        ctx.moveTo(caliperX, y1d);
        ctx.lineTo(caliperX, y2d);
        ctx.stroke();

        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.arc(caliperX, y1d, 4, 0, Math.PI * 2);
        ctx.arc(caliperX, y2d, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = 'bold 11px "JetBrains Mono", monospace';
        ctx.textAlign = 'right';
        ctx.fillText(distMm + ' mm ' + (isPass ? '✓ SAFE' : '⚠ COLLISION'), caliperX - 8, (y1d + y2d) / 2 + 4);
        ctx.restore();
      }
    },

    // 3. Dual Detection Engine
    detectBarcodes: function(source) {
      var self = this;
      if (this.barcodeDetector) {
        return this.barcodeDetector.detect(source).then(function(barcodes) {
          if (barcodes && barcodes.length > 0) {
            return barcodes.map(function(b) {
              return self.parseBarcodeResult(b.rawValue, b.format);
            });
          }
          return self.decodeFallbackScanline(source);
        }).catch(function() {
          return self.decodeFallbackScanline(source);
        });
      }

      return Promise.resolve(this.decodeFallbackScanline(source));
    },

    decodeFallbackScanline: function(source) {
      if (!source) return [];
      try {
        var w = source.videoWidth || source.naturalWidth || source.width;
        var h = source.videoHeight || source.naturalHeight || source.height;
        if (!w || !h) return [];

        var canvas = document.createElement('canvas');
        canvas.width = Math.min(w, 800);
        canvas.height = Math.min(h, 600);
        var ctx = canvas.getContext('2d');
        ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
        var imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        var decoded = this.decodeScanlineUpcEan(imgData, canvas.width, canvas.height);
        if (decoded) {
          return [this.parseBarcodeResult(decoded.rawValue, decoded.format)];
        }
      } catch (e) {}
      return [];
    },

    decodeScanlineUpcEan: function(imgData, w, h) {
      var UPC_L = {
        '0001101': '0', '0011001': '1', '0010011': '2', '0111101': '3', '0100011': '4',
        '0110001': '5', '0101111': '6', '0111011': '7', '0110111': '8', '0001011': '9'
      };
      var UPC_R = {
        '1110010': '0', '1100110': '1', '1101100': '2', '1000010': '3', '1011100': '4',
        '1001110': '5', '1010000': '6', '1000100': '7', '1001000': '8', '1110100': '9'
      };

      function tryDecodeLuminance(lum) {
        var len = lum.length;
        if (len < 50) return null;
        var minL = 255, maxL = 0;
        for (var i = 0; i < len; i++) {
          if (lum[i] < minL) minL = lum[i];
          if (lum[i] > maxL) maxL = lum[i];
        }
        if (maxL - minL < 35) return null;
        var thresh = (minL + maxL) / 2;

        var runs = [];
        var curVal = lum[0] < thresh ? 1 : 0;
        var curLen = 0;
        for (var i = 0; i < len; i++) {
          var v = lum[i] < thresh ? 1 : 0;
          if (v === curVal) {
            curLen++;
          } else {
            runs.push({ val: curVal, len: curLen });
            curVal = v;
            curLen = 1;
          }
        }
        runs.push({ val: curVal, len: curLen });

        for (var r = 0; r < runs.length - 56; r++) {
          if (runs[r].val === 1 && runs[r + 1].val === 0 && runs[r + 2].val === 1) {
            var moduleW = (runs[r].len + runs[r + 1].len + runs[r + 2].len) / 3.0;
            if (moduleW < 0.8) continue;

            var digitsL = '';
            var runPos = r + 3;
            var fail = false;
            for (var d = 0; d < 6; d++) {
              if (runPos + 3 >= runs.length) { fail = true; break; }
              var rSum = runs[runPos].len + runs[runPos + 1].len + runs[runPos + 2].len + runs[runPos + 3].len;
              var modWLocal = rSum / 7.0;
              var bitPattern = '';
              for (var k = 0; k < 4; k++) {
                var count = Math.max(1, Math.min(4, Math.round(runs[runPos + k].len / modWLocal)));
                bitPattern += String(runs[runPos + k].val).repeat(count);
              }
              if (bitPattern.length > 7) bitPattern = bitPattern.slice(0, 7);
              if (UPC_L[bitPattern]) {
                digitsL += UPC_L[bitPattern];
              } else {
                fail = true;
                break;
              }
              runPos += 4;
            }
            if (fail || digitsL.length !== 6) continue;
            if (runPos + 5 >= runs.length) continue;
            runPos += 5; // skip center guard

            var digitsR = '';
            for (var d = 0; d < 6; d++) {
              if (runPos + 3 >= runs.length) { fail = true; break; }
              var rSum = runs[runPos].len + runs[runPos + 1].len + runs[runPos + 2].len + runs[runPos + 3].len;
              var modWLocal = rSum / 7.0;
              var bitPattern = '';
              for (var k = 0; k < 4; k++) {
                var count = Math.max(1, Math.min(4, Math.round(runs[runPos + k].len / modWLocal)));
                bitPattern += String(runs[runPos + k].val).repeat(count);
              }
              if (bitPattern.length > 7) bitPattern = bitPattern.slice(0, 7);
              if (UPC_R[bitPattern]) {
                digitsR += UPC_R[bitPattern];
              } else {
                fail = true;
                break;
              }
              runPos += 4;
            }
            if (digitsR.length === 6) {
              var fullUpc = digitsL + digitsR;
              var sum = 0;
              for (var i = 0; i < 11; i++) {
                sum += parseInt(fullUpc[i], 10) * (i % 2 === 0 ? 3 : 1);
              }
              var check = (10 - (sum % 10)) % 10;
              if (check === parseInt(fullUpc[11], 10)) {
                return { rawValue: fullUpc, format: 'upc_a' };
              }
            }
          }
        }
        return null;
      }

      function sampleRay(x0, y0, x1, y1) {
        var dx = x1 - x0;
        var dy = y1 - y0;
        var steps = Math.max(Math.floor(Math.sqrt(dx * dx + dy * dy)), 10);
        var lum = new Float32Array(steps);
        for (var s = 0; s < steps; s++) {
          var t = s / (steps - 1);
          var px = Math.min(w - 1, Math.max(0, Math.round(x0 + t * dx)));
          var py = Math.min(h - 1, Math.max(0, Math.round(y0 + t * dy)));
          var idx = (py * w + px) * 4;
          lum[s] = 0.299 * imgData.data[idx] + 0.587 * imgData.data[idx + 1] + 0.114 * imgData.data[idx + 2];
        }
        return lum;
      }

      // 1. Horizontal Scanlines
      var yFractions = [0.5, 0.4, 0.6, 0.3, 0.7, 0.25, 0.75, 0.2, 0.8];
      for (var i = 0; i < yFractions.length; i++) {
        var y = Math.floor(h * yFractions[i]);
        var lumH = sampleRay(0, y, w - 1, y);
        var res = tryDecodeLuminance(lumH);
        if (res) return res;
        lumH.reverse();
        res = tryDecodeLuminance(lumH);
        if (res) return res;
      }

      // 2. Vertical Scanlines (for rotated packaging / tall cans)
      var xFractions = [0.5, 0.4, 0.6, 0.35, 0.65];
      for (var j = 0; j < xFractions.length; j++) {
        var x = Math.floor(w * xFractions[j]);
        var lumV = sampleRay(x, 0, x, h - 1);
        var resV = tryDecodeLuminance(lumV);
        if (resV) return resV;
        lumV.reverse();
        resV = tryDecodeLuminance(lumV);
        if (resV) return resV;
      }

      // 3. Diagonal Scanlines (for tilted handheld captures)
      var diagRays = [
        [w * 0.1, h * 0.2, w * 0.9, h * 0.8],
        [w * 0.1, h * 0.8, w * 0.9, h * 0.2],
        [w * 0.15, h * 0.35, w * 0.85, h * 0.65],
        [w * 0.15, h * 0.65, w * 0.85, h * 0.35]
      ];
      for (var d = 0; d < diagRays.length; d++) {
        var r = diagRays[d];
        var lumD = sampleRay(r[0], r[1], r[2], r[3]);
        var resD = tryDecodeLuminance(lumD);
        if (resD) return resD;
        lumD.reverse();
        resD = tryDecodeLuminance(lumD);
        if (resD) return resD;
      }

      return null;
    },

    // Analyze uploaded photo file
    scanImageFile: function(file, callback) {
      var self = this;
      var reader = new FileReader();
      reader.onload = function(e) {
        var img = new Image();
        img.onload = function() {
          self.sourceImage = img;
          self.detectBarcodes(img).then(function(results) {
            callback({ results: results, image: img });
          });
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    },

    parseBarcodeResult: function(rawValue, format) {
      var isUrl = rawValue.indexOf('http://') === 0 || rawValue.indexOf('https://') === 0;
      var isGs1DigitalLink = false;
      var gs1Data = null;

      if (isUrl && rawValue.indexOf('/01/') !== -1) {
        isGs1DigitalLink = true;
        gs1Data = window.DualMarkGS1.parseDigitalLinkUri(rawValue);
      }

      return {
        rawValue: rawValue,
        format: format || (isGs1DigitalLink ? 'GS1_DIGITAL_LINK' : 'GENERIC_BARCODE'),
        isGs1DigitalLink: isGs1DigitalLink,
        gs1Data: gs1Data,
        timestamp: new Date().toISOString()
      };
    },

    // 4. 4-Point Document Dewarping (Perspective Transform)
    autoDetectCorners: function(forceRender) {
      if (!this.sourceImage) return;
      var cv = window.DualMarkCV || window.DualMarkCvGeometry;
      if (cv && typeof cv.autoDetectLabelQuad === 'function') {
        try {
          var img = this.sourceImage;
          var w = Math.min(img.width || 400, 400);
          var h = Math.round(w * ((img.height || 300) / (img.width || 400)));
          var c = document.createElement('canvas');
          c.width = w;
          c.height = h;
          var ctx = c.getContext('2d');
          ctx.drawImage(img, 0, 0, w, h);
          var imgData = ctx.getImageData(0, 0, w, h);
          var gray = new Uint8Array(w * h);
          for (var i = 0; i < gray.length; i++) {
            var idx = i * 4;
            gray[i] = Math.round(0.2126 * imgData.data[idx] + 0.7152 * imgData.data[idx + 1] + 0.0722 * imgData.data[idx + 2]);
          }
          var quad = cv.autoDetectLabelQuad(gray, w, h);
          if (quad && quad.length === 4) {
            this.corners = quad;
          }
        } catch (e) {
          console.warn('Auto quad detection error:', e);
        }
      }
      if (forceRender !== false) {
        this.renderDewarpHandles();
      }
    },

    loadDocumentForDewarp: function(img) {
      this.sourceImage = img;
      this.corners = [
        { x: 0.1, y: 0.1 },
        { x: 0.9, y: 0.1 },
        { x: 0.9, y: 0.9 },
        { x: 0.1, y: 0.9 }
      ];
      this.autoDetectCorners(false);
      this.renderDewarpHandles();
    },

    renderDewarpHandles: function() {
      if (!this.sourceImage || !this.dewarpCanvas || !this.dewarpCtx) return;
      var c = this.dewarpCanvas;
      var ctx = this.dewarpCtx;
      var img = this.sourceImage;

      var containerW = c.parentElement ? c.parentElement.clientWidth : 500;
      var maxW = Math.min(containerW - 32, 640);
      var aspect = img.height / img.width;

      c.width = maxW;
      c.height = Math.round(maxW * aspect);

      // Draw base photo
      ctx.drawImage(img, 0, 0, c.width, c.height);

      // Draw shaded polygon
      ctx.fillStyle = 'rgba(0, 240, 255, 0.15)';
      ctx.strokeStyle = '#00F0FF';
      ctx.lineWidth = 2.5;

      ctx.beginPath();
      var p0 = this.getCornerPixel(0);
      ctx.moveTo(p0.x, p0.y);
      for (var i = 1; i < 4; i++) {
        var pi = this.getCornerPixel(i);
        ctx.lineTo(pi.x, pi.y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Draw 4 corner control handles
      for (var j = 0; j < 4; j++) {
        var pj = this.getCornerPixel(j);
        ctx.fillStyle = '#10B981';
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(pj.x, pj.y, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 10px sans-serif';
        ctx.fillText(['TL', 'TR', 'BR', 'BL'][j], pj.x - 7, pj.y - 12);
      }
    },

    getCornerPixel: function(idx) {
      return {
        x: this.corners[idx].x * this.dewarpCanvas.width,
        y: this.corners[idx].y * this.dewarpCanvas.height
      };
    },

    // Apply 3x3 Projective Homography Perspective Transform & Bilinear Sauvola Binarization
    flattenAndBinarize: function(targetWidth, targetHeight) {
      if (!this.sourceImage) return null;
      targetWidth = targetWidth || 800;
      targetHeight = targetHeight || 1050; // Standard letter aspect 1:1.3

      var offCanvas = document.createElement('canvas');
      offCanvas.width = targetWidth;
      offCanvas.height = targetHeight;
      var offCtx = offCanvas.getContext('2d');

      var img = this.sourceImage;
      var srcCanvas = document.createElement('canvas');
      srcCanvas.width = img.width;
      srcCanvas.height = img.height;
      var srcCtx = srcCanvas.getContext('2d');
      srcCtx.drawImage(img, 0, 0);
      var srcImgData = srcCtx.getImageData(0, 0, img.width, img.height);
      var srcPixels = srcImgData.data;
      var srcW = img.width;
      var srcH = img.height;

      var p0 = { x: this.corners[0].x * srcW, y: this.corners[0].y * srcH };
      var p1 = { x: this.corners[1].x * srcW, y: this.corners[1].y * srcH };
      var p2 = { x: this.corners[2].x * srcW, y: this.corners[2].y * srcH };
      var p3 = { x: this.corners[3].x * srcW, y: this.corners[3].y * srcH };

      // Compute Projective Homography from Unit Square [0,1]^2 to Quad (p0, p1, p2, p3)
      var dx1 = p1.x - p2.x;
      var dx2 = p3.x - p2.x;
      var sx = p0.x - p1.x + p2.x - p3.x;
      var dy1 = p1.y - p2.y;
      var dy2 = p3.y - p2.y;
      var sy = p0.y - p1.y + p2.y - p3.y;

      var a, b, c, d, e, f, g, h;
      var det = dx1 * dy2 - dx2 * dy1;

      if (Math.abs(sx) < 1e-4 && Math.abs(sy) < 1e-4) {
        a = p1.x - p0.x;
        b = p2.x - p1.x;
        c = p0.x;
        d = p1.y - p0.y;
        e = p2.y - p1.y;
        f = p0.y;
        g = 0;
        h = 0;
      } else if (Math.abs(det) > 1e-7) {
        g = (sx * dy2 - sy * dx2) / det;
        h = (dx1 * sy - dy1 * sx) / det;
        a = p1.x - p0.x + g * p1.x;
        b = p3.x - p0.x + h * p3.x;
        c = p0.x;
        d = p1.y - p0.y + g * p1.y;
        e = p3.y - p0.y + h * p3.y;
        f = p0.y;
      } else {
        a = p1.x - p0.x; b = p3.x - p0.x; c = p0.x;
        d = p1.y - p0.y; e = p3.y - p0.y; f = p0.y;
        g = 0; h = 0;
      }

      var grayResampled = new Uint8Array(targetWidth * targetHeight);

      // Resample using subpixel Bilinear Interpolation
      for (var y = 0; y < targetHeight; y++) {
        var t = y / targetHeight;
        for (var x = 0; x < targetWidth; x++) {
          var s = x / targetWidth;
          var den = g * s + h * t + 1.0;
          var srcX = (a * s + b * t + c) / den;
          var srcY = (d * s + e * t + f) / den;

          var outIdx = y * targetWidth + x;
          if (srcX >= 0 && srcX < srcW - 1 && srcY >= 0 && srcY < srcH - 1) {
            var x0 = Math.floor(srcX);
            var y0 = Math.floor(srcY);
            var x1 = x0 + 1;
            var y1 = y0 + 1;
            var fx = srcX - x0;
            var fy = srcY - y0;

            var idx00 = (y0 * srcW + x0) * 4;
            var idx10 = (y0 * srcW + x1) * 4;
            var idx01 = (y1 * srcW + x0) * 4;
            var idx11 = (y1 * srcW + x1) * 4;

            var lum00 = 0.299 * srcPixels[idx00] + 0.587 * srcPixels[idx00 + 1] + 0.114 * srcPixels[idx00 + 2];
            var lum10 = 0.299 * srcPixels[idx10] + 0.587 * srcPixels[idx10 + 1] + 0.114 * srcPixels[idx10 + 2];
            var lum01 = 0.299 * srcPixels[idx01] + 0.587 * srcPixels[idx01 + 1] + 0.114 * srcPixels[idx01 + 2];
            var lum11 = 0.299 * srcPixels[idx11] + 0.587 * srcPixels[idx11 + 1] + 0.114 * srcPixels[idx11 + 2];

            var topLum = lum00 * (1 - fx) + lum10 * fx;
            var btmLum = lum01 * (1 - fx) + lum11 * fx;
            grayResampled[outIdx] = Math.round(topLum * (1 - fy) + btmLum * fy);
          } else {
            grayResampled[outIdx] = 255;
          }
        }
      }

      // Apply Sauvola Local Adaptive Thresholding (O(1) Integral Matrix)
      var cv = window.DualMarkCV || window.DualMarkCvGeometry;
      var binarized;
      if (cv && typeof cv.binarizeSauvola === 'function') {
        binarized = cv.binarizeSauvola(grayResampled, targetWidth, targetHeight, 25, 0.2);
      } else {
        // Fallback global threshold
        binarized = new Uint8Array(targetWidth * targetHeight);
        for (var k = 0; k < grayResampled.length; k++) {
          binarized[k] = grayResampled[k] > 138 ? 255 : 0;
        }
      }

      var dstImgData = offCtx.createImageData(targetWidth, targetHeight);
      var dstPixels = dstImgData.data;
      for (var p = 0; p < binarized.length; p++) {
        var pIdx = p * 4;
        var val = binarized[p];
        dstPixels[pIdx] = val;
        dstPixels[pIdx + 1] = val;
        dstPixels[pIdx + 2] = val;
        dstPixels[pIdx + 3] = 255;
      }

      offCtx.putImageData(dstImgData, 0, 0);
      return offCanvas.toDataURL('image/jpeg', 0.88);
    },

    // Cylindrical Ray-Marching & Unrolling Dewarp for Bottles, Cans, and Curved Pouches
    unrollCylindricalSurface: function(targetWidth, targetHeight, curvatureDepth) {
      if (!this.sourceImage) return null;
      targetWidth = targetWidth || 800;
      targetHeight = targetHeight || 600;
      curvatureDepth = curvatureDepth || 0.45; // 0.1 (gentle curve) to 0.8 (tight bottle cylinder)

      var offCanvas = document.createElement('canvas');
      offCanvas.width = targetWidth;
      offCanvas.height = targetHeight;
      var offCtx = offCanvas.getContext('2d');

      var img = this.sourceImage;
      var tempCanvas = document.createElement('canvas');
      tempCanvas.width = targetWidth;
      tempCanvas.height = targetHeight;
      var tempCtx = tempCanvas.getContext('2d');
      tempCtx.drawImage(img, 0, 0, targetWidth, targetHeight);

      var srcData = tempCtx.getImageData(0, 0, targetWidth, targetHeight);
      var dstData = offCtx.createImageData(targetWidth, targetHeight);

      var srcPixels = srcData.data;
      var dstPixels = dstData.data;

      var halfW = targetWidth / 2;
      var radius = halfW / Math.sin(curvatureDepth);

      for (var y = 0; y < targetHeight; y++) {
        for (var x = 0; x < targetWidth; x++) {
          var normX = (x - halfW) / halfW; // -1.0 to 1.0
          var theta = normX * curvatureDepth;
          var originalNormX = Math.sin(theta) / Math.sin(curvatureDepth);
          var srcX = Math.round(halfW + (originalNormX * halfW));

          if (srcX >= 0 && srcX < targetWidth) {
            var dstIdx = (y * targetWidth + x) * 4;
            var srcIdx = (y * targetWidth + srcX) * 4;
            dstPixels[dstIdx] = srcPixels[srcIdx];
            dstPixels[dstIdx + 1] = srcPixels[srcIdx + 1];
            dstPixels[dstIdx + 2] = srcPixels[srcIdx + 2];
            dstPixels[dstIdx + 3] = srcPixels[srcIdx + 3];
          }
        }
      }

      offCtx.putImageData(dstData, 0, 0);
      return offCanvas.toDataURL('image/jpeg', 0.90);
    }
  };

  window.DualMarkScanner = {
    ScannerDewarpStudio: ScannerDewarpStudio
  };

})(window);
