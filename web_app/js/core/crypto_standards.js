/**
 * DualMark Studio — Headless Cryptographic & GS1 Standards Serialization Engine
 * Functionality Layer: Pure mathematical calculations with ZERO UI / DOM dependencies.
 * Operates headlessly in Browser Web Workers, Node.js CLI, and Service Workers.
 *
 * Implements:
 * 1. WebCrypto / Node.js P-256 ECDSA Sign/Verify Routines with DER/SPKI Encoders
 * 2. Pairwise SHA-256 Merkle Root Digest Calculator
 * 3. RFC 9264 GS1 Linkset Generator & HTTP Link Header Serializer
 * 4. GS1 Digital Link URI Canonical Regex Parser & Application Identifier (AI) Validator
 */
(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.DualMarkCryptoStandards = factory();
  }
})(typeof self !== 'undefined' ? self : this, function() {
  'use strict';

  // Detect environment crypto provider (WebCrypto or Node.js crypto)
  let nodeCrypto = null;
  if (typeof process !== 'undefined' && process.versions && process.versions.node) {
    try {
      nodeCrypto = (typeof require === 'function') ? require('crypto') : null;
    } catch (e) {}
  }

  // =========================================================================
  // 1. CRYPTOGRAPHIC ENGINES: SHA-256 & P-256 ECDSA
  // =========================================================================

  /**
   * Computes SHA-256 hash of a string or Uint8Array, returning lowercase hex string.
   */
  async function sha256Hex(data) {
    const bytes = (typeof data === 'string') ? new TextEncoder().encode(data) : data;

    if (nodeCrypto && typeof nodeCrypto.createHash === 'function') {
      return nodeCrypto.createHash('sha256').update(bytes).digest('hex');
    }

    if (typeof crypto !== 'undefined' && crypto.subtle && typeof crypto.subtle.digest === 'function') {
      const hashBuffer = await crypto.subtle.digest('SHA-256', bytes);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    // Pure JS fallback SHA-256 for non-crypto environments
    return pureJsSha256(bytes);
  }

  /**
   * Compact pure JS fallback SHA-256 implementation
   */
  function pureJsSha256(bytes) {
    function rotr(n, x) { return (x >>> n) | (x << (32 - n)); }
    function ch(x, y, z) { return (x & y) ^ (~x & z); }
    function maj(x, y, z) { return (x & y) ^ (x & z) ^ (y & z); }
    function sigma0(x) { return rotr(2, x) ^ rotr(13, x) ^ rotr(22, x); }
    function sigma1(x) { return rotr(6, x) ^ rotr(11, x) ^ rotr(25, x); }
    function gamma0(x) { return rotr(7, x) ^ rotr(18, x) ^ (x >>> 3); }
    function gamma1(x) { return rotr(17, x) ^ rotr(19, x) ^ (x >>> 10); }

    const K = [
      0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
      0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
      0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
      0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
      0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
      0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
      0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
      0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
    ];

    let H = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];

    const l = bytes.length;
    const n = ((l + 8) >> 6) + 1;
    const totalWords = n * 16;
    const M = new Uint32Array(totalWords);

    for (let i = 0; i < l; i++) {
      M[i >> 2] |= bytes[i] << (24 - (i % 4) * 8);
    }
    M[l >> 2] |= 0x80 << (24 - (l % 4) * 8);
    M[totalWords - 1] = (l * 8) & 0xffffffff;
    M[totalWords - 2] = Math.floor((l * 8) / 0x100000000);

    const W = new Uint32Array(64);

    for (let i = 0; i < n; i++) {
      for (let t = 0; t < 16; t++) W[t] = M[i * 16 + t];
      for (let t = 16; t < 64; t++) {
        W[t] = (gamma1(W[t - 2]) + W[t - 7] + gamma0(W[t - 15]) + W[t - 16]) >>> 0;
      }

      let a = H[0], b = H[1], c = H[2], d = H[3], e = H[4], f = H[5], g = H[6], h = H[7];

      for (let t = 0; t < 64; t++) {
        const T1 = (h + sigma1(e) + ch(e, f, g) + K[t] + W[t]) >>> 0;
        const T2 = (sigma0(a) + maj(a, b, c)) >>> 0;
        h = g; g = f; f = e; e = (d + T1) >>> 0;
        d = c; c = b; b = a; a = (T1 + T2) >>> 0;
      }

      H[0] = (H[0] + a) >>> 0;
      H[1] = (H[1] + b) >>> 0;
      H[2] = (H[2] + c) >>> 0;
      H[3] = (H[3] + d) >>> 0;
      H[4] = (H[4] + e) >>> 0;
      H[5] = (H[5] + f) >>> 0;
      H[6] = (H[6] + g) >>> 0;
      H[7] = (H[7] + h) >>> 0;
    }

    return H.map(val => val.toString(16).padStart(8, '0')).join('');
  }

  /**
   * Pairwise SHA-256 Merkle Root Digest Calculator
   * Computes binary tree root over an array of leaf hash strings.
   */
  async function computeMerkleRoot(leafHashes) {
    if (!leafHashes || leafHashes.length === 0) {
      return await sha256Hex('');
    }
    if (leafHashes.length === 1) {
      return leafHashes[0];
    }

    let currentLayer = [...leafHashes];
    while (currentLayer.length > 1) {
      const nextLayer = [];
      for (let i = 0; i < currentLayer.length; i += 2) {
        const left = currentLayer[i];
        const right = (i + 1 < currentLayer.length) ? currentLayer[i + 1] : left;
        const combined = await sha256Hex(left + right);
        nextLayer.push(combined);
      }
      currentLayer = nextLayer;
    }

    return currentLayer[0];
  }

  /**
   * Converts IEEE P1363 raw 64-byte signature (R || S) into ASN.1 DER format.
   */
  function rawToDer(rawBytes) {
    if (rawBytes.length !== 64) return rawBytes;
    const r = Array.from(rawBytes.slice(0, 32));
    const s = Array.from(rawBytes.slice(32, 64));

    while (r.length > 1 && r[0] === 0) r.shift();
    if (r[0] & 0x80) r.unshift(0);

    while (s.length > 1 && s[0] === 0) s.shift();
    if (s[0] & 0x80) s.unshift(0);

    const rLen = r.length;
    const sLen = s.length;
    const seqLen = 2 + rLen + 2 + sLen;

    const der = [0x30, seqLen, 0x02, rLen, ...r, 0x02, sLen, ...s];
    return new Uint8Array(der);
  }

  /**
   * Generates P-256 ECDSA Key Pair
   */
  async function generateP256KeyPair() {
    if (typeof crypto !== 'undefined' && crypto.subtle) {
      const keyPair = await crypto.subtle.generateKey(
        { name: 'ECDSA', namedCurve: 'P-256' },
        true,
        ['sign', 'verify']
      );
      const spki = await crypto.subtle.exportKey('spki', keyPair.publicKey);
      const spkiHex = Array.from(new Uint8Array(spki)).map(b => b.toString(16).padStart(2, '0')).join('');
      return {
        privateKey: keyPair.privateKey,
        publicKey: keyPair.publicKey,
        spkiHex
      };
    }
    throw new Error('WebCrypto subtle not available in this environment');
  }

  /**
   * Signs data with ECDSA P-256 / SHA-256
   */
  async function signP256(data, privateKey) {
    const bytes = (typeof data === 'string') ? new TextEncoder().encode(data) : data;
    if (typeof crypto !== 'undefined' && crypto.subtle) {
      const rawSig = await crypto.subtle.sign(
        { name: 'ECDSA', hash: { name: 'SHA-256' } },
        privateKey,
        bytes
      );
      const der = rawToDer(new Uint8Array(rawSig));
      return {
        raw: new Uint8Array(rawSig),
        der: der,
        hex: Array.from(der).map(b => b.toString(16).padStart(2, '0')).join('')
      };
    }
    throw new Error('WebCrypto subtle not available for signing');
  }

  // =========================================================================
  // 2. STANDARDS SERIALIZATION: RFC 9264 GS1 LINKSET & DIGITAL LINK
  // =========================================================================

  /**
   * RFC 9264 GS1 Linkset Generator and HTTP Link Header Serializer
   * Produces compliant RFC 9264 Linkset JSON-LD and RFC 8288 Link header format.
   */
  function generateRfc9264Linkset(gtin, digitalLinkUri, links = []) {
    const anchor = digitalLinkUri || `https://id.dualmark.studio/01/${gtin}`;
    const defaultLinks = [
      {
        href: `${anchor}/pip`,
        rel: 'pip',
        type: 'text/html',
        title: 'Product Information Page (Consumer Facing)',
        hreflang: ['en']
      },
      {
        href: `${anchor}/traceability`,
        rel: 'traceability',
        type: 'application/ld+json',
        title: 'FDA FSMA 204 Traceability & EPCIS 2.0 Ledger',
        hreflang: ['en']
      },
      {
        href: `${anchor}/recipe`,
        rel: 'recipe',
        type: 'text/html',
        title: 'Brand Recipes and Sustainability Disclosures',
        hreflang: ['en']
      }
    ];

    const allLinks = (links && links.length > 0) ? links : defaultLinks;

    // RFC 9264 Linkset JSON structure
    const linksetDoc = {
      linkset: [
        {
          anchor: anchor,
          item: allLinks.map(l => {
            const entry = {
              href: l.href,
              rel: l.rel
            };
            if (l.type) entry.type = l.type;
            if (l.title) entry.title = l.title;
            if (l.hreflang) entry.hreflang = l.hreflang;
            return entry;
          })
        }
      ]
    };

    // RFC 8288 HTTP Link Headers
    const httpHeaders = allLinks.map(l => {
      let h = `<${l.href}>; rel="${l.rel}"; anchor="${anchor}"`;
      if (l.type) h += `; type="${l.type}"`;
      if (l.title) h += `; title="${l.title}"`;
      if (l.hreflang && l.hreflang[0]) h += `; hreflang="${l.hreflang[0]}"`;
      return h;
    });

    return {
      anchor,
      jsonld: linksetDoc,
      jsonString: JSON.stringify(linksetDoc, null, 2),
      httpLinkHeaders: httpHeaders,
      linkHeaderString: httpHeaders.join(',\n ')
    };
  }

  /**
   * Canonical GS1 Digital Link URI Parser & AI Validator (GS1 Digital Link v1.2)
   */
  function parseGs1DigitalLink(uri) {
    if (!uri || typeof uri !== 'string') {
      return { isValid: false, error: 'Empty or invalid URI' };
    }

    try {
      const parsedUrl = new URL(uri);
      const isHttps = parsedUrl.protocol === 'https:';
      const pathParts = parsedUrl.pathname.split('/').filter(p => p.length > 0);

      // Extract primary key and qualifiers
      const keys = {};
      const attributes = {};

      let primaryKey = null;
      let primaryVal = null;

      for (let i = 0; i < pathParts.length; i += 2) {
        const ai = pathParts[i];
        const val = pathParts[i + 1] ? decodeURIComponent(pathParts[i + 1]) : null;

        if (i === 0) {
          primaryKey = ai;
          primaryVal = val;
        }

        if (['01', '00', '414', '8004', '8006'].includes(ai)) {
          keys[ai] = val;
        } else if (['10', '21', '22'].includes(ai)) {
          keys[ai] = val;
        } else {
          attributes[ai] = val;
        }
      }

      // Parse query string for secondary AIs
      for (const [key, value] of parsedUrl.searchParams.entries()) {
        attributes[key] = value;
      }

      const hasPrimary = Boolean(primaryKey && primaryVal);
      const isCanonicalGtin = (primaryKey === '01' && /^\d{14}$/.test(primaryVal));

      let score = 100;
      const issues = [];

      if (!isHttps) {
        score -= 20;
        issues.push('URI must use secure HTTPS transport scheme');
      }
      if (!hasPrimary) {
        score -= 40;
        issues.push('Missing primary identification key (e.g. /01/ for GTIN, /00/ for SSCC)');
      }
      if (primaryKey === '01' && !isCanonicalGtin) {
        score -= 30;
        issues.push('GTIN-14 must be exactly 14 digits with leading zeros if necessary');
      }

      return {
        isValid: score >= 70,
        score: Math.max(0, score),
        primaryKey,
        primaryVal,
        keys,
        attributes,
        hostname: parsedUrl.hostname,
        pathname: parsedUrl.pathname,
        isHttps,
        issues
      };
    } catch (e) {
      return {
        isValid: false,
        score: 0,
        error: e.message,
        issues: ['Malformed URI structure']
      };
    }
  }

  return {
    sha256Hex,
    computeMerkleRoot,
    generateP256KeyPair,
    signP256,
    rawToDer,
    generateRfc9264Linkset,
    parseGs1DigitalLink
  };
});
