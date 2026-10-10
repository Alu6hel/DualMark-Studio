import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

const DualMarkZPL = require('./web_app/js/zpl_generator.js');

console.log('Testing Zebra ZPL II Engine...');

// 1. Basic Generation with QR Code
{
  const zpl = DualMarkZPL.generateZpl('UPC-A', '081234567890', 'https://id.brand.com/01/00812345678901', {
    dpi: 203,
    symbology2d: 'QR'
  });

  assert.ok(zpl.includes('^XA'), 'Contains start format');
  assert.ok(zpl.includes('^XZ'), 'Contains end format');
  assert.ok(zpl.includes('^BUN,'), 'Contains UPC-A command');
  assert.ok(zpl.includes('^BQN,'), 'Contains QR Code command');
  assert.ok(zpl.includes('081234567890'), 'Contains barcode value');
  assert.ok(zpl.includes('https://id.brand.com/01/00812345678901'), 'Contains URI');
  console.log('✓ Passed: Basic QR ZPL Generation');
}

// 2. Native DotCode ^BD Generation
{
  const zpl = DualMarkZPL.generateZpl('EAN-13', '0081234567890', 'https://id.brand.com/01/00812345678901', {
    dpi: 300,
    symbology2d: 'DotCode'
  });

  assert.ok(zpl.includes('^BEN,'), 'Contains EAN-13 command');
  assert.ok(zpl.includes('^BDN,'), 'Contains native Zebra ^BD DotCode command');
  assert.ok(!zpl.includes('^BQN,'), 'Does not contain QR command');
  console.log('✓ Passed: Native DotCode ^BD Generation at 300 DPI');
}

// 3. DataMatrix ^BX Generation
{
  const zpl = DualMarkZPL.generateZpl('Code-128', 'ABC123XYZ', 'https://id.brand.com/01/00812345678901', {
    dpi: 600,
    symbology2d: 'DataMatrix'
  });

  assert.ok(zpl.includes('^BCN,'), 'Contains Code 128 command');
  assert.ok(zpl.includes('^BXN,'), 'Contains DataMatrix command');
  console.log('✓ Passed: DataMatrix ^BX Generation at 600 DPI');
}

// 4. Dynamic Die-Line Millimeter-to-Dot Coordinate Translation
{
  const coords1d = { xMm: 15, yMm: 20, wMm: 35, hMm: 25 };
  const coords2d = { xMm: 75, yMm: 20, wMm: 22, hMm: 22 };

  // 203 DPI = 8 dpmm
  const zpl203 = DualMarkZPL.generateZpl('UPC-A', '081234567890', 'https://id.brand.com/01/00812345678901', {
    dpi: 203,
    coords1d,
    coords2d,
    symbology2d: 'DotCode'
  });

  const expectedX1d_203 = 15 * 8; // 120
  const expectedY1d_203 = 20 * 8; // 160
  const expectedX2d_203 = 75 * 8; // 600

  assert.ok(zpl203.includes(`^FO${expectedX1d_203},${expectedY1d_203}`), `Includes translated 1D origin at 203 DPI (${expectedX1d_203},${expectedY1d_203})`);
  assert.ok(zpl203.includes(`^FO${expectedX2d_203},${expectedY1d_203}`), `Includes translated 2D origin at 203 DPI (${expectedX2d_203},${expectedY1d_203})`);

  // 300 DPI = 12 dpmm
  const zpl300 = DualMarkZPL.generateZpl('UPC-A', '081234567890', 'https://id.brand.com/01/00812345678901', {
    dpi: 300,
    coords1d,
    coords2d,
    symbology2d: 'DotCode'
  });

  const expectedX1d_300 = 15 * 12; // 180
  const expectedY1d_300 = 20 * 12; // 240
  const expectedX2d_300 = 75 * 12; // 900

  assert.ok(zpl300.includes(`^FO${expectedX1d_300},${expectedY1d_300}`), `Includes translated 1D origin at 300 DPI (${expectedX1d_300},${expectedY1d_300})`);
  assert.ok(zpl300.includes(`^FO${expectedX2d_300},${expectedY1d_300}`), `Includes translated 2D origin at 300 DPI (${expectedX2d_300},${expectedY1d_300})`);
  console.log('✓ Passed: Dynamic Millimeter-to-Dot Coordinate Translation');
}

// 5. Zebra Host Status (~HS) Parser
{
  const hsSample = '\x02030,0,0,1200,000,0,0,0,000,0,0,0\x03\r\n\x02000,0,0,0,1,2,3,0,00000000,1,000\x03\r\n\x021234,0\x03';
  const status = DualMarkZPL.parseZebraHostStatus(hsSample);

  assert.strictEqual(status.online, true);
  assert.strictEqual(status.paperOut, false);
  assert.strictEqual(status.paused, false);
  assert.strictEqual(status.headOpen, false);
  assert.strictEqual(status.readyToPrint, true);
  assert.strictEqual(status.labelLengthDots, 1200);

  // Error condition: head open & paper out
  const hsError = '\x02030,1,0,1200,000,0,0,0,000,0,0,0\x03\r\n\x02000,0,1,0,1,2,3,0,00000000,1,000\x03\r\n\x021234,0\x03';
  const statusError = DualMarkZPL.parseZebraHostStatus(hsError);
  assert.strictEqual(statusError.paperOut, true);
  assert.strictEqual(statusError.headOpen, true);
  assert.strictEqual(statusError.readyToPrint, false);
  console.log('✓ Passed: Zebra ~HS Host Status Bi-directional Parser');
}

// 6. Native buildZplDotCode Helper
{
  const dotZpl = DualMarkZPL.buildZplDotCode('https://id.brand.com/01/00812345678901', 500, 150, 4, 300);
  assert.ok(dotZpl.includes('^FO500,150^BDN,4,0,0^FDhttps://id.brand.com/01/00812345678901^FS'), 'Matches native ^BD syntax');
  console.log('✓ Passed: Native buildZplDotCode formatter');
}

// 7. compileLayoutToZpl Dynamic Die-Line Compiler
{
  const b1 = { x: 20, y: 15, h: 25, text: '081234567890' };
  const b2 = { x: 75, y: 15, uri: 'https://id.brand.com/01/00812345678901', isDotCode: true };
  const fullZpl = DualMarkZPL.compileLayoutToZpl(b1, b2, 8, 800, 400);

  assert.ok(fullZpl.includes('^PW800^LL400'), 'Includes print dimensions');
  assert.ok(fullZpl.includes(`^FO${20 * 8},${15 * 8}^BY2,3,${25 * 8}^BUN,`), 'Includes 1D placement at (160, 120)');
  assert.ok(fullZpl.includes(`^FO${75 * 8},${15 * 8}^BDN,`), 'Includes 2D DotCode placement at (600, 120)');
  console.log('✓ Passed: compileLayoutToZpl Dynamic Compiler');
}

console.log('All 7 Zebra ZPL Engine tests passed successfully!');

