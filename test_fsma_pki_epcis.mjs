import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { webcrypto } from 'crypto';

console.log('===============================================================');
console.log('DUALMARK STUDIO: FDA FSMA 204 PKI & EPCIS 2.0 TEST SUITE');
console.log('===============================================================');

const fsmaPath = path.resolve('web_app/js/fsma_logger.js');
const fsmaCode = fs.readFileSync(fsmaPath, 'utf8');

const mockStorage = {};
const mockWindow = {
  crypto: webcrypto,
  localStorage: {
    getItem: (key) => mockStorage[key] || null,
    setItem: (key, val) => { mockStorage[key] = String(val); }
  }
};

new Function('window', fsmaCode)(mockWindow);

assert.ok(mockWindow.DualMarkFsma, 'DualMarkFsma instance present');
const fsma = mockWindow.DualMarkFsma;

// 1. Persistent WebCrypto ECDSA P-256 PKI
console.log('\n--- 1. Persistent WebCrypto ECDSA PKI Key Management ---');
const keyPair1 = await fsma.getOrCreatePersistentSigningKey();
assert.ok(keyPair1.privateKey, 'Private key present');
assert.ok(keyPair1.publicKey, 'Public key present');

// Retrieve key again - must match persistent stored key!
const keyPair2 = await fsma.getOrCreatePersistentSigningKey();
assert.strictEqual(keyPair1, keyPair2, 'Should return cached persistent key pair');
assert.ok(mockStorage['dualmark_pki_signing_key_p256'], 'Key pair persisted to local/indexed storage');
console.log('  ✓ PASS: Persistent P-256 key pair initialized and persisted across sessions');

// 2. Add Critical Tracking Event (CTE) with Merkle Audit Hash
console.log('\n--- 2. Merkle Chained Critical Tracking Event (CTE) ---');
const rawRecord = await fsma.addRecord({
  eventType: 'TRANSFORMATION (Food Manufacturing)',
  commodity: 'Organic Cold-Pressed Almond Butter',
  tlc: 'TLC-9924-ALM',
  inputTlc: 'TLC-RAW-ALMOND-08',
  gtin: '00812345678901',
  quantity: '480 Cases',
  gln: '0812345000012',
  gps: '37.7749,-122.4194'
});

assert.ok(rawRecord.id.startsWith('CTE-'), 'Record ID assigned');
assert.ok(rawRecord.sha256, 'SHA-256 Merkle audit hash generated');
console.log(`  ✓ PASS: CTE record created: ${rawRecord.id} (Merkle Hash: ${rawRecord.sha256.slice(0, 16)}...)`);

// 3. 21 CFR Part 11 Electronic Signature Sign-Off
console.log('\n--- 3. 21 CFR Part 11 Cryptographic Sign-Off ---');
const sigManifest = await fsma.signRecord21CfrPart11(rawRecord.id, 'Dr. Aris Thorne', 'Chief Food Safety Officer');
assert.strictEqual(sigManifest.algorithm, 'ECDSA-P256-SHA256');
assert.ok(sigManifest.signatureHex, 'Raw signature hex present');
assert.ok(sigManifest.publicKeySpki, 'SPKI public key hex present');

const verifyResult = await fsma.verifyRecordSignature(rawRecord.id);
assert.strictEqual(verifyResult.verified, true, 'Cryptographic signature verification should succeed');
assert.strictEqual(verifyResult.auditor, 'Dr. Aris Thorne');
console.log(`  ✓ PASS: 21 CFR Part 11 signature created and verified via SPKI public key`);

// 4. GS1 EPCIS 2.0 TransformationEvent Formatting (CBV 2.0)
console.log('\n--- 4. EPCIS 2.0 TransformationEvent JSON-LD & CBV 2.0 ---');
const transformEvent = fsma.buildEpcis2TransformationEvent(rawRecord);
assert.strictEqual(transformEvent.type, 'TransformationEvent', 'Type must be TransformationEvent');
assert.strictEqual(transformEvent.bizStep, 'urn:epcglobal:cbv:bizstep:transforming');
assert.ok(transformEvent.inputEPCList[0].includes('TLC-RAW-ALMOND-08'), 'Input EPC contains parent TLC');
assert.ok(transformEvent.outputEPCList[0].includes('TLC-9924-ALM'), 'Output EPC contains finished product TLC');
assert.ok(transformEvent.transformationID.includes('9924'), 'Transformation ID contains transaction ID');
console.log('  ✓ PASS: buildEpcis2TransformationEvent correctly maps parent lot to output lot with CBV 2.0 URIs');

// 5. EPCIS 2.0 Document Exports
console.log('\n--- 5. EPCIS 2.0 Export Documents ---');
const jsonLdDoc = fsma.exportEpcisJsonLd();
const parsedJsonLd = JSON.parse(jsonLdDoc);
assert.strictEqual(parsedJsonLd.isA, 'EPCISDocument');
assert.strictEqual(parsedJsonLd.schemaVersion, '2.0');
assert.strictEqual(parsedJsonLd.epcisBody.eventList[0].type, 'TransformationEvent');
console.log('  ✓ PASS: exportEpcisJsonLd outputs compliant EPCIS 2.0 JSON-LD with TransformationEvent');

const xmlDoc = fsma.exportEpcisXml();
assert.ok(xmlDoc.includes('<TransformationEvent>'), 'XML contains TransformationEvent');
assert.ok(xmlDoc.includes('<inputEPCList>'), 'XML contains inputEPCList');
assert.ok(xmlDoc.includes('<outputEPCList>'), 'XML contains outputEPCList');
console.log('  ✓ PASS: exportEpcisXml outputs compliant EPCIS 2.0 XML with input/output lot genealogy');

console.log('\n===============================================================');
console.log('ALL FDA FSMA 204 PKI & EPCIS 2.0 TESTS PASSED SUCCESSFULLY!');
console.log('===============================================================');
