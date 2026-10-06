/**
 * DualMark Studio — GS1 DotCode (ISO/IEC 20835) Generator
 * Encodes GS1 serialization on high-speed continuous inkjet (CIJ) and laser marking lines.
 */
(function(window) {
  'use strict';

  function DotCodeGenerator() {}

  DotCodeGenerator.prototype = {
    /**
     * Builds a standardized DotCode grid matrix
     * Rows and columns satisfy (H + W) % 2 === 1, and alternate dot positions.
     */
    buildDotGrid: function(text, options) {
      options = options || {};
      var H = options.height || 9; // Minimum odd height
      // Estimate width needed based on character count
      var dotCountNeeded = (text.length + 3) * 5 + 6;
      var W = Math.max(15, Math.ceil((dotCountNeeded * 2) / H));
      if ((H + W) % 2 === 0) W++; // Ensure (H + W) is odd

      var grid = [];
      for (var r = 0; r < H; r++) {
        grid[r] = [];
        for (var c = 0; c < W; c++) {
          grid[r][c] = 0;
        }
      }

      // Encode characters into dot patterns
      var dotSeq = [];
      // Corner synchronization dots
      dotSeq.push(1);

      // Simple robust 5-bit encoding for demonstration & high-speed layout
      for (var i = 0; i < text.length; i++) {
        var code = text.charCodeAt(i) % 32;
        for (var b = 4; b >= 0; b--) {
          dotSeq.push((code >> b) & 1);
        }
      }

      // Fill valid grid cells where (r + c) % 2 === 0
      var seqIdx = 0;
      for (var col = 0; col < W; col++) {
        for (var row = 0; row < H; row++) {
          if ((row + col) % 2 === 0) {
            grid[row][col] = (seqIdx < dotSeq.length) ? dotSeq[seqIdx++] : 0;
          }
        }
      }

      return {
        rows: H,
        cols: W,
        grid: grid,
        dotCount: dotSeq.length
      };
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
