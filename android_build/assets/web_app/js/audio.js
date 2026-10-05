/**
 * DualMark Studio — Procedural Web Audio Synthesizer
 * Zero audio files: Real-time sound synthesis for tactile scanner and packaging feedback.
 */
(function(window) {
  'use strict';

  var audioCtx = null;
  var isMuted = localStorage.getItem('dualmark_audio_muted') === 'true';

  function getAudioContext() {
    if (!audioCtx) {
      var AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) audioCtx = new AudioContextClass();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playTone(freq, type, duration, gainLevel) {
    if (isMuted) return;
    try {
      var ctx = getAudioContext();
      if (!ctx) return;
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();

      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(gainLevel || 0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {}
  }

  window.DualMarkAudio = {
    isMuted: function() { return isMuted; },
    toggleMute: function() {
      isMuted = !isMuted;
      localStorage.setItem('dualmark_audio_muted', isMuted ? 'true' : 'false');
      return isMuted;
    },
    click: function() { playTone(880, 'sine', 0.05, 0.08); },
    scanBeep: function() {
      // High-pitch dual barcode scanner tone (typical enterprise Zebra/Honeywell imager sound)
      playTone(2400, 'triangle', 0.09, 0.22);
    },
    successChime: function() {
      // Happy major chord chime (compliant >= 50mm)
      playTone(523.25, 'sine', 0.12, 0.15); // C5
      setTimeout(function() { playTone(659.25, 'sine', 0.15, 0.15); }, 80); // E5
      setTimeout(function() { playTone(783.99, 'sine', 0.22, 0.18); }, 160); // G5
    },
    warningBuzz: function() {
      // Low dual warning buzz (clearance collision < 50mm)
      playTone(180, 'sawtooth', 0.18, 0.2);
      setTimeout(function() { playTone(140, 'sawtooth', 0.22, 0.2); }, 120);
    }
  };

})(window);
