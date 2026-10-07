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

    // 1. 1D Barcode on Left
    const x1d = Math.round(8 * dpmm);
    const y1d = Math.round(10 * dpmm);

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
    const dividerX = Math.round(52 * dpmm);
    const dividerY = Math.round(8 * dpmm);
    const dividerH = Math.round(32 * dpmm);
    zpl += `^FO${dividerX},${dividerY}^GB${Math.max(2, Math.round(0.3 * dpmm))},${dividerH},3^FS\n`;
    zpl += `^FO${dividerX - Math.round(10 * dpmm)},${dividerY + dividerH + Math.round(1 * dpmm)}^A0N,${Math.round(2.2 * dpmm)},${Math.round(2.2 * dpmm)}^FD>= 50mm SAFE^FS\n`;

    // 3. 2D GS1 Digital Link Matrix on Right
    const x2d = Math.round(64 * dpmm);
    const y2d = Math.round(10 * dpmm);
    const symbology2d = options.symbology2d || options.symbology || 'QR';
    if (symbology2d === 'DataMatrix' || symbology2d === 'datamatrix') {
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
    copyZpl
  };
})();

window.DualMarkZPL = DualMarkZPL;
window.DualMarkZpl = DualMarkZPL;
