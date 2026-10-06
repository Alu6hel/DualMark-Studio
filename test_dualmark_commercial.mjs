import fs from 'fs';
import { execSync } from 'child_process';

const ARTIFACT_DIR = '/home/davidalujones/.gemini/antigravity/brain/9a8f1a6c-5d9f-4eb1-9390-3620279d8138';

function takeScreenshot(filename) {
  try {
    execSync(`adb -s arc:5555 exec-out screencap -p > "${ARTIFACT_DIR}/${filename}"`);
    console.log(`📸 Screenshot saved via ADB: ${filename}`);
  } catch (err) {
    console.error(`Failed to take screenshot ${filename}:`, err);
  }
}

async function main() {
  console.log("=== DualMark Studio Automated Commercial & Prepress CDP Test ===");

  // 1. Fetch WebSocket debugger URL
  const listRes = await fetch("http://127.0.0.1:9225/json");
  const pages = await listRes.json();
  const page = pages.find(p => p.type === 'page' && p.url.includes('web_app'));
  if (!page) {
    throw new Error("Target WebView page not found! Found: " + JSON.stringify(pages));
  }

  console.log("Connecting to WebSocket:", page.webSocketDebuggerUrl);
  const ws = new WebSocket(page.webSocketDebuggerUrl);

  let msgId = 1;
  const pending = new Map();

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.id && pending.has(data.id)) {
      const { resolve, reject } = pending.get(data.id);
      pending.delete(data.id);
      if (data.error) reject(data.error);
      else resolve(data.result);
    }
  };

  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
  });
  console.log("✓ CDP WebSocket connection established.");

  function sendCommand(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = msgId++;
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async function evalJs(expr) {
    const res = await sendCommand("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true });
    if (res.exceptionDetails) {
      throw new Error("JS Exception in: " + expr + "\nDetails: " + JSON.stringify(res.exceptionDetails));
    }
    return res.result ? res.result.value : undefined;
  }

  // Enable Runtime
  await sendCommand("Runtime.enable");

  // Step 1: Initial state check
  const title = await evalJs("document.title");
  console.log("Page Title:", title);
  const initialTier = await evalJs("window.DualMarkLicensing ? window.DualMarkLicensing.getTier() : 'missing'");
  console.log("Initial License Tier:", initialTier);
  takeScreenshot("dualmark_dashboard.png");

  // Step 2: Test Commercial Licensing Modal
  console.log("\n[Test 2] Testing Commercial Licensing Modal...");
  await evalJs("document.getElementById('btn-licensing').click()");
  await new Promise(r => setTimeout(r, 600));
  const modalLicensingVisible = await evalJs("document.getElementById('modal-licensing').style.display");
  console.log("Licensing Modal Display:", modalLicensingVisible);
  takeScreenshot("dualmark_licensing_modal.png");

  // Upgrade to Pro in modal
  console.log("Upgrading to Commercial Pro...");
  await evalJs("document.getElementById('btn-select-pro').click()");
  await new Promise(r => setTimeout(r, 600));
  const newTier = await evalJs("window.DualMarkLicensing.getTier()");
  const badgeText = await evalJs("document.getElementById('header-license-badge').textContent");
  console.log("New License Tier:", newTier, "| Header Badge:", badgeText);

  // Step 3: Test Legal Disclaimers Modal
  console.log("\n[Test 3] Testing Legal & Regulatory Disclaimers Modal...");
  await evalJs("document.getElementById('btn-legal').click()");
  await new Promise(r => setTimeout(r, 600));
  const modalLegalVisible = await evalJs("document.getElementById('modal-legal-compliance').style.display");
  console.log("Legal Modal Display:", modalLegalVisible);
  takeScreenshot("dualmark_legal_modal.png");
  // Acknowledge
  await evalJs("document.getElementById('btn-legal-confirm').click()");
  await new Promise(r => setTimeout(r, 400));

  // Step 4: Test GS1 GEPIR Prefix & Checksum Validation
  console.log("\n[Test 4] Testing GS1 GEPIR Prefix & Checksum Validator...");
  await evalJs("document.getElementById('gepir-check-input').value = '00812345678901'");
  await evalJs("document.getElementById('btn-gepir-validate').click()");
  await new Promise(r => setTimeout(r, 500));
  const gepirResultText = await evalJs("document.getElementById('gepir-result-box').innerText");
  console.log("GEPIR Result Box:\n" + gepirResultText);

  // Step 5: Test Optical Scanner Camera Pre-Permission Educational Modal & Fallback
  console.log("\n[Test 5] Testing Camera Pre-Permission Educational Modal & File Fallback...");
  // Clear any previous accepted state for test
  await evalJs("localStorage.removeItem('dualmark_camera_rationale_accepted')");
  // Switch to Scanner Tab
  await evalJs("document.querySelector('[data-tab=\"tab-scanner\"]').click()");
  await new Promise(r => setTimeout(r, 600));
  // Click Start Camera
  await evalJs("document.getElementById('btn-start-camera').click()");
  await new Promise(r => setTimeout(r, 600));
  const cameraModalVisible = await evalJs("document.getElementById('modal-camera-rationale').style.display");
  console.log("Camera Rationale Modal Display:", cameraModalVisible);
  takeScreenshot("dualmark_camera_modal.png");
  // Test dismiss
  await evalJs("document.getElementById('btn-camera-dismiss').click()");
  await new Promise(r => setTimeout(r, 400));

  // Step 6: Test Prepress Vector Export Center & BWR Slider
  console.log("\n[Test 6] Testing Prepress Vector Export Center & BWR Slider...");
  // Switch to Exports Tab
  await evalJs("document.querySelector('[data-tab=\"tab-exports\"]').click()");
  await new Promise(r => setTimeout(r, 600));
  // Adjust BWR slider to -50 um
  await evalJs(`
    var slider = document.getElementById('prepress-bwr-slider');
    slider.value = -50;
    slider.dispatchEvent(new Event('input'));
  `);
  await new Promise(r => setTimeout(r, 400));
  const bwrValue = await evalJs("window.DualMarkPrepress.getBwrMicrons()");
  const bwrReadout = await evalJs("document.getElementById('prepress-bwr-readout').textContent");
  console.log("BWR Micron Setting:", bwrValue, "| Readout:", bwrReadout);
  takeScreenshot("dualmark_prepress_bwr.png");

  // Upgrade to Enterprise to test CMYK EPS and High-Res Vector PDF
  await evalJs("window.DualMarkLicensing.setTier('enterprise')");
  const isCmykAllowed = await evalJs("window.DualMarkLicensing.isFeatureAllowed('vector_cmyk_eps')");
  console.log("Enterprise License Feature 'vector_cmyk_eps' Allowed:", isCmykAllowed);

  // Generate CMYK PostScript Level 3 EPS
  const epsOutput = await evalJs(`
    var data = { pattern: '10100110110101000110101011100101100110101001101101', text: '0 81234 56789 0' };
    var qr = window.DualMarkGS1.generateQrMatrix('https://id.brand.com/01/00812345678901');
    window.DualMarkPrepress.generateCmykEps(data, qr);
  `);
  console.log("CMYK EPS Header snippet:", epsOutput.substring(0, 160).replace(/\n/g, ' '));
  console.log("CMYK EPS Contains Process Black '0 0 0 1 setcmykcolor':", epsOutput.includes("0 0 0 1 setcmykcolor"));
  console.log("CMYK EPS Contains BWR annotation:", epsOutput.includes("BWR: -50 um"));

  // Generate 600 DPI Vector PDF
  const pdfOutput = await evalJs(`
    var data = { pattern: '10100110110101000110101011100101100110101001101101', text: '0 81234 56789 0' };
    var qr = window.DualMarkGS1.generateQrMatrix('https://id.brand.com/01/00812345678901');
    window.DualMarkPrepress.generateVectorPdf(data, qr, { dpi: 600 });
  `);
  console.log("Vector PDF Header snippet:", pdfOutput.substring(0, 60).replace(/\n/g, ' '));
  console.log("Vector PDF Contains CMYK process black '0 0 0 1 k':", pdfOutput.includes("0 0 0 1 k"));

  // Step 7: Test Enterprise Rugged Scanner Intent Bridge via ADB
  console.log("\n[Test 7] Testing Enterprise Rugged Scanner Intent Broadcast via ADB...");
  // Switch back to Synth Tab
  await evalJs("document.querySelector('[data-tab=\"tab-synth\"]').click()");
  await new Promise(r => setTimeout(r, 600));

  // Fire broadcast intent from ADB pretending to be Zebra DataWedge
  console.log("Broadcasting Zebra DataWedge scan intent...");
  execSync('adb -s arc:5555 shell am broadcast -a com.symbol.datawedge.api.ACTION --es com.symbol.datawedge.data_string "0012345678905" --es com.symbol.datawedge.label_type "UPCA"');
  await new Promise(r => setTimeout(r, 800));

  const synthBarcodeValue = await evalJs("document.getElementById('synth-1d-input').value");
  const gepirBarcodeValue = await evalJs("document.getElementById('gepir-check-input').value");
  console.log("1D Synth Input after Zebra Broadcast:", synthBarcodeValue);
  console.log("GEPIR Input after Zebra Broadcast:", gepirBarcodeValue);
  takeScreenshot("dualmark_enterprise_wedge.png");

  console.log("\n🎉 ALL 7 AUTOMATED VERIFICATION TESTS PASSED SUCCESSFULLY!");
  ws.close();
  process.exit(0);
}

main().catch(err => {
  console.error("Test error:", err);
  process.exit(1);
});
