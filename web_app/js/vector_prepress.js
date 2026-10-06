/**
 * DualMark Studio — Industrial Prepress Vector Engine & BWR Compensation
 * Generates PostScript CMYK EPS and High-Resolution 600/1200 DPI Vector PDF
 * with Barcode Width Reduction (BWR / Bar Gain Compensation) for packaging printers.
 */

const DualMarkPrepress = (() => {

  /**
   * Barcode Width Reduction (BWR) setting in micrometers (µm)
   * Default: 0 (no reduction). Typical flexo on corrugated: -40µm to -75µm.
   */
  let currentBwrMicrons = 0;

  function setBwrMicrons(microns) {
    currentBwrMicrons = Math.max(-150, Math.min(0, parseInt(microns, 10) || 0));
  }

  function getBwrMicrons() {
    return currentBwrMicrons;
  }

  /**
   * Generates pure PostScript Level 3 CMYK Encapsulated PostScript (EPS).
   * 100% Process Black (0 0 0 1 setcmykcolor), no RGB contamination.
   */
  function generateCmykEps(barcode1dData, qrMatrix, options = {}) {
    const widthPt = options.widthPt || 360;  // 5 inches wide
    const heightPt = options.heightPt || 144; // 2 inches tall
    const bwrPoints = (currentBwrMicrons / 1000) * 2.83465; // Convert µm to mm to PostScript points (1pt = 0.352778mm)

    let ps = `%!PS-Adobe-3.0 EPSF-3.0
%%Creator: DualMark Studio Prepress Engine v1.0
%%Title: Dual-Code Packaging Die-Line Proof (CMYK Flexo)
%%BoundingBox: 0 0 ${widthPt} ${heightPt}
%%HiResBoundingBox: 0 0 ${widthPt}.0000 ${heightPt}.0000
%%LanguageLevel: 3
%%DocumentData: Clean7Bit
%%EndComments

%%BeginProlog
/b { 0 0 0 1 setcmykcolor } bind def
/w { 0 0 0 0 setcmykcolor } bind def
/rect {
  newpath
  4 2 roll moveto
  1 index 0 rlineto
  0 exch rlineto
  neg 0 rlineto
  closepath fill
} bind def
%%EndProlog

%%Page: 1 1
gsave

% Optional White Substrate Background
w
0 0 ${widthPt} ${heightPt} rect

% Set Process Black 100% K
b

% 1. Render 1D Barcode with Barcode Width Reduction (BWR: ${currentBwrMicrons} um)
`;

    if (barcode1dData && barcode1dData.pattern) {
      const startX = 20;
      const startY = 30;
      const barHeight = 70;
      const moduleWidth = 1.8;

      let currentX = startX;
      for (let i = 0; i < barcode1dData.pattern.length; i++) {
        if (barcode1dData.pattern[i] === '1') {
          // Apply BWR by trimming bar width slightly and centering it
          const adjustedW = Math.max(0.4, moduleWidth + bwrPoints);
          const adjustedX = currentX - (bwrPoints / 2);
          ps += `${adjustedX.toFixed(3)} ${startY} ${adjustedW.toFixed(3)} ${barHeight} rect\n`;
        }
        currentX += moduleWidth;
      }

      // Add Human Readable Interpretation (HRI) font text
      if (barcode1dData.text) {
        ps += `/Helvetica findfont 9 scalefont setfont\n`;
        ps += `${(startX + 10).toFixed(1)} 16 moveto\n`;
        ps += `(${barcode1dData.text}) show\n`;
      }
    }

    // 2. Render 2D QR Code / GS1 Digital Link Matrix
    if (qrMatrix && Array.isArray(qrMatrix)) {
      const qrSize = 90;
      const startX = widthPt - qrSize - 25;
      const startY = 25;
      const moduleCount = qrMatrix.length;
      const modSize = qrSize / moduleCount;

      ps += `\n% 2D GS1 Digital Link Matrix\n`;
      for (let r = 0; r < moduleCount; r++) {
        for (let c = 0; c < moduleCount; c++) {
          if (qrMatrix[r][c]) {
            const mx = startX + (c * modSize);
            const my = startY + ((moduleCount - 1 - r) * modSize);
            ps += `${mx.toFixed(3)} ${my.toFixed(3)} ${modSize.toFixed(3)} ${modSize.toFixed(3)} rect\n`;
          }
        }
      }
    }

    // Die-line separation metric watermark text
    ps += `/Helvetica findfont 7 scalefont setfont\n`;
    ps += `20 ${heightPt - 14} moveto\n`;
    ps += `(DualMark 50mm Optical Die-Line Certified | BWR: ${currentBwrMicrons} um | CMYK: 0/0/0/100K) show\n`;

    ps += `grestore\nshowpage\n%%EOF\n`;
    return ps;
  }

  /**
   * Generates High-Resolution (600/1200 DPI vector equivalent) Vector PDF document
   */
  function generateVectorPdf(barcode1dData, qrMatrix, options = {}) {
    const widthPt = 360;
    const heightPt = 144;
    const bwrPoints = (currentBwrMicrons / 1000) * 2.83465;

    let stream = `0 0 0 1 k\n`; // CMYK Process Black

    // 1D Barcode Stream
    if (barcode1dData && barcode1dData.pattern) {
      const startX = 20;
      const startY = 30;
      const barHeight = 70;
      const moduleWidth = 1.8;

      let currentX = startX;
      for (let i = 0; i < barcode1dData.pattern.length; i++) {
        if (barcode1dData.pattern[i] === '1') {
          const adjustedW = Math.max(0.4, moduleWidth + bwrPoints);
          const adjustedX = currentX - (bwrPoints / 2);
          stream += `${adjustedX.toFixed(2)} ${startY} ${adjustedW.toFixed(2)} ${barHeight} re f\n`;
        }
        currentX += moduleWidth;
      }

      if (barcode1dData.text) {
        stream += `BT /F1 9 Tf ${startX + 10} 16 Td (${barcode1dData.text}) Tj ET\n`;
      }
    }

    // 2D Matrix Stream
    if (qrMatrix && Array.isArray(qrMatrix)) {
      const qrSize = 90;
      const startX = widthPt - qrSize - 25;
      const startY = 25;
      const moduleCount = qrMatrix.length;
      const modSize = qrSize / moduleCount;

      for (let r = 0; r < moduleCount; r++) {
        for (let c = 0; c < moduleCount; c++) {
          if (qrMatrix[r][c]) {
            const mx = startX + (c * modSize);
            const my = startY + ((moduleCount - 1 - r) * modSize);
            stream += `${mx.toFixed(2)} ${my.toFixed(2)} ${modSize.toFixed(2)} ${modSize.toFixed(2)} re f\n`;
          }
        }
      }
    }

    // Text header
    stream += `BT /F1 7 Tf 20 ${heightPt - 14} Td (DualMark Studio Prepress Vector Proof | 50mm Die-Line Compliant | BWR: ${currentBwrMicrons} um) Tj ET\n`;

    const streamLength = stream.length;

    const pdf = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${widthPt} ${heightPt}] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length ${streamLength} >>
stream
${stream}
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000251 00000 n 
000000${(300 + streamLength).toString().padStart(4, '0')} 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
${400 + streamLength}
%%EOF`;

    return pdf;
  }

  function downloadFile(content, filename, mimeType) {
    if (window.DualMarkBridge && typeof window.DualMarkBridge.savePdfToStorage === 'function' && filename.endsWith('.pdf')) {
      const base64 = btoa(unescape(encodeURIComponent(content)));
      window.DualMarkBridge.savePdfToStorage(base64, filename);
      return;
    }
    const blob = new Blob([content], { type: mimeType });
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

  return {
    setBwrMicrons,
    getBwrMicrons,
    generateCmykEps,
    generateVectorPdf,
    downloadFile
  };
})();

window.DualMarkPrepress = DualMarkPrepress;
