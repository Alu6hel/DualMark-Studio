/**
 * DualMark Studio — Headless Computer Vision & Geometric Transforms Engine
 * Functionality Layer: Pure mathematical calculations with ZERO UI / DOM dependencies.
 * Operates headlessly in Browser Web Workers, Node.js CLI, and Service Workers.
 *
 * Implements:
 * 1. 3x3 Projective Homography Matrix Solver via Gaussian Elimination on 8 Linear Equations
 * 2. Bilinear Inverse Transformation & Bicubic Interpolation Spline Kernels
 * 3. Otsu Adaptive Thresholding & Rec. 709 Grayscale Luminance Filters
 */
(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.DualMarkCvGeometry = factory();
  }
})(typeof self !== 'undefined' ? self : this, function() {
  'use strict';

  // =========================================================================
  // 1. 3x3 PROJECTIVE HOMOGRAPHY MATRIX SOLVER
  // =========================================================================

  /**
   * Solves 3x3 Projective Homography Matrix mapping 4 source points to 4 destination points.
   * Uses Gaussian Elimination with Partial Pivoting to solve 8 equations for 8 unknowns.
   *
   * Equations for each correspondence point pair (x, y) -> (u, v):
   * h00*x + h01*y + h02 - h20*x*u - h21*y*u = u
   * h10*x + h11*y + h12 - h20*x*v - h21*y*v = v
   * With h22 = 1.0.
   */
  function solveHomography(srcPts, dstPts) {
    if (!srcPts || !dstPts || srcPts.length !== 4 || dstPts.length !== 4) {
      throw new Error('Homography requires exactly 4 source and 4 destination points');
    }

    // 8x9 augmented matrix [A | B]
    const A = [];
    for (let i = 0; i < 4; i++) {
      const x = srcPts[i].x;
      const y = srcPts[i].y;
      const u = dstPts[i].x;
      const v = dstPts[i].y;

      // Row 2*i: u equation
      A.push([x, y, 1, 0, 0, 0, -x * u, -y * u, u]);
      // Row 2*i+1: v equation
      A.push([0, 0, 0, x, y, 1, -x * v, -y * v, v]);
    }

    const N = 8;
    // Gaussian elimination with partial pivoting
    for (let p = 0; p < N; p++) {
      // Find pivot row
      let maxRow = p;
      let maxVal = Math.abs(A[p][p]);
      for (let r = p + 1; r < N; r++) {
        const val = Math.abs(A[r][p]);
        if (val > maxVal) {
          maxVal = val;
          maxRow = r;
        }
      }

      if (maxVal < 1e-12) {
        throw new Error('Degenerate points: Homography matrix is singular or colinear');
      }

      // Swap rows
      if (maxRow !== p) {
        const tmp = A[p];
        A[p] = A[maxRow];
        A[maxRow] = tmp;
      }

      // Eliminate rows below
      for (let r = p + 1; r < N; r++) {
        const factor = A[r][p] / A[p][p];
        A[r][p] = 0;
        for (let c = p + 1; c <= N; c++) {
          A[r][c] -= factor * A[p][c];
        }
      }
    }

    // Back-substitution
    const h = new Array(8);
    for (let r = N - 1; r >= 0; r--) {
      let sum = A[r][N];
      for (let c = r + 1; c < N; c++) {
        sum -= A[r][c] * h[c];
      }
      h[r] = sum / A[r][r];
    }

    // 3x3 matrix in row-major order:
    // [ h[0], h[1], h[2] ]
    // [ h[3], h[4], h[5] ]
    // [ h[6], h[7], 1.0  ]
    const H = [
      h[0], h[1], h[2],
      h[3], h[4], h[5],
      h[6], h[7], 1.0
    ];

    return H;
  }

  /**
   * Computes the exact 3x3 matrix inverse H^-1 via cofactor matrix / determinant.
   */
  function invertHomography(H) {
    const a = H[0], b = H[1], c = H[2];
    const d = H[3], e = H[4], f = H[5];
    const g = H[6], h = H[7], k = H[8];

    const det = a * (e * k - f * h) - b * (d * k - f * g) + c * (d * h - e * g);
    if (Math.abs(det) < 1e-12) {
      throw new Error('Homography matrix is non-invertible');
    }

    const invDet = 1.0 / det;
    return [
      (e * k - f * h) * invDet,
      (c * h - b * k) * invDet,
      (b * f - c * e) * invDet,

      (f * g - d * k) * invDet,
      (a * k - c * g) * invDet,
      (c * d - a * f) * invDet,

      (d * h - e * g) * invDet,
      (b * g - a * h) * invDet,
      (a * e - b * d) * invDet
    ];
  }

  /**
   * Transforms point (x, y) using homography matrix H.
   * [u, v, w]^T = H * [x, y, 1]^T, normalized to (u/w, v/w).
   */
  function transformPoint(H, x, y) {
    const u = H[0] * x + H[1] * y + H[2];
    const v = H[3] * x + H[4] * y + H[5];
    const w = H[6] * x + H[7] * y + H[8];

    if (Math.abs(w) < 1e-12) return { x: 0, y: 0 };
    return {
      x: u / w,
      y: v / w
    };
  }

  // =========================================================================
  // 2. IMAGE RESAMPLING & INTERPOLATION KERNELS
  // =========================================================================

  /**
   * Sub-pixel Bilinear Interpolation
   */
  function sampleBilinear(pixels, width, height, x, y, channels = 4) {
    if (x < 0 || x >= width - 1 || y < 0 || y >= height - 1) {
      const cx = Math.max(0, Math.min(width - 1, Math.round(x)));
      const cy = Math.max(0, Math.min(height - 1, Math.round(y)));
      const idx = (cy * width + cx) * channels;
      const res = [];
      for (let ch = 0; ch < channels; ch++) res.push(pixels[idx + ch]);
      return res;
    }

    const x0 = Math.floor(x);
    const y0 = Math.floor(y);
    const x1 = x0 + 1;
    const y1 = y0 + 1;

    const dx = x - x0;
    const dy = y - y0;
    const w00 = (1 - dx) * (1 - dy);
    const w10 = dx * (1 - dy);
    const w01 = (1 - dx) * dy;
    const w11 = dx * dy;

    const idx00 = (y0 * width + x0) * channels;
    const idx10 = (y0 * width + x1) * channels;
    const idx01 = (y1 * width + x0) * channels;
    const idx11 = (y1 * width + x1) * channels;

    const out = [];
    for (let ch = 0; ch < channels; ch++) {
      const val = w00 * pixels[idx00 + ch] +
                  w10 * pixels[idx10 + ch] +
                  w01 * pixels[idx01 + ch] +
                  w11 * pixels[idx11 + ch];
      out.push(Math.round(val));
    }
    return out;
  }

  /**
   * Bicubic Spline Weighting Kernel (Catmull-Rom cubic spline, a = -0.5)
   */
  function cubicWeight(t) {
    const a = -0.5;
    const x = Math.abs(t);
    if (x <= 1.0) {
      return (a + 2.0) * x * x * x - (a + 3.0) * x * x + 1.0;
    } else if (x < 2.0) {
      return a * x * x * x - 5.0 * a * x * x + 8.0 * a * x - 4.0 * a;
    }
    return 0.0;
  }

  /**
   * Sub-pixel Bicubic Interpolation over 4x4 (16 pixels) neighborhood
   */
  function sampleBicubic(pixels, width, height, x, y, channels = 4) {
    const x0 = Math.floor(x);
    const y0 = Math.floor(y);

    const out = new Array(channels).fill(0);
    let totalWeight = 0;

    for (let m = -1; m <= 2; m++) {
      const py = Math.max(0, Math.min(height - 1, y0 + m));
      const wy = cubicWeight(y - (y0 + m));

      for (let n = -1; n <= 2; n++) {
        const px = Math.max(0, Math.min(width - 1, x0 + n));
        const wx = cubicWeight(x - (x0 + n));
        const w = wx * wy;
        totalWeight += w;

        const idx = (py * width + px) * channels;
        for (let ch = 0; ch < channels; ch++) {
          out[ch] += pixels[idx + ch] * w;
        }
      }
    }

    if (totalWeight !== 0) {
      for (let ch = 0; ch < channels; ch++) {
        out[ch] = Math.max(0, Math.min(255, Math.round(out[ch] / totalWeight)));
      }
    }
    return out;
  }

  /**
   * Headless Perspective Warp: Resamples srcPixels using inverse homography H^-1 into dstPixels
   */
  function warpPerspective(srcPixels, srcW, srcH, dstW, dstH, H, interp = 'bilinear', channels = 4) {
    const invH = invertHomography(H);
    const dstPixels = new Uint8Array(dstW * dstH * channels);

    const sampleFn = (interp === 'bicubic') ? sampleBicubic : sampleBilinear;

    for (let dstY = 0; dstY < dstH; dstY++) {
      for (let dstX = 0; dstX < dstW; dstX++) {
        // Map destination coordinate back to source image coordinate
        const srcCoord = transformPoint(invH, dstX, dstY);
        const sampled = sampleFn(srcPixels, srcW, srcH, srcCoord.x, srcCoord.y, channels);
        const dstIdx = (dstY * dstW + dstX) * channels;
        for (let ch = 0; ch < channels; ch++) {
          dstPixels[dstIdx + ch] = sampled[ch];
        }
      }
    }

    return dstPixels;
  }

  // =========================================================================
  // 3. COMPUTER VISION PREPROCESSING & OTSU THRESHOLDING
  // =========================================================================

  /**
   * Converts RGBA/RGB pixel buffer to 8-bit Grayscale via Rec. 709 Relative Luminance:
   * Y = 0.2126*R + 0.7152*G + 0.0722*B
   */
  function toGrayscale(pixels, width, height, channels = 4) {
    const gray = new Uint8Array(width * height);
    const totalPixels = width * height;
    for (let i = 0; i < totalPixels; i++) {
      const idx = i * channels;
      const lum = 0.2126 * pixels[idx] + 0.7152 * pixels[idx + 1] + 0.0722 * pixels[idx + 2];
      gray[i] = Math.round(lum);
    }
    return gray;
  }

  /**
   * Otsu's Adaptive Global Binarization Threshold
   * Iterates thresholds t in [0, 255] to maximize between-class variance sigma_B^2(t):
   * sigma_B^2(t) = omega_0(t) * omega_1(t) * (mu_0(t) - mu_1(t))^2
   */
  function calcOtsuThreshold(grayPixels, width, height) {
    const totalPixels = width * height;
    const histogram = new Int32Array(256);

    for (let i = 0; i < totalPixels; i++) {
      histogram[grayPixels[i]]++;
    }

    let sumTotal = 0;
    for (let i = 0; i < 256; i++) {
      sumTotal += i * histogram[i];
    }

    let weightBackground = 0;
    let sumBackground = 0;
    let maxVariance = 0;
    let optimalThreshold = 128;

    for (let t = 0; t < 256; t++) {
      weightBackground += histogram[t];
      if (weightBackground === 0) continue;

      const weightForeground = totalPixels - weightBackground;
      if (weightForeground === 0) break;

      sumBackground += t * histogram[t];
      const meanBackground = sumBackground / weightBackground;
      const meanForeground = (sumTotal - sumBackground) / weightForeground;

      const meanDiff = meanBackground - meanForeground;
      const betweenClassVariance = weightBackground * weightForeground * meanDiff * meanDiff;

      if (betweenClassVariance > maxVariance) {
        maxVariance = betweenClassVariance;
        optimalThreshold = t;
      }
    }

    return optimalThreshold;
  }

  /**
   * Binarizes an 8-bit grayscale image using a threshold value into 0 (dark) or 255 (light).
   */
  function binarize(grayPixels, width, height, threshold = null) {
    const T = (threshold !== null) ? threshold : calcOtsuThreshold(grayPixels, width, height);
    const out = new Uint8Array(width * height);
    for (let i = 0; i < grayPixels.length; i++) {
      out[i] = (grayPixels[i] >= T) ? 255 : 0;
    }
    return {
      binary: out,
      threshold: T
    };
  }

  return {
    solveHomography,
    invertHomography,
    transformPoint,
    sampleBilinear,
    sampleBicubic,
    warpPerspective,
    toGrayscale,
    calcOtsuThreshold,
    binarize
  };
});
