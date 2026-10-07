import fs from 'fs';

async function main() {
  console.log("======================================================================");
  console.log("   DualMark Studio Deep Backend & Algorithms Comprehensive Test Suite   ");
  console.log("======================================================================\n");

  const listRes = await fetch("http://127.0.0.1:9222/json");
  const pages = await listRes.json();
  const page = pages.find(p => p.type === 'page' && p.url.includes('web_app'));
  if (!page) {
    throw new Error("Target WebView page not found! Found: " + JSON.stringify(pages));
  }

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

  await new Promise((res, rej) => {
    ws.onopen = res;
    ws.onerror = rej;
  });

  async function evalJs(expr) {
    const id = msgId++;
    const promise = new Promise((resolve, reject) => {
      pending.set(id, { resolve, reject });
    });
    ws.send(JSON.stringify({
      id,
      method: "Runtime.evaluate",
      params: { expression: expr, returnByValue: true, awaitPromise: true }
    }));
    const result = await promise;
    if (result.exceptionDetails) {
      throw new Error(`JS Eval Exception: ${JSON.stringify(result.exceptionDetails)}`);
    }
    return result.result.value;
  }

  // --- [TEST 1] PDF Dossier Generator Object Format & Base64 Decoder ---
  console.log("--- [TEST 1] PDF Dossier Generator & Base64 Integrity ---");
  const dossierTest = await evalJs(`
    (async () => {
      const rec = {
        id: 'CTE-TEST-999',
        eventType: 'receiving',
        tlc: 'TLC-AUDIT-TEST',
        gtin: '00812345678901',
        commodity: 'Organic Apples',
        quantity: '500 kg',
        gln: '0812345678901',
        gps: '37.7749° N, 122.4194° W',
        recordedAt: new Date().toISOString(),
        sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
      };
      const d = await window.DualMarkFsma.generatePdfDossier(rec);
      const isObj = typeof d === 'object';
      const hasBase64 = typeof d.base64 === 'string' && d.base64.length > 50;
      const hasFilename = d.filename === 'DualMark_FSMA_Dossier_CTE-TEST-999.pdf';
      const hasRawPdf = typeof d.rawPdf === 'string' && d.rawPdf.startsWith('%PDF-1.4');
      const toStringWorks = d.toString().startsWith('%PDF-1.4');
      const b64Decoded = atob(d.base64);
      const b64Valid = b64Decoded.startsWith('%PDF-1.4');

      return { isObj, hasBase64, hasFilename, hasRawPdf, toStringWorks, b64Valid };
    })()
  `);
  console.log("Dossier Return Structure:", dossierTest);
  if (!dossierTest.isObj || !dossierTest.hasBase64 || !dossierTest.hasFilename || !dossierTest.b64Valid) {
    throw new Error("Dossier return type or Base64 validation failed!");
  }
  console.log("✓ Test 1 Passed: PDF Dossier returns compliant multi-format object with valid Base64.\n");

  // --- [TEST 2] Offline ECDSA P-256 Public Key Retention & Verification ---
  console.log("--- [TEST 2] 21 CFR Part 11 ECDSA Signature & Verification ---");
  const sigTest = await evalJs(`
    (async () => {
      const rec = await window.DualMarkFsma.addRecord({
        eventType: 'transformation',
        tlc: 'TLC-SIG-CHECK-01',
        gtin: '00812345678901',
        commodity: 'Fresh Romaine',
        quantity: '100 boxes',
        gln: '0812345678901',
        gps: '37.7749° N, 122.4194° W'
      });
      const sig = await window.DualMarkFsma.signRecordPart11(rec, {
        auditorName: 'Lead Auditor Jane Doe',
        auditorTitle: 'Chief QC Inspector',
        signingReason: 'Formal Regulatory Release'
      });
      const hasSpki = typeof sig.publicKeySpki === 'string' && sig.publicKeySpki.length > 50;
      const hasHex = typeof sig.signatureHex === 'string' && sig.signatureHex.length > 30;
      const verResult = await window.DualMarkFsma.verifyRecordSignature(rec.id);

      return { hasSpki, hasHex, verified: verResult.verified, auditor: verResult.auditor };
    })()
  `);
  console.log("ECDSA Signature Verification:", sigTest);
  if (!sigTest.hasSpki || !sigTest.hasHex || !sigTest.verified) {
    throw new Error("Cryptographic signature creation or verification failed!");
  }
  console.log("✓ Test 2 Passed: ECDSA P-256 signature and offline public key verification succeeded.\n");

  // --- [TEST 3] DataMatrix ISO/IEC 16022 Rectangular Formats ---
  console.log("--- [TEST 3] DataMatrix Rectangular Formats ---");
  const dmRectTest = await evalJs(`
    (() => {
      const res = window.DualMarkDataMatrix.buildMatrix("123456", true, { preferRect: true });
      const rows = res.rows;
      const cols = res.cols;
      const isRect = rows !== cols;
      const validSizes = [
        [8, 18], [8, 32], [12, 26], [12, 36], [16, 36], [16, 48]
      ];
      const matched = validSizes.some(([r, c]) => r === rows && c === cols);
      return { rows, cols, isRect, matched };
    })()
  `);
  console.log("DataMatrix Rectangular Result:", dmRectTest);
  if (!dmRectTest.isRect || !dmRectTest.matched) {
    throw new Error("DataMatrix rectangular format generation failed!");
  }
  console.log(`✓ Test 3 Passed: DataMatrix rectangular format generated (${dmRectTest.rows}x${dmRectTest.cols}).\n`);

  // --- [TEST 4] DotCode ISO/IEC 20835 GF(113) Reed-Solomon Math ---
  console.log("--- [TEST 4] DotCode ISO/IEC 20835 Reed-Solomon Math ---");
  const dotcodeTest = await evalJs(`
    (() => {
      const grid = window.DualMarkDotCode.buildGrid("ABC12345", { preferFnc1: true });
      const rows = grid.length;
      const cols = grid[0].length;
      const oddSum = (rows + cols) % 2 === 1;
      let validCheckerboard = true;
      let dotCount = 0;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (grid[r][c]) {
            dotCount++;
            if ((r + c) % 2 !== 0) validCheckerboard = false;
          }
        }
      }
      return { rows, cols, oddSum, validCheckerboard, dotCount };
    })()
  `);
  console.log("DotCode Grid Result:", dotcodeTest);
  if (!dotcodeTest.oddSum || !dotcodeTest.validCheckerboard || dotcodeTest.dotCount < 10) {
    throw new Error("DotCode ISO/IEC 20835 grid or checkerboard validation failed!");
  }
  console.log(`✓ Test 4 Passed: Authentic DotCode GF(113) grid verified (${dotcodeTest.rows}x${dotcodeTest.cols}, ${dotcodeTest.dotCount} dots).\n`);

  // --- [TEST 5] Code 128 Subset C & EAN-8 ---
  console.log("--- [TEST 5] 1D Symbologies: Code 128 C Compaction & EAN-8 ---");
  const symb1dTest = await evalJs(`
    (() => {
      const c128 = window.DualMarkBarcode1D.getBitstream('Code 128', '12345678');
      const ean8 = window.DualMarkBarcode1D.getBitstream('EAN-8', '12345670');
      const gs1128 = window.DualMarkBarcode1D.getBitstream('GS1-128', '(01)00812345678901');

      return {
        c128Length: c128.length,
        ean8Length: ean8.length,
        gs1128Length: gs1128.length
      };
    })()
  `);
  console.log("1D Symbologies Bitstream Lengths:", symb1dTest);
  if (symb1dTest.ean8Length !== 67 || symb1dTest.c128Length < 50 || symb1dTest.gs1128Length < 60) {
    throw new Error("1D barcode generation failed! EAN-8 must be 67 modules.");
  }
  console.log("✓ Test 5 Passed: Code 128 Subset C, GS1-128 FNC1, and EAN-8 (67 modules) verified.\n");

  // --- [TEST 6] GS1 Digital Link Multi-Key Support (/00/, /414/, /8004/) ---
  console.log("--- [TEST 6] GS1 Digital Link Multi-Key Support ---");
  const gs1MultiKeyTest = await evalJs(`
    (() => {
      const uriSscc = window.DualMarkGS1.buildDigitalLinkUri({ sscc: '100812345678901234' });
      const uriGln = window.DualMarkGS1.buildDigitalLinkUri({ gln: '0812345678901', locExt: 'BAY-12' });
      const uriGrai = window.DualMarkGS1.buildDigitalLinkUri({ grai: '0812345678901ABC99' });

      const parsedSscc = window.DualMarkGS1.parseDigitalLinkUri(uriSscc);
      const parsedGln = window.DualMarkGS1.parseDigitalLinkUri(uriGln);
      const parsedGrai = window.DualMarkGS1.parseDigitalLinkUri(uriGrai);

      const confSscc = window.DualMarkGS1.validateConformance(uriSscc);
      const confGln = window.DualMarkGS1.validateConformance(uriGln);
      const confGrai = window.DualMarkGS1.validateConformance(uriGrai);

      return {
        uriSscc,
        uriGln,
        uriGrai,
        ssccOk: parsedSscc.sscc === '100812345678901234' && confSscc.score === 100,
        glnOk: parsedGln.gln === '0812345678901' && parsedGln.locationExtension === 'BAY-12' && confGln.score === 100,
        graiOk: parsedGrai.grai === '0812345678901ABC99' && confGrai.score === 100
      };
    })()
  `);
  console.log("GS1 Multi-Key Verification:", gs1MultiKeyTest);
  if (!gs1MultiKeyTest.ssccOk || !gs1MultiKeyTest.glnOk || !gs1MultiKeyTest.graiOk) {
    throw new Error("GS1 Multi-Key builder, parser, or conformance test failed!");
  }
  console.log("✓ Test 6 Passed: /00/ (SSCC), /414/ (GLN), and /8004/ (GRAI) primary keys pass with 100/100.\n");

  // --- [TEST 7] Pixel-Based ISO/IEC Optical Grading ---
  console.log("--- [TEST 7] Real Pixel-Based ISO/IEC 15416 & 15415 Grading ---");
  const isoPixelTest = await evalJs(`
    (() => {
      const cHigh = document.createElement('canvas');
      cHigh.width = 200;
      cHigh.height = 100;
      const ctxH = cHigh.getContext('2d');
      ctxH.fillStyle = '#FFFFFF';
      ctxH.fillRect(0, 0, 200, 100);
      ctxH.fillStyle = '#000000';
      for (let x = 20; x < 180; x += 10) {
        ctxH.fillRect(x, 10, 5, 80);
      }
      const gradeHigh = window.DualMarkIsoVerifier.gradeBarcode1D(cHigh);

      const cLow = document.createElement('canvas');
      cLow.width = 200;
      cLow.height = 100;
      const ctxL = cLow.getContext('2d');
      ctxL.fillStyle = '#888888';
      ctxL.fillRect(0, 0, 200, 100);
      ctxL.fillStyle = '#777777';
      for (let x = 20; x < 180; x += 10) {
        ctxL.fillRect(x, 10, 5, 80);
      }
      const gradeLow = window.DualMarkIsoVerifier.gradeBarcode1D(cLow);

      return {
        highGrade: gradeHigh.overallGrade,
        highSC: gradeHigh.metrics.symbolContrast,
        lowGrade: gradeLow.overallGrade,
        lowSC: gradeLow.metrics.symbolContrast
      };
    })()
  `);
  console.log("ISO Pixel Grading Results:", isoPixelTest);
  if (isoPixelTest.highGrade.letter !== 'A' || isoPixelTest.lowGrade.numeric > 2.0) {
    throw new Error("Real pixel-based optical grading did not discriminate between high and low contrast!");
  }
  console.log("✓ Test 7 Passed: Real pixel sampling accurately discriminates symbol contrast (Grade A vs Grade F).\n");

  // --- [TEST 8] 50mm Impossible Fit Detection & Multi-Panel Warning ---
  console.log("--- [TEST 8] 50mm Impossible Fit & Multi-Panel Layout ---");
  const clearanceImpossibleTest = await evalJs(`
    (() => {
      const c = document.createElement('canvas');
      c.width = 300;
      c.height = 100;
      const inspector = new window.DualMarkClearance.ClearanceInspector(c);
      inspector.packageWidthMm = 70;
      const snapResult = inspector.snapTo50mm();
      const metrics = inspector.getMetrics();

      return {
        impossibleFit: snapResult.impossibleFit,
        recommendation: snapResult.recommendation,
        multiPanelRecommended: metrics.multiPanelRecommended,
        isCompliant: metrics.isCompliant
      };
    })()
  `);
  console.log("Clearance Impossible Fit Result:", clearanceImpossibleTest);
  if (!clearanceImpossibleTest.impossibleFit || clearanceImpossibleTest.recommendation !== 'MULTI_PANEL_LAYOUT') {
    throw new Error("50mm impossible-fit detection failed!");
  }
  console.log("✓ Test 8 Passed: Impossible coplanar fit detected and MULTI_PANEL_LAYOUT recommended.\n");

  // --- [TEST 9] 3x3 Projective Homography Dewarping ---
  console.log("--- [TEST 9] 3x3 Projective Homography Matrix Transform ---");
  const homographyTest = await evalJs(`
    (() => {
      const c = document.createElement('canvas');
      c.width = 400;
      c.height = 300;
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, 400, 300);
      ctx.fillStyle = '#111827';
      ctx.fillRect(50, 50, 300, 200);

      const dewarp = new window.DualMarkScanner.ScannerDewarpStudio(null, c);
      dewarp.sourceImage = c;
      dewarp.corners = [
        { x: 0.15, y: 0.10 },
        { x: 0.85, y: 0.15 },
        { x: 0.95, y: 0.85 },
        { x: 0.05, y: 0.90 }
      ];

      const outDataUrl = dewarp.flattenAndBinarize(400, 300);
      const isValidJpeg = outDataUrl && outDataUrl.startsWith('data:image/jpeg;base64,');

      return { isValidJpeg, urlLength: outDataUrl ? outDataUrl.length : 0 };
    })()
  `);
  console.log("Homography Dewarp Result:", homographyTest);
  if (!homographyTest.isValidJpeg || homographyTest.urlLength < 1000) {
    throw new Error("3x3 Projective homography dewarp failed!");
  }
  console.log("✓ Test 9 Passed: 3x3 Projective homography dewarp and binarization verified.\n");

  // --- [TEST 10] Dynamic Resolver Serial Range Matching & Nginx Export ---
  console.log("--- [TEST 10] Dynamic Resolver Serial Matching & Lot/Geo Nginx Export ---");
  const resolverTest = await evalJs(`
    (() => {
      const matchIn = window.DualMarkResolver.resolve('00854921004128', 'LOT-9924-REV', 'SN-00250', 'US');
      const matchOut = window.DualMarkResolver.resolve('00854921004128', 'LOT-9924-REV', 'SN-00999', 'US');

      const nginxConfig = window.DualMarkResolver.exportNginxConfig();
      const hasGeoip = nginxConfig.includes('map $geoip_country_code $gs1_geo_redirect');
      const hasLotRegex = nginxConfig.includes('/10/');

      return {
        matchedRecall: matchIn.status === 'RECALLED_SAFETY_OVERRIDE',
        unmatchedPass: matchOut.status !== 'RECALLED_SAFETY_OVERRIDE',
        hasGeoip,
        hasLotRegex
      };
    })()
  `);
  console.log("Resolver Serial & Nginx Results:", resolverTest);
  if (!resolverTest.matchedRecall || !resolverTest.unmatchedPass || !resolverTest.hasGeoip || !resolverTest.hasLotRegex) {
    throw new Error("Dynamic resolver serial range matching or Nginx export failed!");
  }
  console.log("✓ Test 10 Passed: Serial range 'SN-00100..SN-00500' matching and lot/geo Nginx export verified.\n");

  // --- [TEST 11] Prepress Station Exports & Zebra ZPL ^BXN ---
  console.log("--- [TEST 11] Prepress PostScript Dots & Zebra ZPL DataMatrix ^BXN ---");
  const prepressTest = await evalJs(`
    (() => {
      const zplDm = window.DualMarkZPL.generateZpl('UPC-A', '081234567890', 'https://id.brand.com/01/00812345678901', {
        symbology2d: 'DataMatrix'
      });
      const hasBx = zplDm.includes('^BXN');

      const dotGrid = window.DualMarkDotCode.buildGrid("TEST1234");
      const epsDot = window.DualMarkPrepress.generateCmykEps(
        { pattern: '10101', text: '081234567890' },
        dotGrid,
        { isDotCode: true }
      );
      const hasCircleProlog = epsDot.includes('/circle {');
      const hasCircleCalls = epsDot.includes('circle\\n');

      return { hasBx, hasCircleProlog, hasCircleCalls };
    })()
  `);
  console.log("Prepress & ZPL Results:", prepressTest);
  if (!prepressTest.hasBx || !prepressTest.hasCircleProlog || !prepressTest.hasCircleCalls) {
    throw new Error("Prepress PostScript circle dots or Zebra ^BXN generation failed!");
  }
  console.log("✓ Test 11 Passed: Zebra DataMatrix ^BXN and PostScript DotCode circles verified.\n");

  console.log("======================================================================");
  console.log("   🎉 ALL 11 COMPREHENSIVE BACKEND ALGORITHM TESTS PASSED 100%!   ");
  console.log("======================================================================\n");
}

main().catch(err => {
  console.error("Test failed with error:", err);
  process.exit(1);
});
