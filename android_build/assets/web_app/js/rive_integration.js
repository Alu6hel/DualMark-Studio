/**
 * DualMark Studio — Hybrid Rive WebAssembly & Procedural Canvas Engine
 *
 * Implements a dual-mode vector animation subsystem:
 * 1. WebAssembly Mode: Official @rive-app/canvas binary execution with typed state machine
 *    inputs (Number, Boolean, Trigger) and support for custom .riv binary assets.
 * 2. Procedural Fallback Mode: High-performance, zero-telemetry, GPU-accelerated 2D canvas
 *    vector rendering with spring-physics and interactive state machines for air-gapped workstations.
 *
 * Managed Targets:
 * - mascot: Marky Cybernetic Assistant (#canvas-rive-mascot, SM_Mascot)
 * - clearance: 50mm Optical Compliance Gauge (#canvas-rive-clearance, SM_Clearance)
 * - scanner: Cybernetic Imager Targeting HUD (#canvas-rive-scanner, SM_Scanner)
 * - printer: Industrial Thermal Transfer Spooler (#canvas-rive-printer, SM_Printer)
 * - seal: 21 CFR Part 11 Cryptographic Tamper Seal (#canvas-rive-seal, SM_Seal)
 */
(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.DualMarkRive = factory();
  }
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this), function() {
  'use strict';

  // =========================================================================
  // 1. HYBRID RIVE RUNTIME CONTAINER CLASS
  // =========================================================================

  /**
   * DualMarkRiveRuntime
   * Manages an individual canvas element with dual WASM/.riv & procedural fallback capabilities.
   */
  function DualMarkRiveRuntime(options) {
    options = options || {};
    this.targetName = options.targetName || 'widget';
    this.canvasId = options.canvasId || null;
    this.canvas = options.canvas || (this.canvasId && typeof document !== 'undefined' ? document.getElementById(this.canvasId) : null);
    this.stateMachineName = options.stateMachineName || ('SM_' + this.targetName.charAt(0).toUpperCase() + this.targetName.slice(1));
    this.defaultRivPath = options.defaultRivPath || null;
    this.onFallbackInit = options.onFallbackInit || null;
    this.customFallbackState = options.initialState ? Object.assign({}, options.initialState) : {};

    this.mode = 'procedural_fallback'; // 'wasm' | 'procedural_fallback'
    this.riveInstance = null;
    this.smInputs = {}; // Map of inputName -> Rive input object
    this.fallbackController = null;
    this.isDestroyed = false;

    this.init();
  }

  DualMarkRiveRuntime.prototype = {
    init: function() {
      // 1. Initialize procedural fallback first to ensure instant 0ms render
      if (typeof this.onFallbackInit === 'function') {
        this.fallbackController = this.onFallbackInit(this.canvas, this.customFallbackState);
      }

      // 2. If a default .riv path is provided, attempt to load via WASM
      if (this.defaultRivPath) {
        this.loadRiv(this.defaultRivPath, this.stateMachineName);
      }
    },

    /**
     * Loads a .riv binary asset (URL string, ArrayBuffer, or Blob/File)
     */
    loadRiv: async function(source, stateMachineName) {
      var self = this;
      var smName = stateMachineName || self.stateMachineName;

      var riveLib = (typeof window !== 'undefined' && window.rive)
        ? window.rive
        : (typeof globalThis !== 'undefined' && globalThis.rive ? globalThis.rive : null);

      if (!riveLib || typeof riveLib.Rive !== 'function' || !self.canvas) {
        self.mode = 'procedural_fallback';
        DualMarkRiveEngine.notifyModeChange(self.targetName, self.mode);
        return false;
      }

      try {
        var riveConfig = {
          canvas: self.canvas,
          autoplay: true,
          stateMachines: smName
        };

        if (typeof source === 'string') {
          riveConfig.src = source;
        } else if (source instanceof ArrayBuffer) {
          riveConfig.buffer = source;
        } else if (typeof Blob !== 'undefined' && source instanceof Blob) {
          var buf = await source.arrayBuffer();
          riveConfig.buffer = buf;
        } else {
          throw new Error('Unsupported Rive source type');
        }

        return new Promise(function(resolve) {
          try {
            if (self.riveInstance && typeof self.riveInstance.cleanup === 'function') {
              self.riveInstance.cleanup();
            }

            self.riveInstance = new riveLib.Rive(Object.assign({}, riveConfig, {
              onLoad: function() {
                try {
                  self.riveInstance.resizeDrawingSurfaceToCanvas();
                  var inputs = self.riveInstance.stateMachineInputs(smName);
                  self.smInputs = {};
                  if (inputs && inputs.length) {
                    inputs.forEach(function(inp) {
                      self.smInputs[inp.name] = inp;
                    });
                  }
                  self.mode = 'wasm';
                  // Pause procedural rendering loop if controller supports it
                  if (self.fallbackController && typeof self.fallbackController.pause === 'function') {
                    self.fallbackController.pause();
                  }
                  DualMarkRiveEngine.notifyModeChange(self.targetName, 'wasm');
                  resolve(true);
                } catch (e) {
                  console.warn('[DualMarkRive] State machine inputs error:', e);
                  self.mode = 'procedural_fallback';
                  resolve(false);
                }
              },
              onLoadError: function(err) {
                console.warn('[DualMarkRive] .riv asset load failed, falling back to procedural engine:', err);
                self.mode = 'procedural_fallback';
                if (self.fallbackController && typeof self.fallbackController.resume === 'function') {
                  self.fallbackController.resume();
                }
                DualMarkRiveEngine.notifyModeChange(self.targetName, 'procedural_fallback');
                resolve(false);
              }
            }));
          } catch (err) {
            console.warn('[DualMarkRive] Instantiation exception:', err);
            self.mode = 'procedural_fallback';
            resolve(false);
          }
        });
      } catch (e) {
        console.warn('[DualMarkRive] Load exception:', e);
        self.mode = 'procedural_fallback';
        return false;
      }
    },

    setNumber: function(name, value) {
      var numVal = Number(value);
      if (this.mode === 'wasm' && this.smInputs[name]) {
        this.smInputs[name].value = numVal;
      }
      this.customFallbackState[name] = numVal;
      if (this.fallbackController && typeof this.fallbackController.setNumber === 'function') {
        this.fallbackController.setNumber(name, numVal);
      }
    },

    setBoolean: function(name, value) {
      var boolVal = Boolean(value);
      if (this.mode === 'wasm' && this.smInputs[name]) {
        this.smInputs[name].value = boolVal;
      }
      this.customFallbackState[name] = boolVal;
      if (this.fallbackController && typeof this.fallbackController.setBoolean === 'function') {
        this.fallbackController.setBoolean(name, boolVal);
      }
    },

    fireTrigger: function(name) {
      if (this.mode === 'wasm' && this.smInputs[name]) {
        if (typeof this.smInputs[name].fire === 'function') {
          this.smInputs[name].fire();
        }
      }
      this.customFallbackState[name] = true;
      if (this.fallbackController && typeof this.fallbackController.fireTrigger === 'function') {
        this.fallbackController.fireTrigger(name);
      }
    },

    isUsingWasm: function() {
      return this.mode === 'wasm';
    },

    isUsingFallback: function() {
      return this.mode === 'procedural_fallback';
    },

    destroy: function() {
      this.isDestroyed = true;
      if (this.riveInstance && typeof this.riveInstance.cleanup === 'function') {
        this.riveInstance.cleanup();
      }
      if (this.fallbackController && typeof this.fallbackController.destroy === 'function') {
        this.fallbackController.destroy();
      }
    }
  };

  // =========================================================================
  // 2. PROCEDURAL 2D CANVAS VECTOR CONTROLLERS (AIR-GAPPED HIGH-DPI ENGINE)
  // =========================================================================

  // --- Target 1: Clearance Gauge Controller ---
  function createClearanceGaugeFallback(canvas, state) {
    if (!canvas) return null;
    var ctx = canvas.getContext('2d');
    var isPaused = false;
    var animFrame = null;

    state.distanceMm = state.distanceMm || 52.4;
    state.targetMm = state.targetMm || 52.4;
    state.isCompliant = (state.isCompliant !== false);
    state.snapPulse = 0;
    state.rippleRadius = 0;

    function resize() {
      var rect = canvas.getBoundingClientRect();
      var dpr = (typeof window !== 'undefined' && window.devicePixelRatio) || 1;
      var w = rect.width || 220;
      var h = rect.height || 220;
      if (canvas.width !== Math.floor(w * dpr) || canvas.height !== Math.floor(h * dpr)) {
        canvas.width = Math.floor(w * dpr);
        canvas.height = Math.floor(h * dpr);
      }
    }
    resize();
    if (typeof window !== 'undefined') window.addEventListener('resize', resize);

    function render() {
      if (isPaused) return;
      resize();
      var dpr = (typeof window !== 'undefined' && window.devicePixelRatio) || 1;
      var w = canvas.width;
      var h = canvas.height;
      var cx = w / 2;
      var cy = h / 2;
      var radius = Math.min(w, h) * 0.38;

      ctx.clearRect(0, 0, w, h);

      state.distanceMm += (state.targetMm - state.distanceMm) * 0.18;

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

      // Warning Zone (0 - 50mm)
      var splitRatio = 0.5;
      var splitAngle = startAngle + totalAngle * splitRatio;

      ctx.strokeStyle = 'rgba(239, 68, 68, 0.25)';
      ctx.beginPath();
      ctx.arc(cx, cy, radius, startAngle, splitAngle);
      ctx.stroke();

      // Compliant Zone (50 - 100mm)
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.25)';
      ctx.beginPath();
      ctx.arc(cx, cy, radius, splitAngle, endAngle);
      ctx.stroke();

      // Active Arc
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

      // Critical 50mm Threshold Tick
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

      // Center Readout
      ctx.save();
      ctx.fillStyle = 'rgba(13, 21, 39, 0.9)';
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 0.65, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = glowColor;
      ctx.lineWidth = 2 * dpr;
      ctx.stroke();

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '800 ' + Math.round(18 * dpr) + 'px "JetBrains Mono", monospace';
      ctx.fillText(state.distanceMm.toFixed(1) + ' mm', cx, cy - 6 * dpr);

      ctx.font = '700 ' + Math.round(9 * dpr) + 'px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = isOk ? '#10B981' : '#EF4444';
      ctx.fillText(isOk ? '✓ SUNRISE OK' : '⚠ VIOLATION', cx, cy + 14 * dpr);
      ctx.restore();

      animFrame = requestAnimationFrame(render);
    }
    animFrame = requestAnimationFrame(render);

    return {
      setNumber: function(name, val) {
        if (name === 'distanceMm') {
          state.targetMm = val;
        }
      },
      setBoolean: function(name, val) {
        if (name === 'isCompliant') {
          state.isCompliant = val;
        }
      },
      fireTrigger: function(name) {
        if (name === 'snapPulse') {
          state.snapPulse = 1.0;
          state.rippleRadius = 0;
        }
      },
      pause: function() { isPaused = true; },
      resume: function() {
        if (isPaused) {
          isPaused = false;
          animFrame = requestAnimationFrame(render);
        }
      },
      destroy: function() {
        isPaused = true;
        if (animFrame) cancelAnimationFrame(animFrame);
      }
    };
  }

  // --- Target 2: Scanner HUD Controller ---
  function createScannerHudFallback(canvas, state) {
    if (!canvas) return null;
    var ctx = canvas.getContext('2d');
    var isPaused = false;
    var animFrame = null;

    state.isScanning = (state.isScanning !== false);
    state.hasLock = Boolean(state.hasLock);
    state.laserY = 0.1;
    state.laserDir = 0.008;
    state.lockPulse = 0;
    state.reticleScale = 1.0;
    state.targetSymbology = state.targetSymbology || 1;

    function resize() {
      var rect = canvas.getBoundingClientRect();
      var dpr = (typeof window !== 'undefined' && window.devicePixelRatio) || 1;
      var w = rect.width || 320;
      var h = rect.height || 220;
      if (canvas.width !== Math.floor(w * dpr) || canvas.height !== Math.floor(h * dpr)) {
        canvas.width = Math.floor(w * dpr);
        canvas.height = Math.floor(h * dpr);
      }
    }
    resize();
    if (typeof window !== 'undefined') window.addEventListener('resize', resize);

    function render() {
      if (isPaused) return;
      resize();
      var dpr = (typeof window !== 'undefined' && window.devicePixelRatio) || 1;
      var w = canvas.width;
      var h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      if (state.isScanning) {
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

        ctx.beginPath();
        ctx.moveTo(bx, by + arm); ctx.lineTo(bx, by); ctx.lineTo(bx + arm, by);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(bx + boxSize - arm, by); ctx.lineTo(bx + boxSize, by); ctx.lineTo(bx + boxSize, by + arm);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(bx + boxSize, by + boxSize - arm); ctx.lineTo(bx + boxSize, by + boxSize); ctx.lineTo(bx + boxSize - arm, by + boxSize);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(bx + arm, by + boxSize); ctx.lineTo(bx, by + boxSize); ctx.lineTo(bx, by + boxSize - arm);
        ctx.stroke();
        ctx.restore();

        if (state.lockPulse > 0) {
          state.lockPulse -= 0.04;
          ctx.strokeStyle = 'rgba(16, 185, 129, ' + state.lockPulse + ')';
          ctx.lineWidth = 2 * dpr;
          ctx.strokeRect(bx - 10 * dpr, by - 10 * dpr, boxSize + 20 * dpr, boxSize + 20 * dpr);
        }
      }

      animFrame = requestAnimationFrame(render);
    }
    animFrame = requestAnimationFrame(render);

    return {
      setBoolean: function(name, val) {
        if (name === 'isScanning') state.isScanning = val;
        if (name === 'hasLock') state.hasLock = val;
      },
      setNumber: function(name, val) {
        if (name === 'targetSymbology') state.targetSymbology = val;
      },
      fireTrigger: function(name) {
        if (name === 'didAcquire') {
          state.lockPulse = 1.0;
          state.reticleScale = 0.95;
          setTimeout(function() { state.reticleScale = 1.0; }, 120);
        }
      },
      pause: function() { isPaused = true; },
      resume: function() {
        if (isPaused) {
          isPaused = false;
          animFrame = requestAnimationFrame(render);
        }
      },
      destroy: function() {
        isPaused = true;
        if (animFrame) cancelAnimationFrame(animFrame);
      }
    };
  }

  // --- Target 3: Zebra Printer Status Controller ---
  function createPrinterFallback(canvas, state) {
    if (!canvas) return null;
    var ctx = canvas.getContext('2d');
    var isPaused = false;
    var animFrame = null;

    state.printerState = state.printerState || 0; // 0=Idle, 1=Connecting, 2=Printing, 3=Error, 4=Success
    state.feedOffset = 0;
    state.ledPulse = 0;

    function resize() {
      var rect = canvas.getBoundingClientRect();
      var dpr = (typeof window !== 'undefined' && window.devicePixelRatio) || 1;
      var w = rect.width || 180;
      var h = rect.height || 80;
      if (canvas.width !== Math.floor(w * dpr) || canvas.height !== Math.floor(h * dpr)) {
        canvas.width = Math.floor(w * dpr);
        canvas.height = Math.floor(h * dpr);
      }
    }
    resize();
    if (typeof window !== 'undefined') window.addEventListener('resize', resize);

    function render() {
      if (isPaused) return;
      resize();
      var dpr = (typeof window !== 'undefined' && window.devicePixelRatio) || 1;
      var w = canvas.width;
      var h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      var cx = w / 2;
      var cy = h / 2;
      var pw = Math.min(w * 0.8, 140 * dpr);
      var ph = 50 * dpr;
      var px = cx - pw / 2;
      var py = cy - ph / 2;

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

      var slotW = pw * 0.7;
      var slotX = cx - slotW / 2;
      var slotY = py + 10 * dpr;
      ctx.fillStyle = '#090D16';
      ctx.fillRect(slotX, slotY, slotW, 5 * dpr);

      if (state.printerState === 2) {
        state.feedOffset = (state.feedOffset + 1.2 * dpr) % (24 * dpr);
        var labelH = 18 * dpr + state.feedOffset;
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(slotX + 4 * dpr, slotY - labelH * 0.5, slotW - 8 * dpr, labelH);

        ctx.fillStyle = '#000000';
        for (var i = 0; i < 6; i++) {
          ctx.fillRect(slotX + 8 * dpr + i * 8 * dpr, slotY - labelH * 0.4, 3 * dpr, 7 * dpr);
        }
      }

      state.ledPulse += 0.05;
      var ledColor = '#10B981';
      if (state.printerState === 1) ledColor = '#00F0FF';
      if (state.printerState === 2) ledColor = '#F59E0B';
      if (state.printerState === 3) ledColor = '#EF4444';

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

      ctx.fillStyle = '#94A3B8';
      ctx.font = '600 ' + Math.round(9 * dpr) + 'px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      var labelStr = 'READY';
      if (state.printerState === 1) labelStr = 'CONNECTING...';
      if (state.printerState === 2) labelStr = 'PRINTING ZPL...';
      if (state.printerState === 3) labelStr = 'SPOOL ERROR';
      if (state.printerState === 4) labelStr = 'SPOOLED ✓';
      ctx.fillText(labelStr, cx, py + ph - 8 * dpr);

      animFrame = requestAnimationFrame(render);
    }
    animFrame = requestAnimationFrame(render);

    return {
      setNumber: function(name, val) {
        if (name === 'printerState') state.printerState = val;
      },
      fireTrigger: function(name) {
        if (name === 'feedPulse') {
          state.feedOffset = 0;
        }
      },
      pause: function() { isPaused = true; },
      resume: function() {
        if (isPaused) {
          isPaused = false;
          animFrame = requestAnimationFrame(render);
        }
      },
      destroy: function() {
        isPaused = true;
        if (animFrame) cancelAnimationFrame(animFrame);
      }
    };
  }

  // --- Target 4: FSMA Tamper-Evident Seal Controller ---
  function createFsmaSealFallback(canvas, state) {
    if (!canvas) return null;
    var ctx = canvas.getContext('2d');
    var isPaused = false;
    var animFrame = null;

    state.isSigned = Boolean(state.isSigned);
    state.rotation = 0;

    function resize() {
      var rect = canvas.getBoundingClientRect();
      var dpr = (typeof window !== 'undefined' && window.devicePixelRatio) || 1;
      var w = rect.width || 100;
      var h = rect.height || 100;
      if (canvas.width !== Math.floor(w * dpr) || canvas.height !== Math.floor(h * dpr)) {
        canvas.width = Math.floor(w * dpr);
        canvas.height = Math.floor(h * dpr);
      }
    }
    resize();
    if (typeof window !== 'undefined') window.addEventListener('resize', resize);

    function render() {
      if (isPaused) return;
      resize();
      var dpr = (typeof window !== 'undefined' && window.devicePixelRatio) || 1;
      var w = canvas.width;
      var h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      var cx = w / 2;
      var cy = h / 2;
      var r = Math.min(w, h) * 0.42;

      state.rotation += 0.005;

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

      ctx.fillStyle = state.isSigned ? 'rgba(16, 185, 129, 0.15)' : 'rgba(0, 240, 255, 0.08)';
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.78, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = state.isSigned ? '#10B981' : '#00F0FF';
      ctx.font = '800 ' + Math.round(8.5 * dpr) + 'px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(state.isSigned ? '21 CFR 11' : 'FSMA 204', cx, cy - 6 * dpr);
      ctx.font = '700 ' + Math.round(7.5 * dpr) + 'px sans-serif';
      ctx.fillText(state.isSigned ? '✓ VERIFIED' : 'SHA-256', cx, cy + 8 * dpr);

      animFrame = requestAnimationFrame(render);
    }
    animFrame = requestAnimationFrame(render);

    return {
      setBoolean: function(name, val) {
        if (name === 'isSigned') state.isSigned = val;
      },
      fireTrigger: function(name) {
        if (name === 'sealPulse') {
          state.rotation += 0.2;
        }
      },
      pause: function() { isPaused = true; },
      resume: function() {
        if (isPaused) {
          isPaused = false;
          animFrame = requestAnimationFrame(render);
        }
      },
      destroy: function() {
        isPaused = true;
        if (animFrame) cancelAnimationFrame(animFrame);
      }
    };
  }

  // --- Target 5: Marky Mascot Cybernetic Companion Controller ---
  function createMarkyMascotFallback(canvas, state) {
    if (!canvas) return null;
    var ctx = canvas.getContext('2d');
    var isPaused = false;
    var animFrame = null;

    state.persona = state.persona || (typeof localStorage !== 'undefined' && localStorage.getItem('dualmark_mascot_style')) || 'marky_scanner';
    state.lookX = state.lookX || 0;
    state.lookY = state.lookY || 0;
    state.targetLookX = 0;
    state.targetLookY = 0;
    state.blink = 0;
    state.nextBlink = Date.now() + 2500;
    state.isBlinking = false;
    state.celebrateTimer = 0;
    state.laserY = 0;
    state.bobOffset = 0;
    state.tick = 0;

    function resize() {
      var rect = canvas.getBoundingClientRect();
      var dpr = (typeof window !== 'undefined' && window.devicePixelRatio) || 1;
      var w = rect.width || 38;
      var h = rect.height || 38;
      if (canvas.width !== Math.floor(w * dpr) || canvas.height !== Math.floor(h * dpr)) {
        canvas.width = Math.floor(w * dpr);
        canvas.height = Math.floor(h * dpr);
      }
    }
    resize();
    if (typeof window !== 'undefined') window.addEventListener('resize', resize);

    if (typeof window !== 'undefined') {
      window.addEventListener('mousemove', function(e) {
        var rect = canvas.getBoundingClientRect();
        var cx = rect.left + rect.width / 2;
        var cy = rect.top + rect.height / 2;
        var dx = e.clientX - cx;
        var dy = e.clientY - cy;
        var maxDist = 300;
        state.targetLookX = Math.max(-1, Math.min(1, dx / maxDist));
        state.targetLookY = Math.max(-1, Math.min(1, dy / maxDist));
      });
    }

    function render() {
      if (isPaused) return;
      resize();
      var dpr = (typeof window !== 'undefined' && window.devicePixelRatio) || 1;
      var w = canvas.width;
      var h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      if (state.persona === 'mascot_off') {
        animFrame = requestAnimationFrame(render);
        return;
      }

      state.tick += 0.05;
      state.bobOffset = Math.sin(state.tick) * (1.2 * dpr);
      state.lookX += (state.targetLookX - state.lookX) * 0.15;
      state.lookY += (state.targetLookY - state.lookY) * 0.15;

      var now = Date.now();
      if (now > state.nextBlink) {
        state.isBlinking = true;
        state.blink = 1.0;
        state.nextBlink = now + 2500 + Math.random() * 3000;
      }
      if (state.isBlinking) {
        state.blink -= 0.12;
        if (state.blink <= 0) {
          state.blink = 0;
          state.isBlinking = false;
        }
      }

      var isCelebrating = state.celebrateTimer > 0;
      if (isCelebrating) {
        state.celebrateTimer--;
        state.bobOffset = Math.sin(state.tick * 3) * (2.8 * dpr);
      }

      var cx = w / 2;
      var cy = h / 2 + state.bobOffset;
      var r = Math.min(w, h) * 0.40;

      // Persona 1: Cyber Reticle (Futuristic Optical HUD)
      if (state.persona === 'cyber_reticle') {
        ctx.save();
        var reticleColor = isCelebrating ? '#10B981' : '#00F0FF';
        ctx.strokeStyle = reticleColor;
        ctx.lineWidth = 1.6 * dpr;

        // Outer rotating dashed ring
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(state.tick * 0.4);
        ctx.beginPath();
        ctx.setLineDash([4 * dpr, 4 * dpr]);
        ctx.arc(0, 0, r * 0.95, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        // Inner counter-rotating ring
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(-state.tick * 0.6);
        ctx.beginPath();
        ctx.setLineDash([2 * dpr, 3 * dpr]);
        ctx.arc(0, 0, r * 0.6, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        // Crosshairs
        ctx.beginPath();
        ctx.moveTo(cx - r * 0.4, cy); ctx.lineTo(cx + r * 0.4, cy);
        ctx.moveTo(cx, cy - r * 0.4); ctx.lineTo(cx, cy + r * 0.4);
        ctx.stroke();

        // Center targeting pulse dot
        var pX = cx + state.lookX * (2.0 * dpr);
        var pY = cy + state.lookY * (2.0 * dpr);
        ctx.fillStyle = reticleColor;
        ctx.shadowColor = reticleColor;
        ctx.shadowBlur = (isCelebrating ? 10 : 5) * dpr;
        ctx.beginPath();
        ctx.arc(pX, pY, 2.5 * dpr, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        animFrame = requestAnimationFrame(render);
        return;
      }

      // Persona 2: Minimalist Cleanroom LED Pulse
      if (state.persona === 'minimal_pulse') {
        ctx.save();
        var ledHue = isCelebrating ? '#10B981' : '#00F0FF';
        var pulseScale = 1.0 + 0.15 * Math.sin(state.tick * (isCelebrating ? 4 : 1.5));
        var glowR = r * 0.7 * pulseScale;

        var radGrad = ctx.createRadialGradient(cx, cy, 2 * dpr, cx, cy, glowR);
        radGrad.addColorStop(0, ledHue);
        radGrad.addColorStop(0.5, isCelebrating ? 'rgba(16, 185, 129, 0.4)' : 'rgba(0, 240, 255, 0.35)');
        radGrad.addColorStop(1, 'rgba(0, 240, 255, 0)');

        ctx.fillStyle = radGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, glowR, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#FFFFFF';
        ctx.shadowColor = ledHue;
        ctx.shadowBlur = 8 * dpr;
        ctx.beginPath();
        ctx.arc(cx, cy, 3.2 * dpr, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        animFrame = requestAnimationFrame(render);
        return;
      }

      // Persona 3: Packaging Compliance Specialist (Friendly Industrial Engineer)
      if (state.persona === 'specialist_avatar') {
        ctx.save();
        // Industrial Safety Cap / Hardhat
        ctx.fillStyle = '#F59E0B';
        ctx.beginPath();
        ctx.arc(cx, cy - r * 0.3, r * 0.9, Math.PI, 0);
        ctx.fill();
        ctx.fillStyle = '#D97706';
        ctx.fillRect(cx - r * 0.95, cy - r * 0.3, r * 1.9, 3.5 * dpr);

        // Face
        ctx.fillStyle = '#FED7AA';
        ctx.beginPath();
        ctx.arc(cx, cy + r * 0.2, r * 0.75, 0, Math.PI);
        ctx.fill();

        // Safety Visor / Protective Glasses
        var gw = r * 1.3, gh = r * 0.5;
        var gx = cx - gw / 2, gy = cy - r * 0.2;
        ctx.fillStyle = 'rgba(0, 240, 255, 0.4)';
        ctx.strokeStyle = '#00F0FF';
        ctx.lineWidth = 1.2 * dpr;
        ctx.fillRect(gx, gy, gw, gh);
        ctx.strokeRect(gx, gy, gw, gh);

        // Barcode reflection lines on visor
        ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
        for (var bi = 0; bi < 4; bi++) {
          ctx.fillRect(gx + 3 * dpr + bi * 4 * dpr, gy + 2 * dpr, 1.2 * dpr, gh - 4 * dpr);
        }

        // Eyes / Smile
        if (isCelebrating) {
          ctx.strokeStyle = '#10B981';
          ctx.lineWidth = 1.5 * dpr;
          ctx.beginPath();
          ctx.arc(cx, cy + r * 0.45, 3 * dpr, 0, Math.PI);
          ctx.stroke();
        }
        ctx.restore();

        animFrame = requestAnimationFrame(render);
        return;
      }

      // Persona 4: Marky Scanner Bot (Default)
      // Aura / Shield Glow
      ctx.save();
      var glowColor = isCelebrating ? 'rgba(16, 185, 129, 0.4)' : 'rgba(0, 240, 255, 0.25)';
      ctx.fillStyle = glowColor;
      ctx.beginPath();
      ctx.arc(cx, cy, r + 2.5 * dpr, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Bot Helmet Chassis
      ctx.save();
      ctx.fillStyle = '#0F172A';
      ctx.strokeStyle = isCelebrating ? '#10B981' : '#00F0FF';
      ctx.lineWidth = 1.6 * dpr;
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(cx - r, cy - r, r * 2, r * 2, 7 * dpr);
      } else {
        ctx.rect(cx - r, cy - r, r * 2, r * 2);
      }
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // Visor Screen
      var vw = r * 1.5;
      var vh = r * 0.95;
      var vx = cx - vw / 2;
      var vy = cy - vh / 2;
      ctx.save();
      ctx.fillStyle = '#020617';
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(vx, vy, vw, vh, 4 * dpr);
      } else {
        ctx.rect(vx, vy, vw, vh);
      }
      ctx.fill();
      ctx.restore();

      // Cybernetic Optic Eyes
      var eyeDist = 4.2 * dpr;
      var eyeRadius = (isCelebrating ? 3.8 : 3.0) * dpr;
      var eyeColor = isCelebrating ? '#10B981' : '#00F0FF';

      if (!state.isBlinking) {
        ctx.save();
        ctx.fillStyle = eyeColor;
        ctx.shadowColor = eyeColor;
        ctx.shadowBlur = (isCelebrating ? 8 : 5) * dpr;

        var lx = cx - eyeDist + state.lookX * (2.2 * dpr);
        var rx = cx + eyeDist + state.lookX * (2.2 * dpr);
        var ey = cy + state.lookY * (1.8 * dpr);

        if (isCelebrating) {
          ctx.lineWidth = 1.8 * dpr;
          ctx.strokeStyle = '#10B981';
          ctx.beginPath();
          ctx.arc(lx, ey, eyeRadius, Math.PI, 0);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(rx, ey, eyeRadius, Math.PI, 0);
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.arc(lx, ey, eyeRadius, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(rx, ey, eyeRadius, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      // Small Antenna on top of head
      ctx.save();
      ctx.fillStyle = isCelebrating ? '#10B981' : '#00F0FF';
      ctx.beginPath();
      ctx.arc(cx, cy - r, 1.8 * dpr, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      animFrame = requestAnimationFrame(render);
    }
    animFrame = requestAnimationFrame(render);

    return {
      setPersona: function(p) {
        state.persona = p;
      },
      setBoolean: function(name, val) {
        if (name === 'isCelebrating') {
          state.celebrateTimer = val ? 90 : 0;
        }
      },
      setNumber: function(name, val) {
        if (name === 'lookX') state.targetLookX = val;
        if (name === 'lookY') state.targetLookY = val;
      },
      fireTrigger: function(name) {
        if (name === 'celebrate' || name === 'celebrateTrigger') {
          state.celebrateTimer = 90;
        }
      },
      pause: function() { isPaused = true; },
      resume: function() {
        if (isPaused) {
          isPaused = false;
          animFrame = requestAnimationFrame(render);
        }
      },
      destroy: function() {
        isPaused = true;
        if (animFrame) cancelAnimationFrame(animFrame);
      }
    };
  }

  // =========================================================================
  // 3. CENTRAL ENGINE CONTROLLER
  // =========================================================================

  var RiveIntegration = {
    DualMarkRiveRuntime: DualMarkRiveRuntime,
    instances: {},
    active: true,
    listeners: [],

    initClearanceGauge: function() {
      this.instances.clearance = new DualMarkRiveRuntime({
        targetName: 'clearance',
        canvasId: 'canvas-rive-clearance',
        stateMachineName: 'SM_Clearance',
        initialState: { distanceMm: 52.4, isCompliant: true },
        onFallbackInit: createClearanceGaugeFallback
      });
      return this.instances.clearance;
    },

    initScannerHud: function() {
      this.instances.scanner = new DualMarkRiveRuntime({
        targetName: 'scanner',
        canvasId: 'canvas-rive-scanner',
        stateMachineName: 'SM_Scanner',
        initialState: { isScanning: true, hasLock: false, targetSymbology: 1 },
        onFallbackInit: createScannerHudFallback
      });
      return this.instances.scanner;
    },

    initPrinterStatus: function() {
      this.instances.printer = new DualMarkRiveRuntime({
        targetName: 'printer',
        canvasId: 'canvas-rive-printer',
        stateMachineName: 'SM_Printer',
        initialState: { printerState: 0 },
        onFallbackInit: createPrinterFallback
      });
      return this.instances.printer;
    },

    initFsmaSeal: function() {
      this.instances.seal = new DualMarkRiveRuntime({
        targetName: 'seal',
        canvasId: 'canvas-rive-seal',
        stateMachineName: 'SM_Seal',
        initialState: { isSigned: false },
        onFallbackInit: createFsmaSealFallback
      });
      return this.instances.seal;
    },

    initMarkyMascot: function() {
      var savedPersona = this.getMascotStyle();
      this.instances.mascot = new DualMarkRiveRuntime({
        targetName: 'mascot',
        canvasId: 'canvas-rive-mascot',
        stateMachineName: 'SM_Mascot',
        initialState: { persona: savedPersona, isCelebrating: false },
        onFallbackInit: createMarkyMascotFallback
      });
      var wrap = (typeof document !== 'undefined') ? document.getElementById('mascot-companion-wrap') : null;
      if (wrap) {
        wrap.style.display = (savedPersona === 'mascot_off') ? 'none' : 'flex';
      }
      return this.instances.mascot;
    },

    setMascotStyle: function(style) {
      this._mascotStyle = style;
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('dualmark_mascot_style', style);
      }
      if (this.instances.mascot && this.instances.mascot.fallbackController && typeof this.instances.mascot.fallbackController.setPersona === 'function') {
        this.instances.mascot.fallbackController.setPersona(style);
      }
      var wrap = (typeof document !== 'undefined') ? document.getElementById('mascot-companion-wrap') : null;
      if (wrap) {
        wrap.style.display = (style === 'mascot_off') ? 'none' : 'flex';
      }
      if (this.instances.mascotPreview && this.instances.mascotPreview.fallbackController && typeof this.instances.mascotPreview.fallbackController.setPersona === 'function') {
        this.instances.mascotPreview.fallbackController.setPersona(style);
      }
    },

    getMascotStyle: function() {
      if (this._mascotStyle) return this._mascotStyle;
      if (typeof localStorage !== 'undefined') {
        var s = localStorage.getItem('dualmark_mascot_style');
        if (s) return s;
      }
      return 'marky_scanner';
    },

    initMascotPreview: function(canvasId) {
      var cId = canvasId || 'canvas-mascot-preview';
      var initialStyle = this.getMascotStyle();
      this.instances.mascotPreview = new DualMarkRiveRuntime({
        targetName: 'mascot_preview',
        canvasId: cId,
        initialState: { persona: initialStyle, isCelebrating: false },
        onFallbackInit: createMarkyMascotFallback
      });
      return this.instances.mascotPreview;
    },

    init: function() {
      this.initClearanceGauge();
      this.initScannerHud();
      this.initPrinterStatus();
      this.initFsmaSeal();
      this.initMarkyMascot();
      this.initLiveBackground();

      // Expose legacy backward-compatible method aliases
      if (this.instances.clearance) {
        this.instances.clearance.update = function(distanceMm, isCompliant, didSnap) {
          DualMarkRiveEngine.triggerClearanceUpdate(distanceMm, isCompliant, didSnap);
        };
      }
      if (this.instances.scanner) {
        this.instances.scanner.update = function(isScanning, hasLock, targetSymbology, didAcquire) {
          DualMarkRiveEngine.triggerScannerAcquired(isScanning, hasLock, targetSymbology, didAcquire);
        };
      }
      if (this.instances.printer) {
        this.instances.printer.setState = function(st) {
          DualMarkRiveEngine.triggerPrinterState(st);
        };
      }
      if (this.instances.seal) {
        this.instances.seal.setSigned = function(signed) {
          DualMarkRiveEngine.triggerSealSigned(signed);
        };
      }
      if (this.instances.mascot) {
        this.instances.mascot.celebrate = function() {
          DualMarkRiveEngine.triggerMascotCelebrate();
        };
      }
    },

    /**
     * Hot-swaps an animation canvas with an external .riv binary file
     */
    loadCustomRiv: function(targetName, rivSource, stateMachineName) {
      var instance = this.instances[targetName];
      if (!instance) {
        return Promise.reject(new Error('Unknown target widget: ' + targetName));
      }
      return instance.loadRiv(rivSource, stateMachineName);
    },

    getRuntimeStatus: function(targetName) {
      var instance = this.instances[targetName];
      if (!instance) return null;
      return {
        targetName: targetName,
        mode: instance.mode,
        isWasm: instance.isUsingWasm(),
        isFallback: instance.isUsingFallback(),
        stateMachineName: instance.stateMachineName
      };
    },

    getAllRuntimeStatuses: function() {
      var res = {};
      for (var k in this.instances) {
        res[k] = this.getRuntimeStatus(k);
      }
      return res;
    },

    onModeChange: function(fn) {
      if (typeof fn === 'function') {
        this.listeners.push(fn);
      }
    },

    notifyModeChange: function(targetName, mode) {
      this.listeners.forEach(function(fn) {
        try { fn(targetName, mode); } catch (e) {}
      });
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('dualmark:rive:mode_change', {
          detail: { targetName: targetName, mode: mode }
        }));
      }
    },

    // Public hook triggers (Strict backward compatibility with app.js)
    triggerClearanceUpdate: function(distanceMm, isCompliant, didSnap) {
      if (this.instances.clearance) {
        this.instances.clearance.setNumber('distanceMm', distanceMm);
        this.instances.clearance.setBoolean('isCompliant', isCompliant);
        if (didSnap) {
          this.instances.clearance.fireTrigger('snapPulse');
        }
      }
    },

    triggerScannerAcquired: function(isScanning, hasLock, targetSymbology, didAcquire) {
      if (this.instances.scanner) {
        this.instances.scanner.setBoolean('isScanning', isScanning);
        this.instances.scanner.setBoolean('hasLock', hasLock);
        if (typeof targetSymbology === 'number') {
          this.instances.scanner.setNumber('targetSymbology', targetSymbology);
        }
        if (didAcquire) {
          this.instances.scanner.fireTrigger('didAcquire');
        }
      }
    },

    triggerPrinterState: function(st) {
      if (this.instances.printer) {
        this.instances.printer.setNumber('printerState', st);
        if (st === 2) {
          this.instances.printer.fireTrigger('feedPulse');
        }
      }
    },

    triggerSealSigned: function(signed) {
      if (this.instances.seal) {
        this.instances.seal.setBoolean('isSigned', signed);
        if (signed) {
          this.instances.seal.fireTrigger('sealPulse');
        }
      }
    },

    triggerMascotCelebrate: function() {
      if (this.instances.mascot) {
        this.instances.mascot.setBoolean('isCelebrating', true);
        this.instances.mascot.fireTrigger('celebrate');
      }
      if (this.liveBackground && typeof this.liveBackground.createRipple === 'function') {
        var cx = (typeof window !== 'undefined' ? window.innerWidth / 2 : 200);
        this.liveBackground.createRipple(cx, 70, 160);
      }
    },

    initLiveBackground: function() {
      this.liveBackground = DualMarkLiveBackground;
      DualMarkLiveBackground.init('dualmark-live-bg');
      return this.liveBackground;
    }
  };


  // =========================================================================
  // 6. DUALMARK INTERACTIVE GPU LIVE BACKGROUND ENGINE
  // =========================================================================
  var DualMarkLiveBackground = {
    canvas: null,
    ctx: null,
    animFrame: null,
    width: 0,
    height: 0,
    dpr: 1,
    activeTheme: 'default',
    particles: [],
    ripples: [],
    scanLine: { y: 0, speed: 0.9, active: true },
    mouse: { x: -1000, y: -1000, active: false, radius: 140 },
    lastTime: 0,
    isPaused: false,

    themes: {
      'theme-mascot-amber': {
        name: 'Mascot Safety Amber',
        bgGradient: ['#0A101D', '#121E33'],
        gridColor: 'rgba(245, 158, 11, 0.08)',
        filamentColor: 'rgba(245, 158, 11, 0.16)',
        particleColors: ['#F59E0B', '#FBBF24', '#D97706', '#FEF3C7'],
        laserColor: 'rgba(245, 158, 11, 0.38)',
        laserGlow: 'rgba(245, 158, 11, 0.16)',
        rippleColor: 'rgba(245, 158, 11, 0.55)'
      },
      'theme-mascot-cyber': {
        name: 'Mascot Cyber Visor',
        bgGradient: ['#030A14', '#081A33'],
        gridColor: 'rgba(0, 240, 255, 0.09)',
        filamentColor: 'rgba(0, 240, 255, 0.18)',
        particleColors: ['#00F0FF', '#38BDF8', '#06B6D4', '#E0F2FE'],
        laserColor: 'rgba(0, 240, 255, 0.42)',
        laserGlow: 'rgba(0, 240, 255, 0.18)',
        rippleColor: 'rgba(0, 240, 255, 0.55)'
      },
      'theme-light': {
        name: 'Clean Room Light',
        bgGradient: ['#F1F5F9', '#E2E8F0'],
        gridColor: 'rgba(2, 132, 199, 0.05)',
        filamentColor: 'rgba(2, 132, 199, 0.10)',
        particleColors: ['#0284C7', '#0EA5E9', '#38BDF8'],
        laserColor: 'rgba(2, 132, 199, 0.25)',
        laserGlow: 'rgba(2, 132, 199, 0.08)',
        rippleColor: 'rgba(2, 132, 199, 0.35)'
      },
      'theme-outdoor': {
        name: 'Outdoor High-Contrast',
        bgGradient: ['#FFFFFF', '#F8FAFC'],
        gridColor: 'rgba(0, 0, 0, 0.06)',
        filamentColor: 'rgba(0, 0, 0, 0.12)',
        particleColors: ['#000000', '#334155', '#0284C7'],
        laserColor: 'rgba(0, 0, 0, 0.3)',
        laserGlow: 'rgba(0, 0, 0, 0.1)',
        rippleColor: 'rgba(0, 0, 0, 0.4)'
      },
      'default': {
        name: 'Industrial Obsidian',
        bgGradient: ['#070B14', '#0D1527'],
        gridColor: 'rgba(0, 240, 255, 0.05)',
        filamentColor: 'rgba(0, 240, 255, 0.12)',
        particleColors: ['#00F0FF', '#38BDF8', '#64748B', '#0EA5E9'],
        laserColor: 'rgba(0, 240, 255, 0.28)',
        laserGlow: 'rgba(0, 240, 255, 0.12)',
        rippleColor: 'rgba(0, 240, 255, 0.45)'
      }
    },

    init: function(canvasId) {
      var id = canvasId || 'dualmark-live-bg';
      if (typeof document === 'undefined') return;
      this.canvas = document.getElementById(id);
      if (!this.canvas) return;
      this.ctx = this.canvas.getContext('2d');
      if (!this.ctx) return;

      var self = this;
      this.detectCurrentTheme();
      this.resize();
      this.initParticles();

      window.addEventListener('resize', function() {
        self.resize();
      }, { passive: true });

      window.addEventListener('pointermove', function(e) {
        self.mouse.x = e.clientX;
        self.mouse.y = e.clientY;
        self.mouse.active = true;
      }, { passive: true });

      window.addEventListener('pointerleave', function() {
        self.mouse.active = false;
        self.mouse.x = -1000;
        self.mouse.y = -1000;
      }, { passive: true });

      window.addEventListener('click', function(e) {
        self.createRipple(e.clientX, e.clientY);
      }, { passive: true });

      if (typeof document.hidden !== 'undefined') {
        document.addEventListener('visibilitychange', function() {
          if (document.hidden) {
            self.pause();
          } else {
            self.resume();
          }
        });
      }

      this.lastTime = (typeof performance !== 'undefined' ? performance.now() : Date.now());
      this.startLoop();
    },

    detectCurrentTheme: function() {
      if (typeof document === 'undefined') return;
      var b = document.body;
      if (b.classList.contains('theme-mascot-amber')) {
        this.activeTheme = 'theme-mascot-amber';
      } else if (b.classList.contains('theme-mascot-cyber')) {
        this.activeTheme = 'theme-mascot-cyber';
      } else if (b.classList.contains('theme-outdoor')) {
        this.activeTheme = 'theme-outdoor';
      } else if (b.classList.contains('theme-light')) {
        this.activeTheme = 'theme-light';
      } else {
        this.activeTheme = 'default';
      }
    },

    setTheme: function(themeName) {
      if (this.themes[themeName]) {
        this.activeTheme = themeName;
      } else {
        this.detectCurrentTheme();
      }
      this.createRipple(this.width / 2, this.height / 2, 90);
    },

    resize: function() {
      if (!this.canvas) return;
      this.dpr = Math.min((typeof window !== 'undefined' && window.devicePixelRatio) || 1, 2);
      var w = (typeof window !== 'undefined' && window.innerWidth) || 1024;
      var h = (typeof window !== 'undefined' && window.innerHeight) || 768;
      this.width = w;
      this.height = h;
      this.canvas.width = Math.floor(w * this.dpr);
      this.canvas.height = Math.floor(h * this.dpr);
      this.canvas.style.width = w + 'px';
      this.canvas.style.height = h + 'px';
    },

    initParticles: function() {
      this.particles = [];
      var count = Math.min(Math.floor((this.width * this.height) / 28000), 55);
      if (count < 24) count = 24;

      for (var i = 0; i < count; i++) {
        this.particles.push({
          x: Math.random() * this.width,
          y: Math.random() * this.height,
          vx: (Math.random() - 0.5) * 0.45,
          vy: (Math.random() - 0.5) * 0.45,
          radius: 1.2 + Math.random() * 2.2,
          colorIndex: Math.floor(Math.random() * 4),
          angle: Math.random() * Math.PI * 2,
          vAngle: (Math.random() - 0.5) * 0.02,
          shape: Math.random() > 0.75 ? 'rect' : 'circle'
        });
      }
    },

    createRipple: function(x, y, maxR) {
      this.ripples.push({
        x: x || (this.width / 2),
        y: y || (this.height / 2),
        radius: 4,
        maxRadius: maxR || Math.min(this.width, this.height) * 0.45,
        alpha: 0.85,
        speed: 3.5
      });
      if (this.ripples.length > 8) {
        this.ripples.shift();
      }
    },

    triggerScanSweep: function() {
      this.scanLine.y = 0;
      this.scanLine.active = true;
    },

    startLoop: function() {
      var self = this;
      if (self.animFrame) {
        cancelAnimationFrame(self.animFrame);
        self.animFrame = null;
      }
      function tick(now) {
        if (self.isPaused) {
          self.animFrame = null;
          return;
        }
        var dt = (now - self.lastTime) / 1000;
        if (dt > 0.1) dt = 0.1;
        self.update(dt);
        self.render();
        self.lastTime = now;
        self.animFrame = requestAnimationFrame(tick);
      }
      if (typeof requestAnimationFrame !== 'undefined' && !this.isPaused) {
        this.animFrame = requestAnimationFrame(tick);
      }
    },

    pause: function() {
      this.isPaused = true;
      if (this.animFrame) {
        cancelAnimationFrame(this.animFrame);
        this.animFrame = null;
      }
    },

    resume: function() {
      if (this.isPaused) {
        this.isPaused = false;
        this.lastTime = (typeof performance !== 'undefined' ? performance.now() : Date.now());
        if (!this.animFrame) {
          this.startLoop();
        }
      }
    },

    update: function(dt) {
      var w = this.width;
      var h = this.height;

      if (this.scanLine.active) {
        this.scanLine.y += this.scanLine.speed * 120 * dt;
        if (this.scanLine.y > h + 40) {
          this.scanLine.y = -40;
        }
      }

      for (var r = this.ripples.length - 1; r >= 0; r--) {
        var rip = this.ripples[r];
        rip.radius += rip.speed * 60 * dt;
        rip.alpha -= 0.65 * dt;
        if (rip.alpha <= 0 || rip.radius >= rip.maxRadius) {
          this.ripples.splice(r, 1);
        }
      }

      var mx = this.mouse.x;
      var my = this.mouse.y;
      var mActive = this.mouse.active;
      var mRad = this.mouse.radius;

      for (var i = 0; i < this.particles.length; i++) {
        var p = this.particles[i];
        p.x += p.vx * 60 * dt;
        p.y += p.vy * 60 * dt;
        p.angle += p.vAngle;

        if (mActive) {
          var dx = p.x - mx;
          var dy = p.y - my;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mRad && dist > 1) {
            var force = (1 - dist / mRad) * 1.8;
            p.x += (dx / dist) * force * 60 * dt;
            p.y += (dy / dist) * force * 60 * dt;
          }
        }

        if (p.x < -20) p.x = w + 20;
        else if (p.x > w + 20) p.x = -20;
        if (p.y < -20) p.y = h + 20;
        else if (p.y > h + 20) p.y = -20;
      }
    },

    render: function() {
      var ctx = this.ctx;
      if (!ctx) return;
      var w = this.width;
      var h = this.height;
      var dpr = this.dpr;
      var theme = this.themes[this.activeTheme] || this.themes['default'];

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, w, h);

      // 1. Ambient Background Gradient
      var grad = ctx.createLinearGradient(0, 0, w * 0.7, h);
      grad.addColorStop(0, theme.bgGradient[0]);
      grad.addColorStop(1, theme.bgGradient[1]);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // 2. Isometric / Perspective Die-Line Grid
      ctx.save();
      ctx.strokeStyle = theme.gridColor;
      ctx.lineWidth = 1;
      var gridSize = 64;
      var nowTime = (typeof performance !== 'undefined' ? performance.now() : Date.now());
      var offsetX = (nowTime * 0.008) % gridSize;
      var offsetY = (nowTime * 0.006) % gridSize;

      ctx.beginPath();
      for (var gx = -gridSize + offsetX; gx < w + gridSize; gx += gridSize) {
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, h);
      }
      for (var gy = -gridSize + offsetY; gy < h + gridSize; gy += gridSize) {
        ctx.moveTo(0, gy);
        ctx.lineTo(w, gy);
      }
      ctx.stroke();

      // Corner target marks
      var markSize = 12;
      ctx.lineWidth = 1.2;
      ctx.strokeRect(20, 20, markSize, markSize);
      ctx.strokeRect(w - 20 - markSize, 20, markSize, markSize);
      ctx.strokeRect(20, h - 20 - markSize, markSize, markSize);
      ctx.strokeRect(w - 20 - markSize, h - 20 - markSize, markSize, markSize);
      ctx.restore();

      // 3. Filaments
      ctx.save();
      ctx.lineWidth = 0.8;
      var maxConnectDist = 110;
      var len = this.particles.length;
      for (var i = 0; i < len; i++) {
        var pi = this.particles[i];
        for (var j = i + 1; j < len; j++) {
          var pj = this.particles[j];
          var fdx = pi.x - pj.x;
          var fdy = pi.y - pj.y;
          var fdist = Math.sqrt(fdx * fdx + fdy * fdy);
          if (fdist < maxConnectDist) {
            var alpha = (1 - fdist / maxConnectDist) * 0.7;
            ctx.strokeStyle = theme.filamentColor.replace(/[\d\.]+\)$/, alpha + ')');
            ctx.beginPath();
            ctx.moveTo(pi.x, pi.y);
            ctx.lineTo(pj.x, pj.y);
            ctx.stroke();
          }
        }
      }
      ctx.restore();

      // 4. Interactive Particles
      ctx.save();
      for (var k = 0; k < len; k++) {
        var pt = this.particles[k];
        var pCol = theme.particleColors[pt.colorIndex % theme.particleColors.length];
        ctx.fillStyle = pCol;
        ctx.save();
        ctx.translate(pt.x, pt.y);
        ctx.rotate(pt.angle);

        if (pt.shape === 'rect') {
          ctx.fillRect(-pt.radius, -pt.radius, pt.radius * 2, pt.radius * 2);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, pt.radius, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
      ctx.restore();

      // 5. Optical Scanner Laser Sweep Beam
      if (this.scanLine.active && this.scanLine.y >= -20 && this.scanLine.y <= h + 20) {
        ctx.save();
        var sy = this.scanLine.y;
        var laserGrad = ctx.createLinearGradient(0, sy - 18, 0, sy + 18);
        laserGrad.addColorStop(0, 'rgba(0,0,0,0)');
        laserGrad.addColorStop(0.5, theme.laserGlow);
        laserGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = laserGrad;
        ctx.fillRect(0, sy - 18, w, 36);

        ctx.strokeStyle = theme.laserColor;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, sy);
        ctx.lineTo(w, sy);
        ctx.stroke();
        ctx.restore();
      }

      // 6. Action Ripple Waves
      for (var rp = 0; rp < this.ripples.length; rp++) {
        var ripObj = this.ripples[rp];
        ctx.save();
        ctx.beginPath();
        ctx.arc(ripObj.x, ripObj.y, ripObj.radius, 0, Math.PI * 2);
        ctx.strokeStyle = theme.rippleColor.replace(/[\d\.]+\)$/, ripObj.alpha + ')');
        ctx.lineWidth = 1.8;
        ctx.stroke();
        ctx.restore();
      }

      ctx.restore();
    }
  };

  var DualMarkRiveEngine = RiveIntegration;
  if (typeof window !== 'undefined') {
    window.DualMarkRive = RiveIntegration;
    window.RiveIntegration = RiveIntegration;
    window.DualMarkLiveBackground = DualMarkLiveBackground;
  }

  // Auto-initialize in browser DOM
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() {
        RiveIntegration.init();
      });
    } else {
      RiveIntegration.init();
    }
  }

  return RiveIntegration;
});
