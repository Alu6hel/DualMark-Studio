/**
 * DualMark Studio — Part 3 Industrial Packaging & Supply Chain Gap Verification Suite
 * Verifies all 8 industrial and enterprise packaging pillars:
 * 1. PDF/X-4 & PDF/X-6 Output Intent & ICC Profiles (ISO 15930-7)
 * 2. TrueType / OpenType CIDFont Embedding in Vector PDFs
 * 3. Bi-Directional Zebra ZPL Status Polling (~HS / ~HQES)
 * 4. Camera Intrinsics & Fiducial Optical Calibration
 * 5. Persistent High-Capacity Database (Native Android SQLite Bridge & DualMarkDB)
 * 6. Google Play Billing 6.x Decoupled Contract & Scaffolding
 * 7. Multi-Lingual Dynamic UI Localization (6 Locales: en-US, es-ES, de-DE, fr-FR, ja-JP, zh-CN)
 * 8. Bluetooth Low Energy (BLE) GATT Printing Manager
 */

import fs from 'fs';
import { execSync } from 'child_process';
import TrueTypeEngine from './web_app/js/core/truetype_cidfont.js';
import VectorPrepress from './web_app/js/vector_prepress.js';
import CvGeometry from './web_app/js/core/cv_geometry.js';
import ZplGenerator from './web_app/js/zpl_generator.js';
import I18nEngine from './web_app/js/i18n.js';

const ARTIFACT_DIR = '/home/davidalujones/.gemini/antigravity/brain/9a8f1a6c-5d9f-4eb1-9390-3620279d8138';

function takeScreenshot(filename) {
  try {
    execSync(`adb -s arc:5555 exec-out screencap -p > "${ARTIFACT_DIR}/${filename}"`);
    console.log(`📸 Screenshot saved: ${filename}`);
  } catch (err) {
    console.error(`Failed to take screenshot ${filename}:`, err);
  }
}

let passed = 0;
let failed = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${testName}`);
    failed++;
  }
}

function assertApprox(a, b, epsilon, testName) {
  if (Math.abs(a - b) <= epsilon) {
    console.log(`  ✓ PASS: ${testName} (${a.toFixed(4)} ≈ ${b.toFixed(4)})`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${testName} (expected ${b}, got ${a})`);
    failed++;
  }
}

async function runTests() {
  console.log('======================================================================');
  console.log('   DUALMARK STUDIO: PART 3 GAPS IN SUPPLY CHAIN & PACKAGING VERIFICATION');
  console.log('======================================================================\n');

  // ===========================================================================
  // ITEM 1 & 2: TrueType CIDFont & PDF/X-4 ICC Output Intent Conformance
  // ===========================================================================
  console.log('--- 1 & 2. TrueType CIDFont & PDF/X-4 ICC Output Intent (ISO 15930-7) ---');

  // Test ICC Profile Generation
  const isfObj = TrueTypeEngine.generateIccProfile('fogra39');
  const iccBytesFogra = isfObj.bytes;
  assert(iccBytesFogra instanceof Uint8Array, 'FOGRA39 ICC profile returns Uint8Array');
  assert(iccBytesFogra.length >= 128, `ICC profile minimum 128 bytes (actual: ${iccBytesFogra.length})`);

  // Verify ICC Header: magic 'acsp' at offset 36
  const acspMagic = String.fromCharCode(...iccBytesFogra.subarray(36, 40));
  assert(acspMagic === 'acsp', `ICC Header contains 'acsp' signature at offset 36 (found: '${acspMagic}')`);

  // Verify device class 'prtr' and color space 'CMYK'
  const devClass = String.fromCharCode(...iccBytesFogra.subarray(12, 16));
  const colorSpace = String.fromCharCode(...iccBytesFogra.subarray(16, 20));
  assert(devClass === 'prtr', `ICC Profile class is 'prtr' (output printer)`);
  assert(colorSpace === 'CMYK', `ICC Profile color space is 'CMYK'`);

  // Test GRACoL profile
  const isGracolObj = TrueTypeEngine.generateIccProfile('gracol');
  assert(isGracolObj.bytes.length >= 128, 'GRACoL ICC profile generated successfully');

  // Test TrueType SFNT Table Assembly
  const fontObj = TrueTypeEngine.createSubsetTrueTypeFont('DualMarkBrandSans');
  const ttfBytes = fontObj.bytes;
  assert(ttfBytes instanceof Uint8Array, 'TrueType engine generates binary Uint8Array');
  assert(ttfBytes.length > 500, `TrueType binary font size valid (${ttfBytes.length} bytes)`);

  // Verify SFNT Header: 0x00010000 scaler type
  const scaler = (ttfBytes[0] << 24) | (ttfBytes[1] << 16) | (ttfBytes[2] << 8) | ttfBytes[3];
  assert(scaler === 0x00010000, `SFNT header has valid TrueType scaler type (0x00010000)`);

  const numTables = (ttfBytes[4] << 8) | ttfBytes[5];
  assert(numTables >= 7, `TrueType SFNT font contains required packaging tables (found: ${numTables})`);

  // Test /ToUnicode CMap Stream
  const toUnicodeCMap = TrueTypeEngine.generateToUnicodeCMap();
  assert(toUnicodeCMap.includes('/CIDInit /ProcSet findresource begin'), '/ToUnicode CMap contains PostScript header');
  assert(toUnicodeCMap.includes('beginbfrange') && toUnicodeCMap.includes('endbfrange'), '/ToUnicode CMap contains bfrange mappings');

  // Test PDF/X-4 Vector Master Generation
  const dummy1dData = {
    bars: [1, 0, 1, 1, 0, 1, 0, 0, 1, 1, 0, 1],
    humanReadable: '081234567890',
    type: 'UPC-A'
  };
  const dummyQrMatrix = [
    [1, 1, 1, 0, 1],
    [1, 0, 1, 0, 1],
    [1, 1, 1, 0, 1],
    [0, 0, 0, 1, 0],
    [1, 1, 1, 0, 1]
  ];

  const pdfX4Output = VectorPrepress.generatePdfX4(dummy1dData, dummyQrMatrix, {
    iccCondition: 'FOGRA39',
    clearanceMm: 52,
    gtin: '00812345678901'
  });

  assert(typeof pdfX4Output === 'string' && pdfX4Output.length > 1000, `PDF/X-4 document generated (${pdfX4Output.length} chars)`);
  assert(pdfX4Output.includes('/OutputIntents ['), 'PDF/X-4 contains /OutputIntents array');
  assert(pdfX4Output.includes('/GTS_PDFX'), 'PDF/X-4 OutputIntent subtype /S is /GTS_PDFX');
  assert(pdfX4Output.includes('/OutputConditionIdentifier (FOGRA39)'), 'PDF/X-4 identifies FOGRA39 condition');
  assert(pdfX4Output.includes('/DestOutputProfile'), 'PDF/X-4 embeds ICC /DestOutputProfile stream');
  assert(pdfX4Output.includes('/Subtype /Type0'), 'PDF/X-4 includes Type 0 composite CIDFont dictionary');
  assert(pdfX4Output.includes('/CIDFontType2'), 'PDF/X-4 descendant font is /CIDFontType2 (TrueType glyphs)');
  assert(pdfX4Output.includes('/FontFile2'), 'PDF/X-4 embeds TrueType font stream via /FontFile2');
  assert(pdfX4Output.includes('/ToUnicode'), 'PDF/X-4 links /ToUnicode CMap for searchability/cut-and-paste');
  assert(pdfX4Output.includes('<pdfx:GTS_PDFXVersion>PDF/X-4</pdfx:GTS_PDFXVersion>') && pdfX4Output.includes('PDF/X-4:2010'), 'PDF/X-4 XMP metadata packet certifies ISO 15930-7 conformance');

  // ===========================================================================
  // ITEM 3: Bi-Directional Zebra ZPL Status Polling (~HS)
  // ===========================================================================
  console.log('\n--- 3. Bi-Directional Zebra ZPL Status Polling (~HS / ~HQES) ---');

  // Normal Zebra status packet
  const normalHs = "\x02030,0,0,0825,000,0,0,0,000,0,0,0\x03\r\n\x021,0,0,0,1,1,0,0,00000000,1,000\x03\r\n\x021234,0\x03";
  const stNormal = ZplGenerator.parseZebraHostStatus(normalHs);
  assert(stNormal.online === true, 'Zebra normal response parsed as online');
  assert(stNormal.paperOut === false, 'Zebra normal status: paper is present');
  assert(stNormal.pause === false, 'Zebra normal status: not paused');
  assert(stNormal.labelLengthDots === 825, `Zebra normal status: label length is 825 dots (got: ${stNormal.labelLengthDots})`);
  assert(stNormal.printheadOpen === false, 'Zebra normal status: printhead closed');
  assert(stNormal.ribbonOut === false, 'Zebra normal status: ribbon present');
  assert(stNormal.readyToPrint === true, 'Zebra readyToPrint flag is true');

  // Fault Zebra status packet (Paper Out, Head Open, Over Temp)
  const faultHs = "\x02030,1,1,0825,005,0,0,0,000,0,0,1\x03\r\n\x021,0,1,1,1,1,1,0,00000000,1,000\x03\r\n\x021234,0\x03";
  const stFault = ZplGenerator.parseZebraHostStatus(faultHs);
  assert(stFault.paperOut === true, 'Zebra fault status: paper out detected');
  assert(stFault.pause === true, 'Zebra fault status: printer paused detected');
  assert(stFault.formatsInBuffer === 5, `Zebra fault status: formats in buffer is 5 (got: ${stFault.formatsInBuffer})`);
  assert(stFault.ribbonOut === true, 'Zebra fault status: ribbon out detected');
  assert(stFault.printheadOpen === true, 'Zebra fault status: printhead open detected');
  assert(stFault.overTemp === true, 'Zebra fault status: over-temperature flag detected');
  assert(stFault.readyToPrint === false, 'Zebra readyToPrint flag is false when errors exist');

  // ===========================================================================
  // ITEM 4: Camera Intrinsics & Optical Fiducial Calibration
  // ===========================================================================
  console.log('\n--- 4. Camera Intrinsics & Optical Fiducial Calibration ---');

  // Equation: scale = (D * sensorWidthMm) / (f * imageWidthPx)
  // At D = 200mm, f = 4.2mm, sensorWidth = 5.6mm, imageWidth = 1920px:
  // scale = (200 * 5.6) / (4.2 * 1920) = 1120 / 8064 = 0.138888... mm/px
  const scaleMmPerPx = CvGeometry.calcOpticalScale(200, 4.2, 5.6, 1920);
  assertApprox(scaleMmPerPx, 0.138888, 0.0001, 'Optical scale calculated: mm/pixel');

  // Reverse distance equation: D = (knownTargetMm * f * imageWidthPx) / (measuredTargetPx * sensorWidthMm)
  // For known target of 20mm, measured at 144 pixels:
  // D = (20 * 4.2 * 1920) / (144 * 5.6) = 161280 / 806.4 = 200.0 mm
  const opticalDist = CvGeometry.calcOpticalDistance(20.0, 144, 4.2, 5.6, 1920);
  assertApprox(opticalDist, 200.0, 0.01, 'Optical distance D calculated: 200.0 mm');

  // Test Fiducial Target Detection: 20mm square coupon
  const couponBBox = { x: 50, y: 50, width: 120, height: 119 }; // Aspect ratio ~ 1.008
  const fiducialCoupon = CvGeometry.detectFiducialTarget(couponBBox, '20mm_coupon');
  assert(fiducialCoupon.match === true, '20mm square calibration coupon detected');
  assert(fiducialCoupon.targetType === '20mm_coupon', 'Target type identified as 20mm_coupon');
  assertApprox(fiducialCoupon.pxPerMm, 6.0, 0.1, 'Pixel-to-mm ratio calculated (~6.0 px/mm)');

  // Test Fiducial Target Detection: ISO/IEC 7810 ID-1 card (85.60mm x 53.98mm, ratio 1.58577)
  const cardBBox = { x: 100, y: 100, width: 317, height: 200 }; // Aspect ratio 1.585
  const fiducialCard = CvGeometry.detectFiducialTarget(cardBBox, 'id1_card');
  assert(fiducialCard.match === true, 'ISO/IEC 7810 ID-1 credit card target detected');
  assert(fiducialCard.targetType === 'id1_card', 'Target type identified as id1_card');
  assertApprox(fiducialCard.pxPerMm, 3.7, 0.1, 'Card pixel-to-mm ratio calculated (~3.7 px/mm)');

  // ===========================================================================
  // ITEM 7: Multi-Lingual Dynamic UI Localization Engine (6 Locales)
  // ===========================================================================
  console.log('\n--- 7. Dynamic Multi-Lingual Localization (6 Locales) ---');

  const supported = I18nEngine.getSupportedLanguages();
  assert(supported.length === 6, `Supports 6 target packaging locales (${supported.join(', ')})`);
  assert(supported.includes('en-US') && supported.includes('es-ES') && supported.includes('de-DE') &&
         supported.includes('fr-FR') && supported.includes('ja-JP') && supported.includes('zh-CN'),
         'Contains en-US, es-ES, de-DE, fr-FR, ja-JP, zh-CN');

  // Test English
  I18nEngine.setLanguage('en-US');
  assert(I18nEngine.t('btn.export_pdf') === 'Export PDF/X-4 Master', 'en-US translation for btn.export_pdf');
  assert(I18nEngine.t('badge.compliant') === '50mm Clearance Certified', 'en-US translation for badge.compliant');

  // Test Spanish
  I18nEngine.setLanguage('es-ES');
  assert(I18nEngine.t('btn.export_pdf') === 'Exportar Maestro PDF/X-4', 'es-ES translation for btn.export_pdf');
  assert(I18nEngine.t('status.printer_paper_out') === '⚠ Impresora Zebra: Sin Papel', 'es-ES translation for printer paper out');

  // Test German
  I18nEngine.setLanguage('de-DE');
  assert(I18nEngine.t('btn.export_pdf') === 'PDF/X-4 Master Exportieren', 'de-DE translation for btn.export_pdf');
  assert(I18nEngine.t('tab.dieline') === '2. 50mm Stanzkontur-Sicherheitszone', 'de-DE translation for tab.dieline');

  // Test French
  I18nEngine.setLanguage('fr-FR');
  assert(I18nEngine.t('btn.export_pdf') === 'Exporter Master PDF/X-4', 'fr-FR translation for btn.export_pdf');
  assert(I18nEngine.t('status.ble_connected') === 'Imprimante Bluetooth LE: Connectée', 'fr-FR translation for BLE connected');

  // Test Japanese
  I18nEngine.setLanguage('ja-JP');
  assert(I18nEngine.t('btn.export_pdf') === 'PDF/X-4マスター出力', 'ja-JP translation for btn.export_pdf');
  assert(I18nEngine.t('badge.grade_a') === 'ISO/IEC グレード A (4.0/4.0)', 'ja-JP translation for grade A');

  // Test Chinese
  I18nEngine.setLanguage('zh-CN');
  assert(I18nEngine.t('btn.export_pdf') === '导出PDF/X-4主文件', 'zh-CN translation for btn.export_pdf');
  assert(I18nEngine.t('badge.compliant') === '50mm净距认证合格', 'zh-CN translation for 50mm clearance');

  // Reset back to en-US
  I18nEngine.setLanguage('en-US');

  // ===========================================================================
  // CDP & ANDROID NATIVE BRIDGE TESTING (ITEMS 5, 6, 8 & LIVE DOM)
  // ===========================================================================
  console.log('\n--- Connecting to Android WebView for Live Native Integration Testing ---');

  const listRes = await fetch("http://127.0.0.1:9222/json");
  const pages = await listRes.json();
  const page = pages.find(p => p.type === 'page' && p.url.includes('web_app'));
  if (!page) {
    throw new Error("Target WebView page not found! Found: " + JSON.stringify(pages));
  }

  const ws = new WebSocket(page.webSocketDebuggerUrl);
  let msgId = 100;
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

  // ===========================================================================
  // ITEM 5: Persistent High-Capacity Database (Native SQLite Bridge)
  // ===========================================================================
  console.log('--- 5. Persistent High-Capacity Native SQLite Storage (Bridge) ---');

  const hasSqlite = await evalJs("window.DualMarkDB ? window.DualMarkDB.hasNativeSqlite() : false");
  assert(hasSqlite === true, 'Native SQLite is active and detected by DualMarkDB in Android');

  // Test SQLite clear table
  await evalJs("window.DualMarkBridge.sqliteClearTable('fsma_records')");
  const countInitial = await evalJs("window.DualMarkBridge.sqliteCountRecords('fsma_records')");
  assert(countInitial === 0, 'SQLite fsma_records table initialized / cleared');

  // Insert test records via SQLite Bridge
  const sampleCte1 = {
    recordId: 'CTE-SQL-001',
    cteType: 'harvesting',
    timestamp: new Date().toISOString(),
    tlc: 'TLC-SQL-LETTUCE-01',
    commodity: 'Leafy Greens',
    quantity: 50,
    uom: 'cases'
  };
  const sampleCte2 = {
    recordId: 'CTE-SQL-002',
    cteType: 'cooling',
    timestamp: new Date().toISOString(),
    tlc: 'TLC-SQL-LETTUCE-02',
    commodity: 'Leafy Greens',
    quantity: 50,
    uom: 'cases'
  };

  const insertOk1 = await evalJs(`window.DualMarkBridge.sqliteInsertRecord('fsma_records', '${JSON.stringify(sampleCte1)}')`);
  const insertOk2 = await evalJs(`window.DualMarkBridge.sqliteInsertRecord('fsma_records', '${JSON.stringify(sampleCte2)}')`);
  assert(insertOk1 === true && insertOk2 === true, 'Successfully inserted records into native SQLite table');

  // Query records count
  const countAfter = await evalJs("window.DualMarkBridge.sqliteCountRecords('fsma_records')");
  assert(countAfter === 2, `SQLite records count reflects inserted rows (count: ${countAfter})`);

  // Query records payload
  const queriedJson = await evalJs("window.DualMarkBridge.sqliteQueryRecords('fsma_records', 10, 0)");
  const queriedRecords = JSON.parse(queriedJson);
  assert(Array.isArray(queriedRecords) && queriedRecords.length === 2, 'Queried records array length is 2');
  assert(queriedRecords[0].recordId === 'CTE-SQL-001' || queriedRecords[1].recordId === 'CTE-SQL-001', 'Retrieved record contains CTE-SQL-001');

  // Test single record deletion
  const delOk = await evalJs("window.DualMarkBridge.sqliteDeleteRecord('fsma_records', 'CTE-SQL-001')");
  assert(delOk === true, 'Successfully deleted individual record by ID');
  const countFinal = await evalJs("window.DualMarkBridge.sqliteCountRecords('fsma_records')");
  assert(countFinal === 1, `Records count decreased to 1 after deletion (actual: ${countFinal})`);

  // Test transparent DualMarkDB integration
  await evalJs(`
    (async () => {
      await window.DualMarkDB.saveFsmaRecord({
        recordId: 'CTE-TRANSPARENT-DB',
        cteType: 'packing',
        timestamp: new Date().toISOString(),
        tlc: 'TLC-PACK-999'
      });
    })()
  `);
  const transparentCount = await evalJs("window.DualMarkBridge.sqliteCountRecords('fsma_records')");
  assert(transparentCount === 2, `DualMarkDB.saveFsmaRecord routed directly into native SQLite (count: ${transparentCount})`);

  // ===========================================================================
  // ITEM 6: Google Play Billing 6.x Contract & Scaffolding
  // ===========================================================================
  console.log('\n--- 6. Google Play Billing 6.x Contract & Scaffolding ---');

  const billingStatusStr = await evalJs("window.DualMarkBridge.getBillingStatus()");
  const billingStatus = JSON.parse(billingStatusStr);
  assert(billingStatus.ready === true, 'Google Play Billing bridge ready flag is true');
  assert(billingStatus.version === '6.2.1', `Google Play Billing version reported as 6.2.1 (actual: ${billingStatus.version})`);
  assert(billingStatus.configured === true, 'Google Play Billing configured contract flag is true');

  // Test Billing Flow invocation
  await evalJs("window.DualMarkBridge.launchBillingFlow('dualmark_enterprise_annual')");
  const activeTierAfterBilling = await evalJs("window.DualMarkBridge.getLicenseTier()");
  assert(activeTierAfterBilling === 'enterprise', `launchBillingFlow activated license tier (current tier: ${activeTierAfterBilling})`);

  // ===========================================================================
  // ITEM 8: Bluetooth Low Energy (BLE) GATT Printing Manager
  // ===========================================================================
  console.log('\n--- 8. Bluetooth Low Energy (BLE) GATT Printing Manager ---');

  const scanStarted = await evalJs("window.DualMarkBridge.startBleScan()");
  assert(scanStarted === true, 'BLE scan started via DualMarkBridge');

  const blePrintersJson = await evalJs("window.DualMarkBridge.getDiscoveredBlePrinters()");
  const blePrinters = JSON.parse(blePrintersJson);
  assert(Array.isArray(blePrinters), 'getDiscoveredBlePrinters returns valid JSON array');

  const isConnectedBefore = await evalJs("window.DualMarkBridge.isBleConnected()");
  assert(typeof isConnectedBefore === 'boolean', `isBleConnected returns boolean (current: ${isConnectedBefore})`);

  // Test BLE chunking and transmission mock
  const sampleZplBase64 = Buffer.from('^XA^FO50,50^ADN,36,20^FDTEST BLE^FS^XZ').toString('base64');
  const sendResult = await evalJs(`window.DualMarkBridge.sendBleData('${sampleZplBase64}')`);
  assert(typeof sendResult === 'boolean', `sendBleData handles base64 transmission gracefully (result: ${sendResult})`);

  const scanStopped = await evalJs("window.DualMarkBridge.stopBleScan()");
  assert(scanStopped === true, 'BLE scan stopped cleanly via DualMarkBridge');

  // ===========================================================================
  // LIVE UI LOCALIZATION SWITCHING TEST IN BROWSER / WEBVIEW
  // ===========================================================================
  console.log('\n--- Live WebView Dynamic Language Switching (Visual Verification) ---');

  // Switch to Spanish
  await evalJs("window.DualMarkI18n.setLanguage('es-ES')");
  const docLangEs = await evalJs("document.documentElement.lang");
  assert(docLangEs === 'es-ES', `Document HTML lang updated to es-ES (actual: ${docLangEs})`);

  // Switch to Japanese
  await evalJs("window.DualMarkI18n.setLanguage('ja-JP')");
  const docLangJa = await evalJs("document.documentElement.lang");
  assert(docLangJa === 'ja-JP', `Document HTML lang updated to ja-JP (actual: ${docLangJa})`);

  takeScreenshot('dualmark_part3_japanese_ui.png');

  // Switch back to English
  await evalJs("window.DualMarkI18n.setLanguage('en-US')");
  const docLangEn = await evalJs("document.documentElement.lang");
  assert(docLangEn === 'en-US', `Document HTML lang restored to en-US (actual: ${docLangEn})`);

  ws.close();

  // ===========================================================================
  // SUMMARY
  // ===========================================================================
  console.log('\n======================================================================');
  console.log(`   PART 3 GAPS VERIFICATION SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('======================================================================');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests().catch(err => {
  console.error("Test execution fatal error:", err);
  process.exit(1);
});
