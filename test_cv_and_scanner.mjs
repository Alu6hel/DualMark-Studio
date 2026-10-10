import assert from 'assert';
import fs from 'fs';
import path from 'path';

console.log('===============================================================');
console.log('DUALMARK STUDIO: COMPUTER VISION & SCANNER DEWARP TEST SUITE');
console.log('===============================================================');

// Load CV Geometry
const cvGeometryPath = path.resolve('web_app/js/core/cv_geometry.js');
const cvCode = fs.readFileSync(cvGeometryPath, 'utf8');

const cvModule = { exports: {} };
const cvFn = new Function('module', 'exports', cvCode + '; return module.exports;');
const cv = cvFn(cvModule, cvModule.exports);

// 1. Homography and Linear Algebra
console.log('\n--- 1. Homography & 3x3 Projective Math ---');
const srcQuad = [
  { x: 10, y: 10 },
  { x: 90, y: 15 },
  { x: 85, y: 85 },
  { x: 15, y: 90 }
];
const dstQuad = [
  { x: 0, y: 0 },
  { x: 100, y: 0 },
  { x: 100, y: 100 },
  { x: 0, y: 100 }
];

const H = cv.solveHomography(srcQuad, dstQuad);
assert.strictEqual(H.length, 9, 'H should be a 9-element 3x3 matrix');
assert.strictEqual(H[8], 1.0, 'H[8] normalized to 1.0');

const p0 = cv.transformPoint(H, 10, 10);
assert.ok(Math.abs(p0.x - 0) < 0.1 && Math.abs(p0.y - 0) < 0.1, 'p0 maps close to (0,0)');

const p2 = cv.transformPoint(H, 85, 85);
assert.ok(Math.abs(p2.x - 100) < 0.1 && Math.abs(p2.y - 100) < 0.1, 'p2 maps close to (100,100)');
console.log('  ✓ PASS: solveHomography solves 8 linear equations with partial pivoting');

const Hinv = cv.invertHomography(H);
const pBack = cv.transformPoint(Hinv, p0.x, p0.y);
assert.ok(Math.abs(pBack.x - 10) < 0.1 && Math.abs(pBack.y - 10) < 0.1, 'Hinv maps back to (10,10)');
console.log('  ✓ PASS: invertHomography accurately computes matrix inverse');

// 2. Bilinear Interpolation
console.log('\n--- 2. Bilinear & Image Resampling ---');
const testW = 4, testH = 4;
const testImg = new Uint8Array([
  0,   50,  100, 150,
  50,  100, 150, 200,
  100, 150, 200, 250,
  150, 200, 250, 255
]);
const sampleVal = cv.sampleBilinear(testImg, testW, testH, 1.5, 1.5, 1);
assert.ok(sampleVal[0] >= 140 && sampleVal[0] <= 160, `Bilinear sample at (1.5, 1.5) was ${sampleVal[0]}`);
console.log('  ✓ PASS: sampleBilinear computes smooth subpixel interpolation');

// 3. Sauvola Adaptive Thresholding
console.log('\n--- 3. Sauvola Local Adaptive Thresholding ---');
const gradW = 30, gradH = 30;
const gradImg = new Uint8Array(gradW * gradH);
for (let y = 0; y < gradH; y++) {
  for (let x = 0; x < gradW; x++) {
    // Non-uniform background gradient: 40 at left, 200 at right
    let bg = 40 + (x / gradW) * 160;
    // Dark barcode bar in middle
    let isBar = (x >= 12 && x <= 16);
    gradImg[y * gradW + x] = isBar ? Math.max(0, bg - 50) : bg;
  }
}
const binarized = cv.binarizeSauvola(gradImg, gradW, gradH, 9, 0.2);
assert.strictEqual(binarized.length, gradW * gradH, 'Binarized output matches dimensions');
// Verify dark bar is binarized to 0 (dark) despite background gradient
const barPixelLeft = binarized[15 * gradW + 14];
const bgPixelLeft = binarized[15 * gradW + 5];
const bgPixelRight = binarized[15 * gradW + 25];
assert.strictEqual(barPixelLeft, 0, 'Barcode bar should be classified as 0 (black)');
assert.strictEqual(bgPixelLeft, 255, 'Background under low light should be classified as 255 (white)');
assert.strictEqual(bgPixelRight, 255, 'Background under high light should be classified as 255 (white)');
console.log('  ✓ PASS: binarizeSauvola separates foreground from background under non-uniform illumination');

// 4. Canny Edges & Quad Contour Detection
console.log('\n--- 4. Canny Edges & Auto Quad Corner Detection ---');
const docW = 100, docH = 100;
const docImg = new Uint8Array(docW * docH).fill(220); // white background
// Draw a darker document rectangle from (15, 20) to (85, 80)
for (let y = 20; y <= 80; y++) {
  for (let x = 15; x <= 85; x++) {
    docImg[y * docW + x] = 80;
  }
}
const quad = cv.autoDetectLabelQuad(docImg, docW, docH);
assert.strictEqual(quad.length, 4, 'Quad must contain 4 corners');
assert.ok(Math.abs(quad[0].x - 0.15) <= 0.05, `TL x should be near 0.15, got ${quad[0].x}`);
assert.ok(Math.abs(quad[0].y - 0.20) <= 0.05, `TL y should be near 0.20, got ${quad[0].y}`);
assert.ok(Math.abs(quad[2].x - 0.85) <= 0.05, `BR x should be near 0.85, got ${quad[2].x}`);
assert.ok(Math.abs(quad[2].y - 0.80) <= 0.05, `BR y should be near 0.80, got ${quad[2].y}`);
console.log('  ✓ PASS: autoDetectLabelQuad accurately locates document boundary corners via Canny edge density');

// 5. Scanner Dewarp Studio Omnidirectional Scanline Decoding
console.log('\n--- 5. Omnidirectional 1D Barcode Scanline Engine ---');
const scannerPath = path.resolve('web_app/js/scanner_dewarp.js');
const scannerCode = fs.readFileSync(scannerPath, 'utf8');

const mockWindow = {
  DualMarkCV: cv,
  DualMarkCvGeometry: cv
};
const scannerFn = new Function('window', scannerCode);
scannerFn(mockWindow);

assert.ok(mockWindow.DualMarkScanner, 'DualMarkScanner loaded onto window');
assert.ok(mockWindow.DualMarkScanner.ScannerDewarpStudio, 'ScannerDewarpStudio constructor exists');

const studio = new mockWindow.DualMarkScanner.ScannerDewarpStudio(null, null);

// Generate synthetic image with a horizontal UPC-A barcode: 012345678905
// UPC-A encoding of '012345678905':
// Start guard: 101
// Digits: 0='0001101', 1='0011001', 2='0010011', 3='0111101', 4='0100011', 5='0110001'
// Center guard: 01010
// Digits: 6='1010000', 7='1000100', 8='1001000', 9='1110100', 0='1110010', 5='1001110'
// End guard: 101
const upcPattern = '101' +
  '0001101' + '0011001' + '0010011' + '0111101' + '0100011' + '0110001' +
  '01010' +
  '1010000' + '1000100' + '1001000' + '1110100' + '1110010' + '1001110' +
  '101';

const scanW = 300, scanH = 300;
const mockImgData = {
  data: new Uint8Array(scanW * scanH * 4).fill(255)
};

// Render horizontal UPC at y = 140..160 with module scale 2
const scale = 2;
for (let y = 140; y <= 160; y++) {
  for (let i = 0; i < upcPattern.length; i++) {
    for (let s = 0; s < scale; s++) {
      const x = 40 + i * scale + s;
      const isDark = upcPattern[i] === '1';
      const idx = (y * scanW + x) * 4;
      const val = isDark ? 20 : 240;
      mockImgData.data[idx] = val;
      mockImgData.data[idx + 1] = val;
      mockImgData.data[idx + 2] = val;
      mockImgData.data[idx + 3] = 255;
    }
  }
}

const decodedH = studio.decodeScanlineUpcEan(mockImgData, scanW, scanH);
assert.ok(decodedH, 'Should decode horizontal UPC barcode');
assert.strictEqual(decodedH.rawValue, '012345678905', 'Decoded UPC-A payload matches');
console.log('  ✓ PASS: decodeScanlineUpcEan accurately decodes horizontal UPC-A scanline');

// Render vertical UPC (rotated 90 degrees) to test vertical ray sampling!
const mockImgDataVert = {
  data: new Uint8Array(scanW * scanH * 4).fill(255)
};
for (let x = 140; x <= 160; x++) {
  for (let i = 0; i < upcPattern.length; i++) {
    for (let s = 0; s < scale; s++) {
      const y = 40 + i * scale + s;
      const isDark = upcPattern[i] === '1';
      const idx = (y * scanW + x) * 4;
      const val = isDark ? 20 : 240;
      mockImgDataVert.data[idx] = val;
      mockImgDataVert.data[idx + 1] = val;
      mockImgDataVert.data[idx + 2] = val;
      mockImgDataVert.data[idx + 3] = 255;
    }
  }
}
const decodedV = studio.decodeScanlineUpcEan(mockImgDataVert, scanW, scanH);
assert.ok(decodedV, 'Should decode vertical UPC barcode via multi-axis scanline rays');
assert.strictEqual(decodedV.rawValue, '012345678905', 'Vertical decoded UPC-A payload matches');
console.log('  ✓ PASS: decodeScanlineUpcEan accurately decodes vertically oriented barcode on rotated packaging');

console.log('\n===============================================================');
console.log('ALL CV & SCANNER DEWARP TESTS PASSED SUCCESSFULLY!');
console.log('===============================================================');
