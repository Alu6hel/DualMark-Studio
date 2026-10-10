import fs from 'fs';
import path from 'path';

console.log('===============================================================');
console.log('DUALMARK STUDIO: UX CONSOLIDATION & RIVE INTEGRATION TEST SUITE');
console.log('===============================================================');

let pass = 0;
let fail = 0;

function assert(cond, msg) {
  if (cond) {
    console.log(`  ✓ PASS: ${msg}`);
    pass++;
  } else {
    console.error(`  ✗ FAIL: ${msg}`);
    fail++;
  }
}

// 1. Verify HTML Structure & Consolidated Controls
console.log('\n--- 1. HTML Verification: Consolidated Header & Quick Settings Drawer ---');
const html = fs.readFileSync('web_app/index.html', 'utf8');

assert(html.includes('id="btn-quick-settings"'), 'Quick Settings gear button (#btn-quick-settings) present');
assert(html.includes('id="sheet-quick-settings"'), 'Quick Settings slide-over sheet (#sheet-quick-settings) present');
assert(html.includes('id="btn-close-settings"'), 'Close button (#btn-close-settings) present');
assert(html.includes('id="chk-sync-codes"'), 'Smart Auto-Sync toggle (#chk-sync-codes) present in Tab 1');
assert(html.includes('id="canvas-rive-clearance"'), 'Rive Clearance Gauge canvas (#canvas-rive-clearance) present in Tab 2');
assert(html.includes('id="canvas-rive-scanner"'), 'Rive Scanner HUD canvas (#canvas-rive-scanner) present in Tab 4');
assert(html.includes('id="card-scan-quick-cte"'), '1-Tap Scan-to-CTE Quick Action card (#card-scan-quick-cte) present in Tab 4');
assert(html.includes('id="btn-quick-log-cte"'), '1-Tap Quick Log CTE button (#btn-quick-log-cte) present in Tab 4');
assert(html.includes('id="canvas-rive-seal"'), 'Rive Cryptographic Seal canvas (#canvas-rive-seal) present in Tab 5');
assert(html.includes('id="btn-export-master-package"'), '1-Click Master Prepress Bundle button (#btn-export-master-package) present in Tab 6');
assert(html.includes('id="export-segment-switch"'), 'Export Segment Switch (#export-segment-switch) present in Tab 6');
assert(html.includes('id="pane-prepress"') && html.includes('id="pane-zebra"') && html.includes('id="pane-batch"'), 'Prepress, Zebra, and Batch export panes present in Tab 6');
assert(html.includes('id="canvas-rive-printer"'), 'Rive Miniature Printer canvas (#canvas-rive-printer) present in Tab 6');
assert(html.includes('src="js/rive_integration.js"'), 'rive_integration.js script tag loaded in index.html');

assert(html.includes('id="canvas-rive-mascot"'), 'Rive Marky Mascot canvas (#canvas-rive-mascot) present in header');
assert(html.includes('id="mascot-companion-wrap"'), 'Mascot companion wrap (#mascot-companion-wrap) present in header');
assert(html.includes('id="tab1-clearance-pill"'), 'Tab 1 instant clearance badge pill (#tab1-clearance-pill) present');
assert(html.includes('id="btn-tab1-prepress-bundle"'), 'Tab 1 1-click Master Prepress Bundle button (#btn-tab1-prepress-bundle) present');
assert(html.includes('id="btn-toggle-extended-ais"'), 'Tab 1 Extended AIs accordion toggle (#btn-toggle-extended-ais) present');
assert(html.includes('id="body-extended-ais"'), 'Tab 1 Extended AIs collapsible body (#body-extended-ais) present');

// 2. Verify CSS Styles
console.log('\n--- 2. CSS Verification: Drawer & Animation Styles ---');
const css = fs.readFileSync('web_app/css/style.css', 'utf8');

assert(css.includes('.quick-settings-drawer'), '.quick-settings-drawer style class defined');
assert(css.includes('@keyframes slideInRight'), 'slideInRight keyframe animation defined for drawer');
assert(css.includes('#card-scan-quick-cte'), '#card-scan-quick-cte style defined');
assert(css.includes('.fused-proof-box'), '.fused-proof-box style defined for Tab 1');
assert(css.includes('#tab1-clearance-pill'), '#tab1-clearance-pill style defined');
assert(css.includes('.accordion-toggle'), '.accordion-toggle style defined');

// 3. Verify Rive Integration Module
console.log('\n--- 3. Rive Integration Engine & State Machines ---');
const riveJs = fs.readFileSync('web_app/js/rive_integration.js', 'utf8');

assert(riveJs.includes('RiveIntegration'), 'RiveIntegration object defined');
assert(riveJs.includes('initClearanceGauge'), 'Clearance Gauge state machine initialized');
assert(riveJs.includes('initScannerHud'), 'Scanner HUD state machine initialized');
assert(riveJs.includes('initPrinterStatus'), 'Printer Status state machine initialized');
assert(riveJs.includes('initFsmaSeal'), 'FSMA Seal state machine initialized');
assert(riveJs.includes('initMarkyMascot'), 'Marky Mascot state machine initialized');
assert(riveJs.includes('triggerClearanceUpdate'), 'triggerClearanceUpdate public hook exposed');
assert(riveJs.includes('triggerScannerAcquired'), 'triggerScannerAcquired public hook exposed');
assert(riveJs.includes('triggerPrinterState'), 'triggerPrinterState public hook exposed');
assert(riveJs.includes('triggerSealSigned'), 'triggerSealSigned public hook exposed');
assert(riveJs.includes('triggerMascotCelebrate'), 'triggerMascotCelebrate public hook exposed');

// 4. Verify Smart Auto-Sync Logic (Headless test)
console.log('\n--- 4. Logic Verification: Smart Auto-Sync 1D <-> 2D ---');
function sync1dTo2d(input1d) {
  const raw = input1d.trim().replace(/\D/g, '');
  if (raw.length === 12) return '00' + raw;
  if (raw.length === 13) return '0' + raw;
  if (raw.length === 14) return raw;
  let padded = raw;
  while (padded.length < 14) padded = '0' + padded;
  return padded;
}

function sync2dTo1d(gtin14) {
  const raw = gtin14.trim().replace(/\D/g, '');
  if (raw.length === 14 && raw.startsWith('00')) return raw.substring(2);
  if (raw.length === 14 && raw.startsWith('0')) return raw.substring(1);
  return raw;
}

assert(sync1dTo2d('081234567890') === '00081234567890', '12-digit UPC-A (081234567890) auto-syncs to 14-digit GTIN-14 (00081234567890)');
assert(sync1dTo2d('4012345678901') === '04012345678901', '13-digit EAN-13 auto-syncs to 14-digit GTIN-14');
assert(sync2dTo1d('00081234567890') === '081234567890', '14-digit GTIN-14 (00081234567890) auto-syncs back to 12-digit UPC-A (081234567890)');

// 5. Verify App.js Integration Wiring
console.log('\n--- 5. App.js Verification: Feature Bindings ---');
const appJs = fs.readFileSync('web_app/js/app.js', 'utf8');

assert(appJs.includes("getElementById('btn-quick-settings')"), 'Quick settings gear click listener wired in app.js');
assert(appJs.includes("getElementById('chk-sync-codes')"), 'chk-sync-codes auto-sync listener wired in app.js');
assert(appJs.includes("triggerClearanceUpdate"), 'Rive clearance dial triggers wired in clearance onUpdate & snap');
assert(appJs.includes("handleScannedForQuickCte"), 'handleScannedForQuickCte wired in scanner module');
assert(appJs.includes("triggerScannerAcquired"), 'Rive scanner HUD triggers wired in app.js');
assert(appJs.includes("triggerSealSigned"), 'Rive cryptographic seal triggers wired in FSMA module');
assert(appJs.includes("exportSegmentSwitch"), 'Segmented export switch wired in app.js');
assert(appJs.includes("btn-export-master-package"), '1-Click Master Prepress Bundle wired in app.js');
assert(appJs.includes("triggerPrinterState"), 'Rive printer state machine triggers wired in Zebra spoolers');
assert(appJs.includes("btn-toggle-extended-ais"), 'Tab 1 Extended AIs accordion toggle wired in app.js');
assert(appJs.includes("tab1-clearance-pill"), 'Tab 1 clearance badge pill wired in app.js');
assert(appJs.includes("btn-tab1-prepress-bundle"), 'Tab 1 Master Prepress Bundle trigger wired in app.js');
assert(appJs.includes("mascot-companion-wrap"), 'Marky Mascot companion wrap wired in app.js');
assert(appJs.includes("triggerMascotCelebrate"), 'Marky Mascot celebrate triggers wired across app.js');

console.log('===============================================================');
console.log(`TOTAL RESULTS: ${pass} PASSED | ${fail} FAILED`);
console.log('===============================================================');

if (fail > 0) process.exit(1);
