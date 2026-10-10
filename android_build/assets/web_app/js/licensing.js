/**
 * DualMark Studio — Commercial Licensing & Monetization Engine
 * Manages Free, Commercial Pro, and Enterprise Perpetual tiers,
 * feature gating, paywall modal, and Google Play Billing bridge integration.
 */

const DualMarkLicensing = (() => {
  const TIERS = {
    free: {
      id: 'free',
      name: 'Free Evaluator',
      price: '$0',
      period: 'Forever',
      badge: 'FREE',
      features: [
        '1D Barcode synthesis (UPC-A, EAN-13)',
        'Basic 2D QR Code generator',
        'Single-label 50mm die-line inspector preview',
        'Standard PNG / SVG download',
        'Air-gapped offline operation'
      ]
    },
    pro: {
      id: 'pro',
      name: 'Commercial Pro',
      price: '$29.99',
      period: 'per month or $249/yr',
      badge: 'PRO',
      features: [
        'Everything in Free Tier',
        'GS1 Digital Link v1.2 Standard Syntax Parser',
        'FDA FSMA Rule 204 CTE/KDE Logger with SHA-256 audit trail',
        'Batch CSV packaging label synthesis',
        'Offline SQLite dynamic redirect routing compiler',
        'Barcode Width Reduction (BWR) flexo ink-gain compensation',
        'Commercial packaging prepress production license'
      ]
    },
    enterprise: {
      id: 'enterprise',
      name: 'Enterprise Perpetual',
      price: '$899',
      period: 'per seat perpetual',
      badge: 'ENTERPRISE',
      features: [
        'Everything in Commercial Pro Tier',
        'Industrial Vector CMYK EPS & 600/1200 DPI PDF Prepress Export',
        'Edge Resolver Compilation (Cloudflare Workers, Nginx, AWS Lambda)',
        'Rugged Barcode Handheld Scanner Wedge (Zebra, Honeywell, Datalogic)',
        'GS1 GEPIR live company prefix validation',
        'Priority SLA & custom die-line packaging templates'
      ]
    }
  };

  // Feature permission mapping
  const FEATURE_TIER_REQUIREMENTS = {
    'gs1_digital_link_advanced': 'pro',
    'fsma_cte_logging': 'pro',
    'batch_csv_synthesis': 'pro',
    'offline_sqlite_compiler': 'pro',
    'bwr_compensation': 'pro',
    'vector_cmyk_eps': 'enterprise',
    'vector_highres_pdf': 'enterprise',
    'edge_resolvers_bundle': 'enterprise',
    'rugged_scanner_wedge': 'enterprise',
    'gepir_lookup': 'enterprise'
  };

  const TIER_HIERARCHY = { free: 0, pro: 1, enterprise: 2 };

  const _memoryStorage = {};
  function getStorage() {
    try {
      if (typeof localStorage !== 'undefined' && localStorage !== null) return localStorage;
      if (typeof window !== 'undefined' && window.localStorage) return window.localStorage;
    } catch (e) {}
    return {
      getItem: (k) => Object.prototype.hasOwnProperty.call(_memoryStorage, k) ? _memoryStorage[k] : null,
      setItem: (k, v) => { _memoryStorage[k] = String(v); },
      removeItem: (k) => { delete _memoryStorage[k]; }
    };
  }

  function getCurrentTier() {
    try {
      const storage = getStorage();
      if (storage) {
        const stored = storage.getItem('dualmark_license_tier');
        if (stored && TIERS[stored]) return stored;
      }
    } catch (e) {}
    return 'free';
  }

  function setCurrentTier(tierId) {
    if (!TIERS[tierId]) return;
    try {
      const storage = getStorage();
      if (storage) {
        storage.setItem('dualmark_license_tier', tierId);
      }
    } catch (e) {}
    updateUiBadges();
    if (typeof window !== 'undefined') {
      if (window.DualMarkAudio && typeof window.DualMarkAudio.successChime === 'function') {
        window.DualMarkAudio.successChime();
      }
      if (window.DualMarkBridge && typeof window.DualMarkBridge.vibrate === 'function') {
        window.DualMarkBridge.vibrate(40);
      }
    }
  }

  async function computeHmacSha256(keyStr, dataStr) {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(keyStr);
    const messageData = encoder.encode(dataStr);
    const cryptoObj = (typeof crypto !== 'undefined' ? crypto : (typeof window !== 'undefined' ? window.crypto : null));
    if (cryptoObj && cryptoObj.subtle) {
      const key = await cryptoObj.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );
      const signature = await cryptoObj.subtle.sign('HMAC', key, messageData);
      const uint8 = new Uint8Array(signature);
      let binary = '';
      for (let i = 0; i < uint8.length; i++) binary += String.fromCharCode(uint8[i]);
      return btoa(binary)
        .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    }
    // Deterministic fallback for environments without SubtleCrypto
    let hash = 0;
    for (let i = 0; i < dataStr.length; i++) {
      hash = ((hash << 5) - hash) + dataStr.charCodeAt(i) + keyStr.charCodeAt(i % keyStr.length);
      hash |= 0;
    }
    return 'fb_' + Math.abs(hash).toString(36);
  }

  async function generateLicenseToken(payload, secretKey = 'DUALMARK_OFFLINE_ROOT_KEY_SUNRISE2027') {
    const jsonStr = JSON.stringify(payload);
    const b64Payload = btoa(unescape(encodeURIComponent(jsonStr)))
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    const sig = await computeHmacSha256(secretKey, b64Payload);
    return `DMLIC-1.${b64Payload}.${sig}`;
  }

  async function verifyLicenseToken(tokenString, secretKey = 'DUALMARK_OFFLINE_ROOT_KEY_SUNRISE2027') {
    if (!tokenString || typeof tokenString !== 'string') {
      return { valid: false, reason: 'INVALID_FORMAT' };
    }
    const parts = tokenString.trim().split('.');
    if (parts.length !== 3 || parts[0] !== 'DMLIC-1') {
      return { valid: false, reason: 'INVALID_HEADER' };
    }
    const b64Payload = parts[1];
    const providedSig = parts[2];

    const expectedSig = await computeHmacSha256(secretKey, b64Payload);
    if (providedSig !== expectedSig) {
      return { valid: false, reason: 'SIGNATURE_MISMATCH' };
    }

    try {
      let normalizedB64 = b64Payload.replace(/-/g, '+').replace(/_/g, '/');
      while (normalizedB64.length % 4) normalizedB64 += '=';
      const jsonStr = decodeURIComponent(escape(atob(normalizedB64)));
      const payload = JSON.parse(jsonStr);

      if (payload.expires) {
        const expiryDate = new Date(payload.expires);
        if (!isNaN(expiryDate.getTime()) && Date.now() > expiryDate.getTime()) {
          return { valid: false, reason: 'EXPIRED', payload, expiryDate };
        }
      }

      if (!payload.tier || !TIERS[payload.tier]) {
        return { valid: false, reason: 'INVALID_TIER', payload };
      }

      return { valid: true, payload };
    } catch (e) {
      return { valid: false, reason: 'MALFORMED_PAYLOAD', error: e.message };
    }
  }

  async function activateWithLicenseToken(tokenString, secretKey) {
    const verification = await verifyLicenseToken(tokenString, secretKey);
    if (!verification.valid) {
      return { success: false, reason: verification.reason };
    }
    const payload = verification.payload;
    setCurrentTier(payload.tier);
    try {
      const storage = getStorage();
      if (storage) {
        storage.setItem('dualmark_active_license_token', tokenString);
        storage.setItem('dualmark_active_license_payload', JSON.stringify(payload));
      }
    } catch (e) {}
    return { success: true, tier: payload.tier, payload };
  }

  function getActiveLicenseInfo() {
    try {
      const storage = getStorage();
      if (storage) {
        const token = storage.getItem('dualmark_active_license_token');
        const payloadStr = storage.getItem('dualmark_active_license_payload');
        if (payloadStr) {
          return { token, payload: JSON.parse(payloadStr) };
        }
      }
    } catch (e) {}
    return null;
  }

  function isFeatureAllowed(featureKey) {
    const requiredTier = FEATURE_TIER_REQUIREMENTS[featureKey];
    if (!requiredTier) return true; // Unrestricted feature
    const current = getCurrentTier();
    return TIER_HIERARCHY[current] >= TIER_HIERARCHY[requiredTier];
  }

  function checkFeatureOrPrompt(featureKey, onSuccess) {
    if (isFeatureAllowed(featureKey)) {
      if (typeof onSuccess === 'function') onSuccess();
      return true;
    }
    const requiredTier = FEATURE_TIER_REQUIREMENTS[featureKey] || 'pro';
    showPaywallModal(requiredTier, featureKey);
    return false;
  }

  function updateUiBadges() {
    if (typeof document === 'undefined') return;
    const currentTier = getCurrentTier();
    const badgeEl = document.getElementById('header-license-badge');
    if (badgeEl) {
      badgeEl.textContent = TIERS[currentTier].badge;
      badgeEl.className = 'brand-badge ' + (currentTier === 'enterprise' ? 'badge-enterprise' : (currentTier === 'pro' ? 'badge-pro' : 'badge-free'));
    }
  }

  function showPaywallModal(recommendedTier = 'pro', triggeredFeature = '') {
    let modal = document.getElementById('modal-licensing');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'modal-licensing';
      modal.className = 'modal-overlay';
      document.body.appendChild(modal);
    }

    const currentTier = getCurrentTier();

    modal.innerHTML = `
      <div class="modal-card" style="max-width: 820px; text-align: left;">
        <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 12px; margin-bottom: 16px;">
          <div>
            <span class="badge badge-cyan" style="font-size: 10px; font-weight: bold; letter-spacing: 1px;">COMMERCIAL LICENSING &amp; EDITIONS</span>
            <h3 style="margin: 4px 0 0; font-size: 18px; font-weight: 800;">DualMark Studio Editions</h3>
          </div>
          <button class="icon-btn" id="btn-close-licensing" style="font-size: 18px; line-height: 1;">✕</button>
        </div>

        ${triggeredFeature ? `
          <div style="background: rgba(2, 132, 199, 0.1); border: 1px solid var(--accent-cyan); border-radius: 8px; padding: 10px 14px; margin-bottom: 16px; font-size: 12px; display: flex; align-items: center; gap: 8px;">
            <span>⚡</span>
            <span>The feature <strong>${triggeredFeature.replace(/_/g, ' ').toUpperCase()}</strong> requires a <strong>${(FEATURE_TIER_REQUIREMENTS[triggeredFeature] || 'pro').toUpperCase()}</strong> commercial license.</span>
          </div>
        ` : ''}

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 14px; margin-bottom: 18px;">
          
          <!-- Free Tier -->
          <div style="background: var(--bg-secondary); border: 1px solid ${currentTier === 'free' ? 'var(--accent-cyan)' : 'var(--border-color)'}; border-radius: 10px; padding: 16px; display: flex; flex-direction: column;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <h4 style="margin: 0; font-size: 15px;">Free Evaluator</h4>
              <span class="badge badge-secondary">FREE</span>
            </div>
            <div style="font-size: 20px; font-weight: 800; color: var(--text-primary); margin-bottom: 4px;">$0</div>
            <div style="font-size: 11px; color: var(--text-secondary); margin-bottom: 14px;">Evaluation & Single Labels</div>
            <ul style="font-size: 11px; color: var(--text-secondary); padding-left: 18px; margin: 0 0 16px; flex-grow: 1; line-height: 1.6;">
              ${TIERS.free.features.map(f => `<li>${f}</li>`).join('')}
            </ul>
            <button class="btn ${currentTier === 'free' ? 'btn-secondary' : 'btn-outline'}" id="btn-select-free" ${currentTier === 'free' ? 'disabled' : ''}>
              ${currentTier === 'free' ? '✓ Active Tier' : 'Switch to Free'}
            </button>
          </div>

          <!-- Pro Tier -->
          <div style="background: var(--bg-secondary); border: 2px solid ${currentTier === 'pro' ? 'var(--accent-emerald)' : 'var(--accent-cyan)'}; border-radius: 10px; padding: 16px; display: flex; flex-direction: column; position: relative;">
            <div style="position: absolute; top: -10px; right: 12px; background: var(--accent-cyan); color: #000; font-size: 9px; font-weight: 800; padding: 2px 8px; border-radius: 10px;">POPULAR</div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <h4 style="margin: 0; font-size: 15px; color: var(--accent-cyan);">Commercial Pro</h4>
              <span class="badge badge-cyan">PRO</span>
            </div>
            <div style="font-size: 20px; font-weight: 800; color: var(--accent-cyan); margin-bottom: 4px;">$29.99 <span style="font-size: 12px; font-weight: 400; color: var(--text-secondary);">/ mo</span></div>
            <div style="font-size: 11px; color: var(--text-secondary); margin-bottom: 14px;">Packaging &amp; FDA FSMA Production</div>
            <ul style="font-size: 11px; color: var(--text-secondary); padding-left: 18px; margin: 0 0 16px; flex-grow: 1; line-height: 1.6;">
              ${TIERS.pro.features.map(f => `<li>${f}</li>`).join('')}
            </ul>
            <button class="btn btn-primary" id="btn-select-pro">
              ${currentTier === 'pro' ? '✓ Active Pro License' : 'Upgrade to Pro ($29.99)'}
            </button>
          </div>

          <!-- Enterprise Tier -->
          <div style="background: var(--bg-secondary); border: 2px solid ${currentTier === 'enterprise' ? 'var(--accent-emerald)' : 'var(--border-color)'}; border-radius: 10px; padding: 16px; display: flex; flex-direction: column;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <h4 style="margin: 0; font-size: 15px; color: #a855f7;">Enterprise Perpetual</h4>
              <span class="badge badge-purple">ENTERPRISE</span>
            </div>
            <div style="font-size: 20px; font-weight: 800; color: #a855f7; margin-bottom: 4px;">$899 <span style="font-size: 12px; font-weight: 400; color: var(--text-secondary);">/ seat</span></div>
            <div style="font-size: 11px; color: var(--text-secondary); margin-bottom: 14px;">Prepress CMYK &amp; Rugged Scanners</div>
            <ul style="font-size: 11px; color: var(--text-secondary); padding-left: 18px; margin: 0 0 16px; flex-grow: 1; line-height: 1.6;">
              ${TIERS.enterprise.features.map(f => `<li>${f}</li>`).join('')}
            </ul>
            <button class="btn btn-emerald" id="btn-select-enterprise">
              ${currentTier === 'enterprise' ? '✓ Active Enterprise' : 'Unlock Enterprise ($899)'}
            </button>
          </div>

        </div>

        <div style="border-top: 1px solid var(--border-color); padding-top: 12px; display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: var(--text-secondary);">
          <span>100% Offline-Friendly • Google Play In-App Billing Compatible</span>
          <button class="btn btn-secondary btn-sm" id="btn-restore-purchases">Restore Purchases</button>
        </div>
      </div>
    `;

    modal.style.display = 'flex';

    document.getElementById('btn-close-licensing')?.addEventListener('click', () => {
      modal.style.display = 'none';
      if (window.DualMarkAudio) window.DualMarkAudio.playClick();
    });

    document.getElementById('btn-select-free')?.addEventListener('click', () => {
      setCurrentTier('free');
      modal.style.display = 'none';
      if (window.DualMarkApp) window.DualMarkApp.showToast('Switched to Free Tier');
    });

    document.getElementById('btn-select-pro')?.addEventListener('click', () => {
      // In native Android wrapper, invoke billing bridge if available
      if (window.DualMarkBridge && typeof window.DualMarkBridge.launchBillingFlow === 'function') {
        window.DualMarkBridge.launchBillingFlow('dualmark_pro_monthly');
      } else {
        setCurrentTier('pro');
        modal.style.display = 'none';
        if (window.DualMarkApp) window.DualMarkApp.showToast('✓ Commercial Pro License Activated');
      }
    });

    document.getElementById('btn-select-enterprise')?.addEventListener('click', () => {
      if (window.DualMarkBridge && typeof window.DualMarkBridge.launchBillingFlow === 'function') {
        window.DualMarkBridge.launchBillingFlow('dualmark_enterprise_perpetual');
      } else {
        setCurrentTier('enterprise');
        modal.style.display = 'none';
        if (window.DualMarkApp) window.DualMarkApp.showToast('✓ Enterprise Perpetual License Activated');
      }
    });

    document.getElementById('btn-restore-purchases')?.addEventListener('click', () => {
      if (window.DualMarkBridge && typeof window.DualMarkBridge.restorePurchases === 'function') {
        window.DualMarkBridge.restorePurchases();
      } else {
        if (window.DualMarkApp) window.DualMarkApp.showToast('No external purchases found. Current local tier: ' + getCurrentTier().toUpperCase());
      }
    });
  }

  let currentRole = 'compliance'; // Default full enterprise administrator role

  function getRole() {
    try {
      const stored = localStorage.getItem('dualmark_user_role');
      if (stored) currentRole = stored;
    } catch (e) {}
    return currentRole;
  }

  function setRole(role) {
    if (['operator', 'designer', 'compliance'].includes(role)) {
      currentRole = role;
      try {
        localStorage.setItem('dualmark_user_role', role);
      } catch (e) {}
      if (window.DualMarkApp && typeof window.DualMarkApp.showToast === 'function') {
        window.DualMarkApp.showToast('Active Role Switched to: ' + role.toUpperCase());
      }
    }
  }

  function exportDiagnosticBundle() {
    let diag = {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      devicePixelRatio: window.devicePixelRatio || 1,
      licenseTier: getCurrentTier(),
      userRole: getRole(),
      offlineReady: true,
      dataPrivacy: 'SANITIZED - ZERO CUSTOMER PACKAGING DATA INCLUDED'
    };

    if (window.DualMarkBridge && typeof window.DualMarkBridge.getDiagnosticData === 'function') {
      try {
        const nativeDiag = JSON.parse(window.DualMarkBridge.getDiagnosticData());
        diag.nativeDevice = nativeDiag;
      } catch (e) {}
    }

    const blob = new Blob([JSON.stringify(diag, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'DualMark_Diagnostic_Bundle_' + Date.now().toString(36) + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    if (window.DualMarkApp && typeof window.DualMarkApp.showToast === 'function') {
      window.DualMarkApp.showToast('✓ Diagnostic Telemetry Bundle Exported (Sanitized)');
    }
  }

  function init() {
    updateUiBadges();
  }

  return {
    init,
    getTier: getCurrentTier,
    setTier: setCurrentTier,
    getRole,
    setRole,
    exportDiagnosticBundle,
    isFeatureAllowed,
    checkFeatureOrPrompt,
    showPaywallModal,
    updateUiBadges,
    generateLicenseToken,
    verifyLicenseToken,
    activateWithLicenseToken,
    getActiveLicenseInfo
  };
})();

if (typeof window !== 'undefined') {
  window.DualMarkLicensing = DualMarkLicensing;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DualMarkLicensing;
}


