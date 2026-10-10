import assert from 'assert';
import fs from 'fs';
import path from 'path';

console.log('===============================================================');
console.log('DUALMARK STUDIO: ISO/IEC 15415 & 15416 OPTICAL VERIFIER TEST');
console.log('===============================================================');

const isoPath = path.resolve('web_app/js/iso_verifier.js');
const isoCode = fs.readFileSync(isoPath, 'utf8');

const mockWindow = {
  localStorage: {
    getItem: () => null,
    setItem: () => {}
  }
};

new Function('window', isoCode)(mockWindow);

assert.ok(mockWindow.DualMarkIsoVerifier, 'DualMarkIsoVerifier exported');
const verifier = mockWindow.DualMarkIsoVerifier;

// 1. 1D Scan Profile Analysis (ISO/IEC 15416)
console.log('\n--- 1. ISO/IEC 15416 1D Scan Profile Grading ---');
// Create a synthetic 1D scanline with high contrast (Rmin=0.05, Rmax=0.92)
const profile1D = new Float32Array(200);
for (let i = 0; i < 200; i++) {
  // Alternate dark bars and light spaces
  profile1D[i] = (Math.floor(i / 10) % 2 === 0) ? 0.05 : 0.92;
}

const report1D = verifier.analyzeScanProfile(profile1D);
assert.ok(report1D.symbolContrast >= 0.80, `SC should be >= 0.80, got ${report1D.symbolContrast}`);
assert.strictEqual(report1D.scGradeLetter, 'A', 'SC Grade should be A');
assert.strictEqual(report1D.gradeLetter, 'A', 'Overall Grade should be A');
console.log(`  ✓ PASS: 1D Scan Profile: SC=${report1D.symbolContrast}, MOD=${report1D.modulation}, DEC=${report1D.decodability} -> Grade ${report1D.gradeLetter}`);

// 2. 2D Matrix Quality Grading (ISO/IEC 15415)
console.log('\n--- 2. ISO/IEC 15415 2D Matrix Verification ---');
// Generate synthetic 100x100 2D barcode canvas with 20x20 module grid (5px per module)
const mock2DCanvas = {
  width: 100,
  height: 100,
  getContext: () => ({
    getImageData: () => {
      const data = new Uint8ClampedArray(100 * 100 * 4).fill(245); // white substrate
      for (let r = 2; r < 18; r++) {
        for (let c = 2; c < 18; c++) {
          if ((r + c) % 2 === 0) { // checkerboard pattern
            for (let y = r * 5; y < (r + 1) * 5; y++) {
              for (let x = c * 5; x < (c + 1) * 5; x++) {
                const idx = (y * 100 + x) * 4;
                data[idx] = 15;     // R
                data[idx + 1] = 15; // G
                data[idx + 2] = 15; // B
                data[idx + 3] = 255;
              }
            }
          }
        }
      }
      return { data };
    }
  })
};

const result2D = verifier.gradeBarcode2D(mock2DCanvas);
assert.ok(result2D.overallGrade, 'Overall grade present');
assert.ok(result2D.metrics.symbolContrast >= 70, `2D SC should be >= 70%, got ${result2D.metrics.symbolContrast}%`);
console.log(`  ✓ PASS: 2D Matrix: SC=${result2D.metrics.symbolContrast}%, ANU=${result2D.metrics.axialNonUniformity}, MOD=${result2D.metrics.modulation} -> Grade ${result2D.overallGrade.letter}`);

// 3. NIST-Traceable Calibration
console.log('\n--- 3. NIST-Traceable Calibration Verification ---');
const nist = verifier.performNistCalibration();
assert.ok(nist.certificateId.startsWith('NIST-SRM'), 'NIST Certificate ID generated');
assert.strictEqual(nist.luxVerification, 'PASS (450 lux nominal)');
console.log(`  ✓ PASS: NIST Calibration completed: Cert ${nist.certificateId}`);

// 4. PDF Compliance Certificate Generation
console.log('\n--- 4. Formal PDF Compliance Certificate ---');
const pdfStr = verifier.generateCertificatePdf({
  gtin: '00812345678901',
  operator: 'Lead Prepress QC Engineer',
  substrate: 'Coated SBS Board'
});
assert.ok(pdfStr.startsWith('%PDF-1.4'), 'Valid PDF-1.4 header');
assert.ok(pdfStr.includes('ISO/IEC 15416:2016 & ISO/IEC 15415:2011'), 'Contains ISO standards text');
assert.ok(pdfStr.includes('00812345678901'), 'Contains target GTIN');
console.log('  ✓ PASS: PDF/X compliance certificate rendered with ISO audit trail');

// 5. Raw Pixel Buffer ISO 15415 Grading
console.log('\n--- 5. Direct gradeMatrixIso15415 with Raw Pixel Buffer ---');
const rawPixels = new Uint8Array(200 * 200).fill(240);
for (let y = 0; y < 100; y++) {
  for (let x = 0; x < 100; x++) {
    rawPixels[y * 200 + x] = 20;
  }
}
const isoGradeRaw = verifier.gradeMatrixIso15415(rawPixels, 200, 200, 25, 25);
assert.ok(isoGradeRaw.symbolContrast >= 0.80, 'Symbol Contrast >= 0.80');
assert.strictEqual(isoGradeRaw.axialNonUniformity, 0, 'Square matrix ANU is 0');
assert.ok(typeof isoGradeRaw.unusedErrorCorrection === 'number', 'UEC computed');
assert.ok(isoGradeRaw.letterGrade, 'Letter grade returned');
console.log(`  ✓ PASS: Direct pixel buffer ISO 15415: SC=${isoGradeRaw.symbolContrast}, ANU=${isoGradeRaw.axialNonUniformity}, UEC=${isoGradeRaw.unusedErrorCorrection} -> Grade ${isoGradeRaw.letterGrade}`);

console.log('\n===============================================================');
console.log('ALL ISO/IEC 15415 & 15416 VERIFIER TESTS PASSED SUCCESSFULLY!');
console.log('===============================================================');

