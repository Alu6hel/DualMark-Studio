/**
 * DualMark Studio — 50mm Physical Clearance Die-Line Inspector
 * Validates optical spacing between 1D UPC and 2D GS1 barcodes to prevent POS laser-grid cross-talk.
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

      var dx = 0;
      if (b1.right < b2.left) dx = b2.left - b1.right;
      else if (b2.right < b1.left) dx = b1.left - b2.right;

      var dy = 0;
      if (b1.bottom < b2.top) dy = b2.top - b1.bottom;
      else if (b2.bottom < b1.top) dy = b1.top - b2.bottom;

      var edgeDistance = Math.hypot(dx, dy);
      var centerDistance = Math.hypot(this.barcode2d.x - this.barcode1d.x, this.barcode2d.y - this.barcode1d.y);

      var isCompliant = edgeDistance >= 50.0;
      return {
        edgeDistanceMm: parseFloat(edgeDistance.toFixed(1)),
        centerDistanceMm: parseFloat(centerDistance.toFixed(1)),
        isCompliant: isCompliant,
        thresholdMm: 50.0,
        marginDeltaMm: parseFloat((edgeDistance - 50.0).toFixed(1))
      };
    },

    autoAlign: function() {
      // Auto-separate to satisfy 50mm clearance safely
      this.barcode1d.x = Math.max(this.barcode1d.w / 2 + 5, 25);
      this.barcode1d.y = this.packageHeightMm / 2;

      this.barcode2d.x = Math.min(this.packageWidthMm - this.barcode2d.w / 2 - 5, this.barcode1d.x + this.barcode1d.w / 2 + 50 + this.barcode2d.w / 2);
      this.barcode2d.y = this.packageHeightMm / 2;
    },

    snapToSafe50mm: function() {
      // Shift 2D code so edge-to-edge distance equals exactly 52 mm
      var targetDistance = 52.0;
      var dirX = this.barcode2d.x - this.barcode1d.x;
      var dirY = this.barcode2d.y - this.barcode1d.y;
      var len = Math.hypot(dirX, dirY) || 1;

      var normX = dirX / len;
      var normY = dirY / len;

      var totalSpan = (this.barcode1d.w / 2 + this.barcode2d.w / 2) + targetDistance;
      this.barcode2d.x = this.barcode1d.x + (normX * totalSpan);
      this.barcode2d.y = this.barcode1d.y + (normY * totalSpan);

      // Clamp to package boundaries
      this.barcode2d.x = Math.max(this.barcode2d.w / 2 + 2, Math.min(this.packageWidthMm - this.barcode2d.w / 2 - 2, this.barcode2d.x));
      this.barcode2d.y = Math.max(this.barcode2d.h / 2 + 2, Math.min(this.packageHeightMm - this.barcode2d.h / 2 - 2, this.barcode2d.y));

      this.render();
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
        var pos = getCanvasPos(e);
        // Check hit on 1D or 2D
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

      function handleEnd() {
        isMouseDown = false;
        self.activeDragging = null;
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

      // Adapt scale based on canvas display width
      var containerWidth = c.parentElement ? c.parentElement.clientWidth : 600;
      var maxCanvasWidth = Math.min(containerWidth - 32, 850);
      this.scale = maxCanvasWidth / this.packageWidthMm;

      var widthPx = Math.round(this.packageWidthMm * this.scale);
      var heightPx = Math.round(this.packageHeightMm * this.scale);
      c.width = widthPx;
      c.height = heightPx;

      var scale = this.scale;

      // 1. Draw Package Outline & Die-Line
      ctx.fillStyle = '#0F172A'; // Dark slate package background
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

      // Package dimension labels
      ctx.fillStyle = '#64748B';
      ctx.font = '600 11px sans-serif';
      ctx.fillText(this.packageWidthMm + ' mm', 8, 16);
      ctx.fillText(this.packageHeightMm + ' mm', 8, heightPx - 8);

      // 2. Draw Caliper / Clearance Line
      var x1 = this.barcode1d.x * scale;
      var y1 = this.barcode1d.y * scale;
      var x2 = this.barcode2d.x * scale;
      var y2 = this.barcode2d.y * scale;

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = metrics.isCompliant ? '#10B981' : '#EF4444';
      ctx.lineWidth = 3;
      ctx.setLineDash([6, 6]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Caliper Badge in center of measurement line
      var midX = (x1 + x2) / 2;
      var midY = (y1 + y2) / 2;

      ctx.fillStyle = metrics.isCompliant ? '#064E3B' : '#7F1D1D';
      ctx.strokeStyle = metrics.isCompliant ? '#10B981' : '#EF4444';
      ctx.lineWidth = 2;
      var badgeW = 96;
      var badgeH = 28;
      ctx.fillRect(midX - badgeW / 2, midY - badgeH / 2, badgeW, badgeH);
      ctx.strokeRect(midX - badgeW / 2, midY - badgeH / 2, badgeW, badgeH);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 12px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(metrics.edgeDistanceMm + ' mm', midX, midY - 1);

      // 3. Draw 1D Barcode Widget
      var b1w = this.barcode1d.w * scale;
      var b1h = this.barcode1d.h * scale;
      var b1x = x1 - b1w / 2;
      var b1y = y1 - b1h / 2;

      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(b1x, b1y, b1w, b1h);
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = (this.activeDragging === '1d') ? 3 : 1;
      ctx.strokeRect(b1x, b1y, b1w, b1h);

      // Simulated barcode stripes
      ctx.fillStyle = '#000000';
      var stripeCount = 28;
      var stripeStep = b1w / (stripeCount + 6);
      for (var s = 0; s < stripeCount; s++) {
        var sw = (s % 3 === 0) ? stripeStep * 1.5 : stripeStep * 0.7;
        ctx.fillRect(b1x + (s + 3) * stripeStep, b1y + 3, sw, b1h - 10);
      }
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 9px monospace';
      ctx.fillText('1D UPC-A', x1, b1y + b1h - 2);

      // 4. Draw 2D GS1 QR Code Widget
      var b2w = this.barcode2d.w * scale;
      var b2h = this.barcode2d.h * scale;
      var b2x = x2 - b2w / 2;
      var b2y = y2 - b2h / 2;

      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(b2x, b2y, b2w, b2h);
      ctx.strokeStyle = '#10B981';
      ctx.lineWidth = (this.activeDragging === '2d') ? 3 : 1;
      ctx.strokeRect(b2x, b2y, b2w, b2h);

      // Simulated 2D QR finder blocks
      ctx.fillStyle = '#000000';
      var fSize = b2w * 0.28;
      // Finder 1
      ctx.strokeRect(b2x + 2, b2y + 2, fSize, fSize);
      ctx.fillRect(b2x + 4, b2y + 4, fSize - 4, fSize - 4);
      // Finder 2
      ctx.strokeRect(b2x + b2w - fSize - 2, b2y + 2, fSize, fSize);
      ctx.fillRect(b2x + b2w - fSize, b2y + 4, fSize - 4, fSize - 4);
      // Finder 3
      ctx.strokeRect(b2x + 2, b2y + b2h - fSize - 2, fSize, fSize);
      ctx.fillRect(b2x + 4, b2y + b2h - fSize, fSize - 4, fSize - 4);

      ctx.font = 'bold 8px monospace';
      ctx.fillText('2D GS1', x2, y2);

      this.notifyUpdate(metrics);
    }
  };

  window.DualMarkClearance = {
    ClearanceInspector: ClearanceInspector,
    PACKAGING_PRESETS: PACKAGING_PRESETS
  };

})(window);
