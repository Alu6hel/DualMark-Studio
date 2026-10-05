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

  function buildDigitalLinkUri(options) {
    options = options || {};
    var domain = (options.domain || 'https://id.dualmark.studio').replace(/\/+$/, '');
    var gtin = formatGtin14(options.gtin || '00812345678901');
    var lot = options.lot ? encodeURIComponent(options.lot.trim()) : '';
    var serial = options.serial ? encodeURIComponent(options.serial.trim()) : '';
    var expiration = options.expiration ? encodeURIComponent(options.expiration.replace(/\D/g, '').slice(0, 6)) : '';

    var path = domain + '/01/' + gtin;
    if (lot) path += '/10/' + lot;
    if (serial) path += '/21/' + serial;

    var queryParams = [];
    if (expiration) queryParams.push('17=' + expiration);
    if (options.linkType) queryParams.push('linkType=' + encodeURIComponent(options.linkType));
    if (options.customQuery) queryParams.push(options.customQuery);

    if (queryParams.length > 0) {
      path += '?' + queryParams.join('&');
    }
    return path;
  }

  function buildHriString(options) {
    var gtin = formatGtin14(options.gtin || '00812345678901');
    var parts = ['(01) ' + gtin];
    if (options.lot) parts.push('(10) ' + options.lot.trim());
    if (options.serial) parts.push('(21) ' + options.serial.trim());
    if (options.expiration) parts.push('(17) ' + options.expiration.replace(/\D/g, '').slice(0, 6));
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
        gtin: '',
        lot: '',
        serial: '',
        expiration: '',
        rawUri: uri
      };

      for (var i = 0; i < segments.length; i += 2) {
        var ai = segments[i];
        var val = segments[i + 1] || '';
        if (ai === '01') result.gtin = val;
        else if (ai === '10') result.lot = decodeURIComponent(val);
        else if (ai === '21') result.serial = decodeURIComponent(val);
      }

      // Check query parameters
      if (url.searchParams.has('17')) result.expiration = url.searchParams.get('17');
      if (url.searchParams.has('15')) result.bestBefore = url.searchParams.get('15');
      return result;
    } catch (e) {
      return null;
    }
  }

  function renderQrCanvas(canvas, uri, options) {
    return window.DualMarkQR.renderCanvas(canvas, uri, options);
  }

  function renderQrSvg(uri, options) {
    return window.DualMarkQR.renderSvgString(uri, options);
  }

  window.DualMarkGS1 = {
    formatGtin14: formatGtin14,
    buildDigitalLinkUri: buildDigitalLinkUri,
    buildHriString: buildHriString,
    parseDigitalLinkUri: parseDigitalLinkUri,
    renderQrCanvas: renderQrCanvas,
    renderQrSvg: renderQrSvg
  };

})(window);
