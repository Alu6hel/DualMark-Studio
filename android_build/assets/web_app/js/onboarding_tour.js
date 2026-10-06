/**
 * DualMark Studio — Interactive Guided Onboarding Tour
 * Provides a lightweight spotlight walkthrough for packaging designers & warehouse inspectors.
 */
(function(window) {
  'use strict';

  var TOUR_STEPS = [
    {
      targetId: 'tab-synth',
      tabKey: 'tab-synth',
      title: '1. Dual-Code Barcode Synthesis',
      content: 'During the GS1 Sunrise 2027 transition, consumer packaging requires both a 1D UPC/EAN for legacy checkout scanners and a 2D GS1 Digital Link QR or DataMatrix code for smart supply chain data.',
      position: 'bottom'
    },
    {
      targetId: 'canvas-1d',
      tabKey: 'tab-synth',
      title: '2. 1D Barcode & Auto Check Digit',
      content: 'Select UPC-A, EAN-13, Code-128, or ITF-14. As you type, the Modulo-10 check digit validates and corrects automatically with live GS1 country prefix lookup.',
      position: 'bottom'
    },
    {
      targetId: 'synth-2d-exp-date',
      tabKey: 'tab-synth',
      title: '3. Calendar Date Picker & Smart AIs',
      content: 'Use standard calendar dates—they auto-convert into GS1 AI (17) YYMMDD format. Add net weight (AI 3102), price payable (AI 3922), and country origin with smart input masks.',
      position: 'top'
    },
    {
      targetId: 'canvas-clearance',
      tabKey: 'tab-clearance',
      title: '4. 50mm Die-Line Clearance Inspector',
      content: 'Retail checkout lasers sweep at 40-70 items/minute. If 1D and 2D codes are closer than 50 mm, scanners trigger optical cross-talk. Drag codes or use "Snap to 50mm" to ensure 100% retail pass rates.',
      position: 'bottom'
    },
    {
      targetId: 'prepress-bwr-slider',
      tabKey: 'tab-exports',
      title: '5. Prepress Bar Width Reduction (BWR)',
      content: 'Flexographic plates cause liquid ink spread on porous corrugated paper. Use the BWR slider (-40µm to -75µm) to shave bar widths proportionally and guarantee grade-A scans on press.',
      position: 'top'
    },
    {
      targetId: 'btn-commit-cte',
      tabKey: 'tab-fsma',
      title: '6. FDA FSMA Rule 204 Traceability',
      content: 'Log Critical Tracking Events (Receiving, Transformation, Shipping) for Food Traceability List items. Export 24-hour FDA sortable spreadsheets, EPCIS 2.0 JSON-LD/XML, and signed PDF dossiers.',
      position: 'top'
    }
  ];

  function OnboardingTour() {
    this.currentStep = 0;
    this.overlay = null;
    this.isActive = false;
  }

  OnboardingTour.prototype = {
    start: function() {
      this.currentStep = 0;
      this.isActive = true;
      this.createOverlay();
      this.showStep(0);
      if (window.DualMarkAudio && typeof window.DualMarkAudio.click === 'function') {
        window.DualMarkAudio.click();
      }
    },

    createOverlay: function() {
      if (this.overlay) {
        this.overlay.remove();
      }

      var el = document.createElement('div');
      el.id = 'dualmark-tour-overlay';
      el.style.cssText = 'position:fixed; inset:0; z-index:9999; background:rgba(0,0,0,0.75); display:flex; flex-direction:column; justify-content:center; align-items:center; backdrop-filter:blur(3px); transition:opacity 0.2s ease;';

      el.innerHTML = [
        '<div id="tour-card" style="background:var(--bg-card, #1e293b); color:var(--text-main, #f8fafc); border:2px solid var(--accent-cyan, #0284c7); border-radius:12px; padding:20px; max-width:440px; width:90%; box-shadow:0 20px 25px -5px rgba(0,0,0,0.5); font-family:var(--font-sans, sans-serif); text-align:left;">',
        '  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:8px;">',
        '    <span id="tour-step-counter" style="font-size:11px; font-weight:bold; color:var(--accent-cyan, #38bdf8); text-transform:uppercase; letter-spacing:1px;">Step 1 of ' + TOUR_STEPS.length + '</span>',
        '    <button id="btn-tour-close" style="background:none; border:none; color:#94a3b8; font-size:18px; cursor:pointer; padding:2px 6px;">✕</button>',
        '  </div>',
        '  <h3 id="tour-title" style="margin:0 0 8px 0; font-size:16px; font-weight:700; color:#fff;"></h3>',
        '  <p id="tour-content" style="font-size:13px; line-height:1.55; color:#cbd5e1; margin:0 0 16px 0;"></p>',
        '  <div style="display:flex; justify-content:space-between; align-items:center;">',
        '    <div id="tour-dots" style="display:flex; gap:6px;"></div>',
        '    <div style="display:flex; gap:8px;">',
        '      <button id="btn-tour-prev" class="btn btn-secondary btn-sm" style="display:none; padding:6px 12px; font-size:12px;">Back</button>',
        '      <button id="btn-tour-next" class="btn btn-primary btn-sm" style="padding:6px 14px; font-size:12px;">Next →</button>',
        '    </div>',
        '  </div>',
        '</div>'
      ].join('\n');

      document.body.appendChild(el);
      this.overlay = el;

      var self = this;
      document.getElementById('btn-tour-close').addEventListener('click', function() { self.finish(); });
      document.getElementById('btn-tour-next').addEventListener('click', function() { self.next(); });
      document.getElementById('btn-tour-prev').addEventListener('click', function() { self.prev(); });
    },

    showStep: function(index) {
      if (index < 0 || index >= TOUR_STEPS.length) return;
      this.currentStep = index;
      var step = TOUR_STEPS[index];

      // Switch to the target tab if needed
      if (step.tabKey) {
        var tabBtn = document.querySelector('.nav-tab[data-tab="' + step.tabKey + '"]');
        if (tabBtn) tabBtn.click();
      }

      document.getElementById('tour-step-counter').textContent = 'Step ' + (index + 1) + ' of ' + TOUR_STEPS.length;
      document.getElementById('tour-title').textContent = step.title;
      document.getElementById('tour-content').textContent = step.content;

      // Update Back / Next buttons
      var prevBtn = document.getElementById('btn-tour-prev');
      var nextBtn = document.getElementById('btn-tour-next');
      if (prevBtn) prevBtn.style.display = (index > 0) ? 'inline-block' : 'none';
      if (nextBtn) nextBtn.textContent = (index === TOUR_STEPS.length - 1) ? 'Finish Tour ✓' : 'Next →';

      // Update dots
      var dotsWrap = document.getElementById('tour-dots');
      if (dotsWrap) {
        dotsWrap.innerHTML = '';
        for (var i = 0; i < TOUR_STEPS.length; i++) {
          var dot = document.createElement('span');
          dot.style.cssText = 'width:8px; height:8px; border-radius:50%; background:' + (i === index ? 'var(--accent-cyan, #38bdf8)' : '#475569') + '; display:inline-block; transition:all 0.2s ease;';
          dotsWrap.appendChild(dot);
        }
      }

      // Highlight target element if present
      var target = document.getElementById(step.targetId);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }

      if (window.DualMarkAudio && typeof window.DualMarkAudio.click === 'function') {
        window.DualMarkAudio.click();
      }
    },

    next: function() {
      if (this.currentStep < TOUR_STEPS.length - 1) {
        this.showStep(this.currentStep + 1);
      } else {
        this.finish();
      }
    },

    prev: function() {
      if (this.currentStep > 0) {
        this.showStep(this.currentStep - 1);
      }
    },

    finish: function() {
      this.isActive = false;
      if (this.overlay) {
        this.overlay.remove();
        this.overlay = null;
      }
      try {
        localStorage.setItem('dualmark_tour_seen', 'true');
      } catch (e) {}
      if (window.DualMarkAudio && typeof window.DualMarkAudio.successChime === 'function') {
        window.DualMarkAudio.successChime();
      }
      if (window.DualMarkApp && typeof window.DualMarkApp.showToast === 'function') {
        window.DualMarkApp.showToast('Tour completed! Click ? anytime to review.');
      }
    }
  };

  window.DualMarkTour = new OnboardingTour();
})(window);
