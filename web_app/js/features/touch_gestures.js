/**
 * DualMark Studio — Touch Gestures & Interactive Spatial Coordinators
 * Feature Layer: Presentation & user ergonomics coordinator for multi-touch gestures
 * and quadrilateral perspective corner-pin manipulation.
 */
(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.DualMarkTouchGestures = factory();
  }
})(typeof self !== 'undefined' ? self : this, function() {
  'use strict';

  // =========================================================================
  // 1. TWO-FINGER PINCH-TO-ZOOM & PAN COORDINATOR
  // =========================================================================

  class TwoFingerGestureCoordinator {
    constructor(targetElement, options = {}) {
      this.element = targetElement;
      this.minScale = options.minScale || 0.5;
      this.maxScale = options.maxScale || 3.0;
      this.onScale = options.onScale || (() => {});
      this.onPan = options.onPan || (() => {});

      this.currentScale = 1.0;
      this.initialDistance = 0;
      this.initialScale = 1.0;
      this.lastMidpoint = null;

      this._boundTouchStart = this._handleTouchStart.bind(this);
      this._boundTouchMove = this._handleTouchMove.bind(this);
      this._boundTouchEnd = this._handleTouchEnd.bind(this);

      if (this.element) {
        this.element.addEventListener('touchstart', this._boundTouchStart, { passive: false });
        this.element.addEventListener('touchmove', this._boundTouchMove, { passive: false });
        this.element.addEventListener('touchend', this._boundTouchEnd);
        this.element.addEventListener('touchcancel', this._boundTouchEnd);
      }
    }

    _getDistance(t1, t2) {
      const dx = t1.clientX - t2.clientX;
      const dy = t1.clientY - t2.clientY;
      return Math.sqrt(dx * dx + dy * dy);
    }

    _getMidpoint(t1, t2) {
      return {
        x: (t1.clientX + t2.clientX) / 2,
        y: (t1.clientY + t2.clientY) / 2
      };
    }

    _handleTouchStart(e) {
      if (e.touches.length === 2) {
        e.preventDefault();
        this.initialDistance = this._getDistance(e.touches[0], e.touches[1]);
        this.initialScale = this.currentScale;
        this.lastMidpoint = this._getMidpoint(e.touches[0], e.touches[1]);
      }
    }

    _handleTouchMove(e) {
      if (e.touches.length === 2 && this.initialDistance > 0) {
        e.preventDefault();
        const dist = this._getDistance(e.touches[0], e.touches[1]);
        const mid = this._getMidpoint(e.touches[0], e.touches[1]);

        const rawScale = this.initialScale * (dist / this.initialDistance);
        this.currentScale = Math.max(this.minScale, Math.min(this.maxScale, rawScale));

        if (this.lastMidpoint) {
          const dx = mid.x - this.lastMidpoint.x;
          const dy = mid.y - this.lastMidpoint.y;
          this.onPan(dx, dy);
        }

        this.lastMidpoint = mid;
        this.onScale(this.currentScale, mid);
      }
    }

    _handleTouchEnd(e) {
      if (e.touches.length < 2) {
        this.initialDistance = 0;
        this.lastMidpoint = null;
      }
    }

    setScale(s) {
      this.currentScale = Math.max(this.minScale, Math.min(this.maxScale, s));
    }

    destroy() {
      if (this.element) {
        this.element.removeEventListener('touchstart', this._boundTouchStart);
        this.element.removeEventListener('touchmove', this._boundTouchMove);
        this.element.removeEventListener('touchend', this._boundTouchEnd);
        this.element.removeEventListener('touchcancel', this._boundTouchEnd);
      }
    }
  }

  // =========================================================================
  // 2. QUADRILATERAL CORNER-PIN BOUNDING CONSTRAINT CLAMPS
  // =========================================================================

  class QuadrilateralCornerPinCoordinator {
    constructor(canvasWidthOrOptions, canvasHeight = null, initialCorners = null) {
      let w = 640;
      let h = 480;
      let corners = initialCorners;

      if (typeof canvasWidthOrOptions === 'object' && canvasWidthOrOptions !== null) {
        w = canvasWidthOrOptions.width || 640;
        h = canvasWidthOrOptions.height || 480;
        corners = canvasWidthOrOptions.corners || null;
      } else if (typeof canvasWidthOrOptions === 'number') {
        w = canvasWidthOrOptions;
        h = canvasHeight || 480;
      }

      this.width = w;
      this.height = h;
      this.pinRadius = 14;
      this.activePin = null; // 0, 1, 2, 3

      // Order: [Top-Left, Top-Right, Bottom-Right, Bottom-Left]
      this.corners = corners || [
        { x: this.width * 0.15, y: this.height * 0.15 },
        { x: this.width * 0.85, y: this.height * 0.15 },
        { x: this.width * 0.85, y: this.height * 0.85 },
        { x: this.width * 0.15, y: this.height * 0.85 }
      ];
    }

    setDimensions(w, h) {
      this.width = w;
      this.height = h;
    }

    getCorners() {
      return this.corners.map(p => ({ x: p.x, y: p.y }));
    }

    isPointInside(x, y) {
      let inside = false;
      for (let i = 0, j = 3; i < 4; j = i++) {
        const xi = this.corners[i].x, yi = this.corners[i].y;
        const xj = this.corners[j].x, yj = this.corners[j].y;
        const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
      }
      return inside;
    }

    setCorners(newCorners) {
      if (newCorners && newCorners.length === 4) {
        this.corners = newCorners.map(p => this.clampPoint(p.x, p.y));
      }
    }

    clampPoint(x, y) {
      const margin = 4;
      return {
        x: Math.max(margin, Math.min(this.width - margin, x)),
        y: Math.max(margin, Math.min(this.height - margin, y))
      };
    }

    hitTest(x, y) {
      for (let i = 0; i < 4; i++) {
        const dx = x - this.corners[i].x;
        const dy = y - this.corners[i].y;
        if (Math.sqrt(dx * dx + dy * dy) <= this.pinRadius * 1.5) {
          return i;
        }
      }
      return null;
    }

    startDrag(x, y) {
      this.activePin = this.hitTest(x, y);
      return this.activePin !== null;
    }

    drag(x, y) {
      if (this.activePin === null) return false;
      const clamped = this.clampPoint(x, y);

      // Candidate corners
      const testCorners = [...this.corners];
      testCorners[this.activePin] = clamped;

      // Verify convex polygon constraint (prevent self-intersecting or inverted quadrilateral)
      if (this.isConvex(testCorners)) {
        this.corners[this.activePin] = clamped;
        return true;
      }
      return false;
    }

    endDrag() {
      this.activePin = null;
    }

    /**
     * Cross product of vectors (P1 - P0) and (P2 - P1)
     */
    _crossProduct(p0, p1, p2) {
      const dx1 = p1.x - p0.x;
      const dy1 = p1.y - p0.y;
      const dx2 = p2.x - p1.x;
      const dy2 = p2.y - p1.y;
      return dx1 * dy2 - dy1 * dx2;
    }

    /**
     * Checks if the 4 points form a convex, non-self-intersecting quadrilateral
     */
    isConvex(pts = this.corners) {
      let positive = 0;
      let negative = 0;
      for (let i = 0; i < 4; i++) {
        const p0 = pts[i];
        const p1 = pts[(i + 1) % 4];
        const p2 = pts[(i + 2) % 4];
        const cp = this._crossProduct(p0, p1, p2);
        if (cp > 0) positive++;
        if (cp < 0) negative++;
      }
      return positive === 4 || negative === 4;
    }

    /**
     * Renders corner pin guidelines and circular grips on canvas context
     */
    render(ctx) {
      if (!ctx) return;
      ctx.save();

      // Draw bounding quadrilateral polygon
      ctx.strokeStyle = '#00F0FF';
      ctx.fillStyle = 'rgba(0, 240, 255, 0.12)';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);

      ctx.beginPath();
      ctx.moveTo(this.corners[0].x, this.corners[0].y);
      for (let i = 1; i < 4; i++) {
        ctx.lineTo(this.corners[i].x, this.corners[i].y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Draw corner pin handles
      ctx.setLineDash([]);
      for (let i = 0; i < 4; i++) {
        const pt = this.corners[i];
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, this.pinRadius, 0, Math.PI * 2);
        ctx.fillStyle = (i === this.activePin) ? '#10B981' : '#00F0FF';
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        ctx.fillStyle = '#0F172A';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(i + 1), pt.x, pt.y);
      }

      ctx.restore();
    }
  }

  return {
    TwoFingerGestureCoordinator,
    QuadrilateralCornerPinCoordinator
  };
});
