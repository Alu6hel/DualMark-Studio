/**
 * DualMark Studio — 50mm Physical Clearance Die-Line Inspector
 * Validates optical spacing between 1D UPC and 2D GS1 barcodes to prevent POS laser-grid cross-talk.
 * Features touch pinch-to-zoom, pan, and snap-to-safe layout engine.
 */
(function(window) {
  'use strict';

  var PACKAGING_PRESETS = {
    'blister': { name: 'Blister Pack (Lip Balm / Cosmetics)', width: 110, height: 75 },
    'snack': { name: 'Snack Bar / Flow-Wrap', width: 150, height: 55 },
    'bottle': { name: 'Beverage Bottle Wrap Label', width: 180, height: 85 },
    'pharma': { name: 'Pharmaceutical Carton', width: 90, height: 50 },
    'retail_box': { name: 'Retail Folding Carton Box', width: 220, height: 160 }
  };

  function ClearanceInspector(containerCanvas) {
    this.canvas = containerCanvas;
    this.ctx = containerCanvas.getContext('2d');

    // Physical packaging dimensions in mm
    this.packageWidthMm = 150;
    this.packageHeightMm = 55;

    // 1D Barcode physical dimensions (mm) and position (center mm)
    this.barcode1d = {
      w: 37.3, // Standard nominal UPC-A width at 100% magnification
      h: 25.9, // Standard nominal UPC-A height
      x: 35,   // Center X in mm
      y: 27.5
    };

    // 2D QR Code physical dimensions (mm) and position (center mm)
    this.barcode2d = {
      w: 16.0, // Standard 2D GS1 QR size (16x16mm at 0.38mm module)
      h: 16.0,
      x: 105,  // Center X in mm
      y: 27.5
    };

    this.activeDragging = null; // '1d' or '2d'
    this.scale = 4.0; // Screen pixels per millimeter (px/mm)
    this.zoomLevel = 1.0; // Zoom multiplier (0.5x to 3.0x)
    this.initialPinchDistance = 0;
    this.listeners = [];

    this.initEvents();
  }

  ClearanceInspector.prototype = {
    setPreset: function(key) {
      if (PACKAGING_PRESETS[key]) {
        var p = PACKAGING_PRESETS[key];
        this.packageWidthMm = p.width;
        this.packageHeightMm = p.height;
        this.autoAlign();
        this.render();
      }
    },

    setCustomDimensions: function(wMm, hMm) {
      this.packageWidthMm = Math.max(50, wMm);
      this.packageHeightMm = Math.max(30, hMm);
      this.autoAlign();
      this.render();
    },

    zoomIn: function() {
      this.zoomLevel = Math.min(3.0, this.zoomLevel + 0.25);
      this.render();
      return this.zoomLevel;
    },

    zoomOut: function() {
      this.zoomLevel = Math.max(0.6, this.zoomLevel - 0.25);
      this.render();
      return this.zoomLevel;
    },

    resetZoom: function() {
      this.zoomLevel = 1.0;
      this.render();
      return this.zoomLevel;
    },

    getZoomLevel: function() {
      return this.zoomLevel;
    },

    onUpdate: function(callback) {
      this.listeners.push(callback);
    },

    notifyUpdate: function(metrics) {
      for (var i = 0; i < this.listeners.length; i++) {
        this.listeners[i](metrics);
      }
    },

    // Calculate edge-to-edge distance between the two bounding boxes in mm
    calculateDistanceMm: function() {
      var b1 = {
        left: this.barcode1d.x - this.barcode1d.w / 2,
        right: this.barcode1d.x + this.barcode1d.w / 2,
        top: this.barcode1d.y - this.barcode1d.h / 2,
        bottom: this.barcode1d.y + this.barcode1d.h / 2
      };

      var b2 = {
        left: this.barcode2d.x - this.barcode2d.w / 2,
        right: this.barcode2d.x + this.barcode2d.w / 2,
        top: this.barcode2d.y - this.barcode2d.h / 2,
        bottom: this.barcode2d.y + this.barcode2d.h / 2
      };

      // Horizontal and vertical gaps between rectangles
      var dx = Math.max(0, Math.max(b1.left - b2.right, b2.left - b1.right));
      var dy = Math.max(0, Math.max(b1.top - b2.bottom, b2.top - b1.bottom));

      var distance = Math.sqrt(dx * dx + dy * dy);
      var isCompliant = distance >= 50.0;
      var totalNeededWidth = this.barcode1d.w + this.barcode2d.w + 50.0;
      var impossibleFit = this.packageWidthMm < (totalNeededWidth + 8.0); // including 4mm side margins

      return {
        distanceMm: parseFloat(distance.toFixed(1)),
        edgeDistanceMm: parseFloat(distance.toFixed(1)),
        isCompliant: isCompliant,
        impossibleFit: impossibleFit,
        multiPanelRecommended: impossibleFit,
        recommendation: impossibleFit ? 'MULTI_PANEL_LAYOUT' : 'COPLANAR_OK',
        marginDeltaMm: (distance - 50.0).toFixed(1),
        dxMm: parseFloat(dx.toFixed(1)),
        dyMm: parseFloat(dy.toFixed(1)),
        b1: b1,
        b2: b2
      };
    },

    getMetrics: function() {
      return this.calculateDistanceMm();
    },

    autoAlign: function() {
      // Place 1D on left, 2D on right with >= 50mm safe spacing
      var targetCenter1 = this.barcode1d.w / 2 + 10;
      var targetCenter2 = Math.min(this.packageWidthMm - this.barcode2d.w / 2 - 10, targetCenter1 + this.barcode1d.w / 2 + 52 + this.barcode2d.w / 2);

      this.barcode1d.x = targetCenter1;
      this.barcode1d.y = this.packageHeightMm / 2;
      this.barcode2d.x = targetCenter2;
      this.barcode2d.y = this.packageHeightMm / 2;
    },

    snapTo50mm: function() {
      var metrics = this.calculateDistanceMm();
      var needed = 52.0;
      var totalNeededWidth = this.barcode1d.w + this.barcode2d.w + needed + 8.0;

      if (this.packageWidthMm < totalNeededWidth) {
        // Physical dimensions cannot fit 50mm coplanar clearance
        this.barcode1d.x = this.barcode1d.w / 2 + 4;
        this.barcode2d.x = this.packageWidthMm - this.barcode2d.w / 2 - 4;
        this.impossibleFit = true;
        this.multiPanelRecommended = true;
        this.render();
        if (window.DualMarkAudio && typeof window.DualMarkAudio.warningBuzz === 'function') {
          window.DualMarkAudio.warningBuzz();
        }
        return {
          impossibleFit: true,
          multiPanelRecommended: true,
          recommendation: 'MULTI_PANEL_LAYOUT',
          distanceMm: this.calculateDistanceMm().distanceMm,
          isCompliant: false
        };
      }

      this.impossibleFit = false;
      this.multiPanelRecommended = false;

      if (!metrics.isCompliant || metrics.distanceMm < 50.0) {
        var newX2 = this.barcode1d.x + (this.barcode1d.w / 2) + needed + (this.barcode2d.w / 2);
        if (newX2 + this.barcode2d.w / 2 <= this.packageWidthMm - 4) {
          this.barcode2d.x = newX2;
        } else {
          this.barcode1d.x = this.barcode1d.w / 2 + 4;
          this.barcode2d.x = this.barcode1d.x + (this.barcode1d.w / 2) + needed + (this.barcode2d.w / 2);
        }
      }
      this.render();
      if (window.DualMarkAudio && typeof window.DualMarkAudio.successChime === 'function') {
        window.DualMarkAudio.successChime();
      }
      return {
        impossibleFit: false,
        multiPanelRecommended: false,
        distanceMm: this.calculateDistanceMm().distanceMm,
        isCompliant: true
      };
    },

    snapToSafe50mm: function() {
      return this.snapTo50mm();
    },

    initEvents: function() {
      var self = this;
      var isMouseDown = false;

      function getCanvasPos(e) {
        var rect = self.canvas.getBoundingClientRect();
        var clientX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
        var clientY = e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : 0);
        var px = clientX - rect.left;
        var py = clientY - rect.top;
        return {
          xMm: px / self.scale,
          yMm: py / self.scale
        };
      }

      function handleStart(e) {
        if (e.touches && e.touches.length === 2) {
          // Pinch start
          var dx = e.touches[0].clientX - e.touches[1].clientX;
          var dy = e.touches[0].clientY - e.touches[1].clientY;
          self.initialPinchDistance = Math.sqrt(dx * dx + dy * dy);
          return;
        }

        var pos = getCanvasPos(e);
        var hit1d = Math.abs(pos.xMm - self.barcode1d.x) <= self.barcode1d.w / 2 && Math.abs(pos.yMm - self.barcode1d.y) <= self.barcode1d.h / 2;
        var hit2d = Math.abs(pos.xMm - self.barcode2d.x) <= self.barcode2d.w / 2 && Math.abs(pos.yMm - self.barcode2d.y) <= self.barcode2d.h / 2;

        if (hit1d) {
          self.activeDragging = '1d';
          isMouseDown = true;
        } else if (hit2d) {
          self.activeDragging = '2d';
          isMouseDown = true;
        }
      }

      function handleMove(e) {
        if (e.touches && e.touches.length === 2 && self.initialPinchDistance > 0) {
          // Pinch move
          if (e.cancelable) e.preventDefault();
          var dx = e.touches[0].clientX - e.touches[1].clientX;
          var dy = e.touches[0].clientY - e.touches[1].clientY;
          var dist = Math.sqrt(dx * dx + dy * dy);
          var factor = dist / self.initialPinchDistance;
          if (factor > 1.1) {
            self.zoomIn();
            self.initialPinchDistance = dist;
          } else if (factor < 0.9) {
            self.zoomOut();
            self.initialPinchDistance = dist;
          }
          return;
        }

        if (!isMouseDown || !self.activeDragging) return;
        if (e.cancelable) e.preventDefault();
        var pos = getCanvasPos(e);

        if (self.activeDragging === '1d') {
          self.barcode1d.x = Math.max(self.barcode1d.w / 2 + 2, Math.min(self.packageWidthMm - self.barcode1d.w / 2 - 2, pos.xMm));
          self.barcode1d.y = Math.max(self.barcode1d.h / 2 + 2, Math.min(self.packageHeightMm - self.barcode1d.h / 2 - 2, pos.yMm));
        } else if (self.activeDragging === '2d') {
          self.barcode2d.x = Math.max(self.barcode2d.w / 2 + 2, Math.min(self.packageWidthMm - self.barcode2d.w / 2 - 2, pos.xMm));
          self.barcode2d.y = Math.max(self.barcode2d.h / 2 + 2, Math.min(self.packageHeightMm - self.barcode2d.h / 2 - 2, pos.yMm));
        }
        self.render();
      }

      function handleEnd(e) {
        isMouseDown = false;
        self.activeDragging = null;
        self.initialPinchDistance = 0;
      }

      this.canvas.addEventListener('mousedown', handleStart);
      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', handleEnd);

      this.canvas.addEventListener('touchstart', handleStart, { passive: false });
      window.addEventListener('touchmove', handleMove, { passive: false });
      window.addEventListener('touchend', handleEnd);
    },

    render: function() {
      var metrics = this.calculateDistanceMm();
      var c = this.canvas;
      var ctx = this.ctx;

      var containerWidth = c.parentElement ? c.parentElement.clientWidth : 600;
      var maxCanvasWidth = Math.min(containerWidth - 32, 850);
      var baseScale = maxCanvasWidth / this.packageWidthMm;
      this.scale = baseScale * this.zoomLevel;

      var widthPx = Math.round(this.packageWidthMm * this.scale);
      var heightPx = Math.round(this.packageHeightMm * this.scale);
      c.width = widthPx;
      c.height = heightPx;

      var scale = this.scale;

      // 1. Draw Package Outline & Die-Line
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(0, 0, widthPx, heightPx);

      // Grid Lines (every 10mm)
      ctx.strokeStyle = '#1E293B';
      ctx.lineWidth = 1;
      for (var xm = 10; xm < this.packageWidthMm; xm += 10) {
        ctx.beginPath();
        ctx.moveTo(xm * scale, 0);
        ctx.lineTo(xm * scale, heightPx);
        ctx.stroke();
      }
      for (var ym = 10; ym < this.packageHeightMm; ym += 10) {
        ctx.beginPath();
        ctx.moveTo(0, ym * scale);
        ctx.lineTo(widthPx, ym * scale);
        ctx.stroke();
      }

      // Die-line outer border
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 2;
      ctx.strokeRect(1, 1, widthPx - 2, heightPx - 2);

      // Package dimension labels & zoom level
      ctx.fillStyle = '#64748B';
      ctx.font = '600 11px sans-serif';
      ctx.fillText(this.packageWidthMm + ' mm', 8, 16);
      ctx.fillText(this.packageHeightMm + ' mm', 8, heightPx - 8);
      ctx.fillText((this.zoomLevel * 100).toFixed(0) + '% Zoom', widthPx - 65, 16);

      // 2. Draw Caliper / Clearance Line
      var p1 = { x: this.barcode1d.x * scale, y: this.barcode1d.y * scale };
      var p2 = { x: this.barcode2d.x * scale, y: this.barcode2d.y * scale };

      ctx.save();
      ctx.beginPath();
      ctx.setLineDash([5, 4]);
      ctx.strokeStyle = metrics.isCompliant ? '#10B981' : '#F43F5E';
      ctx.lineWidth = 2;
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
      ctx.restore();

      // Measurement bubble in middle
      var midX = (p1.x + p2.x) / 2;
      var midY = (p1.y + p2.y) / 2;
      ctx.fillStyle = metrics.isCompliant ? '#10B981' : '#F43F5E';
      ctx.beginPath();
      ctx.arc(midX, midY, 18, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(metrics.distanceMm + 'm', midX, midY);

      // 3. Draw 1D Barcode Placeholder Box
      var b1Px = {
        x: (this.barcode1d.x - this.barcode1d.w / 2) * scale,
        y: (this.barcode1d.y - this.barcode1d.h / 2) * scale,
        w: this.barcode1d.w * scale,
        h: this.barcode1d.h * scale
      };

      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(b1Px.x, b1Px.y, b1Px.w, b1Px.h);
      ctx.strokeStyle = (this.activeDragging === '1d') ? '#0284C7' : '#94A3B8';
      ctx.lineWidth = (this.activeDragging === '1d') ? 3 : 1;
      ctx.strokeRect(b1Px.x, b1Px.y, b1Px.w, b1Px.h);

      // Simulated vertical bars
      ctx.fillStyle = '#000000';
      var numBars = 22;
      var barGap = b1Px.w / (numBars * 2);
      for (var b = 0; b < numBars; b++) {
        var bx = b1Px.x + b * (barGap * 2) + barGap;
        var bw = (b % 3 === 0) ? barGap * 1.5 : barGap * 0.8;
        ctx.fillRect(bx, b1Px.y + 4, bw, b1Px.h - 14);
      }
      ctx.fillStyle = '#000000';
      ctx.font = '9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('1D UPC-A', b1Px.x + b1Px.w / 2, b1Px.y + b1Px.h - 4);

      // 4. Draw 2D QR Code Placeholder Box
      var b2Px = {
        x: (this.barcode2d.x - this.barcode2d.w / 2) * scale,
        y: (this.barcode2d.y - this.barcode2d.h / 2) * scale,
        w: this.barcode2d.w * scale,
        h: this.barcode2d.h * scale
      };

      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(b2Px.x, b2Px.y, b2Px.w, b2Px.h);
      ctx.strokeStyle = (this.activeDragging === '2d') ? '#0284C7' : '#94A3B8';
      ctx.lineWidth = (this.activeDragging === '2d') ? 3 : 1;
      ctx.strokeRect(b2Px.x, b2Px.y, b2Px.w, b2Px.h);

      // Simulated 2D finder patterns
      ctx.fillStyle = '#000000';
      var finderSize = b2Px.w * 0.28;
      ctx.fillRect(b2Px.x + 3, b2Px.y + 3, finderSize, finderSize);
      ctx.fillRect(b2Px.x + b2Px.w - finderSize - 3, b2Px.y + 3, finderSize, finderSize);
      ctx.fillRect(b2Px.x + 3, b2Px.y + b2Px.h - finderSize - 3, finderSize, finderSize);

      ctx.fillStyle = '#000000';
      ctx.font = '8px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('2D GS1', b2Px.x + b2Px.w / 2, b2Px.y + b2Px.h / 2 + 2);

      this.notifyUpdate(metrics);
    }
  };

  window.ClearanceInspector = ClearanceInspector;
  window.DualMarkClearance = {
    ClearanceInspector: ClearanceInspector
  };
})(window);
