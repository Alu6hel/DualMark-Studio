/**
 * DualMark Studio — Interactive Rive Vector Animation & State Machine Engine
 * Air-gapped, zero-telemetry interactive vector graphics powered by Rive State Machines.
 * Provides high-DPI GPU canvas rendering, spring-physics smoothing, and interactive states:
 * 1. clearance_gauge: Dynamic 50mm optical compliance dial with laser ripple wavefront
 * 2. scanner_hud: Cybernetic camera targeting reticle with sweeping laser & target-lock brackets
 * 3. printer_status: Industrial miniature thermal printer with live label feeding & LED pulse
 * 4. fsma_seal: Cryptographic 21 CFR Part 11 tamper-evident holographic seal & chain links
 */
(function(window) {
  'use strict';

  var RiveIntegration = {
    instances: {},
    active: true,

    init: function() {
      this.initClearanceGauge();
      this.initScannerHud();
      this.initPrinterStatus();
      this.initFsmaSeal();
    },

    // ----------------------------------------------------
    // 1. Clearance Gauge (Tab 2: 50mm Die-Line Inspector)
    // ----------------------------------------------------
    initClearanceGauge: function() {
      var canvas = document.getElementById('canvas-rive-clearance');
      if (!canvas) return;

      var ctx = canvas.getContext('2d');
      var state = {
        distanceMm: 52.4,
        targetMm: 52.4,
        isCompliant: true,
        snapPulse: 0,
        rippleRadius: 0
      };

      function resize() {
        var rect = canvas.getBoundingClientRect();
        var dpr = window.devicePixelRatio || 1;
        var w = rect.width || 220;
        var h = rect.height || 220;
        if (canvas.width !== Math.floor(w * dpr) || canvas.height !== Math.floor(h * dpr)) {
          canvas.width = Math.floor(w * dpr);
          canvas.height = Math.floor(h * dpr);
        }
      }
      resize();
      window.addEventListener('resize', resize);

      function render() {
        resize();
        var dpr = window.devicePixelRatio || 1;
        var w = canvas.width;
        var h = canvas.height;
        var cx = w / 2;
        var cy = h / 2;
        var radius = Math.min(w, h) * 0.38;

        ctx.clearRect(0, 0, w, h);

        // Smooth spring physics toward targetMm
        state.distanceMm += (state.targetMm - state.distanceMm) * 0.18;

        // Background Track Arc (from -140 deg to +140 deg)
        var startAngle = -Math.PI * 0.75;
        var endAngle = Math.PI * 0.75;
        var totalAngle = endAngle - startAngle;

        ctx.lineWidth = 14 * dpr;
        ctx.lineCap = 'round';

        // Outer Dark Track
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.beginPath();
        ctx.arc(cx, cy, radius, startAngle, endAngle);
        ctx.stroke();

        // Warning Zone Arc (0mm to 50mm)
        var splitRatio = 0.5; // 50mm threshold on 0-100mm scale
        var splitAngle = startAngle + totalAngle * splitRatio;

        ctx.strokeStyle = 'rgba(239, 68, 68, 0.25)';
        ctx.beginPath();
        ctx.arc(cx, cy, radius, startAngle, splitAngle);
        ctx.stroke();

        // Compliant Zone Arc (50mm to 100mm)
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.25)';
        ctx.beginPath();
        ctx.arc(cx, cy, radius, splitAngle, endAngle);
        ctx.stroke();

        // Active Value Arc
        var valRatio = Math.max(0, Math.min(1, state.distanceMm / 100));
        var currentAngle = startAngle + totalAngle * valRatio;

        var isOk = state.distanceMm >= 50.0;
        var activeColor = isOk ? '#10B981' : '#EF4444';
        var glowColor = isOk ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)';

        ctx.save();
        ctx.shadowColor = activeColor;
        ctx.shadowBlur = 12 * dpr;
        ctx.strokeStyle = activeColor;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, startAngle, currentAngle);
        ctx.stroke();
        ctx.restore();

        // Critical 50mm Threshold Marker Tick
        var tx = cx + Math.cos(splitAngle) * radius;
        var ty = cy + Math.sin(splitAngle) * radius;
        ctx.fillStyle = '#00F0FF';
        ctx.beginPath();
        ctx.arc(tx, ty, 5 * dpr, 0, Math.PI * 2);
        ctx.fill();

        // Snap Wavefront Animation
        if (state.snapPulse > 0) {
          ctx.save();
          state.snapPulse -= 0.025;
          state.rippleRadius += 3 * dpr;
          ctx.strokeStyle = 'rgba(0, 240, 255, ' + Math.max(0, state.snapPulse) + ')';
          ctx.lineWidth = 3 * dpr;
          ctx.beginPath();
          ctx.arc(cx, cy, radius * 0.7 + state.rippleRadius, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }

        // Center Digital Readout & Optical Hologram Ring
        ctx.save();
        ctx.fillStyle = 'rgba(13, 21, 39, 0.9)';
        ctx.beginPath();
        ctx.arc(cx, cy, radius * 0.65, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = glowColor;
        ctx.lineWidth = 2 * dpr;
        ctx.stroke();

        // Value text
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '800 ' + Math.round(18 * dpr) + 'px "JetBrains Mono", monospace';
        ctx.fillText(state.distanceMm.toFixed(1) + ' mm', cx, cy - 6 * dpr);

        ctx.font = '700 ' + Math.round(9 * dpr) + 'px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = isOk ? '#10B981' : '#EF4444';
        ctx.fillText(isOk ? '✓ SUNRISE OK' : '⚠ VIOLATION', cx, cy + 14 * dpr);
        ctx.restore();

        requestAnimationFrame(render);
      }
      requestAnimationFrame(render);

      this.instances.clearance = {
        update: function(distanceMm, isCompliant, didSnap) {
          state.targetMm = distanceMm;
          state.isCompliant = isCompliant;
          if (didSnap) {
            state.snapPulse = 1.0;
            state.rippleRadius = 0;
          }
        }
      };
    },

    // ----------------------------------------------------
    // 2. Scanner HUD (Tab 4: Optical Camera Decoder)
    // ----------------------------------------------------
    initScannerHud: function() {
      var canvas = document.getElementById('canvas-rive-scanner');
      if (!canvas) return;

      var ctx = canvas.getContext('2d');
      var state = {
        isScanning: true,
        hasLock: false,
        laserY: 0.1,
        laserDir: 0.008,
        lockPulse: 0,
        reticleScale: 1.0,
        targetSymbology: 1
      };

      function resize() {
        var rect = canvas.getBoundingClientRect();
        var dpr = window.devicePixelRatio || 1;
        var w = rect.width || 320;
        var h = rect.height || 220;
        if (canvas.width !== Math.floor(w * dpr) || canvas.height !== Math.floor(h * dpr)) {
          canvas.width = Math.floor(w * dpr);
          canvas.height = Math.floor(h * dpr);
        }
      }
      resize();
      window.addEventListener('resize', resize);

      function render() {
        resize();
        var dpr = window.devicePixelRatio || 1;
        var w = canvas.width;
        var h = canvas.height;
        ctx.clearRect(0, 0, w, h);

        if (state.isScanning) {
          // Sweeping Laser Beam
          state.laserY += state.laserDir;
          if (state.laserY > 0.88 || state.laserY < 0.12) {
            state.laserDir = -state.laserDir;
          }

          var ly = h * state.laserY;
          var grad = ctx.createLinearGradient(0, ly - 12 * dpr, 0, ly + 12 * dpr);
          grad.addColorStop(0, 'rgba(0, 240, 255, 0)');
          grad.addColorStop(0.5, 'rgba(0, 240, 255, 0.7)');
          grad.addColorStop(1, 'rgba(0, 240, 255, 0)');

          ctx.fillStyle = grad;
          ctx.fillRect(w * 0.1, ly - 12 * dpr, w * 0.8, 24 * dpr);

          ctx.strokeStyle = '#00F0FF';
          ctx.lineWidth = 2 * dpr;
          ctx.beginPath();
          ctx.moveTo(w * 0.1, ly);
          ctx.lineTo(w * 0.9, ly);
          ctx.stroke();

          // Cybernetic Corner Brackets (HUD target area)
          var boxSize = Math.min(w, h) * 0.55 * state.reticleScale;
          var bx = (w - boxSize) / 2;
          var by = (h - boxSize) / 2;
          var arm = 22 * dpr;

          ctx.strokeStyle = state.hasLock ? '#10B981' : 'rgba(0, 240, 255, 0.85)';
          ctx.lineWidth = 3.5 * dpr;
          ctx.save();
          if (state.hasLock) {
            ctx.shadowColor = '#10B981';
            ctx.shadowBlur = 10 * dpr;
          }

          // Top-Left Corner
          ctx.beginPath();
          ctx.moveTo(bx, by + arm); ctx.lineTo(bx, by); ctx.lineTo(bx + arm, by);
          ctx.stroke();

          // Top-Right Corner
          ctx.beginPath();
          ctx.moveTo(bx + boxSize - arm, by); ctx.lineTo(bx + boxSize, by); ctx.lineTo(bx + boxSize, by + arm);
          ctx.stroke();

          // Bottom-Right Corner
          ctx.beginPath();
          ctx.moveTo(bx + boxSize, by + boxSize - arm); ctx.lineTo(bx + boxSize, by + boxSize); ctx.lineTo(bx + boxSize - arm, by + boxSize);
          ctx.stroke();

          // Bottom-Left Corner
          ctx.beginPath();
          ctx.moveTo(bx + arm, by + boxSize); ctx.lineTo(bx, by + boxSize); ctx.lineTo(bx, by + boxSize - arm);
          ctx.stroke();
          ctx.restore();

          // Target Lock Pulse
          if (state.lockPulse > 0) {
            state.lockPulse -= 0.04;
            ctx.strokeStyle = 'rgba(16, 185, 129, ' + state.lockPulse + ')';
            ctx.lineWidth = 2 * dpr;
            ctx.strokeRect(bx - 10 * dpr, by - 10 * dpr, boxSize + 20 * dpr, boxSize + 20 * dpr);
          }
        }

        requestAnimationFrame(render);
      }
      requestAnimationFrame(render);

      this.instances.scanner = {
        update: function(isScanning, hasLock, targetSymbology, didAcquire) {
          state.isScanning = isScanning;
          state.hasLock = hasLock;
          if (typeof targetSymbology === 'number') state.targetSymbology = targetSymbology;
          if (didAcquire) {
            state.lockPulse = 1.0;
            state.reticleScale = 0.95;
            setTimeout(function() { state.reticleScale = 1.0; }, 120);
          }
        }
      };
    },

    // ----------------------------------------------------
    // 3. Printer Status (Tab 6: Zebra Thermal Spooler)
    // ----------------------------------------------------
    initPrinterStatus: function() {
      var canvas = document.getElementById('canvas-rive-printer');
      if (!canvas) return;

      var ctx = canvas.getContext('2d');
      var state = {
        printerState: 0, // 0=Idle, 1=Connecting, 2=Printing, 3=Error, 4=Success
        feedOffset: 0,
        ledPulse: 0
      };

      function resize() {
        var rect = canvas.getBoundingClientRect();
        var dpr = window.devicePixelRatio || 1;
        var w = rect.width || 180;
        var h = rect.height || 80;
        if (canvas.width !== Math.floor(w * dpr) || canvas.height !== Math.floor(h * dpr)) {
          canvas.width = Math.floor(w * dpr);
          canvas.height = Math.floor(h * dpr);
        }
      }
      resize();
      window.addEventListener('resize', resize);

      function render() {
        resize();
        var dpr = window.devicePixelRatio || 1;
        var w = canvas.width;
        var h = canvas.height;
        ctx.clearRect(0, 0, w, h);

        var cx = w / 2;
        var cy = h / 2;
        var pw = Math.min(w * 0.8, 140 * dpr);
        var ph = 50 * dpr;
        var px = cx - pw / 2;
        var py = cy - ph / 2;

        // Printer Chassis (Dark matte industrial casing)
        ctx.fillStyle = '#1E293B';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 2 * dpr;
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(px, py, pw, ph, 8 * dpr);
        } else {
          ctx.rect(px, py, pw, ph);
        }
        ctx.fill();
        ctx.stroke();

        // Print Head Ejection Slot
        var slotW = pw * 0.7;
        var slotX = cx - slotW / 2;
        var slotY = py + 10 * dpr;
        ctx.fillStyle = '#090D16';
        ctx.fillRect(slotX, slotY, slotW, 5 * dpr);

        // Animated Paper Label Feeding (when printing)
        if (state.printerState === 2) {
          state.feedOffset = (state.feedOffset + 1.2 * dpr) % (24 * dpr);
          var labelH = 18 * dpr + state.feedOffset;
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(slotX + 4 * dpr, slotY - labelH * 0.5, slotW - 8 * dpr, labelH);

          // Simulated Barcode lines on the paper
          ctx.fillStyle = '#000000';
          for (var i = 0; i < 6; i++) {
            ctx.fillRect(slotX + 8 * dpr + i * 8 * dpr, slotY - labelH * 0.4, 3 * dpr, 7 * dpr);
          }
        }

        // Status LED Light
        state.ledPulse += 0.05;
        var ledColor = '#10B981'; // Success / Ready
        if (state.printerState === 1) ledColor = '#00F0FF'; // Connecting
        if (state.printerState === 2) ledColor = '#F59E0B'; // Printing / Busy
        if (state.printerState === 3) ledColor = '#EF4444'; // Error

        var ledX = px + pw - 12 * dpr;
        var ledY = py + 12 * dpr;
        ctx.save();
        ctx.fillStyle = ledColor;
        ctx.shadowColor = ledColor;
        ctx.shadowBlur = 8 * dpr;
        ctx.beginPath();
        ctx.arc(ledX, ledY, 3.5 * dpr, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Status label text
        ctx.fillStyle = '#94A3B8';
        ctx.font = '600 ' + Math.round(9 * dpr) + 'px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        var labelStr = 'READY';
        if (state.printerState === 1) labelStr = 'CONNECTING...';
        if (state.printerState === 2) labelStr = 'PRINTING ZPL...';
        if (state.printerState === 3) labelStr = 'SPOOL ERROR';
        if (state.printerState === 4) labelStr = 'SPOOLED ✓';
        ctx.fillText(labelStr, cx, py + ph - 8 * dpr);

        requestAnimationFrame(render);
      }
      requestAnimationFrame(render);

      this.instances.printer = {
        setState: function(st) {
          state.printerState = st;
        }
      };
    },

    // ----------------------------------------------------
    // 4. FSMA Tamper-Evident Seal (Tab 5: FDA Part 11)
    // ----------------------------------------------------
    initFsmaSeal: function() {
      var canvas = document.getElementById('canvas-rive-seal');
      if (!canvas) return;

      var ctx = canvas.getContext('2d');
      var state = {
        isSigned: false,
        stampAnim: 0,
        rotation: 0
      };

      function resize() {
        var rect = canvas.getBoundingClientRect();
        var dpr = window.devicePixelRatio || 1;
        var w = rect.width || 100;
        var h = rect.height || 100;
        if (canvas.width !== Math.floor(w * dpr) || canvas.height !== Math.floor(h * dpr)) {
          canvas.width = Math.floor(w * dpr);
          canvas.height = Math.floor(h * dpr);
        }
      }
      resize();
      window.addEventListener('resize', resize);

      function render() {
        resize();
        var dpr = window.devicePixelRatio || 1;
        var w = canvas.width;
        var h = canvas.height;
        ctx.clearRect(0, 0, w, h);

        var cx = w / 2;
        var cy = h / 2;
        var r = Math.min(w, h) * 0.42;

        state.rotation += 0.005;

        // Outer Notched Certificate Ring
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(state.rotation);

        ctx.strokeStyle = state.isSigned ? 'rgba(16, 185, 129, 0.8)' : 'rgba(0, 240, 255, 0.4)';
        ctx.lineWidth = 2 * dpr;
        ctx.beginPath();
        for (var a = 0; a < Math.PI * 2; a += Math.PI / 16) {
          var outerR = r;
          var innerR = r - 4 * dpr;
          var x1 = Math.cos(a) * outerR;
          var y1 = Math.sin(a) * outerR;
          var x2 = Math.cos(a + 0.1) * innerR;
          var y2 = Math.sin(a + 0.1) * innerR;
          ctx.lineTo(x1, y1);
          ctx.lineTo(x2, y2);
        }
        ctx.closePath();
        ctx.stroke();
        ctx.restore();

        // Inner Circle & Shield
        ctx.fillStyle = state.isSigned ? 'rgba(16, 185, 129, 0.15)' : 'rgba(0, 240, 255, 0.08)';
        ctx.beginPath();
        ctx.arc(cx, cy, r * 0.78, 0, Math.PI * 2);
        ctx.fill();

        // Emblem Text
        ctx.fillStyle = state.isSigned ? '#10B981' : '#00F0FF';
        ctx.font = '800 ' + Math.round(8.5 * dpr) + 'px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(state.isSigned ? '21 CFR 11' : 'FSMA 204', cx, cy - 6 * dpr);
        ctx.font = '700 ' + Math.round(7.5 * dpr) + 'px sans-serif';
        ctx.fillText(state.isSigned ? '✓ VERIFIED' : 'SHA-256', cx, cy + 8 * dpr);

        requestAnimationFrame(render);
      }
      requestAnimationFrame(render);

      this.instances.seal = {
        setSigned: function(signed) {
          state.isSigned = signed;
        }
      };
    },

    // Public hook triggers
    triggerClearanceUpdate: function(distanceMm, isCompliant, didSnap) {
      if (this.instances.clearance) {
        this.instances.clearance.update(distanceMm, isCompliant, didSnap);
      }
    },

    triggerScannerAcquired: function(isScanning, hasLock, targetSymbology, didAcquire) {
      if (this.instances.scanner) {
        this.instances.scanner.update(isScanning, hasLock, targetSymbology, didAcquire);
      }
    },

    triggerPrinterState: function(st) {
      if (this.instances.printer) {
        this.instances.printer.setState(st);
      }
    },

    triggerSealSigned: function(signed) {
      if (this.instances.seal) {
        this.instances.seal.setSigned(signed);
      }
    }
  };

  window.DualMarkRive = RiveIntegration;

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() { RiveIntegration.init(); });
    } else {
      RiveIntegration.init();
    }
  }
})(typeof window !== 'undefined' ? window : globalThis);
