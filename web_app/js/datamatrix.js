/**
 * DualMark Studio — GS1 DataMatrix (ISO/IEC 16022 ECC 200) Generator
 * Encodes GS1 Application Identifiers with FNC1 delimiter for pharmaceutical (FDA UDI),
 * medical device, and high-density industrial packaging.
 */
(function(window) {
  'use strict';

  // Supported square matrix sizes: rows, cols, data CWs, error CWs
  var MATRIX_SIZES = [
    { rows: 10, cols: 10, dataCW: 3, ecCW: 5 },
    { rows: 12, cols: 12, dataCW: 5, ecCW: 7 },
    { rows: 14, cols: 14, dataCW: 8, ecCW: 10 },
    { rows: 16, cols: 16, dataCW: 12, ecCW: 12 },
    { rows: 18, cols: 18, dataCW: 18, ecCW: 14 },
    { rows: 20, cols: 20, dataCW: 22, ecCW: 18 },
    { rows: 22, cols: 22, dataCW: 30, ecCW: 20 },
    { rows: 24, cols: 24, dataCW: 36, ecCW: 24 },
    { rows: 26, cols: 26, dataCW: 44, ecCW: 28 },
    { rows: 32, cols: 32, dataCW: 62, ecCW: 36 },
    { rows: 36, cols: 36, dataCW: 86, ecCW: 42 },
    { rows: 40, cols: 40, dataCW: 114, ecCW: 48 },
    { rows: 44, cols: 44, dataCW: 144, ecCW: 56 }
  ];

  // Galois Field GF(256) with primitive polynomial x^8 + x^5 + x^3 + x^2 + 1 (301 decimal)
  var GF_EXP = new Array(512);
  var GF_LOG = new Array(256);
  (function initGalois() {
    var x = 1;
    for (var i = 0; i < 255; i++) {
      GF_EXP[i] = x;
      GF_LOG[x] = i;
      x <<= 1;
      if (x & 256) x ^= 301;
    }
    for (var j = 255; j < 512; j++) {
      GF_EXP[j] = GF_EXP[j - 255];
    }
  })();

  function gfMul(a, b) {
    if (a === 0 || b === 0) return 0;
    return GF_EXP[GF_LOG[a] + GF_LOG[b]];
  }

  // Generate Reed-Solomon error correction codewords
  function generateEC(dataCW, ecCount) {
    var gen = [1];
    for (var i = 0; i < ecCount; i++) {
      var next = new Array(gen.length + 1);
      for (var k = 0; k < next.length; k++) next[k] = 0;
      for (var j = 0; j < gen.length; j++) {
        next[j] ^= gfMul(gen[j], GF_EXP[i + 1]);
        next[j + 1] ^= gen[j];
      }
      gen = next;
    }

    var ec = new Array(ecCount);
    for (var e = 0; e < ecCount; e++) ec[e] = 0;

    for (var d = 0; d < dataCW.length; d++) {
      var factor = dataCW[d] ^ ec[0];
      for (var c = 0; c < ecCount - 1; c++) {
        ec[c] = ec[c + 1] ^ gfMul(factor, gen[ecCount - 1 - c]);
      }
      ec[ecCount - 1] = gfMul(factor, gen[0]);
    }
    return ec;
  }

  // Encode ASCII text with GS1 FNC1 prefix (CW 232)
  function encodeGS1Data(text, isGS1) {
    var codewords = [];
    if (isGS1) {
      codewords.push(232); // FNC1 codeword indicating GS1 compliance
    }

    var i = 0;
    while (i < text.length) {
      // Check for two consecutive digits for 2-digit numeric compaction
      if (i + 1 < text.length && /\d/.test(text[i]) && /\d/.test(text[i + 1])) {
        var num = parseInt(text.substr(i, 2), 10);
        codewords.push(num + 130);
        i += 2;
      } else {
        var code = text.charCodeAt(i);
        if (code <= 127) {
          codewords.push(code + 1);
        } else {
          codewords.push(235); // Upper shift
          codewords.push(code - 128 + 1);
        }
        i++;
      }
    }
    return codewords;
  }

  // Pad data codewords to target capacity
  function padCodewords(dataCW, targetLength) {
    if (dataCW.length < targetLength) {
      dataCW.push(129); // First pad codeword
      while (dataCW.length < targetLength) {
        var r = ((149 * (dataCW.length + 1)) % 253) + 1;
        var pad = (129 + r) % 254;
        dataCW.push(pad);
      }
    }
    return dataCW;
  }

  // Place codewords into DataMatrix matrix using the standard Utah array algorithm
  function placeModules(matrix, rows, cols, codewords) {
    var r = 4, c = 0, k = 0;
    var totalCW = codewords.length;

    function setModule(row, col, bit) {
      if (row < 0) { row += rows; col += 4 - ((rows + 4) % 8); }
      if (col < 0) { col += cols; row += 4 - ((cols + 4) % 8); }
      row = ((row % rows) + rows) % rows;
      col = ((col % cols) + cols) % cols;
      if (matrix[row] && matrix[row][col] !== undefined) {
        matrix[row][col] = bit ? 1 : 0;
      }
    }

    function placeCorner1(val) {
      setModule(rows - 1, 0, val & 1);
      setModule(rows - 1, 1, val & 2);
      setModule(rows - 1, 2, val & 4);
      setModule(0, cols - 2, val & 8);
      setModule(0, cols - 1, val & 16);
      setModule(1, cols - 1, val & 32);
      setModule(2, cols - 1, val & 64);
      setModule(3, cols - 1, val & 128);
    }

    function placeStandard(row, col, val) {
      setModule(row - 2, col - 2, val & 1);
      setModule(row - 2, col - 1, val & 2);
      setModule(row - 1, col - 2, val & 4);
      setModule(row - 1, col - 1, val & 8);
      setModule(row - 1, col, val & 16);
      setModule(row, col - 2, val & 32);
      setModule(row, col - 1, val & 64);
      setModule(row, col, val & 128);
    }

    do {
      if (r === rows && c === 0) placeCorner1(codewords[k++] || 0);
      do {
        if (r >= 0 && r < rows && c >= 0 && c < cols && matrix[r] && matrix[r][c] === -1) {
          placeStandard(r, c, codewords[k++] || 0);
        }
        r -= 2;
        c += 2;
      } while (r >= 0 && c < cols);
      r += 1;
      c += 3;

      do {
        if (r >= 0 && r < rows && c >= 0 && c < cols && matrix[r] && matrix[r][c] === -1) {
          placeStandard(r, c, codewords[k++] || 0);
        }
        r += 2;
        c -= 2;
      } while (r < rows && c >= 0);
      r += 3;
      c += 1;
    } while (r < rows || c < cols);

    for (var r2 = 0; r2 < rows; r2++) {
      for (var c2 = 0; c2 < cols; c2++) {
        if (matrix[r2][c2] === -1) matrix[r2][c2] = 0;
      }
    }
  }

  // Construct final DataMatrix with L-Finder and Alternating Timing Patterns
  function buildMatrix(text, isGS1) {
    var rawCW = encodeGS1Data(text, isGS1);
    var size = null;
    for (var s = 0; s < MATRIX_SIZES.length; s++) {
      if (MATRIX_SIZES[s].dataCW >= rawCW.length) {
        size = MATRIX_SIZES[s];
        break;
      }
    }
    if (!size) size = MATRIX_SIZES[MATRIX_SIZES.length - 1];

    var dataCW = padCodewords(rawCW.slice(0, size.dataCW), size.dataCW);
    var ecCW = generateEC(dataCW, size.ecCW);
    var allCW = dataCW.concat(ecCW);

    var rows = size.rows;
    var cols = size.cols;
    var matrix = [];
    for (var r = 0; r < rows; r++) {
      matrix[r] = [];
      for (var c = 0; c < cols; c++) matrix[r][c] = -1;
    }

    placeModules(matrix, rows, cols, allCW);

    // Apply borders: Left and Bottom are solid 'L' shape; Top and Right alternate
    for (var i = 0; i < rows; i++) {
      matrix[i][0] = 1; // Left solid
      matrix[i][cols - 1] = (i % 2 === 0) ? 1 : 0; // Right alternate
    }
    for (var j = 0; j < cols; j++) {
      matrix[rows - 1][j] = 1; // Bottom solid
      matrix[0][j] = (j % 2 === 0) ? 0 : 1; // Top alternate
    }

    return {
      size: size,
      matrix: matrix,
      rows: rows,
      cols: cols,
      dataCodewords: dataCW.length,
      isGS1: isGS1
    };
  }

  function renderCanvas(canvas, text, options) {
    options = options || {};
    var isGS1 = (options.isGS1 !== false);
    var res = buildMatrix(text, isGS1);
    var cellSize = options.cellSize || 6;
    var margin = (options.margin !== undefined ? options.margin : 2) * cellSize;

    var widthPx = res.cols * cellSize + margin * 2;
    var heightPx = res.rows * cellSize + margin * 2;

    canvas.width = widthPx;
    canvas.height = heightPx;
    var ctx = canvas.getContext('2d');

    // White substrate
    ctx.fillStyle = options.bgColor || '#FFFFFF';
    ctx.fillRect(0, 0, widthPx, heightPx);

    // Modules
    ctx.fillStyle = options.color || '#000000';
    for (var r = 0; r < res.rows; r++) {
      for (var c = 0; c < res.cols; c++) {
        if (res.matrix[r][c] === 1) {
          ctx.fillRect(margin + c * cellSize, margin + r * cellSize, cellSize, cellSize);
        }
      }
    }
    return res;
  }

  function renderSvg(text, options) {
    options = options || {};
    var isGS1 = (options.isGS1 !== false);
    var res = buildMatrix(text, isGS1);
    var cellSize = options.cellSize || 6;
    var margin = (options.margin !== undefined ? options.margin : 2) * cellSize;

    var widthPx = res.cols * cellSize + margin * 2;
    var heightPx = res.rows * cellSize + margin * 2;

    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + widthPx + ' ' + heightPx + '" width="' + widthPx + '" height="' + heightPx + '">\n';
    svg += '  <rect width="100%" height="100%" fill="' + (options.bgColor || '#FFFFFF') + '"/>\n';
    svg += '  <g fill="' + (options.color || '#000000') + '">\n';

    for (var r = 0; r < res.rows; r++) {
      for (var c = 0; c < res.cols; c++) {
        if (res.matrix[r][c] === 1) {
          svg += '    <rect x="' + (margin + c * cellSize) + '" y="' + (margin + r * cellSize) + '" width="' + cellSize + '" height="' + cellSize + '"/>\n';
        }
      }
    }
    svg += '  </g>\n</svg>';
    return { svg: svg, info: res };
  }

  window.DualMarkDataMatrix = {
    buildMatrix: buildMatrix,
    renderCanvas: renderCanvas,
    renderSvg: renderSvg
  };
})(window);
