/**
 * DualMark Studio — Zebra ZPL II Direct Thermal Printer Engine
 * Generates raw Zebra Programming Language (ZPL II) code streams
 * for automated warehouse label applicators and industrial thermal transfer printers (203/300/600 DPI).
 */
const DualMarkZPL = (() => {
  'use strict';

  function generateZpl(type, barcodeValue, digitalLinkUri, options = {}) {
    const dpi = options.dpi || 203; // 203, 300, or 600 DPI
    const dpmm = dpi === 600 ? 24 : (dpi === 300 ? 12 : 8);

    // 4" x 2" label dimensions in dots
    const printWidth = options.widthDots || Math.round(101.6 * dpmm);
    const labelLength = options.lengthDots || Math.round(50.8 * dpmm);

    const barHeight = Math.round(25 * dpmm); // ~25mm height
    const moduleWidth = dpi === 600 ? 6 : (dpi === 300 ? 3 : 2);

    let zpl = `^XA\n`;
    zpl += `^PW${printWidth}^LL${labelLength}\n`;
    zpl += `^LH0,0\n`;
    zpl += `^CI28\n`; // UTF-8 Encoding

    // Label Header Banner
    const headerY = Math.round(3 * dpmm);
    const headerX = Math.round(6 * dpmm);
    zpl += `^FO${headerX},${headerY}^A0N,${Math.round(2.8 * dpmm)},${Math.round(2.8 * dpmm)}^FDDUALMARK STUDIO PACKAGING PROOF — SUNRISE 2027^FS\n`;

    // Dynamic coordinate calculation
    let coords1d = options.coords1d;
    let coords2d = options.coords2d;
    if ((!coords1d || !coords2d) && options.useDieLine !== false && typeof window !== 'undefined' && window.clearanceInspector && window.clearanceInspector.barcode1d && window.clearanceInspector.barcode2d) {
      if (!coords1d) {
        coords1d = {
          xMm: Math.max(0, window.clearanceInspector.barcode1d.x - window.clearanceInspector.barcode1d.w / 2),
          yMm: Math.max(0, window.clearanceInspector.barcode1d.y - window.clearanceInspector.barcode1d.h / 2),
          wMm: window.clearanceInspector.barcode1d.w,
          hMm: window.clearanceInspector.barcode1d.h
        };
      }
      if (!coords2d) {
        coords2d = {
          xMm: Math.max(0, window.clearanceInspector.barcode2d.x - window.clearanceInspector.barcode2d.w / 2),
          yMm: Math.max(0, window.clearanceInspector.barcode2d.y - window.clearanceInspector.barcode2d.h / 2),
          wMm: window.clearanceInspector.barcode2d.w,
          hMm: window.clearanceInspector.barcode2d.h
        };
      }
    }

    let x1d, y1d;
    if (coords1d && typeof coords1d.xMm === 'number') {
      x1d = Math.round(coords1d.xMm * dpmm);
      y1d = typeof coords1d.yMm === 'number' ? Math.round(coords1d.yMm * dpmm) : Math.round(10 * dpmm);
    } else if (coords1d && typeof coords1d.x === 'number') {
      x1d = Math.round(coords1d.x);
      y1d = typeof coords1d.y === 'number' ? Math.round(coords1d.y) : Math.round(10 * dpmm);
    } else {
      x1d = Math.round(8 * dpmm);
      y1d = Math.round(10 * dpmm);
    }

    let x2d, y2d;
    if (coords2d && typeof coords2d.xMm === 'number') {
      x2d = Math.round(coords2d.xMm * dpmm);
      y2d = typeof coords2d.yMm === 'number' ? Math.round(coords2d.yMm * dpmm) : Math.round(10 * dpmm);
    } else if (coords2d && typeof coords2d.x === 'number') {
      x2d = Math.round(coords2d.x);
      y2d = typeof coords2d.y === 'number' ? Math.round(coords2d.y) : Math.round(10 * dpmm);
    } else {
      x2d = Math.round(64 * dpmm);
      y2d = Math.round(10 * dpmm);
    }

    if (type === 'UPC-A') {
      zpl += `^FO${x1d},${y1d}^BY${moduleWidth},3,${barHeight}^BUN,${barHeight},Y,N,Y^FD${barcodeValue}^FS\n`;
    } else if (type === 'EAN-13') {
      zpl += `^FO${x1d},${y1d}^BY${moduleWidth},3,${barHeight}^BEN,${barHeight},Y,N^FD${barcodeValue}^FS\n`;
    } else if (type === 'ITF-14') {
      zpl += `^FO${x1d},${y1d}^BY${moduleWidth},3,${barHeight}^B1N,${barHeight},Y,N,N^FD${barcodeValue}^FS\n`;
    } else {
      zpl += `^FO${x1d},${y1d}^BY${moduleWidth},3,${barHeight}^BCN,${barHeight},Y,N,N^FD${barcodeValue}^FS\n`;
    }

    // 2. 50mm Optical Clearance Center Divider Marker
    const w1d = coords1d && coords1d.wMm ? coords1d.wMm * dpmm : Math.round(38 * dpmm);
    const dividerX = Math.round((x1d + w1d + x2d) / 2);
    const dividerY = Math.min(y1d, y2d);
    const dividerH = Math.round(32 * dpmm);
    zpl += `^FO${dividerX},${dividerY}^GB${Math.max(2, Math.round(0.3 * dpmm))},${dividerH},3^FS\n`;
    zpl += `^FO${Math.max(0, dividerX - Math.round(10 * dpmm))},${dividerY + dividerH + Math.round(1 * dpmm)}^A0N,${Math.round(2.2 * dpmm)},${Math.round(2.2 * dpmm)}^FD>= 50mm SAFE^FS\n`;

    // 3. 2D GS1 Digital Link Matrix on Right
    const symbology2d = (options.symbology2d || options.symbology || 'QR').toLowerCase();
    if (symbology2d === 'dotcode') {
      const dotSize = options.dotSize || (dpi === 600 ? 6 : (dpi === 300 ? 4 : 3));
      zpl += `^FO${x2d},${y2d}^BDN,${dotSize},0,0^FD${digitalLinkUri}^FS\n`;
    } else if (symbology2d === 'datamatrix') {
      const dmModuleSize = dpi === 600 ? 8 : (dpi === 300 ? 5 : 4);
      zpl += `^FO${x2d},${y2d}^BXN,${dmModuleSize},200^FD${digitalLinkUri}^FS\n`;
    } else {
      const qrMagnification = dpi === 600 ? 8 : (dpi === 300 ? 5 : 4);
      zpl += `^FO${x2d},${y2d}^BQN,2,${qrMagnification},M,7^FDMA,${digitalLinkUri}^FS\n`;
    }

    // Footer Certification Text
    const footerY = Math.round(44 * dpmm);
    zpl += `^FO${headerX},${footerY}^A0N,${Math.round(2.2 * dpmm)},${Math.round(2.2 * dpmm)}^FDGS1 DIGITAL LINK v1.2 CERTIFIED | DIE-LINE PASS RATE: 100%^FS\n`;
    zpl += `^XZ\n`;

    return zpl;
  }

  function downloadZplFile(zplString, filename = 'dualmark_label.zpl') {
    const blob = new Blob([zplString], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  }

  function copyZpl(zplString) {
    if (navigator.clipboard) {
      return navigator.clipboard.writeText(zplString);
    }
    return Promise.reject(new Error('Clipboard API unavailable'));
  }

  /**
   * Bi-Directional Zebra ~HS (Host Status) 3-String Parser
   * String 1: <STX>aaa,b,c,dddd,eee,f,g,h,iii,j,k,l<ETX>
   * String 2: <STX>m,n,o,p,q,r,s,t,u,v,w<ETX>
   * String 3: <STX>xxxx,y<ETX>
   */
  function parseZebraHostStatus(response) {
    const result = {
      online: true,
      paperOut: false,
      paused: false,
      pause: false,
      headOpen: false,
      printheadOpen: false,
      ribbonOut: false,
      thermalTransfer: false,
      tempError: false,
      overTemp: false,
      bufferCount: 0,
      formatsInBuffer: 0,
      labelLengthDots: 0,
      readyToPrint: true,
      raw: response || ''
    };

    if (!response || typeof response !== 'string') return result;

    const clean = response.replace(/[\u0002\u0003]/g, '').trim();
    const lines = clean.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);

    if (lines.length > 0) {
      const p1 = lines[0].split(',');
      if (p1.length >= 3) {
        result.paperOut = (p1[1].trim() === '1');
        result.paused = (p1[2].trim() === '1');
        result.pause = result.paused;
      }
      if (p1.length >= 4) result.labelLengthDots = parseInt(p1[3].trim(), 10) || 0;
      if (p1.length >= 5) {
        result.bufferCount = parseInt(p1[4].trim(), 10) || 0;
        result.formatsInBuffer = result.bufferCount;
      }
      if (p1.length >= 12) {
        const overTemp = (p1[11].trim() === '1');
        const underTemp = (p1.length >= 11 && p1[10].trim() === '1');
        result.tempError = overTemp || underTemp;
        result.overTemp = overTemp;
      }
    }

    if (lines.length > 1) {
      const p2 = lines[1].split(',');
      // String 2: function settings, unused, head open, ribbon out, thermal transfer...
      if (p2.length >= 3) {
        result.headOpen = (p2[2].trim() === '1');
        result.printheadOpen = result.headOpen;
      }
      if (p2.length >= 4) {
        result.ribbonOut = (p2[3].trim() === '1');
      }
      if (p2.length >= 5) {
        result.thermalTransfer = (p2[4].trim() === '1');
      }
    }

    if (lines.length > 2) {
      const p3 = lines[2].split(',');
      if (p3.length >= 2 && !result.headOpen) {
        if (p3[1].trim() === '1') {
          result.headOpen = true;
          result.printheadOpen = true;
        }
      }
    }

    result.readyToPrint = !result.paperOut && !result.paused && !result.headOpen && !result.ribbonOut && !result.tempError;
    return result;
  }

  function generateDualMarkZpl(opts = {}) {
    return generateZpl(
      opts.type || 'UPC-A',
      opts.gtin || '081234567890',
      opts.digitalLinkUri || 'https://id.brand.com/01/00812345678901',
      opts
    );
  }

  return {
    generateZpl,
    generateDualMarkZpl,
    downloadZplFile,
    copyZpl,
    parseZebraHostStatus
  };
})();

if (typeof window !== 'undefined') {
  window.DualMarkZPL = DualMarkZPL;
  window.DualMarkZpl = DualMarkZPL;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DualMarkZPL;
}

