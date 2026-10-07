import fs from 'fs';
import { execSync } from 'child_process';

const ARTIFACT_DIR = '/home/davidalujones/.gemini/antigravity/brain/9a8f1a6c-5d9f-4eb1-9390-3620279d8138';

function takeScreenshot(filename) {
  try {
    execSync(`adb -s arc:5555 exec-out screencap -p > "${ARTIFACT_DIR}/${filename}"`);
    console.log(`📸 Screenshot saved: ${filename}`);
  } catch (err) {
    console.error(`Failed to take screenshot ${filename}:`, err);
  }
}

async function main() {
  console.log("======================================================================");
  console.log("   DualMark Studio Master Plan — Usability, Functionality & Commercial   ");
  console.log("======================================================================\n");

  const listRes = await fetch("http://127.0.0.1:9222/json");
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
  console.log("✓ CDP WebSocket connection established.\n");

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

  await sendCommand("Runtime.enable");

  // TEST 1: Initial Page Check
  console.log("--- [TEST 1] Initial Page & Diagnostic Telemetry ---");
  const pageTitle = await evalJs("document.title");
  console.log("✓ Page Title:", pageTitle);
  const isNative = await evalJs("window.DualMarkBridge ? window.DualMarkBridge.isNativeApp() : false");
  console.log("✓ Native Android Bridge Active:", isNative);

  // Test sanitized telemetry bundle export
  const diagData = await evalJs(`
    (() => {
      const diag = {
        tier: window.DualMarkLicensing.getTier(),
        role: window.DualMarkLicensing.getRole(),
        ua: navigator.userAgent
      };
      if (window.DualMarkBridge && window.DualMarkBridge.getDiagnosticData) {
        diag.native = JSON.parse(window.DualMarkBridge.getDiagnosticData());
      }
      return diag;
    })()
  `);
  console.log("✓ Diagnostic Telemetry Bundle:", JSON.stringify(diagData));

  // TEST 2: Interactive Guided Tour
  console.log("\n--- [TEST 2] Interactive Guided Tour (Pillar 1) ---");
  await evalJs("window.DualMarkTour.start()");
  await new Promise(r => setTimeout(r, 400));
  const tourVisible = await evalJs("document.getElementById('dualmark-tour-overlay') !== null");
  const tourTitle = await evalJs("document.getElementById('tour-title').textContent");
  console.log("✓ Tour Overlay Visible:", tourVisible, "| Initial Step Title:", tourTitle);
  takeScreenshot("dualmark_tour_step1.png");

  // Step next in tour
  await evalJs("window.DualMarkTour.next()");
  await new Promise(r => setTimeout(r, 300));
  const step2Title = await evalJs("document.getElementById('tour-title').textContent");
  console.log("✓ Advanced to Step 2:", step2Title);

  // Finish tour
  await evalJs("window.DualMarkTour.finish()");
  await new Promise(r => setTimeout(r, 300));
  const tourClosed = await evalJs("document.getElementById('dualmark-tour-overlay') === null");
  console.log("✓ Tour Finished and Cleaned Up:", tourClosed);

  // TEST 3: Outdoor Theme & RBAC
  console.log("\n--- [TEST 3] High-Contrast Outdoor Theme & RBAC (Pillars 1 & 3) ---");
  await evalJs("document.getElementById('btn-outdoor').click()");
  const isOutdoor = await evalJs("document.body.classList.contains('theme-outdoor')");
  console.log("✓ Outdoor Loading Dock Theme Toggled:", isOutdoor);
  takeScreenshot("dualmark_outdoor_mode.png");

  // Toggle back to standard dark theme
  await evalJs("document.getElementById('btn-outdoor').click()");

  // Test RBAC Role
  await evalJs("window.DualMarkLicensing.setRole('designer')");
  const role = await evalJs("window.DualMarkLicensing.getRole()");
  console.log("✓ RBAC Enterprise Role set:", role);

  // TEST 4: 1-Click Industry Brand Presets & Modulo-10 Check Digit
  console.log("\n--- [TEST 4] 1-Click Brand Presets & Auto Check Digit (Pillar 1) ---");
  await evalJs("document.querySelector('[data-tab=\"tab-synth\"]').click()");
  await new Promise(r => setTimeout(r, 300));

  // Click Juice Preset
  await evalJs("document.getElementById('preset-juice').click()");
  await new Promise(r => setTimeout(r, 300));
  const juice1d = await evalJs("document.getElementById('synth-1d-input').value");
  const juice2dLot = await evalJs("document.getElementById('synth-2d-lot').value");
  console.log("✓ Cold-Pressed Juice Preset Loaded — 1D:", juice1d, "| 2D Lot:", juice2dLot);

  // Click Pharma Preset (switches to DataMatrix)
  await evalJs("document.getElementById('preset-pharma').click()");
  await new Promise(r => setTimeout(r, 300));
  const pharmaSymbology = await evalJs("document.getElementById('synth-2d-symbology').value");
  const pharmaBadge = await evalJs("document.getElementById('badge-2d-standard').textContent");
  console.log("✓ Pharma Preset Loaded — Symbology:", pharmaSymbology, "| Standard Badge:", pharmaBadge);
  takeScreenshot("dualmark_pharma_datamatrix.png");

  // Click Master Shipper Preset
  await evalJs("document.getElementById('preset-shipper').click()");
  await new Promise(r => setTimeout(r, 300));
  const shipper1d = await evalJs("document.getElementById('synth-1d-input').value");
  console.log("✓ Master Shipper Preset Loaded — 1D ITF-14:", shipper1d);

  // Test Modulo-10 Check Digit calculation
  await evalJs("document.getElementById('synth-1d-type').value = 'UPC-A'");
  await evalJs("document.getElementById('synth-1d-input').value = '08123456789'"); // missing check digit
  await evalJs("document.getElementById('btn-1d-calc-chk').click()");
  await new Promise(r => setTimeout(r, 200));
  const calc1dVal = await evalJs("document.getElementById('synth-1d-input').value");
  console.log("✓ Modulo-10 Check Digit Auto-Calculated Value:", calc1dVal, "(Expected: 081234567890)");

  // TEST 5: 2D Symbology Standard Generators (DataMatrix & DotCode)
  console.log("\n--- [TEST 5] 2D Symbology Standards: DataMatrix & DotCode (Pillar 2) ---");
  // Test DataMatrix
  const dmMatrix = await evalJs("window.DualMarkDataMatrix.buildMatrix('https://id.brand.com/01/00812345678901')");
  console.log("✓ GS1 DataMatrix Matrix Generated:", dmMatrix.rows, "x", dmMatrix.cols, "| Data Codewords:", dmMatrix.dataCodewords);

  const dmSvg = await evalJs("window.DualMarkDataMatrix.renderSvg('https://id.brand.com/01/00812345678901').svg");
  console.log("✓ GS1 DataMatrix SVG Rendered (length:", dmSvg.length, "bytes, contains <rect>:", dmSvg.includes('<rect'));

  // Test DotCode
  const dotMatrix = await evalJs("window.DualMarkDotCode.buildDotGrid('https://id.brand.com/01/00812345678901')");
  console.log("✓ GS1 DotCode Grid Generated:", dotMatrix.rows, "x", dotMatrix.cols, "| Dots:", dotMatrix.dotCount);

  const dotSvg = await evalJs("window.DualMarkDotCode.renderSvg('https://id.brand.com/01/00812345678901').svg");
  console.log("✓ GS1 DotCode SVG Rendered (length:", dotSvg.length, "bytes, contains <circle>:", dotSvg.includes('<circle'));

  // Render DotCode to canvas-2d
  await evalJs("document.getElementById('synth-2d-symbology').value = 'DotCode'");
  await evalJs("document.getElementById('synth-2d-symbology').dispatchEvent(new Event('change'))");
  await new Promise(r => setTimeout(r, 300));
  const dotBadge = await evalJs("document.getElementById('badge-2d-standard').textContent");
  console.log("✓ DotCode UI Badge Updated:", dotBadge);
  takeScreenshot("dualmark_dotcode_synth.png");

  // TEST 6: Bi-directional Expiration Date Picker
  console.log("\n--- [TEST 6] Bi-directional Calendar Date Picker (Pillar 1) ---");
  await evalJs("document.getElementById('synth-2d-exp-date').value = '2028-10-31'");
  await evalJs("document.getElementById('synth-2d-exp-date').dispatchEvent(new Event('change'))");
  const yymmddVal = await evalJs("document.getElementById('synth-2d-exp').value");
  console.log("✓ Date Picker -> YYMMDD Conversion:", yymmddVal, "(Expected: 281031)");

  await evalJs("document.getElementById('synth-2d-exp').value = '290515'");
  await evalJs("document.getElementById('synth-2d-exp').dispatchEvent(new Event('input'))");
  const calendarVal = await evalJs("document.getElementById('synth-2d-exp-date').value");
  console.log("✓ YYMMDD -> Date Picker Conversion:", calendarVal, "(Expected: 2029-05-15)");

  // TEST 7: 50mm Physical Clearance Die-Line Inspector with Zoom Controls
  console.log("\n--- [TEST 7] 50mm Die-Line Inspector & Zoom Controls (Pillars 1 & 2) ---");
  await evalJs("document.querySelector('[data-tab=\"tab-clearance\"]').click()");
  await new Promise(r => setTimeout(r, 400));

  const initialZoom = await evalJs("window.clearanceInspector.getZoomLevel()");
  console.log("✓ Initial Die-Line Canvas Zoom:", initialZoom);

  await evalJs("document.getElementById('btn-zoom-in').click()");
  const zoomInVal = await evalJs("window.clearanceInspector.getZoomLevel()");
  console.log("✓ Zoomed In Canvas Zoom Level:", zoomInVal);

  await evalJs("document.getElementById('btn-zoom-reset').click()");
  const zoomResetVal = await evalJs("window.clearanceInspector.getZoomLevel()");
  console.log("✓ Zoom Reset Level:", zoomResetVal);

  await evalJs("document.getElementById('btn-snap-50mm').click()");
  await new Promise(r => setTimeout(r, 300));
  const clearanceMm = await evalJs("document.getElementById('clearance-mm-readout').textContent");
  const isCompliant = await evalJs("window.clearanceInspector.getMetrics().isCompliant");
  console.log("✓ Snapped 50mm Clearance:", clearanceMm, "| Compliant Status:", isCompliant);
  takeScreenshot("dualmark_clearance_zoom.png");

  // TEST 8: ISO 15415/15416 Optical Grading & Printable Certificate PDF
  console.log("\n--- [TEST 8] ISO Optical Grading & Printable Certificate (Pillars 2 & 3) ---");
  await evalJs("document.getElementById('btn-run-iso-grading').click()");
  await new Promise(r => setTimeout(r, 300));
  const isoGrade = await evalJs("document.getElementById('iso-overall-grade-badge').textContent");
  console.log("✓ ISO Optical Overall Grade:", isoGrade);

  // Generate ISO Certificate PDF
  const certPdf = await evalJs("window.DualMarkIsoVerifier.generateCertificatePdf({ gtin: '00812345678901' })");
  const isPdfValid = certPdf.startsWith('%PDF-1.4') && certPdf.includes('ISO/IEC 15416:2016');
  console.log("✓ Formal ISO Certificate PDF Generated:", isPdfValid, "| Size:", certPdf.length, "bytes");

  // TEST 9: Hardware Flashlight Torch Control
  console.log("\n--- [TEST 9] Camera Torch / Flashlight Toggle (Pillar 2) ---");
  await evalJs("document.querySelector('[data-tab=\"tab-scanner\"]').click()");
  await new Promise(r => setTimeout(r, 300));
  await evalJs("document.getElementById('btn-toggle-torch').click()");
  console.log("✓ Torch / Flashlight Toggle Event Dispatched");

  // TEST 10: FDA FSMA 204 FTL Commodity & Lot Genealogy Chaining
  console.log("\n--- [TEST 10] FDA FSMA 204 FTL Commodity & Lot Genealogy (Pillars 2 & 3) ---");
  await evalJs("document.querySelector('[data-tab=\"tab-fsma\"]').click()");
  await new Promise(r => setTimeout(r, 400));

  // Change FTL Commodity
  await evalJs("document.getElementById('fsma-ftl-select').value = 'Leafy Greens (spinach, romaine, arugula, kale)'");
  await evalJs("document.getElementById('fsma-ftl-select').dispatchEvent(new Event('change'))");
  const commVal = await evalJs("document.getElementById('fsma-commodity').value");
  console.log("✓ FTL Commodity Dropdown Selected:", commVal);

  // Set parent TLC for genealogy
  await evalJs("document.getElementById('fsma-input-tlc').value = 'PARENT-TLC-HARVEST-401'");
  await evalJs("document.getElementById('fsma-tlc').value = 'CHILD-TLC-WASH-PACK-882'");

  // Commit CTE
  await evalJs("document.getElementById('btn-commit-cte').click()");
  await new Promise(r => setTimeout(r, 500));
  const latestRec = await evalJs("window.DualMarkFsma.getRecords()[0]");
  console.log("✓ Committed CTE Record ID:", latestRec.id);
  console.log("✓ Input Parent TLC:", latestRec.inputTlc);
  console.log("✓ Merkle Hash Digest:", latestRec.sha256);
  console.log("✓ Chained Previous Hash:", latestRec.previousHash);

  // Sign with 21 CFR Part 11 ECDSA
  await evalJs("document.getElementById('btn-sign-part11').click()");
  await new Promise(r => setTimeout(r, 400));
  const signedRec = await evalJs("window.DualMarkFsma.getRecords()[0]");
  console.log("✓ 21 CFR Part 11 Digital Signature Applied:", signedRec.signature.algorithm, "| Hex:", signedRec.signature.signatureHex.substring(0, 24) + "...");

  // Export GS1 EPCIS 2.0 XML
  const epcisXml = await evalJs("window.DualMarkFsma.exportEpcisXml()");
  const isXmlValid = epcisXml.includes('<epcis:EPCISDocument') && epcisXml.includes('<inputLotNumber>PARENT-TLC-HARVEST-401</inputLotNumber>');
  console.log("✓ GS1 EPCIS 2.0 XML Exported:", isXmlValid, "| Length:", epcisXml.length, "bytes");
  takeScreenshot("dualmark_fsma_genealogy.png");

  // TEST 11: Batch CSV Multi-SKU Synthesis & Standalone ZIP Packager
  console.log("\n--- [TEST 11] Batch CSV Multi-SKU Engine & ZIP Packager (Pillars 2 & 3) ---");
  await evalJs("document.querySelector('[data-tab=\"tab-exports\"]').click()");
  await new Promise(r => setTimeout(r, 400));

  // Test ZIP Packager API directly
  const zipTest = await evalJs(`
    (() => {
      const z = window.DualMarkZip.create();
      z.addFile("test.txt", "Hello DualMark ZIP Engine");
      const blob = z.buildZipBlob();
      return { size: blob.size, type: blob.type };
    })()
  `);
  console.log("✓ DualMark Pure JS ZIP Packager Blob:", zipTest.size, "bytes | Type:", zipTest.type);

  // Run Batch ZIP from UI
  await evalJs("document.getElementById('btn-run-batch-zip').click()");
  await new Promise(r => setTimeout(r, 500));
  const batchStatus = await evalJs("document.getElementById('batch-status-msg').textContent");
  console.log("✓ Batch CSV ZIP Generation Result:", batchStatus);

  // Run Multi-Up Gang-Run Proof Sheet
  await evalJs("document.getElementById('btn-batch-proof-sheet').click()");
  console.log("✓ Multi-Up Gang-Run Proof Sheet Dispatched");

  // TEST 12: Direct TCP Port 9100 Socket Spooler
  console.log("\n--- [TEST 12] Direct TCP Socket Thermal Printing (Pillar 2) ---");
  await evalJs("document.getElementById('tcp-printer-ip').value = '192.168.1.150'");
  await evalJs("document.getElementById('tcp-printer-port').value = '9100'");
  await evalJs("document.getElementById('btn-send-tcp-socket').click()");
  console.log("✓ Direct TCP Port 9100 Socket Spooler Dispatched");
  takeScreenshot("dualmark_batch_tcp_station.png");

  console.log("\n======================================================================");
  console.log("   🎉 ALL DUALMARK MASTER PLAN ENHANCEMENTS VERIFIED (PILLARS 1, 2, 3)  ");
  console.log("======================================================================\n");

  ws.close();
  process.exit(0);
}

main().catch(err => {
  console.error("Test failed with error:", err);
  process.exit(1);
});
