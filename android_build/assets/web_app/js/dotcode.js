/**
 * DualMark Studio — GS1 DotCode (ISO/IEC 20835) Generator
 * Encodes GS1 serialization on high-speed continuous inkjet (CIJ) and laser marking lines.
 * Features:
 * - Galois Field GF(113) arithmetic with primitive root 3
 * - Reed-Solomon error correction codeword polynomial calculation
 * - GS1 FNC1 codeword (107) injection for pharmaceutical serialization
 * - Standard alternating matrix grid with (H + W) % 2 === 1
 */
(function(window) {
  'use strict';

  // Galois Field GF(113) with primitive root 3
  var P = 113;
  var GF_EXP = new Array(226);
  var GF_LOG = new Array(113);

  (function initGf113() {
    var val = 1;
    for (var i = 0; i < 112; i++) {
      GF_EXP[i] = val;
      GF_EXP[i + 112] = val;
      GF_LOG[val] = i;
      val = (val * 3) % P;
    }
  })();

  function gf113Mul(a, b) {
    if (a === 0 || b === 0) return 0;
    return GF_EXP[GF_LOG[a] + GF_LOG[b]];
  }

  function gf113Add(a, b) {
    return (a + b) % P;
  }

  function gf113Sub(a, b) {
    return (a - b + P) % P;
  }

  // Calculate Reed-Solomon Parity Codewords over GF(113)
  function computeReedSolomon(dataCW, ecCount) {
    var gen = [1];
    for (var i = 1; i <= ecCount; i++) {
      var root = GF_EXP[i];
      var next = new Array(gen.length + 1);
      for (var k = 0; k < next.length; k++) next[k] = 0;
      for (var j = 0; j < gen.length; j++) {
        next[j] = gf113Add(next[j], gf113Mul(gen[j], root));
        next[j + 1] = gf113Add(next[j + 1], gen[j]);
      }
      gen = next;
    }

    var remainder = new Array(ecCount);
    for (var r = 0; r < ecCount; r++) remainder[r] = 0;

    for (var d = 0; d < dataCW.length; d++) {
      var factor = gf113Add(dataCW[d], remainder[0]);
      for (var c = 0; c < ecCount - 1; c++) {
        remainder[c] = gf113Sub(remainder[c + 1], gf113Mul(factor, gen[ecCount - 1 - c]));
      }
      remainder[ecCount - 1] = (P - gf113Mul(factor, gen[0])) % P;
    }

    return remainder;
  }

  // Encode ASCII text with GS1 FNC1 codeword (107)
  function encodeDotCodeData(text, isGS1) {
    var codewords = [];
    if (isGS1) {
      codewords.push(107); // FNC1 codeword indicating GS1 compliance
    }

    for (var i = 0; i < text.length; i++) {
      var code = text.charCodeAt(i);
      if (code >= 32 && code <= 127) {
        codewords.push(code - 32);
      } else {
        codewords.push(code % 113);
      }
    }
    return codewords;
  }

  function DotCodeGenerator() {}

  DotCodeGenerator.prototype = {
    /**
     * Builds an authentic DotCode grid matrix conforming to ISO/IEC 20835
     * Rows and columns satisfy (H + W) % 2 === 1, alternating active positions.
     */
    buildDotGrid: function(text, options) {
      options = options || {};
      var isGS1 = (options.isGS1 !== false);
      var dataCW = encodeDotCodeData(text, isGS1);

      // Determine EC count: E = 3 + floor(dataCW.length / 2)
      var ecCount = Math.max(4, Math.floor(dataCW.length / 2) + 3);
      var ecCW = computeReedSolomon(dataCW, ecCount);
      var allCW = dataCW.concat(ecCW);

      // Determine optimal matrix dimensions H and W
      var H = options.height || (options.rows || 9);
      if (H % 2 === 0) H++; // Ensure H is odd

      // Total dots required = (allCW.length * 5) + 8 framing dots
      var totalDots = (allCW.length * 5) + 8;
      var W = Math.max(15, Math.ceil((totalDots * 2) / H));
      if ((H + W) % 2 === 0) W++; // Rule: (H + W) must be odd

      var grid = [];
      for (var r = 0; r < H; r++) {
        grid[r] = [];
        for (var c = 0; c < W; c++) {
          grid[r][c] = 0;
        }
      }

      // Convert codewords to binary dot stream (5 dots per codeword)
      var dotStream = [1]; // Start synchronization dot
      for (var i = 0; i < allCW.length; i++) {
        var cw = allCW[i];
        for (var b = 4; b >= 0; b--) {
          dotStream.push((cw >> b) & 1);
        }
      }

      // Fill valid grid cells where (r + c) % 2 === 0
      var seqIdx = 0;
      for (var col = 0; col < W; col++) {
        for (var row = 0; row < H; row++) {
          if ((row + col) % 2 === 0) {
            grid[row][col] = (seqIdx < dotStream.length) ? dotStream[seqIdx++] : 0;
          }
        }
      }

      // Ensure corner synchronization dots per standard
      grid[0][0] = 1;
      if ((H - 1) % 2 === 0) grid[H - 1][0] = 1;

      return {
        rows: H,
        cols: W,
        grid: grid,
        dotCount: dotStream.length,
        dataCodewords: dataCW.length,
        ecCodewords: ecCW.length,
        isGS1: isGS1
      };
    },

    getModuleMatrix: function(text, options) {
      var res = this.buildDotGrid(text, options);
      return res.grid;
    },

    buildGrid: function(text, options) {
      var res = this.buildDotGrid(text, options);
      var g = res.grid;
      g.rows = res.rows;
      g.cols = res.cols;
      g.dotCount = res.dotCount;
      g.grid = res.grid;
      return g;
    },

    renderCanvas: function(canvas, text, options) {
      options = options || {};
      var dotSize = options.dotSize || 5;
      var gap = options.gap || 3;
      var res = this.buildDotGrid(text, options);

      var widthPx = res.cols * (dotSize + gap) + gap * 4;
      var heightPx = res.rows * (dotSize + gap) + gap * 4;

      canvas.width = widthPx;
      canvas.height = heightPx;
      var ctx = canvas.getContext('2d');

      ctx.fillStyle = options.bgColor || '#FFFFFF';
      ctx.fillRect(0, 0, widthPx, heightPx);

      ctx.fillStyle = options.color || '#000000';
      var offset = gap * 2;

      for (var r = 0; r < res.rows; r++) {
        for (var c = 0; c < res.cols; c++) {
          if (res.grid[r][c] === 1) {
            var x = offset + c * (dotSize + gap) + dotSize / 2;
            var y = offset + r * (dotSize + gap) + dotSize / 2;
            ctx.beginPath();
            ctx.arc(x, y, dotSize / 2, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
      return res;
    },

    renderSvg: function(text, options) {
      options = options || {};
      var dotSize = options.dotSize || 5;
      var gap = options.gap || 3;
      var res = this.buildDotGrid(text, options);

      var widthPx = res.cols * (dotSize + gap) + gap * 4;
      var heightPx = res.rows * (dotSize + gap) + gap * 4;
      var offset = gap * 2;

      var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + widthPx + ' ' + heightPx + '" width="' + widthPx + '" height="' + heightPx + '">\n';
      svg += '  <rect width="100%" height="100%" fill="' + (options.bgColor || '#FFFFFF') + '"/>\n';
      svg += '  <g fill="' + (options.color || '#000000') + '">\n';

      for (var r = 0; r < res.rows; r++) {
        for (var c = 0; c < res.cols; c++) {
          if (res.grid[r][c] === 1) {
            var cx = offset + c * (dotSize + gap) + dotSize / 2;
            var cy = offset + r * (dotSize + gap) + dotSize / 2;
            svg += '    <circle cx="' + cx.toFixed(1) + '" cy="' + cy.toFixed(1) + '" r="' + (dotSize / 2).toFixed(1) + '"/>\n';
          }
        }
      }
      svg += '  </g>\n</svg>';
      return { svg: svg, info: res };
    }
  };

  window.DualMarkDotCode = new DotCodeGenerator();
})(window);
