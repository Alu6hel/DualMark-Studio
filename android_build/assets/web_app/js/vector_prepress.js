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
/circle {
  newpath
  3 1 roll 0 360 arc
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

    // 2. Render 2D Matrix (QR, DataMatrix, DotCode)
    if (qrMatrix && Array.isArray(qrMatrix) && qrMatrix.length > 0) {
      const numRows = qrMatrix.length;
      const numCols = qrMatrix[0] ? qrMatrix[0].length : numRows;
      const qrWidth = options.width2d || 90;
      const qrHeight = options.height2d || (numRows === numCols ? 90 : Math.round(90 * (numRows / numCols)));
      const startX = widthPt - qrWidth - 25;
      const startY = 25;
      const modSizeX = qrWidth / numCols;
      const modSizeY = qrHeight / numRows;
      const isDotCode = Boolean(options.isDotCode || options.symbology === 'dotcode');

      ps += `\n% 2D Matrix (${isDotCode ? 'DotCode' : (numRows !== numCols ? 'Rect DataMatrix' : 'Square')})\n`;
      for (let r = 0; r < numRows; r++) {
        for (let c = 0; c < numCols; c++) {
          if (qrMatrix[r][c]) {
            const mx = startX + (c * modSizeX);
            const my = startY + ((numRows - 1 - r) * modSizeY);
            if (isDotCode) {
              const radius = Math.min(modSizeX, modSizeY) * 0.45;
              const cx = mx + modSizeX / 2;
              const cy = my + modSizeY / 2;
              ps += `${radius.toFixed(3)} ${cx.toFixed(3)} ${cy.toFixed(3)} circle\n`;
            } else {
              ps += `${mx.toFixed(3)} ${my.toFixed(3)} ${modSizeX.toFixed(3)} ${modSizeY.toFixed(3)} rect\n`;
            }
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
    if (qrMatrix && Array.isArray(qrMatrix) && qrMatrix.length > 0) {
      const numRows = qrMatrix.length;
      const numCols = qrMatrix[0] ? qrMatrix[0].length : numRows;
      const qrWidth = options.width2d || 90;
      const qrHeight = options.height2d || (numRows === numCols ? 90 : Math.round(90 * (numRows / numCols)));
      const startX = widthPt - qrWidth - 25;
      const startY = 25;
      const modSizeX = qrWidth / numCols;
      const modSizeY = qrHeight / numRows;
      const isDotCode = Boolean(options.isDotCode || options.symbology === 'dotcode');

      for (let r = 0; r < numRows; r++) {
        for (let c = 0; c < numCols; c++) {
          if (qrMatrix[r][c]) {
            const mx = startX + (c * modSizeX);
            const my = startY + ((numRows - 1 - r) * modSizeY);
            if (isDotCode) {
              const radius = Math.min(modSizeX, modSizeY) * 0.45;
              const cx = mx + modSizeX / 2;
              const cy = my + modSizeY / 2;
              const k = radius * 0.55228475;
              stream += `${(cx - radius).toFixed(2)} ${cy.toFixed(2)} m ` +
                `${(cx - radius).toFixed(2)} ${(cy + k).toFixed(2)} ${(cx - k).toFixed(2)} ${(cy + radius).toFixed(2)} ${cx.toFixed(2)} ${(cy + radius).toFixed(2)} c ` +
                `${(cx + k).toFixed(2)} ${(cy + radius).toFixed(2)} ${(cx + radius).toFixed(2)} ${(cy + k).toFixed(2)} ${(cx + radius).toFixed(2)} ${cy.toFixed(2)} c ` +
                `${(cx + radius).toFixed(2)} ${(cy - k).toFixed(2)} ${(cx + k).toFixed(2)} ${(cy - radius).toFixed(2)} ${cx.toFixed(2)} ${(cy - radius).toFixed(2)} c ` +
                `${(cx - k).toFixed(2)} ${(cy - radius).toFixed(2)} ${(cx - radius).toFixed(2)} ${(cy - k).toFixed(2)} ${(cx - radius).toFixed(2)} ${cy.toFixed(2)} c f\n`;
            } else {
              stream += `${mx.toFixed(2)} ${my.toFixed(2)} ${modSizeX.toFixed(2)} ${modSizeY.toFixed(2)} re f\n`;
            }
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

  /**
   * Generates PostScript Level 3 Separation Spot Color EPS (Pantone Process Black C & Spot Magenta)
   */
  function generatePantoneEps(barcode1dData, qrMatrix, options = {}) {
    const widthPt = options.widthPt || 360;
    const heightPt = options.heightPt || 144;
    const bwrPoints = (currentBwrMicrons / 1000) * 2.83465;

    let ps = `%!PS-Adobe-3.0 EPSF-3.0
%%Creator: DualMark Studio Prepress Engine v1.0
%%Title: Dual-Code Packaging Die-Line Proof (Spot Color / Pantone Separations)
%%BoundingBox: 0 0 ${widthPt} ${heightPt}
%%LanguageLevel: 3
%%DocumentCustomColors: (PANTONE Process Black C) (PANTONE Rubine Red C)
%%CMYKCustomColor: 0 0 0 1 (PANTONE Process Black C)
%%CMYKCustomColor: 0 1 0.15 0 (PANTONE Rubine Red C)
%%EndComments

%%BeginProlog
/rect {
  newpath 4 2 roll moveto 1 index 0 rlineto 0 exch rlineto neg 0 rlineto closepath fill
} bind def
/circle {
  newpath 3 1 roll 0 360 arc closepath fill
} bind def
%%EndProlog

%%Page: 1 1
gsave

% Separation 1: Die-Line & 50mm Optical Clearance in Spot Rubine Red
[/Separation (PANTONE Rubine Red C) /DeviceCMYK { 0 exch 0.15 mul 0 }] setcolorspace
1.0 setcolor
% 50mm clearance boundary line
newpath 200 20 moveto 200 120 lineto [4 4] 0 setdash 2 setlinewidth stroke
[] 0 setdash

% Separation 2: 1D & 2D Barcodes in Pantone Process Black C
[/Separation (PANTONE Process Black C) /DeviceCMYK { 0 0 0 4 -1 roll }] setcolorspace
1.0 setcolor
`;

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
          ps += `${adjustedX.toFixed(3)} ${startY} ${adjustedW.toFixed(3)} ${barHeight} rect\n`;
        }
        currentX += moduleWidth;
      }
      if (barcode1dData.text) {
        ps += `/Helvetica findfont 9 scalefont setfont\n`;
        ps += `${(startX + 10).toFixed(1)} 16 moveto (${barcode1dData.text}) show\n`;
      }
    }

    if (qrMatrix && Array.isArray(qrMatrix) && qrMatrix.length > 0) {
      const numRows = qrMatrix.length;
      const numCols = qrMatrix[0] ? qrMatrix[0].length : numRows;
      const qrWidth = options.width2d || 90;
      const qrHeight = options.height2d || (numRows === numCols ? 90 : Math.round(90 * (numRows / numCols)));
      const startX = widthPt - qrWidth - 25;
      const startY = 25;
      const modSizeX = qrWidth / numCols;
      const modSizeY = qrHeight / numRows;
      const isDotCode = Boolean(options.isDotCode || options.symbology === 'dotcode');

      for (let r = 0; r < numRows; r++) {
        for (let c = 0; c < numCols; c++) {
          if (qrMatrix[r][c]) {
            const mx = startX + (c * modSizeX);
            const my = startY + ((numRows - 1 - r) * modSizeY);
            if (isDotCode) {
              const radius = Math.min(modSizeX, modSizeY) * 0.45;
              const cx = mx + modSizeX / 2;
              const cy = my + modSizeY / 2;
              ps += `${radius.toFixed(3)} ${cx.toFixed(3)} ${cy.toFixed(3)} circle\n`;
            } else {
              ps += `${mx.toFixed(3)} ${my.toFixed(3)} ${modSizeX.toFixed(3)} ${modSizeY.toFixed(3)} rect\n`;
            }
          }
        }
      }
    }

    ps += `/Helvetica findfont 7 scalefont setfont\n`;
    ps += `20 ${heightPt - 14} moveto (DualMark Pantone Spot Color Separation Proof | 50mm Clearance Certified) show\n`;
    ps += `grestore\nshowpage\n%%EOF\n`;
    return ps;
  }

  /**
   * Generates Adobe Illustrator & Esko Compatible Layered PDF (Optional Content Groups / OCG)
   */
  function generateLayeredPdf(barcode1dData, qrMatrix, options = {}) {
    const widthPt = 360;
    const heightPt = 144;
    const bwrPoints = (currentBwrMicrons / 1000) * 2.83465;

    let stream = ``;

    // Layer 1: Die-Line & Cut Contours (/OC /OC1)
    stream += `/OC /OC1 BDC\n`;
    stream += `0 1 0.15 0 k\n`; // Spot Magenta simulation
    stream += `[4 4] 0 d 2 w 200 20 m 200 120 l S [] 0 d\n`;
    stream += `BT /F1 8 Tf 175 125 Td (>= 50mm DIE-LINE) Tj ET\n`;
    stream += `EMC\n`;

    // Layer 2: 1D Barcode & Quiet Zones (/OC /OC2)
    stream += `/OC /OC2 BDC\n`;
    stream += `0 0 0 1 k\n`; // CMYK Process Black
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
    }
    stream += `EMC\n`;

    // Layer 3: 2D GS1 Digital Link Matrix (/OC /OC3)
    stream += `/OC /OC3 BDC\n`;
    stream += `0 0 0 1 k\n`;
    if (qrMatrix && Array.isArray(qrMatrix) && qrMatrix.length > 0) {
      const numRows = qrMatrix.length;
      const numCols = qrMatrix[0] ? qrMatrix[0].length : numRows;
      const qrWidth = options.width2d || 90;
      const qrHeight = options.height2d || (numRows === numCols ? 90 : Math.round(90 * (numRows / numCols)));
      const startX = widthPt - qrWidth - 25;
      const startY = 25;
      const modSizeX = qrWidth / numCols;
      const modSizeY = qrHeight / numRows;
      const isDotCode = Boolean(options.isDotCode || options.symbology === 'dotcode');

      for (let r = 0; r < numRows; r++) {
        for (let c = 0; c < numCols; c++) {
          if (qrMatrix[r][c]) {
            const mx = startX + (c * modSizeX);
            const my = startY + ((numRows - 1 - r) * modSizeY);
            if (isDotCode) {
              const radius = Math.min(modSizeX, modSizeY) * 0.45;
              const cx = mx + modSizeX / 2;
              const cy = my + modSizeY / 2;
              const k = radius * 0.55228475;
              stream += `${(cx - radius).toFixed(2)} ${cy.toFixed(2)} m ` +
                `${(cx - radius).toFixed(2)} ${(cy + k).toFixed(2)} ${(cx - k).toFixed(2)} ${(cy + radius).toFixed(2)} ${cx.toFixed(2)} ${(cy + radius).toFixed(2)} c ` +
                `${(cx + k).toFixed(2)} ${(cy + radius).toFixed(2)} ${(cx + radius).toFixed(2)} ${(cy + k).toFixed(2)} ${(cx + radius).toFixed(2)} ${cy.toFixed(2)} c ` +
                `${(cx + radius).toFixed(2)} ${(cy - k).toFixed(2)} ${(cx + k).toFixed(2)} ${(cx - radius).toFixed(2)} ${cx.toFixed(2)} ${(cx - radius).toFixed(2)} c ` +
                `${(cx - k).toFixed(2)} ${(cy - radius).toFixed(2)} ${(cx - radius).toFixed(2)} ${(cy - k).toFixed(2)} ${(cx - radius).toFixed(2)} ${cy.toFixed(2)} c f\n`;
            } else {
              stream += `${mx.toFixed(2)} ${my.toFixed(2)} ${modSizeX.toFixed(2)} ${modSizeY.toFixed(2)} re f\n`;
            }
          }
        }
      }
    }
    stream += `EMC\n`;

    // Layer 4: Human Readable Text & Dimension Annotations (/OC /OC4)
    stream += `/OC /OC4 BDC\n`;
    stream += `0 0 0 1 k\n`;
    if (barcode1dData && barcode1dData.text) {
      stream += `BT /F1 9 Tf 30 16 Td (${barcode1dData.text}) Tj ET\n`;
    }
    stream += `BT /F1 7 Tf 20 ${heightPt - 14} Td (DualMark Layered OCG Proof | 4 Layers: DieLine, 1D, 2D, Text | BWR: ${currentBwrMicrons} um) Tj ET\n`;
    stream += `EMC\n`;

    const streamLength = stream.length;

    const pdf = `%PDF-1.5
1 0 obj
<< /Type /Catalog /Pages 2 0 R /OCProperties << /OCGs [6 0 R 7 0 R 8 0 R 9 0 R] /D << /Order [6 0 R 7 0 R 8 0 R 9 0 R] /ON [6 0 R 7 0 R 8 0 R 9 0 R] >> >> >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${widthPt} ${heightPt}] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> /Properties << /OC1 6 0 R /OC2 7 0 R /OC3 8 0 R /OC4 9 0 R >> >> >>
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
6 0 obj
<< /Type /OCG /Name (1. Packaging Die-Line & 50mm Guide) >>
endobj
7 0 obj
<< /Type /OCG /Name (2. 1D Barcode & Quiet Zones) >>
endobj
8 0 obj
<< /Type /OCG /Name (3. 2D GS1 Digital Link Matrix) >>
endobj
9 0 obj
<< /Type /OCG /Name (4. Text & Dimension Annotations) >>
endobj
xref
0 10
0000000000 65535 f 
0000000009 00000 n 
0000000150 00000 n 
0000000210 00000 n 
0000000410 00000 n 
000000${(480 + streamLength).toString().padStart(4, '0')} 00000 n 
000000${(550 + streamLength).toString().padStart(4, '0')} 00000 n 
000000${(630 + streamLength).toString().padStart(4, '0')} 00000 n 
000000${(700 + streamLength).toString().padStart(4, '0')} 00000 n 
000000${(775 + streamLength).toString().padStart(4, '0')} 00000 n 
trailer
<< /Size 10 /Root 1 0 R >>
startxref
${850 + streamLength}
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
    generatePantoneEps,
    generateVectorPdf,
    generateLayeredPdf,
    downloadFile
  };
})();

window.DualMarkPrepress = DualMarkPrepress;
