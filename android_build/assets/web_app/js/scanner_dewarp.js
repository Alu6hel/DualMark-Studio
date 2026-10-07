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
  }

  ScannerDewarpStudio.prototype = {
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
        c.width = video.videoWidth || 640;
        c.height = video.videoHeight || 480;
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
        var distMm = (distPx * 0.35).toFixed(1);
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
      var yList = [Math.floor(h * 0.5), Math.floor(h * 0.4), Math.floor(h * 0.6), Math.floor(h * 0.35), Math.floor(h * 0.65)];
      var UPC_L = {
        '0001101': '0', '0011001': '1', '0010011': '2', '0111101': '3', '0100011': '4',
        '0110001': '5', '0101111': '6', '0111011': '7', '0110111': '8', '0001011': '9'
      };
      var UPC_R = {
        '1110010': '0', '1100110': '1', '1101100': '2', '1000010': '3', '1011100': '4',
        '1001110': '5', '1010000': '6', '1000100': '7', '1001000': '8', '1110100': '9'
      };

      for (var yIdx = 0; yIdx < yList.length; yIdx++) {
        var y = yList[yIdx];
        var lum = new Float32Array(w);
        var minL = 255, maxL = 0;
        for (var x = 0; x < w; x++) {
          var idx = (y * w + x) * 4;
          var l = 0.299 * imgData.data[idx] + 0.587 * imgData.data[idx + 1] + 0.114 * imgData.data[idx + 2];
          lum[x] = l;
          if (l < minL) minL = l;
          if (l > maxL) maxL = l;
        }
        if (maxL - minL < 40) continue;
        var thresh = (minL + maxL) / 2;

        var runs = [];
        var curVal = lum[0] < thresh ? 1 : 0;
        var curLen = 0;
        for (var x = 0; x < w; x++) {
          var v = lum[x] < thresh ? 1 : 0;
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
            if (moduleW < 1.0) continue;

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
    loadDocumentForDewarp: function(img) {
      this.sourceImage = img;
      this.corners = [
        { x: 0.1, y: 0.1 },
        { x: 0.9, y: 0.1 },
        { x: 0.9, y: 0.9 },
        { x: 0.1, y: 0.9 }
      ];
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

    // Apply 3x3 Projective Homography Perspective Transform & Binarization
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

      var p0 = { x: this.corners[0].x * img.width, y: this.corners[0].y * img.height };
      var p1 = { x: this.corners[1].x * img.width, y: this.corners[1].y * img.height };
      var p2 = { x: this.corners[2].x * img.width, y: this.corners[2].y * img.height };
      var p3 = { x: this.corners[3].x * img.width, y: this.corners[3].y * img.height };

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

      var dstImgData = offCtx.createImageData(targetWidth, targetHeight);
      var dstPixels = dstImgData.data;
      var srcW = img.width;
      var srcH = img.height;
      var threshold = 138;

      for (var y = 0; y < targetHeight; y++) {
        var t = y / targetHeight;
        for (var x = 0; x < targetWidth; x++) {
          var s = x / targetWidth;
          var den = g * s + h * t + 1.0;
          var srcX = Math.round((a * s + b * t + c) / den);
          var srcY = Math.round((d * s + e * t + f) / den);

          var dstIdx = (y * targetWidth + x) * 4;
          if (srcX >= 0 && srcX < srcW && srcY >= 0 && srcY < srcH) {
            var srcIdx = (srcY * srcW + srcX) * 4;
            var r = srcPixels[srcIdx];
            var gr = srcPixels[srcIdx + 1];
            var bl = srcPixels[srcIdx + 2];
            var lum = 0.299 * r + 0.587 * gr + 0.114 * bl;
            var val = (lum > threshold) ? 255 : Math.round(lum * 0.7);
            dstPixels[dstIdx] = val;
            dstPixels[dstIdx + 1] = val;
            dstPixels[dstIdx + 2] = val;
            dstPixels[dstIdx + 3] = 255;
          } else {
            dstPixels[dstIdx] = 255;
            dstPixels[dstIdx + 1] = 255;
            dstPixels[dstIdx + 2] = 255;
            dstPixels[dstIdx + 3] = 255;
          }
        }
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
