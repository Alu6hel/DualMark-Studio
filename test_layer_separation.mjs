/**
 * Test Suite: Layer Separation & Headless Engines
 * Verifies that the functionality layer (pure algorithms, zero DOM) and
 * presentation feature layer operate with 100% precision headlessly.
 */

import MathSymbologies from './web_app/js/core/math_symbologies.js';
import CvGeometry from './web_app/js/core/cv_geometry.js';
import CryptoStandards from './web_app/js/core/crypto_standards.js';
import Gestures from './web_app/js/features/touch_gestures.js';
import Presets from './web_app/js/features/preset_loaders.js';

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
    console.log(`  ✓ PASS: ${testName} (${a} ≈ ${b})`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${testName} (expected ${b}, got ${a})`);
    failed++;
  }
}

async function runTests() {
  console.log('===============================================================');
  console.log('DUALMARK STUDIO: LAYER SEPARATION & HEADLESS ENGINES TEST SUITE');
  console.log('===============================================================\n');

  // ---------------------------------------------------------------------------
  // 1. Galois Field & Reed-Solomon Arithmetic
  // ---------------------------------------------------------------------------
  console.log('--- 1. Galois Field & Reed-Solomon Math Symbologies ---');
  
  // GF(113) DotCode field tests
  const gf113 = MathSymbologies.GF113;
  assert(gf113.add(15, 27) === ((15 + 27) % 113), 'GF(113) addition is modulo 113');
  const gf113Mul = gf113.multiply(7, 19);
  assert(gf113.divide(gf113Mul, 7) === 19, 'GF(113) division inverts multiplication');
  assert(gf113.exp(gf113.log(42)) === 42, 'GF(113) exp/log function roundtrip');

  // GF(256) QR & DataMatrix fields
  const gf256Qr = MathSymbologies.GF256_QR;
  const gf256Dm = MathSymbologies.GF256_DATAMATRIX;
  assert(gf256Qr.multiply(14, 25) === gf256Qr.divide(gf256Qr.multiply(14, 25), 1), 'GF(256) QR identity division');
  assert(gf256Dm.multiply(100, 200) !== 0, 'GF(256) DataMatrix non-zero field product');
  assert(gf256Dm.exp(gf256Dm.log(128)) === 128, 'GF(256) DataMatrix exp/log roundtrip');

  // Reed-Solomon generator & encoding
  const rsGen = MathSymbologies.buildRsGenerator(gf256Qr, 4);
  assert(rsGen.length === 5, 'Reed-Solomon degree 4 generator has 5 coefficients');
  const rsCode = MathSymbologies.encodeReedSolomon(gf256Qr, [16, 32, 12, 86], 4);
  assert(rsCode.length === 4, 'Reed-Solomon produces 4 error correction codewords');

  // ---------------------------------------------------------------------------
  // 2. Check Character Generators & Code 128 Dynamic State Machine
  // ---------------------------------------------------------------------------
  console.log('\n--- 2. Check Character Generators & Code 128 Dynamic State Machine ---');
  
  // Modulo-10 (GTIN / UPC / SSCC)
  // Example: 0081234567890 -> check is 1
  const upcBase = '0081234567890';
  const mod10 = MathSymbologies.calcModulo10(upcBase);
  assert(mod10 === 1, `calcModulo10(${upcBase}) returns 1`);
  assert(MathSymbologies.verifyModulo10('00812345678901') === true, 'verifyModulo10 valid GTIN');
  assert(MathSymbologies.verifyModulo10('00812345678902') === false, 'verifyModulo10 invalid GTIN rejected');

  // Modulo-43 (Code 39 / HIBC)
  const mod43 = MathSymbologies.calcModulo43('12345ABCDE');
  assert(typeof mod43 === 'string' && mod43.length === 1, `calcModulo43 produces check character: ${mod43}`);

  // Modulo-103 & Code 128
  const c128Enc = MathSymbologies.encodeCode128('00812345678901');
  assert(c128Enc.symbology === 'Code 128', 'Code 128 returns correct symbology');
  assert(c128Enc.codewords[0] === 105, 'Dynamic subset machine selects Code C (105) for all-digits');
  assert(typeof c128Enc.checkDigit === 'number' && c128Enc.checkDigit >= 0 && c128Enc.checkDigit < 103, 'Valid Modulo-103 check digit');
  assert(c128Enc.pattern.length === c128Enc.moduleCount, 'Binary pattern matches moduleCount');

  // Code 128 mixed alphanumeric dynamic switching
  const c128Mixed = MathSymbologies.encodeCode128('ABC1234567');
  assert(c128Mixed.codewords[0] === 104, 'Code 128 selects Subset B (104) for starting letters');
  assert(c128Mixed.codewords.includes(99), 'Code 128 dynamic state machine switches to Code C (99) for 4+ digits');

  // ---------------------------------------------------------------------------
  // 3. Computer Vision & Geometric Math
  // ---------------------------------------------------------------------------
  console.log('\n--- 3. Computer Vision & Geometric Math ---');
  
  // 8-equation Homography Matrix solver
  const srcCorners = [
    { x: 0, y: 0 },
    { x: 100, y: 0 },
    { x: 100, y: 100 },
    { x: 0, y: 100 }
  ];
  // Scaled & translated quad
  const dstCorners = [
    { x: 10, y: 20 },
    { x: 210, y: 20 },
    { x: 210, y: 220 },
    { x: 10, y: 220 }
  ];
  const H = CvGeometry.solveHomography(srcCorners, dstCorners);
  assert(H !== null && H.length === 9, 'solveHomography produces 3x3 matrix (9 elements)');
  
  // Transform corner test
  const pt0 = CvGeometry.transformPoint(H, 0, 0);
  assertApprox(pt0.x, 10, 0.001, 'Homography transforms (0,0) to dst x');
  assertApprox(pt0.y, 20, 0.001, 'Homography transforms (0,0) to dst y');

  const pt2 = CvGeometry.transformPoint(H, 100, 100);
  assertApprox(pt2.x, 210, 0.001, 'Homography transforms (100,100) to dst x');
  assertApprox(pt2.y, 220, 0.001, 'Homography transforms (100,100) to dst y');

  // Invert Homography
  const H_inv = CvGeometry.invertHomography(H);
  assert(H_inv !== null, 'Homography matrix is invertible');
  const pt0_back = CvGeometry.transformPoint(H_inv, 10, 20);
  assertApprox(pt0_back.x, 0, 0.001, 'Inverse homography roundtrips to src x');
  assertApprox(pt0_back.y, 0, 0.001, 'Inverse homography roundtrips to src y');

  // Rec. 709 Grayscale & Otsu Threshold
  const testPixels = new Uint8ClampedArray(4 * 4 * 4); // 4x4 image
  // Fill half bright, half dark
  for (let i = 0; i < 4 * 4; i++) {
    const val = (i < 8) ? 240 : 20;
    testPixels[i * 4] = val;
    testPixels[i * 4 + 1] = val;
    testPixels[i * 4 + 2] = val;
    testPixels[i * 4 + 3] = 255;
  }
  const gray = CvGeometry.toGrayscale(testPixels, 4, 4);
  assert(gray.length === 16, 'toGrayscale converts RGBA to single channel buffer');
  const otsuThresh = CvGeometry.calcOtsuThreshold(gray);
  assert(otsuThresh > 20 && otsuThresh < 240, `Otsu threshold (${otsuThresh}) separates bimodal distribution`);

  const bin = CvGeometry.binarize(gray, 4, 4, otsuThresh);
  assert(bin.binary[0] === 255 && bin.binary[15] === 0, 'Binarization accurately splits bright and dark pixels');

  // ---------------------------------------------------------------------------
  // 4. Cryptographic Standards & Serialization
  // ---------------------------------------------------------------------------
  console.log('\n--- 4. Cryptographic Standards & Serialization ---');
  
  // SHA-256 Hex Digest
  const sha = await CryptoStandards.sha256Hex('DualMark-Packaging-Standard');
  assert(typeof sha === 'string' && sha.length === 64, `SHA-256 produces 64-char hex string: ${sha.slice(0, 16)}...`);

  // Merkle Root calculation
  const leaf1 = await CryptoStandards.sha256Hex('BATCH-001');
  const leaf2 = await CryptoStandards.sha256Hex('BATCH-002');
  const leaf3 = await CryptoStandards.sha256Hex('BATCH-003');
  const merkleRoot = await CryptoStandards.computeMerkleRoot([leaf1, leaf2, leaf3]);
  assert(typeof merkleRoot === 'string' && merkleRoot.length === 64, `Merkle root digest calculated: ${merkleRoot.slice(0, 16)}...`);

  // P-256 Keypair generation & rawToDer
  const keyPair = await CryptoStandards.generateP256KeyPair();
  assert(keyPair.publicKey && keyPair.privateKey, 'generateP256KeyPair generates WebCrypto CryptoKey pair');
  const signature = await CryptoStandards.signP256('DualMark Packaging Standard Payload', keyPair.privateKey);
  assert(signature.raw instanceof Uint8Array && signature.raw.length === 64, 'signP256 creates 64-byte raw signature');
  const der = CryptoStandards.rawToDer(signature.raw);
  assert(der instanceof Uint8Array && der.length >= 68 && der[0] === 0x30, 'rawToDer formats 64-byte raw signature to ASN.1 DER SEQUENCE');

  // RFC 9264 GS1 Linkset generator
  const linkset = CryptoStandards.generateRfc9264Linkset('00812345678901', 'https://id.dualmark.studio/01/00812345678901');
  assert(linkset.jsonld && Array.isArray(linkset.jsonld.linkset), 'RFC 9264 generates valid linkset JSON-LD structure');
  assert(linkset.httpLinkHeaders.length >= 3, 'RFC 9264 generates RFC 8288 HTTP Link headers');
  assert(linkset.httpLinkHeaders[0].includes('rel="pip"'), 'Link header contains pip relation');

  // GS1 Digital Link canonical parser
  const testDl = 'https://id.example.com/01/00812345678901/10/LOT-99/21/SER-456?linkType=gs1:pip';
  const parsed = CryptoStandards.parseGs1DigitalLink(testDl);
  assert(parsed.isValid === true, 'parseGs1DigitalLink validates compliant GS1 URI');
  assert(parsed.primaryKey === '01' && parsed.primaryVal === '00812345678901', 'parseGs1DigitalLink extracts GTIN primary identification key');
  assert(parsed.keys['10'] === 'LOT-99' && parsed.keys['21'] === 'SER-456', 'parseGs1DigitalLink extracts qualifiers (10) and (21)');
  assert(parsed.attributes['linkType'] === 'gs1:pip', 'parseGs1DigitalLink extracts query attributes');

  // ---------------------------------------------------------------------------
  // 5. Presentation Layer Gestures & Feature Coordinators
  // ---------------------------------------------------------------------------
  console.log('\n--- 5. Touch Gestures & Feature Coordinators ---');
  
  // Quadrilateral corner-pin coordinator
  const quadCoord = new Gestures.QuadrilateralCornerPinCoordinator({
    width: 640,
    height: 480,
    initialMargin: 40
  });
  const corners = quadCoord.getCorners();
  assert(corners.length === 4, 'Corner pin coordinator initializes 4 corners');
  assert(quadCoord.isConvex() === true, 'Initial quad geometry is strictly convex');
  
  // Dragging test
  const activeHit = quadCoord.startDrag(corners[0].x, corners[0].y);
  assert(activeHit === true, 'startDrag hits corner pin handle 0');
  const dragOk = quadCoord.drag(50, 50);
  assert(dragOk === true, 'drag(50, 50) successfully moves active pin 0');
  quadCoord.endDrag();
  const updatedCorners = quadCoord.getCorners();
  assertApprox(updatedCorners[0].x, 50, 0.001, 'Corner 0 position updated accurately');
  assert(quadCoord.isConvex() === true, 'Convexity preserved after modest drag');

  // Point in quad test
  assert(quadCoord.isPointInside(320, 240) === true, 'Center point (320, 240) is inside quad');
  assert(quadCoord.isPointInside(10, 10) === false, 'Outside point (10, 10) is rejected');

  // Presets & SKU CSV Parser
  const juicePreset = Presets.getPreset('cold_pressed_juice');
  assert(juicePreset !== null && juicePreset.name.includes('Juice'), 'getPreset retrieves Cold-Pressed Juice preset');
  
  const testCsv = `gtin,sku,name,lot,serial
00812345678901,SKU-A,Organic Orange,LOT-101,SN-001
00812345678918,SKU-B,Apple Cider,LOT-102,SN-002`;
  const parsedSkus = Presets.parseSkuCsv(testCsv);
  assert(parsedSkus.length === 2, 'parseSkuCsv extracts 2 SKUs from CSV text');
  assert(parsedSkus[0].gtin === '00812345678901' && parsedSkus[0].sku === 'SKU-A', 'SKU record parsed with exact columns');

  console.log('\n===============================================================');
  console.log(`TOTAL RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log('===============================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Unhandled Test Failure:', err);
  process.exit(1);
});
