/**
 * DualMark Studio — UI State & Layout Engine
 * Feature Layer: Presentation layer coordinator for segmented switches,
 * high-contrast loading dock / outdoor themes, and Role-Based Access Control (RBAC).
 */
(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.DualMarkUiLayout = factory();
  }
})(typeof self !== 'undefined' ? self : this, function() {
  'use strict';

  // =========================================================================
  // 1. SEGMENTED SWITCH CONTROLLER
  // =========================================================================

  class SegmentedSwitchController {
    constructor(segmentButtons, onSelect = null) {
      this.buttons = Array.from(segmentButtons || []);
      this.onSelect = onSelect;
      this.activeValue = null;

      this.buttons.forEach(btn => {
        btn.addEventListener('click', () => {
          const val = btn.getAttribute('data-value') || btn.id;
          this.setActive(val);
        });
      });

      // Initialize with currently active or first button
      const currentActive = this.buttons.find(b => b.classList.contains('active')) || this.buttons[0];
      if (currentActive) {
        this.setActive(currentActive.getAttribute('data-value') || currentActive.id, false);
      }
    }

    setActive(value, triggerCallback = true) {
      this.activeValue = value;
      this.buttons.forEach(b => {
        const val = b.getAttribute('data-value') || b.id;
        const isActive = (val === value);
        b.classList.toggle('active', isActive);
        b.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });

      if (triggerCallback && typeof this.onSelect === 'function') {
        this.onSelect(value);
      }
    }

    getValue() {
      return this.activeValue;
    }
  }

  // =========================================================================
  // 2. HIGH-CONTRAST LOADING DOCK / OUTDOOR THEME CONTROLLER
  // =========================================================================

  class OutdoorThemeController {
    constructor(storageKey = 'dualmark_theme') {
      this.storageKey = storageKey;
      this.isOutdoor = false;
      this.listeners = [];

      // Check saved preference
      try {
        const saved = localStorage.getItem(this.storageKey);
        if (saved === 'outdoor') {
          this.setOutdoor(true, false);
        }
      } catch (e) {}
    }

    toggle() {
      return this.setOutdoor(!this.isOutdoor);
    }

    setOutdoor(enabled, save = true) {
      this.isOutdoor = Boolean(enabled);
      if (typeof document !== 'undefined' && document.body) {
        document.body.classList.toggle('theme-outdoor', this.isOutdoor);
      }

      if (save) {
        try {
          localStorage.setItem(this.storageKey, this.isOutdoor ? 'outdoor' : 'standard');
        } catch (e) {}
      }

      this.listeners.forEach(cb => cb(this.isOutdoor));
      return this.isOutdoor;
    }

    onChange(callback) {
      this.listeners.push(callback);
    }
  }

  // =========================================================================
  // 3. ROLE-BASED ACCESS CONTROL (RBAC) DOM VISIBILITY MATRIX
  // =========================================================================

  const RBAC_ROLES = {
    'designer': {
      title: 'Packaging & Prepress Lead',
      allowedSections: ['tab-synth', 'tab-clearance', 'tab-resolver', 'tab-prepress'],
      highlightFeatures: ['vector_prepress', 'clearance_inspection', 'barcode_synthesis']
    },
    'auditor': {
      title: 'Regulatory & Compliance Auditor',
      allowedSections: ['tab-synth', 'tab-clearance', 'tab-fsma', 'tab-scanner'],
      highlightFeatures: ['fsma_204_ledger', '21_cfr_part_11', 'iso_verification']
    },
    'pressman': {
      title: 'Thermal Press Operator & Warehouse Lead',
      allowedSections: ['tab-synth', 'tab-scanner', 'tab-prepress', 'tab-fsma'],
      highlightFeatures: ['zebra_thermal_spooler', 'barcode_scanner', 'batch_csv_print']
    }
  };

  class RbacViewController {
    constructor(defaultRole = 'designer') {
      this.currentRole = defaultRole;
      this.listeners = [];
    }

    setRole(role) {
      if (!RBAC_ROLES[role]) return false;
      this.currentRole = role;

      if (typeof document !== 'undefined') {
        const elements = document.querySelectorAll('[data-rbac-role]');
        elements.forEach(el => {
          const roles = el.getAttribute('data-rbac-role').split(',').map(s => s.trim());
          const isAllowed = roles.includes('*') || roles.includes(this.currentRole);
          el.style.display = isAllowed ? '' : 'none';
        });

        // Update active role badge if present
        const badge = document.getElementById('rbac-role-badge');
        if (badge) {
          badge.textContent = this.currentRole.toUpperCase();
        }
      }

      this.listeners.forEach(cb => cb(this.currentRole, RBAC_ROLES[this.currentRole]));
      return true;
    }

    getRole() {
      return this.currentRole;
    }

    getRoleDetails() {
      return RBAC_ROLES[this.currentRole];
    }

    onRoleChange(cb) {
      this.listeners.push(cb);
    }
  }

  return {
    SegmentedSwitchController,
    OutdoorThemeController,
    RbacViewController,
    RBAC_ROLES
  };
});
