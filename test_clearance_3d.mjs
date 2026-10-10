import assert from 'assert';
import fs from 'fs';
import path from 'path';

console.log('===============================================================');
console.log('DUALMARK STUDIO: 3D CURVILINEAR CLEARANCE ENGINE TEST SUITE');
console.log('===============================================================');

const clearancePath = path.resolve('web_app/js/clearance_inspector.js');
const clearanceCode = fs.readFileSync(clearancePath, 'utf8');

const mockCanvas = {
  getContext: () => ({
    fillRect: () => {},
    strokeRect: () => {},
    beginPath: () => {},
    moveTo: () => {},
    lineTo: () => {},
    stroke: () => {},
    fill: () => {},
    arc: () => {},
    fillText: () => {},
    save: () => {},
    restore: () => {},
    setLineDash: () => {},
    createLinearGradient: () => ({ addColorStop: () => {} })
  }),
  addEventListener: () => {},
  removeEventListener: () => {},
  getBoundingClientRect: () => ({ left: 0, top: 0, width: 600, height: 220 })
};

const mockWindow = {
  addEventListener: () => {},
  removeEventListener: () => {}
};
new Function('window', clearanceCode)(mockWindow);

assert.ok(mockWindow.DualMarkClearance, 'DualMarkClearance exported');
assert.ok(mockWindow.DualMarkClearance.ClearanceInspector, 'ClearanceInspector constructor present');

const inspector = new mockWindow.DualMarkClearance.ClearanceInspector(mockCanvas);

// 1. Flat Mode Verification
console.log('\n--- 1. Flat Carton Mode (Euclidean Coplanar Clearance) ---');
inspector.setSurfaceType('flat');
inspector.barcode1d.x = 35;
inspector.barcode1d.y = 27.5;
inspector.barcode2d.x = 105;
inspector.barcode2d.y = 27.5;

const flatMetrics = inspector.calculateDistanceMm();
assert.strictEqual(flatMetrics.surfaceType, 'flat');
assert.strictEqual(flatMetrics.losOccluded, false);
assert.strictEqual(flatMetrics.deltaThetaDeg, 0);
assert.ok(flatMetrics.distanceMm >= 40, `Flat distance should be computed, got ${flatMetrics.distanceMm}`);
console.log(`  ✓ PASS: Flat mode calculates planar distance: ${flatMetrics.distanceMm} mm (Compliant: ${flatMetrics.isCompliant})`);

// 2. 3D Cylindrical Geodesic Arc Clearance (Standard 66mm Beverage Can)
console.log('\n--- 2. 3D Cylindrical Arc Length & Angular Separation ---');
inspector.setSurfaceType('cylindrical', 66); // D = 66mm, R = 33mm
inspector.barcode1d.x = 40;
inspector.barcode2d.x = 85;

const cylMetrics = inspector.calculateDistanceMm();
assert.strictEqual(cylMetrics.surfaceType, 'cylindrical');
assert.strictEqual(cylMetrics.cylinderDiameterMm, 66);
assert.strictEqual(cylMetrics.radiusMm, 33);
assert.ok(cylMetrics.deltaThetaDeg > 0, `Angular separation should be positive, got ${cylMetrics.deltaThetaDeg}°`);
console.log(`  ✓ PASS: Cylindrical mode computes geodesic arc: ${cylMetrics.distanceMm} mm at Δθ = ${cylMetrics.deltaThetaDeg}°`);

// 3. Line-of-Sight Occlusion (> 90 degrees separation on opposite sides of cylinder)
console.log('\n--- 3. Line-of-Sight Occlusion & Zero Cross-Talk Assurance ---');
// Position barcodes on opposite sides of the 66mm cylinder:
// Circumference = pi * 66 = 207.3mm. 90 degrees = 51.8mm.
inspector.barcode1d.x = 25;
inspector.barcode2d.x = 135; // dx = 110mm > 51.8mm -> deltaTheta > 90 deg

const occludedMetrics = inspector.calculateDistanceMm();
assert.ok(occludedMetrics.deltaThetaDeg > 90.0, `Angular separation ${occludedMetrics.deltaThetaDeg}° should exceed 90°`);
assert.strictEqual(occludedMetrics.losOccluded, true, 'LOS should be occluded by cylinder body');
assert.strictEqual(occludedMetrics.isCompliant, true, 'Should be compliant due to zero optical cross-talk');
assert.strictEqual(occludedMetrics.recommendation, 'CYLINDRICAL_OCCLUDED_SAFE');
console.log(`  ✓ PASS: Codes separated by ${occludedMetrics.deltaThetaDeg}° wrap around cylinder: losOccluded=true (Zero cross-talk)`);

// 4. Projective Cosine Foreshortening
console.log('\n--- 4. Perspective Projective Foreshortening Analysis ---');
// Place barcode 1 near the far edge of the cylinder
inspector.packageWidthMm = 150;
inspector.barcode1d.x = 42; // |42 - 75| = 33mm = R -> theta = 1 rad = 57.3 deg -> cos(57.3 deg) = 0.54 < 0.70
inspector.barcode2d.x = 100;

const foreshortenedMetrics = inspector.calculateDistanceMm();
assert.ok(foreshortenedMetrics.minForeshortening < 0.75, `Expected foreshortening < 0.75, got ${foreshortenedMetrics.minForeshortening}`);
assert.strictEqual(foreshortenedMetrics.isForeshortened, true, 'isForeshortened should be flagged');
console.log(`  ✓ PASS: Foreshortening accurately detected: minForeshortening=${foreshortenedMetrics.minForeshortening} (isForeshortened=true)`);

// 5. Dynamic Cylinder Diameter Adjustment
console.log('\n--- 5. Dynamic Diameter Adjustments ---');
inspector.setCylinderDiameter(33); // Small energy shot / vial (33mm)
const smallCyl = inspector.calculateDistanceMm();
assert.strictEqual(smallCyl.cylinderDiameterMm, 33);
assert.strictEqual(smallCyl.radiusMm, 16.5);
console.log(`  ✓ PASS: Small cylinder (33mm Ø) updates radius to 16.5mm with Δθ = ${smallCyl.deltaThetaDeg}°`);

// 6. Direct Functional Signature calculateCylindricalClearance(b1, b2, dia, fov)
console.log('\n--- 6. Direct calculateCylindricalClearance(b1, b2, dia, fov) ---');
const b1_direct = { x: 25, y: 30, w: 35, h: 25 };
const b2_direct = { x: 80, y: 30, w: 22, h: 22 };
const directResult = mockWindow.DualMarkClearance.calculateCylindricalClearance(b1_direct, b2_direct, 66.0, 65.0);
assert.ok(typeof directResult.true3dClearanceMm === 'number', 'true3dClearanceMm computed');
assert.ok(typeof directResult.arcClearanceMm === 'number', 'arcClearanceMm computed');
assert.ok(typeof directResult.deltaThetaDeg === 'string' || typeof directResult.deltaThetaDeg === 'number', 'deltaThetaDeg computed');
assert.ok(typeof directResult.isCompliant50mm === 'boolean', 'isCompliant50mm computed');
assert.ok(typeof directResult.isOccludedByCurvature === 'boolean', 'isOccludedByCurvature computed');
assert.ok(typeof directResult.opticalForeshorteningFactor === 'number', 'opticalForeshorteningFactor computed');
assert.ok(typeof directResult.scannerSafe === 'boolean', 'scannerSafe computed');
console.log(`  ✓ PASS: Direct functional clearance: true3d=${directResult.true3dClearanceMm}mm, deltaTheta=${directResult.deltaThetaDeg}°, scannerSafe=${directResult.scannerSafe}`);

console.log('\n===============================================================');
console.log('ALL 3D CURVILINEAR CLEARANCE TESTS PASSED SUCCESSFULLY!');
console.log('===============================================================');

