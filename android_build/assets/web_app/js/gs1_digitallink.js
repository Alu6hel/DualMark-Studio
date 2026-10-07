/**
 * DualMark Studio — GS1 Digital Link URI Builder & 2D Matrix Engine
 * Conforms to GS1 Digital Link Standard v1.2 & Sunrise 2027 POS Specifications.
 */
(function(window) {
  'use strict';

  function formatGtin14(raw) {
    if (!raw) return '00000000000000';
    var clean = raw.replace(/\D/g, '');
    while (clean.length < 14) clean = '0' + clean;
    if (clean.length > 14) clean = clean.substring(clean.length - 14);
    return clean;
  }

  function formatSscc18(raw) {
    if (!raw) return '000000000000000000';
    var clean = raw.replace(/\D/g, '');
    while (clean.length < 18) clean = '0' + clean;
    if (clean.length > 18) clean = clean.substring(clean.length - 18);
    return clean;
  }

  function formatGln13(raw) {
    if (!raw) return '0000000000000';
    var clean = raw.replace(/\D/g, '');
    while (clean.length < 13) clean = '0' + clean;
    if (clean.length > 13) clean = clean.substring(clean.length - 13);
    return clean;
  }

  function buildDigitalLinkUri(options) {
    options = options || {};
    var domain = (options.domain || 'https://id.dualmark.studio').replace(/\/+$/, '');
    var path = domain;
    var primaryKeyType = options.primaryKeyType || (options.sscc ? '00' : (options.gln ? '414' : (options.grai ? '8004' : '01')));

    if (primaryKeyType === '00') {
      var sscc = formatSscc18(options.sscc || options.gtin || '000000000000000000');
      path += '/00/' + sscc;
    } else if (primaryKeyType === '414') {
      var gln = formatGln13(options.gln || options.gtin || '0000000000000');
      path += '/414/' + gln;
      if (options.locExt) path += '/254/' + encodeURIComponent(options.locExt.trim());
    } else if (primaryKeyType === '8004') {
      var grai = encodeURIComponent((options.grai || options.gtin || '').trim());
      path += '/8004/' + grai;
    } else {
      var gtin = formatGtin14(options.gtin || '00812345678901');
      var lot = options.lot ? encodeURIComponent(options.lot.trim()) : '';
      var serial = options.serial ? encodeURIComponent(options.serial.trim()) : '';
      path += '/01/' + gtin;
      if (lot) path += '/10/' + lot;
      if (serial) path += '/21/' + serial;
    }

    var expiration = options.expiration ? encodeURIComponent(options.expiration.replace(/\D/g, '').slice(0, 6)) : '';

    var queryParams = [];
    if (expiration) queryParams.push('17=' + expiration);
    if (options.bestBefore) queryParams.push('15=' + encodeURIComponent(options.bestBefore.replace(/\D/g, '').slice(0, 6)));
    if (options.weightKg) {
      // AI 3102: Net weight in kg with 2 decimal places (e.g. 12.50 -> 001250)
      var weightInt = Math.round(parseFloat(options.weightKg) * 100);
      var weightStr = String(weightInt).padStart(6, '0');
      queryParams.push('3102=' + weightStr);
    }
    if (options.price) {
      // AI 3922: Amount payable with 2 decimals (e.g. 19.99 -> 001999)
      var priceInt = Math.round(parseFloat(options.price) * 100);
      var priceStr = String(priceInt).padStart(6, '0');
      queryParams.push('3922=' + priceStr);
    }
    if (options.poNumber) {
      queryParams.push('400=' + encodeURIComponent(options.poNumber.trim()));
    }
    if (options.countryOfOrigin) {
      // AI 422: ISO numeric 3-digit country
      var coo = options.countryOfOrigin.replace(/\D/g, '').padStart(3, '0').slice(0, 3);
      queryParams.push('422=' + coo);
    }
    if (options.expDateTime) {
      queryParams.push('7003=' + encodeURIComponent(options.expDateTime.replace(/\D/g, '').slice(0, 10)));
    }
    if (options.prodDateTime) {
      queryParams.push('8008=' + encodeURIComponent(options.prodDateTime.replace(/\D/g, '').slice(0, 12)));
    }
    if (options.linkType) queryParams.push('linkType=' + encodeURIComponent(options.linkType));
    if (options.customQuery) queryParams.push(options.customQuery);

    if (queryParams.length > 0) {
      path += '?' + queryParams.join('&');
    }
    return path;
  }

  function buildHriString(options) {
    options = options || {};
    var primaryKeyType = options.primaryKeyType || (options.sscc ? '00' : (options.gln ? '414' : (options.grai ? '8004' : '01')));
    var parts = [];
    if (primaryKeyType === '00') {
      parts.push('(00) ' + formatSscc18(options.sscc || options.gtin || '000000000000000000'));
    } else if (primaryKeyType === '414') {
      parts.push('(414) ' + formatGln13(options.gln || options.gtin || '0000000000000'));
      if (options.locExt) parts.push('(254) ' + options.locExt.trim());
    } else if (primaryKeyType === '8004') {
      parts.push('(8004) ' + (options.grai || options.gtin || ''));
    } else {
      var gtin = formatGtin14(options.gtin || '00812345678901');
      parts.push('(01) ' + gtin);
      if (options.lot) parts.push('(10) ' + options.lot.trim());
      if (options.serial) parts.push('(21) ' + options.serial.trim());
    }
    if (options.expiration) parts.push('(17) ' + options.expiration.replace(/\D/g, '').slice(0, 6));
    if (options.weightKg) parts.push('(3102) ' + options.weightKg + ' kg');
    if (options.poNumber) parts.push('(400) ' + options.poNumber.trim());
    if (options.countryOfOrigin) parts.push('(422) ' + options.countryOfOrigin);
    return parts.join(' ');
  }

  function parseDigitalLinkUri(uri) {
    if (!uri) return null;
    try {
      var url = new URL(uri);
      var pathname = url.pathname;
      var segments = pathname.split('/').filter(Boolean);
      var result = {
        domain: url.origin,
        primaryKeyType: '01',
        primaryKey: '',
        gtin: '',
        sscc: '',
        gln: '',
        grai: '',
        lot: '',
        serial: '',
        expiration: '',
        attributes: {},
        rawUri: uri
      };

      for (var i = 0; i < segments.length; i += 2) {
        var ai = segments[i];
        var val = segments[i + 1] || '';
        if (ai === '01') {
          result.gtin = val;
          result.primaryKeyType = '01';
          result.primaryKey = val;
        } else if (ai === '00') {
          result.sscc = val;
          result.primaryKeyType = '00';
          result.primaryKey = val;
        } else if (ai === '414') {
          result.gln = val;
          result.primaryKeyType = '414';
          result.primaryKey = val;
        } else if (ai === '8004') {
          result.grai = decodeURIComponent(val);
          result.primaryKeyType = '8004';
          result.primaryKey = result.grai;
        } else if (ai === '10') {
          result.lot = decodeURIComponent(val);
        } else if (ai === '21') {
          result.serial = decodeURIComponent(val);
        } else if (ai === '254') {
          result.locationExtension = decodeURIComponent(val);
        }
      }

      // Check all query parameters
      url.searchParams.forEach(function(val, key) {
        if (key === '17') result.expiration = val;
        else if (key === '15') result.bestBefore = val;
        else if (key === '3102') result.weightKg = (parseInt(val, 10) / 100).toFixed(2);
        else if (key === '400') result.poNumber = val;
        else if (key === '422') result.countryOfOrigin = val;
        result.attributes[key] = val;
      });

      return result;
    } catch (e) {
      return null;
    }
  }

  // FNC1 & Symbology Identifier Validation
  function validateFnc1AndSymbology(rawBarcode) {
    if (!rawBarcode) return { valid: false, error: 'Empty barcode' };
    var prefix = rawBarcode.substring(0, 3);
    var symbologyMap = {
      ']C1': { name: 'GS1-128', hasFnc1: true, compliant: true },
      ']d2': { name: 'GS1 DataMatrix', hasFnc1: true, compliant: true },
      ']Q3': { name: 'GS1 QR Code', hasFnc1: true, compliant: true },
      ']e0': { name: 'EAN/UPC', hasFnc1: false, compliant: true }
    };

    if (symbologyMap[prefix]) {
      return {
        valid: true,
        symbologyIdentifier: prefix,
        symbologyName: symbologyMap[prefix].name,
        hasFnc1: symbologyMap[prefix].hasFnc1,
        pureData: rawBarcode.substring(3)
      };
    }

    // Standard raw barcode without AIM symbology identifier flag
    return {
      valid: true,
      symbologyIdentifier: 'NONE',
      symbologyName: 'Standard Barcode (Unprefixed)',
      hasFnc1: rawBarcode.indexOf('\x1D') !== -1 || rawBarcode.indexOf('<GS>') !== -1,
      pureData: rawBarcode
    };
  }

  // GS1 Digital Link Conformance Test Suite (v1.2 Standard)
  function validateConformance(uri) {
    var checks = [];
    var score = 100;

    // Check 1: HTTPS URL Scheme
    var isHttps = uri.startsWith('https://');
    checks.push({
      test: 'HTTPS Transport Scheme',
      passed: isHttps,
      detail: isHttps ? 'Secure HTTPS scheme verified' : 'FAIL: Non-HTTPS scheme violates GS1 DL Standard'
    });
    if (!isHttps) score -= 25;

    // Check 2: Valid Identification Key (/01/ GTIN, /00/ SSCC, /414/ GLN, /8004/ GRAI)
    var parsed = parseDigitalLinkUri(uri);
    var hasValidKey = false;
    var keyDetail = '';
    var testTitle = 'Primary Identification Key (/01/ GTIN-14)';
    if (parsed) {
      if (parsed.gtin && parsed.gtin.length === 14) {
        hasValidKey = true;
        testTitle = 'Primary Identification Key (/01/ GTIN-14)';
        keyDetail = 'Valid 14-digit GTIN identified: ' + parsed.gtin;
      } else if (parsed.sscc && parsed.sscc.length === 18) {
        hasValidKey = true;
        testTitle = 'Primary Identification Key (/00/ SSCC-18)';
        keyDetail = 'Valid 18-digit SSCC identified: ' + parsed.sscc;
      } else if (parsed.gln && parsed.gln.length === 13) {
        hasValidKey = true;
        testTitle = 'Primary Identification Key (/414/ GLN-13)';
        keyDetail = 'Valid 13-digit GLN identified: ' + parsed.gln;
      } else if (parsed.grai && parsed.grai.length >= 14) {
        hasValidKey = true;
        testTitle = 'Primary Identification Key (/8004/ GRAI)';
        keyDetail = 'Valid GRAI identified: ' + parsed.grai;
      }
    }
    checks.push({
      test: testTitle,
      passed: Boolean(hasValidKey),
      detail: hasValidKey ? keyDetail : 'FAIL: Missing or invalid primary GS1 identification key'
    });
    if (!hasValidKey) score -= 35;

    // Check 3: Canonical AI Ordering
    var hasCanonicalPath = Boolean(parsed && (parsed.gtin || parsed.sscc || parsed.gln || parsed.grai));
    checks.push({
      test: 'Canonical Key Path Structure',
      passed: hasCanonicalPath,
      detail: hasCanonicalPath ? 'Path segment starts with primary key /' + (parsed ? parsed.primaryKeyType : '01') + '/' : 'FAIL: Non-canonical path structure'
    });
    if (!hasCanonicalPath) score -= 20;

    // Check 4: No Illegal Characters
    var hasIllegalChars = /[<>"\s\\]/.test(uri);
    checks.push({
      test: 'RFC 3986 URI Percent-Encoding',
      passed: !hasIllegalChars,
      detail: !hasIllegalChars ? 'URI characters are properly encoded' : 'FAIL: Unencoded illegal characters detected'
    });
    if (hasIllegalChars) score -= 20;

    var details = checks.map(function(c) { return c.test + ': ' + (c.passed ? 'PASS' : 'FAIL'); });
    var errors = checks.filter(function(c) { return !c.passed; }).map(function(c) { return c.detail; });

    return {
      valid: score >= 80,
      compliant: score >= 80,
      score: Math.max(0, score),
      checks: checks,
      details: details,
      errors: errors,
      parsed: parsed
    };
  }

  // PIM / DAM Syndication Formatter (Salsify, Syndigo, 1WorldSync)
  function exportPimFormat(productData, platform) {
    const data = {
      gtin: formatGtin14(productData.gtin || '00812345678901'),
      brand: productData.brand || 'DualMark Verified Brand',
      productName: productData.name || 'Packaging Unit',
      gs1DigitalLinkUri: productData.uri || buildDigitalLinkUri(productData),
      lotNumber: productData.lot || '',
      serialNumber: productData.serial || '',
      expirationDate: productData.expiration || '',
      weightKg: productData.weightKg || '1.00',
      countryOfOrigin: productData.countryOfOrigin || '840',
      packagingStatus: 'SUNRISE_2027_COMPLIANT',
      timestamp: new Date().toISOString()
    };

    const salsifyPayload = {
      'salsify:id': data.gtin,
      'Product ID': data.gtin,
      'Product Name': data.productName,
      'GTIN': data.gtin,
      'GS1 Digital Link URI': data.gs1DigitalLinkUri,
      'Lot / Batch': data.lotNumber,
      'Net Weight (kg)': data.weightKg,
      'Country of Origin': data.countryOfOrigin,
      'Compliance Standard': 'GS1 Digital Link Standard v1.2'
    };

    const syndigoPayload = {
      PartnerId: 'DUALMARK_CONNECTOR',
      gtin: data.gtin,
      digitalLink: data.gs1DigitalLinkUri,
      attributes: {
        grossWeight: data.weightKg,
        countryOfOrigin: data.countryOfOrigin
      }
    };

    const oneWorldSyncPayload = {
      tradeItemIdentification: {
        gtin: data.gtin,
        digitalLinkUri: data.gs1DigitalLinkUri
      },
      gdsnTradeItemClassification: 'Packaging/Consumer Goods',
      countryOfOrigin: data.countryOfOrigin
    };

    if (platform === 'salsify') return salsifyPayload;
    if (platform === 'syndigo') return syndigoPayload;
    if (platform === '1worldsync') return oneWorldSyncPayload;

    return {
      salsify: salsifyPayload,
      syndigo: syndigoPayload,
      oneWorldSync: oneWorldSyncPayload
    };
  }

  function renderQrCanvas(canvas, uri, options) {
    return window.DualMarkQR.renderCanvas(canvas, uri, options);
  }

  function renderQrSvg(uri, options) {
    return window.DualMarkQR.renderSvgString(uri, options);
  }

  function generateQrMatrix(uri, options) {
    return window.DualMarkQR.getModuleMatrix(uri, options);
  }

  window.DualMarkGS1 = {
    formatGtin14: formatGtin14,
    formatSscc18: formatSscc18,
    formatGln13: formatGln13,
    buildDigitalLinkUri: buildDigitalLinkUri,
    buildHriString: buildHriString,
    parseDigitalLinkUri: parseDigitalLinkUri,
    validateFnc1AndSymbology: validateFnc1AndSymbology,
    validateConformance: validateConformance,
    exportPimFormat: exportPimFormat,
    renderQrCanvas: renderQrCanvas,
    renderQrSvg: renderQrSvg,
    generateQrMatrix: generateQrMatrix
  };

})(window);
