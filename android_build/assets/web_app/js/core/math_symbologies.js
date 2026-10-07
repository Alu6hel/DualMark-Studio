/**
 * DualMark Studio — Headless Math & Symbology Synthesizer Engine
 * Functionality Layer: Pure mathematical calculations with ZERO UI / DOM dependencies.
 * Operates headlessly in Browser Web Workers, Node.js CLI, and Service Workers.
 *
 * Implements:
 * 1. Galois Field Arithmetic: GF(113) for DotCode, GF(256) for QR (0x11D) and DataMatrix (0x12D)
 * 2. Reed-Solomon Polynomial Division & Generator Matrix Builder
 * 3. Modulo-10 (GS1 / Luhn), Modulo-43 (Code 39 / HIBC), Modulo-103 (Code 128) Check Characters
 * 4. Code 128 Dynamic State Machine (Automatic A/B/C subset switching with FNC1 optimization)
 */
(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.DualMarkMathSymbologies = factory();
  }
})(typeof self !== 'undefined' ? self : this, function() {
  'use strict';

  // =========================================================================
  // 1. GALOIS FIELD ARITHMETIC
  // =========================================================================

  /**
   * GF(113) Arithmetic for ISO/IEC 20835 DotCode
   * Prime field GF(113) where operations are standard arithmetic modulo 113.
   * Primitive root is 3.
   */
  const GF113 = (() => {
    const MOD = 113;
    const exp = new Int32Array(MOD * 2);
    const log = new Int32Array(MOD);

    let x = 1;
    for (let i = 0; i < MOD - 1; i++) {
      exp[i] = x;
      exp[i + (MOD - 1)] = x;
      log[x] = i;
      x = (x * 3) % MOD;
    }

    const field = {
      MOD,
      add: (a, b) => (a + b) % MOD,
      sub: (a, b) => (a - b + MOD) % MOD,
      mul: (a, b) => {
        if (a === 0 || b === 0) return 0;
        return exp[log[a] + log[b]];
      },
      div: (a, b) => {
        if (b === 0) throw new Error('GF(113) Division by zero');
        if (a === 0) return 0;
        return exp[(log[a] - log[b] + (MOD - 1)) % (MOD - 1)];
      },
      inv: (a) => {
        if (a === 0) throw new Error('GF(113) Inversion of zero');
        return exp[(MOD - 1) - log[a]];
      },
      exp: (power) => exp[((power % (MOD - 1)) + (MOD - 1)) % (MOD - 1)],
      log: (val) => {
        if (val === 0) throw new Error('GF(113) Log of zero');
        return log[val];
      }
    };
    field.multiply = field.mul;
    field.divide = field.div;
    return field;
  })();

  /**
   * GF(256) Arithmetic for ISO/IEC 18004 (QR Code) and ISO/IEC 16022 (DataMatrix)
   * QR Code uses primitive polynomial x^8 + x^4 + x^3 + x^2 + 1 (0x11D / 285)
   * DataMatrix uses primitive polynomial x^8 + x^5 + x^3 + x^2 + 1 (0x12D / 301)
   */
  function createGF256(primitivePoly) {
    const exp = new Int32Array(512);
    const log = new Int32Array(256);

    let x = 1;
    for (let i = 0; i < 255; i++) {
      exp[i] = x;
      exp[i + 255] = x;
      log[x] = i;
      x <<= 1;
      if (x >= 256) {
        x ^= primitivePoly;
      }
    }

    const field = {
      add: (a, b) => a ^ b,
      sub: (a, b) => a ^ b,
      mul: (a, b) => {
        if (a === 0 || b === 0) return 0;
        return exp[log[a] + log[b]];
      },
      div: (a, b) => {
        if (b === 0) throw new Error('GF(256) Division by zero');
        if (a === 0) return 0;
        return exp[(log[a] - log[b] + 255) % 255];
      },
      inv: (a) => {
        if (a === 0) throw new Error('GF(256) Inversion of zero');
        return exp[255 - log[a]];
      },
      exp: (p) => exp[((p % 255) + 255) % 255],
      log: (v) => {
        if (v === 0) throw new Error('GF(256) Log of zero');
        return log[v];
      }
    };
    field.multiply = field.mul;
    field.divide = field.div;
    return field;
  }

  const GF256_QR = createGF256(0x11D); // 285
  const GF256_DATAMATRIX = createGF256(0x12D); // 301

  // =========================================================================
  // 2. REED-SOLOMON POLYNOMIAL ENGINE
  // =========================================================================

  /**
   * Builds Reed-Solomon Generator Polynomial of degree `capacity`
   * g(x) = (x - alpha^0)(x - alpha^1)...(x - alpha^(capacity - 1))
   * or indexed from 1 for DataMatrix: (x - alpha^1)...(x - alpha^capacity)
   */
  function buildRsGenerator(gf, capacity, startIndex = 0) {
    let poly = [1];
    for (let i = 0; i < capacity; i++) {
      const root = gf.exp(i + startIndex);
      // Multiply poly by (x - root) = (x + root)
      const next = new Array(poly.length + 1).fill(0);
      for (let j = 0; j < poly.length; j++) {
        next[j] = gf.add(next[j], poly[j]);
        next[j + 1] = gf.add(next[j + 1], gf.mul(poly[j], root));
      }
      poly = next;
    }
    return poly;
  }

  /**
   * Systematic Reed-Solomon division.
   * Multiplies message by x^parityCount, then divides by generator poly, returning remainder.
   */
  function encodeReedSolomon(gf, message, parityCount, generatorPoly = null, startIndex = 0) {
    const gen = generatorPoly || buildRsGenerator(gf, parityCount, startIndex);
    const msgLen = message.length;
    const remainder = new Array(parityCount).fill(0);

    for (let i = 0; i < msgLen; i++) {
      const lead = gf.add(message[i], remainder[0]);
      for (let j = 0; j < parityCount - 1; j++) {
        remainder[j] = gf.add(remainder[j + 1], gf.mul(lead, gen[j + 1]));
      }
      remainder[parityCount - 1] = gf.mul(lead, gen[parityCount]);
    }

    return remainder;
  }

  // =========================================================================
  // 3. CHECK CHARACTER GENERATORS
  // =========================================================================

  /**
   * Modulo-10 Check Digit (GS1 Standard: GTIN-8, GTIN-12, GTIN-13, GTIN-14, SSCC-18)
   * Alternating weights 3 and 1 starting from the digit immediately to the left of check digit.
   */
  function calcModulo10(numericStr) {
    const digits = String(numericStr).replace(/\D/g, '');
    if (!digits) return 0;

    let sum = 0;
    let weight = 3;
    for (let i = digits.length - 1; i >= 0; i--) {
      sum += parseInt(digits[i], 10) * weight;
      weight = (weight === 3) ? 1 : 3;
    }
    const remainder = sum % 10;
    return remainder === 0 ? 0 : 10 - remainder;
  }

  /**
   * Verifies whether a full GTIN string has a valid Modulo-10 check digit.
   */
  function verifyModulo10(gtinWithCheck) {
    const str = String(gtinWithCheck).replace(/\D/g, '');
    if (str.length < 2) return false;
    const body = str.slice(0, -1);
    const expected = calcModulo10(body);
    const actual = parseInt(str.slice(-1), 10);
    return expected === actual;
  }

  /**
   * Modulo-43 Check Character (ISO/IEC 16388 / Code 39 / HIBC Health Industry Barcode)
   * Alphabet: 0-9, A-Z, -, ., space, $, /, +, % (43 characters)
   */
  const CODE39_ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ-. $/+%';

  function calcModulo43(str) {
    const upper = String(str).toUpperCase();
    let sum = 0;
    for (let i = 0; i < upper.length; i++) {
      const idx = CODE39_ALPHABET.indexOf(upper[i]);
      if (idx === -1) throw new Error(`Invalid Code 39 character: '${upper[i]}'`);
      sum += idx;
    }
    return CODE39_ALPHABET[sum % 43];
  }

  /**
   * Modulo-103 Check Character (ISO/IEC 15417 Code 128 / GS1-128)
   * Sum = StartCode + Sum(i * Codeword_i) modulo 103.
   */
  function calcModulo103(startCode, codewords) {
    let sum = startCode;
    for (let i = 0; i < codewords.length; i++) {
      sum += (i + 1) * codewords[i];
    }
    return sum % 103;
  }

  // =========================================================================
  // 4. CODE 128 DYNAMIC SUBSET STATE MACHINE (ISO/IEC 15417)
  // =========================================================================

  const CODE128_PATTERNS = [
    '212222', '222122', '222221', '121223', '121322', '131222', '122213', '122312', '132212', '221213',
    '221312', '231212', '112232', '122132', '122231', '113222', '123122', '123221', '223211', '221132',
    '221231', '213212', '223112', '312131', '311222', '321122', '321221', '312212', '322112', '322211',
    '212123', '212321', '232121', '111323', '131123', '131321', '112313', '132113', '132311', '211313',
    '231113', '231311', '112133', '112331', '132131', '113123', '113321', '133121', '313121', '211331',
    '231131', '213113', '213311', '213131', '311123', '311321', '331121', '312113', '312311', '332111',
    '314111', '221411', '431111', '111224', '111422', '121124', '121421', '141122', '141221', '112214',
    '112412', '122114', '122411', '142112', '142211', '241211', '221114', '413111', '241112', '134111',
    '111242', '121142', '121241', '114212', '124112', '124211', '411212', '421112', '421211', '212141',
    '214121', '412121', '111143', '111341', '131141', '114113', '114311', '411113', '411311', '113141',
    '114131', '311141', '411131',
    // Special control symbols:
    '211412', // 103: Start A
    '211214', // 104: Start B
    '211232', // 105: Start C
    '2331112' // 106: Stop (7 elements)
  ];

  const C128_CODE_A = 101;
  const C128_CODE_B = 100;
  const C128_CODE_C = 99;
  const C128_SHIFT = 98;
  const C128_FNC1 = 102;
  const C128_START_A = 103;
  const C128_START_B = 104;
  const C128_START_C = 105;

  /**
   * Code 128 Optimal Lookahead Subset Selector
   * Minimizes barcode length by transitioning to Code C for digit pairs, Code A for control characters,
   * and Code B for general ASCII.
   */
  function encodeCode128(text, isGs1 = false) {
    const raw = String(text);
    const codewords = [];
    let curSubset = null;
    let i = 0;

    // Helper: count continuous digits ahead
    function countDigits(pos) {
      let count = 0;
      while (pos + count < raw.length && raw.charCodeAt(pos + count) >= 48 && raw.charCodeAt(pos + count) <= 57) {
        count++;
      }
      return count;
    }

    // Determine initial subset
    const initialDigits = countDigits(0);
    if (initialDigits >= 4 || (initialDigits === raw.length && initialDigits >= 2)) {
      curSubset = 'C';
      codewords.push(C128_START_C);
    } else {
      let hasCtrl = false;
      for (let k = 0; k < Math.min(raw.length, 4); k++) {
        if (raw.charCodeAt(k) < 32) { hasCtrl = true; break; }
      }
      curSubset = hasCtrl ? 'A' : 'B';
      codewords.push(curSubset === 'A' ? C128_START_A : C128_START_B);
    }

    if (isGs1) {
      codewords.push(C128_FNC1);
    }

    while (i < raw.length) {
      if (curSubset === 'C') {
        const digits = countDigits(i);
        if (digits >= 2) {
          const val = parseInt(raw.substr(i, 2), 10);
          codewords.push(val);
          i += 2;
        } else {
          // Switch out of C
          const nextCharCode = raw.charCodeAt(i);
          if (nextCharCode < 32) {
            codewords.push(C128_CODE_A);
            curSubset = 'A';
          } else {
            codewords.push(C128_CODE_B);
            curSubset = 'B';
          }
        }
      } else if (curSubset === 'B') {
        const digits = countDigits(i);
        if (digits >= 4) {
          codewords.push(C128_CODE_C);
          curSubset = 'C';
          const val = parseInt(raw.substr(i, 2), 10);
          codewords.push(val);
          i += 2;
        } else {
          const code = raw.charCodeAt(i);
          if (code < 32) {
            // Need Code A
            codewords.push(C128_SHIFT);
            codewords.push(code + 64);
            i++;
          } else if (code <= 127) {
            codewords.push(code - 32);
            i++;
          } else {
            // Extended ASCII fallback
            codewords.push(code - 32);
            i++;
          }
        }
      } else { // curSubset === 'A'
        const digits = countDigits(i);
        if (digits >= 4) {
          codewords.push(C128_CODE_C);
          curSubset = 'C';
          const val = parseInt(raw.substr(i, 2), 10);
          codewords.push(val);
          i += 2;
        } else {
          const code = raw.charCodeAt(i);
          if (code >= 96 && code <= 127) {
            // Lowercase requires Code B
            codewords.push(C128_CODE_B);
            curSubset = 'B';
            codewords.push(code - 32);
            i++;
          } else if (code < 32) {
            codewords.push(code + 64);
            i++;
          } else {
            codewords.push(code - 32);
            i++;
          }
        }
      }
    }

    // Calculate check digit (start code is at index 0)
    const startCode = codewords[0];
    const dataCodewords = codewords.slice(1);
    const checkDigit = calcModulo103(startCode, dataCodewords);
    codewords.push(checkDigit);
    codewords.push(106); // Stop

    // Build module bitstream
    let pattern = '';
    for (let c = 0; c < codewords.length; c++) {
      const p = CODE128_PATTERNS[codewords[c]];
      for (let el = 0; el < p.length; el++) {
        const count = parseInt(p[el], 10);
        const bit = (el % 2 === 0) ? '1' : '0';
        pattern += bit.repeat(count);
      }
    }

    return {
      symbology: isGs1 ? 'GS1-128' : 'Code 128',
      text: raw,
      codewords,
      checkDigit,
      pattern,
      moduleCount: pattern.length
    };
  }

  return {
    GF113,
    GF256_QR,
    GF256_DATAMATRIX,
    createGF256,
    buildRsGenerator,
    encodeReedSolomon,
    calcModulo10,
    verifyModulo10,
    calcModulo43,
    calcModulo103,
    encodeCode128
  };
});
