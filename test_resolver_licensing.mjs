import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

const DualMarkResolver = require('./web_app/js/dynamic_resolver.js');
const DualMarkLicensing = require('./web_app/js/licensing.js');

console.log('Testing GS1 Digital Link RFC 9264 Resolver & Cryptographic Licensing...');

// 1. Resolver Standard & Geo-Targeting
{
  const gtin = '00812345678901';
  // Default US
  const resUS = DualMarkResolver.resolve(gtin, null, null, 'US');
  assert.strictEqual(resUS.status, 'GEO_MATCH');
  assert.ok(resUS.targetUrl.includes('/us/nutrition/almond-milk'));

  // France FR
  const resFR = DualMarkResolver.resolve(gtin, null, null, 'FR');
  assert.strictEqual(resFR.status, 'GEO_MATCH');
  assert.ok(resFR.targetUrl.includes('/fr/tri-recyclage-almond'));

  // Default fallback (e.g. UK)
  const resGB = DualMarkResolver.resolve(gtin, null, null, 'GB');
  assert.strictEqual(resGB.status, 'DEFAULT_FALLBACK');
  assert.strictEqual(resGB.targetUrl, 'https://brand.com/products/almond-milk');
  console.log('✓ Passed: Standard & Geo-targeted Link Resolution');
}

// 2. Emergency Recall Kill-Switch Precedence
{
  const recalledGtin = '00854921004128'; // Rule 2 has isRecalled: true
  const resRecall = DualMarkResolver.resolve(recalledGtin, 'LOT-9924-REV', 'SN-00200', 'US');
  assert.strictEqual(resRecall.status, 'RECALLED_SAFETY_OVERRIDE');
  assert.strictEqual(resRecall.targetUrl, 'https://recalls.fda.gov/cfsan/2026/safety-alert-formula');
  console.log('✓ Passed: Instant Recall Kill-Switch Safety Precedence');
}

// 3. RFC 9264 & GS1 Digital Link Content Negotiation
{
  const gtin = '00812345678901';

  // 3a. ?linkType=pip
  const resPip = DualMarkResolver.resolveWithContentNegotiation(gtin, { linkType: 'pip', countryCode: 'FR' });
  assert.strictEqual(resPip.status, 'LINKTYPE_MATCH');
  assert.strictEqual(resPip.linkType, 'gs1:pip');
  assert.ok(resPip.targetUrl.includes('/fr/tri-recyclage-almond'));
  assert.ok(resPip.headers.Link.includes('rel="gs1:pip"'));

  // 3b. ?linkType=epcis
  const resEpcis = DualMarkResolver.resolveWithContentNegotiation(gtin, { linkType: 'epcis' });
  assert.strictEqual(resEpcis.status, 'LINKTYPE_MATCH');
  assert.strictEqual(resEpcis.linkType, 'gs1:traceability');
  assert.ok(resEpcis.targetUrl.includes('/traceability'));

  // 3c. ?linkType=sds (Safety Data Sheet / Certifications)
  const resSds = DualMarkResolver.resolveWithContentNegotiation(gtin, { linkType: 'sds' });
  assert.strictEqual(resSds.status, 'LINKTYPE_MATCH');
  assert.strictEqual(resSds.linkType, 'gs1:certificationInfo');
  assert.ok(resSds.targetUrl.includes('/safety'));

  // 3d. Accept: application/linkset+json (RFC 9264 Linkset)
  const resLinkset = DualMarkResolver.resolveWithContentNegotiation(gtin, { acceptHeader: 'application/linkset+json' });
  assert.strictEqual(resLinkset.status, 'LINKSET_RESOLVED');
  assert.strictEqual(resLinkset.contentType, 'application/linkset+json');
  const parsedLinkset = JSON.parse(resLinkset.body);
  assert.ok(Array.isArray(parsedLinkset));
  assert.strictEqual(parsedLinkset[0].anchor, 'https://id.dualmark.studio/01/' + gtin);
  assert.ok(parsedLinkset[0].links.length >= 3);
  console.log('✓ Passed: RFC 9264 Content Negotiation & Linkset Document Generation');
}

// 4. Offline Prepress Cryptographic License Token Generation & Verification
async function runLicensingTests() {
  const secretKey = 'ENTERPRISE_PACKAGING_SECRET_SALT_2026';

  // 4a. Generate genuine Enterprise license
  const payload = {
    licensee: 'Global Brand Packaging LLC',
    tier: 'enterprise',
    seats: 25,
    issued: '2026-01-01',
    expires: '2030-12-31',
    nonce: 'rnd_991823'
  };

  const token = await DualMarkLicensing.generateLicenseToken(payload, secretKey);
  assert.ok(token.startsWith('DMLIC-1.'));
  assert.strictEqual(token.split('.').length, 3);

  // 4b. Verify genuine token
  const validResult = await DualMarkLicensing.verifyLicenseToken(token, secretKey);
  assert.strictEqual(validResult.valid, true);
  assert.strictEqual(validResult.payload.licensee, 'Global Brand Packaging LLC');
  assert.strictEqual(validResult.payload.tier, 'enterprise');

  // 4c. Tampered token rejection (signature mismatch)
  const tamperedToken = token.slice(0, -4) + 'XXXX';
  const tamperedResult = await DualMarkLicensing.verifyLicenseToken(tamperedToken, secretKey);
  assert.strictEqual(tamperedResult.valid, false);
  assert.strictEqual(tamperedResult.reason, 'SIGNATURE_MISMATCH');

  // 4d. Expired token rejection
  const expiredPayload = {
    licensee: 'Legacy Co',
    tier: 'pro',
    issued: '2020-01-01',
    expires: '2021-01-01'
  };
  const expiredToken = await DualMarkLicensing.generateLicenseToken(expiredPayload, secretKey);
  const expiredResult = await DualMarkLicensing.verifyLicenseToken(expiredToken, secretKey);
  assert.strictEqual(expiredResult.valid, false);
  assert.strictEqual(expiredResult.reason, 'EXPIRED');

  // 4e. Offline activation and feature gate unlocking
  DualMarkLicensing.setTier('free');
  assert.strictEqual(DualMarkLicensing.getTier(), 'free');
  assert.strictEqual(DualMarkLicensing.isFeatureAllowed('vector_cmyk_eps'), false);
  assert.strictEqual(DualMarkLicensing.isFeatureAllowed('edge_resolvers_bundle'), false);

  const activationResult = await DualMarkLicensing.activateWithLicenseToken(token, secretKey);
  assert.strictEqual(activationResult.success, true);
  assert.strictEqual(activationResult.tier, 'enterprise');
  assert.strictEqual(DualMarkLicensing.getTier(), 'enterprise');
  assert.strictEqual(DualMarkLicensing.isFeatureAllowed('vector_cmyk_eps'), true);
  assert.strictEqual(DualMarkLicensing.isFeatureAllowed('edge_resolvers_bundle'), true);

  console.log('✓ Passed: Cryptographic License Token Generation, Tamper Detection & Feature Unlocking');
}

runLicensingTests().then(() => {
  console.log('All Dynamic Resolver & Licensing tests passed successfully!');
}).catch(err => {
  console.error('Licensing test error:', err);
  process.exit(1);
});
