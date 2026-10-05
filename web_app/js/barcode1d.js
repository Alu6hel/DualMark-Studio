/**
 * DualMark Studio — 1D Barcode Synthesis Engine
 * Standard-compliant vector generation for UPC-A, EAN-13, Code 128, and ITF-14.
 * Features:
 * - Modulo 10 check digit calculation & verification
 * - GS1 Country / Company prefix dictionary
 * - SVG and Canvas rendering with ISO/IEC compliant quiet zones and bearer bars.
 */
(function(window) {
  'use strict';

  // GS1 Prefix Country Identification Table
  var GS1_PREFIXES = [
    { min: '000', max: '019', country: 'United States & Canada', org: 'GS1 US' },
    { min: '020', max: '029', country: 'Restricted / In-Store Circulation', org: 'GS1 Internal' },
    { min: '030', max: '039', country: 'United States (National Drug Code NDC)', org: 'GS1 US' },
    { min: '040', max: '049', country: 'Restricted / Internal Distribution', org: 'GS1 Internal' },
    { min: '050', max: '059', country: 'United States (Coupons)', org: 'GS1 US' },
    { min: '060', max: '139', country: 'United States', org: 'GS1 US' },
    { min: '300', max: '379', country: 'France & Monaco', org: 'GS1 France' },
    { min: '380', max: '380', country: 'Bulgaria', org: 'GS1 Bulgaria' },
    { min: '383', max: '383', country: 'Slovenia', org: 'GS1 Slovenia' },
    { min: '385', max: '385', country: 'Croatia', org: 'GS1 Croatia' },
    { min: '400', max: '440', country: 'Germany', org: 'GS1 Germany' },
    { min: '450', max: '459', country: 'Japan (JAN)', org: 'GS1 Japan' },
    { min: '460', max: '469', country: 'Russia', org: 'GS1 Russia' },
    { min: '471', max: '471', country: 'Taiwan', org: 'GS1 Taiwan' },
    { min: '489', max: '489', country: 'Hong Kong', org: 'GS1 Hong Kong' },
    { min: '490', max: '499', country: 'Japan (JAN)', org: 'GS1 Japan' },
    { min: '500', max: '509', country: 'United Kingdom', org: 'GS1 UK' },
    { min: '520', max: '521', country: 'Greece', org: 'GS1 Greece' },
    { min: '539', max: '539', country: 'Ireland', org: 'GS1 Ireland' },
    { min: '540', max: '549', country: 'Belgium & Luxembourg', org: 'GS1 Belux' },
    { min: '570', max: '579', country: 'Denmark', org: 'GS1 Denmark' },
    { min: '590', max: '590', country: 'Poland', org: 'GS1 Poland' },
    { min: '600', max: '601', country: 'South Africa', org: 'GS1 South Africa' },
    { min: '640', max: '649', country: 'Finland', org: 'GS1 Finland' },
    { min: '690', max: '699', country: 'China', org: 'GS1 China' },
    { min: '700', max: '709', country: 'Norway', org: 'GS1 Norway' },
    { min: '730', max: '739', country: 'Sweden', org: 'GS1 Sweden' },
    { min: '750', max: '750', country: 'Mexico', org: 'GS1 Mexico' },
    { min: '760', max: '769', country: 'Switzerland & Liechtenstein', org: 'GS1 Switzerland' },
    { min: '779', max: '779', country: 'Argentina', org: 'GS1 Argentina' },
    { min: '789', max: '790', country: 'Brazil', org: 'GS1 Brazil' },
    { min: '800', max: '839', country: 'Italy, San Marino, Vatican', org: 'GS1 Italy' },
    { min: '840', max: '849', country: 'Spain & Andorra', org: 'GS1 Spain' },
    { min: '870', max: '879', country: 'Netherlands', org: 'GS1 Netherlands' },
    { min: '880', max: '880', country: 'South Korea', org: 'GS1 Korea' },
    { min: '885', max: '885', country: 'Thailand', org: 'GS1 Thailand' },
    { min: '888', max: '888', country: 'Singapore', org: 'GS1 Singapore' },
    { min: '890', max: '890', country: 'India', org: 'GS1 India' },
    { min: '930', max: '939', country: 'Australia', org: 'GS1 Australia' },
    { min: '940', max: '949', country: 'New Zealand', org: 'GS1 New Zealand' }
  ];

  function lookupPrefix(prefixStr) {
    if (!prefixStr || prefixStr.length < 3) return { country: 'Global GS1', org: 'GS1 Member Org' };
    var p3 = prefixStr.substring(0, 3);
    for (var i = 0; i < GS1_PREFIXES.length; i++) {
      var item = GS1_PREFIXES[i];
      if (p3 >= item.min && p3 <= item.max) return item;
    }
    return { country: 'International GS1 Entity', org: 'GS1 General' };
  }

  // Modulo 10 Checksum (UPC, EAN, ITF)
  function calculateMod10(digits) {
    var sum = 0;
    var len = digits.length;
    for (var i = len - 1; i >= 0; i--) {
      var n = parseInt(digits.charAt(i), 10);
      if (isNaN(n)) return 0;
      var weight = ((len - i) % 2 === 1) ? 3 : 1;
      sum += n * weight;
    }
    return (10 - (sum % 10)) % 10;
  }

  function validateMod10(fullCode) {
    if (!fullCode || fullCode.length < 2) return false;
    var data = fullCode.slice(0, -1);
    var expected = calculateMod10(data);
    var actual = parseInt(fullCode.slice(-1), 10);
    return expected === actual;
  }

  // UPC-A / EAN-13 Barcode Patterns
  var L_CODES = [
    '0001101', '0011001', '0010011', '0111101', '0100011',
    '0110001', '0101111', '0111011', '0110111', '0001011'
  ];

  var G_CODES = [
    '0100111', '0110011', '0011011', '0100001', '0011101',
    '0111001', '0000101', '0010001', '0001001', '0010111'
  ];

  // R-code is bitwise inverted L-code
  var R_CODES = L_CODES.map(function(l) {
    return l.split('').map(function(b) { return b === '1' ? '0' : '1'; }).join('');
  });

  // EAN-13 Parity combinations based on 1st digit
  var EAN_PARITY = [
    'LLLLLL', 'LLGLGG', 'LLGGLG', 'LLGGGL', 'LGLLGG',
    'LGGLLG', 'LGGGLL', 'LGLGLG', 'LGLGGL', 'LGGLGL'
  ];

  // 1. Synthesize UPC-A Bitstream (95 modules)
  function getUpcABitstream(upc12) {
    if (upc12.length === 11) {
      upc12 += calculateMod10(upc12);
    }
    if (upc12.length !== 12) throw new Error("UPC-A must be 12 digits");

    var bitstream = '101'; // Start guard
    // Left 6 digits (L-codes)
    for (var i = 0; i < 6; i++) {
      var d = parseInt(upc12.charAt(i), 10);
      bitstream += L_CODES[d];
    }
    bitstream += '01010'; // Center guard
    // Right 6 digits (R-codes)
    for (var j = 6; j < 12; j++) {
      var d2 = parseInt(upc12.charAt(j), 10);
      bitstream += R_CODES[d2];
    }
    bitstream += '101'; // Stop guard
    return { bitstream: bitstream, fullCode: upc12 };
  }

  // 2. Synthesize EAN-13 Bitstream (95 modules)
  function getEan13Bitstream(ean13) {
    if (ean13.length === 12) {
      ean13 += calculateMod10(ean13);
    }
    if (ean13.length !== 13) throw new Error("EAN-13 must be 13 digits");

    var first = parseInt(ean13.charAt(0), 10);
    var parity = EAN_PARITY[first];

    var bitstream = '101'; // Start guard
    // First 6 encoded digits (positions 1 to 6)
    for (var i = 1; i <= 6; i++) {
      var d = parseInt(ean13.charAt(i), 10);
      var p = parity.charAt(i - 1);
      bitstream += (p === 'L') ? L_CODES[d] : G_CODES[d];
    }
    bitstream += '01010'; // Center guard
    // Last 6 digits (R-codes)
    for (var j = 7; j <= 12; j++) {
      var d2 = parseInt(ean13.charAt(j), 10);
      bitstream += R_CODES[d2];
    }
    bitstream += '101'; // Stop guard
    return { bitstream: bitstream, fullCode: ean13 };
  }

  // 3. Synthesize Code 128 (Sets B / C Auto)
  var C128_PATTERNS = [
    '11011001100','11001101100','11001100110','10010011000','10010001100','10001001100','10011001000','10011000100',
    '10001100100','11001001000','11001000100','11000100100','10110011100','10011011100','10011001110','10111001100',
    '10011101100','10011100110','11001110010','11001011100','11001001110','11011100100','11001110100','11101101110',
    '11101001100','11100101100','11100100110','11101100100','11100110100','11100110010','11011011000','11011000110',
    '11000110110','10100011000','10001011000','10001000110','10110001000','10001101000','10001100010','11010001000',
    '11000101000','11000100010','10110111000','10110001110','10001101110','10111011000','10111000110','10001110110',
    '11101110110','11010001110','11000101110','11011101000','11011100010','11011101110','11101011000','11101000110',
    '11100010110','11101101000','11101100010','11100011010','11101111010','11001000010','11110001010','10100110000',
    '10100001100','10010110000','10010000110','10000101100','10000100110','10110010000','10110000100','10011010000',
    '10011000010','10000110100','10000110010','11000010010','11001010000','11110111010','11000010100','10001111010',
    '10100111100','10010111100','10010011110','10111100100','10011110100','10011110010','11110100100','11110010100',
    '11110010010','11011011110','11011110110','11110110110','10101111000','10100011110','10001011110','10111101000',
    '10111100010','11110101000','11110100010','10111011110','10111101110','11101011110','11110101110','11010000100',
    '11010010000','11010011100','1100011101011' // 106 = Stop
  ];

  function getCode128Bitstream(text) {
    if (!text) text = "DUALMARK-2027";
    var values = [104]; // Start Code B (104)
    var checksum = 104;

    for (var i = 0; i < text.length; i++) {
      var code = text.charCodeAt(i) - 32;
      if (code < 0 || code > 95) code = 0;
      values.push(code);
      checksum += code * (i + 1);
    }
    var checkDigit = checksum % 103;
    values.push(checkDigit);
    values.push(106); // Stop pattern

    var bitstream = '';
    for (var v = 0; v < values.length; v++) {
      bitstream += C128_PATTERNS[values[v]];
    }
    return { bitstream: bitstream, fullCode: text };
  }

  // 4. Synthesize ITF-14 (Interleaved 2 of 5, 14 digits)
  var I25_WEIGHTS = ['NNWWN', 'WNNNW', 'NWNNW', 'WWNNN', 'NNWNW', 'WNWNN', 'NWWNN', 'NNNWW', 'WNNWN', 'NWNWN'];

  function getItf14Bitstream(itf14) {
    if (itf14.length === 13) itf14 += calculateMod10(itf14);
    if (itf14.length !== 14) throw new Error("ITF-14 must be 14 digits");

    var bitstream = '1010'; // Start: narrow bar, narrow space, narrow bar, narrow space
    for (var i = 0; i < 14; i += 2) {
      var d1 = parseInt(itf14.charAt(i), 10);
      var d2 = parseInt(itf14.charAt(i + 1), 10);
      var barPattern = I25_WEIGHTS[d1];
      var spacePattern = I25_WEIGHTS[d2];

      for (var p = 0; p < 5; p++) {
        var isBarWide = (barPattern.charAt(p) === 'W');
        var isSpaceWide = (spacePattern.charAt(p) === 'W');
        bitstream += isBarWide ? '111' : '1';
        bitstream += isSpaceWide ? '000' : '0';
      }
    }
    bitstream += '11101'; // Stop: wide bar, narrow space, narrow bar
    return { bitstream: bitstream, fullCode: itf14, isItf: true };
  }

  // Render to HTML5 Canvas
  function renderCanvas(canvas, type, rawValue, options) {
    options = options || {};
    var scale = options.scale || 3;
    var barHeight = options.barHeight || 120;
    var darkColor = options.darkColor || '#000000';
    var lightColor = options.lightColor || '#FFFFFF';
    var showText = (options.showText !== undefined) ? options.showText : true;

    var result;
    if (type === 'UPC-A') result = getUpcABitstream(rawValue);
    else if (type === 'EAN-13') result = getEan13Bitstream(rawValue);
    else if (type === 'ITF-14') result = getItf14Bitstream(rawValue);
    else result = getCode128Bitstream(rawValue);

    var bitstream = result.bitstream;
    var quietZone = (type === 'ITF-14') ? 20 : 12;
    var totalModules = bitstream.length + (quietZone * 2);
    var width = totalModules * scale;
    var height = barHeight + (showText ? 36 : 0) + (result.isItf ? 24 : 0);

    canvas.width = width;
    canvas.height = height;
    var ctx = canvas.getContext('2d');

    // Fill background
    ctx.fillStyle = lightColor;
    ctx.fillRect(0, 0, width, height);

    // Draw ITF-14 Bearer Bars Frame if applicable
    if (result.isItf) {
      ctx.fillStyle = darkColor;
      var bearerThickness = 6;
      ctx.fillRect(0, 0, width, bearerThickness); // Top bearer
      ctx.fillRect(0, barHeight + 12, width, bearerThickness); // Bottom bearer
      ctx.fillRect(0, 0, bearerThickness, barHeight + 18); // Left bearer
      ctx.fillRect(width - bearerThickness, 0, bearerThickness, barHeight + 18); // Right bearer
    }

    // Draw Bars
    ctx.fillStyle = darkColor;
    var currentX = quietZone * scale;
    for (var b = 0; b < bitstream.length; b++) {
      if (bitstream.charAt(b) === '1') {
        // Extend guard bars for UPC/EAN
        var isGuard = false;
        if (type === 'UPC-A' || type === 'EAN-13') {
          if (b < 3 || (b >= 45 && b < 50) || b >= bitstream.length - 3) {
            isGuard = true;
          }
        }
        var h = (isGuard && showText) ? barHeight + 8 : barHeight;
        ctx.fillRect(currentX, result.isItf ? 8 : 4, scale, h);
      }
      currentX += scale;
    }

    // Draw Human-Readable Text
    if (showText) {
      ctx.font = '700 ' + (14 * (scale / 2.5)) + 'px "JetBrains Mono", monospace, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = darkColor;
      var textY = height - (result.isItf ? 8 : 6);

      if (type === 'UPC-A') {
        var c = result.fullCode;
        ctx.fillText(c.charAt(0) + '  ' + c.substring(1, 6) + '  ' + c.substring(6, 11) + '  ' + c.charAt(11), width / 2, textY);
      } else if (type === 'EAN-13') {
        var e = result.fullCode;
        ctx.fillText(e.charAt(0) + ' ' + e.substring(1, 7) + ' ' + e.substring(7, 13), width / 2, textY);
      } else {
        ctx.fillText(result.fullCode, width / 2, textY);
      }
    }

    return { canvas: canvas, fullCode: result.fullCode, prefixInfo: lookupPrefix(result.fullCode) };
  }

  // Render to SVG Vector String
  function renderSvg(type, rawValue, options) {
    options = options || {};
    var scale = options.scale || 3;
    var barHeight = options.barHeight || 120;
    var darkColor = options.darkColor || '#000000';
    var lightColor = options.lightColor || '#FFFFFF';
    var showText = (options.showText !== undefined) ? options.showText : true;

    var result;
    if (type === 'UPC-A') result = getUpcABitstream(rawValue);
    else if (type === 'EAN-13') result = getEan13Bitstream(rawValue);
    else if (type === 'ITF-14') result = getItf14Bitstream(rawValue);
    else result = getCode128Bitstream(rawValue);

    var bitstream = result.bitstream;
    var quietZone = (type === 'ITF-14') ? 20 : 12;
    var totalModules = bitstream.length + (quietZone * 2);
    var width = totalModules * scale;
    var height = barHeight + (showText ? 36 : 0) + (result.isItf ? 24 : 0);

    var svg = [];
    svg.push('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + width + ' ' + height + '" width="' + width + '" height="' + height + '">');
    svg.push('<rect width="' + width + '" height="' + height + '" fill="' + lightColor + '"/>');

    if (result.isItf) {
      svg.push('<rect x="0" y="0" width="' + width + '" height="6" fill="' + darkColor + '"/>');
      svg.push('<rect x="0" y="' + (barHeight + 12) + '" width="' + width + '" height="6" fill="' + darkColor + '"/>');
      svg.push('<rect x="0" y="0" width="6" height="' + (barHeight + 18) + '" fill="' + darkColor + '"/>');
      svg.push('<rect x="' + (width - 6) + '" y="0" width="6" height="' + (barHeight + 18) + '" fill="' + darkColor + '"/>');
    }

    var currentX = quietZone * scale;
    for (var b = 0; b < bitstream.length; b++) {
      if (bitstream.charAt(b) === '1') {
        var isGuard = false;
        if (type === 'UPC-A' || type === 'EAN-13') {
          if (b < 3 || (b >= 45 && b < 50) || b >= bitstream.length - 3) isGuard = true;
        }
        var h = (isGuard && showText) ? barHeight + 8 : barHeight;
        var y = result.isItf ? 8 : 4;
        svg.push('<rect x="' + currentX + '" y="' + y + '" width="' + scale + '" height="' + h + '" fill="' + darkColor + '"/>');
      }
      currentX += scale;
    }

    if (showText) {
      var fontSize = 14 * (scale / 2.5);
      var textY = height - (result.isItf ? 8 : 6);
      var txt = result.fullCode;
      if (type === 'UPC-A') {
        txt = txt.charAt(0) + '  ' + txt.substring(1, 6) + '  ' + txt.substring(6, 11) + '  ' + txt.charAt(11);
      } else if (type === 'EAN-13') {
        txt = txt.charAt(0) + ' ' + txt.substring(1, 7) + ' ' + txt.substring(7, 13);
      }
      svg.push('<text x="' + (width / 2) + '" y="' + textY + '" font-family="monospace" font-size="' + fontSize + '" font-weight="bold" text-anchor="middle" fill="' + darkColor + '">' + txt + '</text>');
    }

    svg.push('</svg>');
    return { svg: svg.join(''), fullCode: result.fullCode, prefixInfo: lookupPrefix(result.fullCode) };
  }

  window.DualMarkBarcode1D = {
    calculateMod10: calculateMod10,
    validateMod10: validateMod10,
    lookupPrefix: lookupPrefix,
    renderCanvas: renderCanvas,
    renderSvg: renderSvg
  };

})(window);
