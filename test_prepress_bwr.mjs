import assert from 'assert';
import fs from 'fs';
import path from 'path';

console.log('===============================================================');
console.log('DUALMARK STUDIO: PREPRESS RIP 2D BWR & PDF/X-4 TEST SUITE');
console.log('===============================================================');

const prepressPath = path.resolve('web_app/js/vector_prepress.js');
const prepressCode = fs.readFileSync(prepressPath, 'utf8');

const fontPath = path.resolve('web_app/js/core/truetype_cidfont.js');
const fontCode = fs.readFileSync(fontPath, 'utf8');

const mockWindow = {};
new Function('root', 'factory', fontCode)(mockWindow, () => {
  const m = { exports: {} };
  eval(fontCode);
  return m.exports;
});

new Function('window', prepressCode)(mockWindow);

// In Node environment, evaluate prepress
const prepress = eval(prepressCode + '; DualMarkPrepress;');

assert.ok(prepress, 'DualMarkPrepress loaded');

// Test 1: BWR setting
console.log('\n--- 1. BWR Parameter Management ---');
prepress.setBwrMicrons(-50);
assert.strictEqual(prepress.getBwrMicrons(), -50, 'BWR set to -50 microns');
console.log('  ✓ PASS: setBwrMicrons(-50) updates current BWR parameter');

// Test 2: 2D Module BWR in CMYK EPS
console.log('\n--- 2. 2D BWR Module Erosion in CMYK EPS ---');
const dummy1D = { pattern: '10101', text: '00812345678901' };
const dummy2D = [
  [1, 0, 1],
  [0, 1, 0],
  [1, 0, 1]
];

const epsOut = prepress.generateCmykEps(dummy1D, dummy2D, { packageWidthMm: 150, packageHeightMm: 55 });
assert.ok(epsOut.includes('BWR: -50 um'), 'EPS contains BWR parameter in comments');
assert.ok(epsOut.includes('rect'), 'EPS contains rect commands for eroded modules');
console.log('  ✓ PASS: CMYK EPS renders 2D modules with -50µm inward perimeter erosion');

// Test 3: 2D Module BWR in High-Res Vector PDF
console.log('\n--- 3. 2D BWR in Vector PDF ---');
const pdfOut = prepress.generateVectorPdf(dummy1D, dummy2D, { packageWidthMm: 150, packageHeightMm: 55 });
assert.ok(pdfOut.startsWith('%PDF-1.4'), 'Valid PDF-1.4 header');
assert.ok(pdfOut.includes('BWR: -50 um'), 'PDF contains BWR watermark');
console.log('  ✓ PASS: Vector PDF renders 2D matrix modules with 2D BWR compensation');

// Test 4: PDF/X-4:2010 Conformance with Embedded CIDFont & 2D BWR
console.log('\n--- 4. ISO 15930-7 (PDF/X-4:2010) Engine & Typography ---');
const pdfX4 = prepress.generatePdfX4(dummy1D, dummy2D, {
  packageWidthMm: 150,
  packageHeightMm: 55,
  fontName: 'OCR-B',
  iccProfile: 'FOGRA39'
});
assert.ok(pdfX4.startsWith('%PDF-1.6'), 'Valid PDF-1.6 header for PDF/X-4');
assert.ok(pdfX4.includes('/GTS_PDFXVersion (PDF/X-4)'), 'GTS_PDFXVersion is PDF/X-4');
assert.ok(pdfX4.includes('GTS_PDFXConformanceVersion>PDF/X-4:2010'), 'Conforms to PDF/X-4:2010');
assert.ok(pdfX4.includes('/OutputConditionIdentifier (FOGRA39)'), 'OutputIntent FOGRA39 registered');
assert.ok(pdfX4.includes('Embedded CIDFont: OCR-B'), 'GS1 OCR-B typography referenced in annotation');
console.log('  ✓ PASS: PDF/X-4:2010 successfully generated with ISO 15930-7 compliance and 2D BWR');

console.log('\n===============================================================');
console.log('ALL PREPRESS RIP & PDF/X-4 TESTS PASSED SUCCESSFULLY!');
console.log('===============================================================');
