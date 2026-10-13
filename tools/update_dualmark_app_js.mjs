import fs from 'fs';

const filePath = 'web_app/js/app.js';
let code = fs.readFileSync(filePath, 'utf8');

// 1. Add _t helper after escapeHtml
const helperMarker = '  // Helper to escape HTML in previews\n  function escapeHtml(str) {\n    if (!str) return \'\';\n    return String(str)\n      .replace(/&/g, \'&amp;\')\n      .replace(/</g, \'&lt;\')\n      .replace(/>/g, \'&gt;\')\n      .replace(/"/g, \'&quot;\')\n      .replace(/\'/g, \'&#039;\');\n  }\n';

const helperCode = `  // Helper to escape HTML in previews
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Internationalization translation helper
  function _t(key, params, fallback) {
    if (typeof window !== 'undefined' && window.DualMarkI18n && typeof window.DualMarkI18n.t === 'function') {
      return window.DualMarkI18n.t(key, params);
    }
    return fallback || key;
  }
`;

if (!code.includes('function _t(')) {
  code = code.replace(helperMarker, helperCode);
}

// 2. Localize showExportConfirmModal
const oldExportModalBlock = `    // Determine document type description & icon
    var formatDesc = 'Document File';
    var icon = '💾';
    var lowerName = filename.toLowerCase();
    if (lowerName.endsWith('.pdf')) {
      formatDesc = 'PDF/X-4 CMYK Vector Document (ISO 15930-7)';
      icon = '📄';
    } else if (lowerName.endsWith('.eps')) {
      formatDesc = 'Adobe PostScript Vector Plate (CMYK / Spot)';
      icon = '🎨';
    } else if (lowerName.endsWith('.svg')) {
      formatDesc = 'Scalable Vector Graphics (W3C Die-Line Proof)';
      icon = '📐';
    } else if (lowerName.endsWith('.png')) {
      formatDesc = 'Raster Graphic 300 DPI (Lossless PNG)';
      icon = '🖼️';
    } else if (lowerName.endsWith('.zpl')) {
      formatDesc = 'Zebra ZPL II Industrial Thermal Code';
      icon = '🖨️';
    } else if (lowerName.endsWith('.zip')) {
      formatDesc = 'Master Multi-SKU Production Archive (.zip)';
      icon = '📦';
    } else if (lowerName.endsWith('.csv')) {
      formatDesc = 'FDA FSMA 204 Sortable Spreadsheet (CSV)';
      icon = '📊';
    } else if (lowerName.endsWith('.json') || lowerName.endsWith('.jsonld')) {
      formatDesc = 'Structured Data / EPCIS JSON-LD';
      icon = '🔗';
    } else if (lowerName.endsWith('.xml')) {
      formatDesc = 'GS1 EPCIS 2.0 XML Audit Document';
      icon = '📑';
    } else if (lowerName.endsWith('.sql')) {
      formatDesc = 'SQLite Edge Database Script';
      icon = '🗄️';
    } else if (lowerName.endsWith('.js')) {
      formatDesc = 'Cloudflare Edge Worker Script';
      icon = '⚡';
    } else if (lowerName.endsWith('.conf')) {
      formatDesc = 'Nginx Reverse Proxy Route Configuration';
      icon = '🌐';
    }

    if (formatEl) formatEl.textContent = formatDesc;
    if (iconEl) iconEl.textContent = icon;

    // Populate preview container
    if (previewContainer) {
      if (typeof content === 'string' && (lowerName.endsWith('.svg') || content.trim().startsWith('<svg'))) {
        previewContainer.innerHTML = '<div style="background:#ffffff; border-radius:6px; padding:10px; display:flex; justify-content:center; align-items:center; max-height:160px; overflow:hidden;">' + content + '</div>';
      } else if (content instanceof Blob && (content.type === 'image/png' || lowerName.endsWith('.png'))) {
        var imgUrl = URL.createObjectURL(content);
        previewContainer.innerHTML = '<div style="background:#1e293b; border-radius:6px; padding:10px; text-align:center;"><img src="' + imgUrl + '" style="max-height:140px; max-width:100%; object-fit:contain; border-radius:4px; box-shadow:0 2px 8px rgba(0,0,0,0.5);"></div>';
      } else if (lowerName.endsWith('.pdf')) {
        previewContainer.innerHTML = '<div style="color:var(--text-secondary); font-size:11px; line-height:1.5;">' +
          '<div style="color:var(--cyan); font-weight:700; margin-bottom:4px;">✓ Prepress Verification Check Passed:</div>' +
          '<div>• Format: ISO 15930-7 (PDF/X-4:2010 Prepress Master)</div>' +
          '<div>• Color: CMYK Plates with FOGRA39 Characterization</div>' +
          '<div>• Geometry: Vector Bézier Paths with Bar Width Reduction (BWR)</div>' +
          '<div>• Output Target: ' + escapeHtml(filename) + ' (' + sizeStr + ')</div>' +
          '</div>';
      } else if (lowerName.endsWith('.zip')) {
        previewContainer.innerHTML = '<div style="color:var(--text-secondary); font-size:11px; line-height:1.5;">' +
          '<div style="color:var(--emerald); font-weight:700; margin-bottom:4px;">📦 Multi-SKU Production Archive:</div>' +
          '<div>• High-Throughput Batch Generation</div>' +
          '<div>• Bundled: Individual Vector SVGs, Thermal Code &amp; Proof Sheets</div>' +
          '<div>• Output Target: ' + escapeHtml(filename) + ' (' + sizeStr + ')</div>' +
          '</div>';
      } else {
        var textSample = (typeof content === 'string') ? content : '';
        var excerpt = textSample.slice(0, 1200);
        if (textSample.length > 1200) {
          excerpt += '\\n\\n... [' + (textSample.length - 1200) + ' more characters truncated for preview]';
        }
        previewContainer.textContent = excerpt;
      }
    }`;

const newExportModalBlock = `    // Determine document type description & icon
    var formatDesc = _t('modal_export.format_generic', null, 'Document File');
    var icon = '💾';
    var lowerName = filename.toLowerCase();
    if (lowerName.endsWith('.pdf')) {
      formatDesc = _t('modal_export.format_pdf', null, 'PDF/X-4 CMYK Vector Document (ISO 15930-7)');
      icon = '📄';
    } else if (lowerName.endsWith('.eps')) {
      formatDesc = _t('modal_export.format_eps', null, 'Adobe PostScript Vector Plate (CMYK / Spot)');
      icon = '🎨';
    } else if (lowerName.endsWith('.svg')) {
      formatDesc = _t('modal_export.format_svg', null, 'Scalable Vector Graphics (W3C Die-Line Proof)');
      icon = '📐';
    } else if (lowerName.endsWith('.png')) {
      formatDesc = _t('modal_export.format_png', null, 'Raster Graphic 300 DPI (Lossless PNG)');
      icon = '🖼️';
    } else if (lowerName.endsWith('.zpl')) {
      formatDesc = _t('modal_export.format_zpl', null, 'Zebra ZPL II Industrial Thermal Code');
      icon = '🖨️';
    } else if (lowerName.endsWith('.zip')) {
      formatDesc = _t('modal_export.format_zip', null, 'Master Multi-SKU Production Archive (.zip)');
      icon = '📦';
    } else if (lowerName.endsWith('.csv')) {
      formatDesc = _t('modal_export.format_csv', null, 'FDA FSMA 204 Sortable Spreadsheet (CSV)');
      icon = '📊';
    } else if (lowerName.endsWith('.json') || lowerName.endsWith('.jsonld')) {
      formatDesc = _t('modal_export.format_json', null, 'Structured Data / EPCIS JSON-LD');
      icon = '🔗';
    } else if (lowerName.endsWith('.xml')) {
      formatDesc = _t('modal_export.format_xml', null, 'GS1 EPCIS 2.0 XML Audit Document');
      icon = '📑';
    } else if (lowerName.endsWith('.sql')) {
      formatDesc = _t('modal_export.format_sql', null, 'SQLite Edge Database Script');
      icon = '🗄️';
    } else if (lowerName.endsWith('.js')) {
      formatDesc = _t('modal_export.format_js', null, 'Cloudflare Edge Worker Script');
      icon = '⚡';
    } else if (lowerName.endsWith('.conf')) {
      formatDesc = _t('modal_export.format_conf', null, 'Nginx Reverse Proxy Route Configuration');
      icon = '🌐';
    }

    if (formatEl) formatEl.textContent = formatDesc;
    if (iconEl) iconEl.textContent = icon;

    // Populate preview container
    if (previewContainer) {
      if (typeof content === 'string' && (lowerName.endsWith('.svg') || content.trim().startsWith('<svg'))) {
        previewContainer.innerHTML = '<div style="background:#ffffff; border-radius:6px; padding:10px; display:flex; justify-content:center; align-items:center; max-height:160px; overflow:hidden;">' + content + '</div>';
      } else if (content instanceof Blob && (content.type === 'image/png' || lowerName.endsWith('.png'))) {
        var imgUrl = URL.createObjectURL(content);
        previewContainer.innerHTML = '<div style="background:#1e293b; border-radius:6px; padding:10px; text-align:center;"><img src="' + imgUrl + '" style="max-height:140px; max-width:100%; object-fit:contain; border-radius:4px; box-shadow:0 2px 8px rgba(0,0,0,0.5);"></div>';
      } else if (lowerName.endsWith('.pdf')) {
        previewContainer.innerHTML = '<div style="color:var(--text-secondary); font-size:11px; line-height:1.5;">' +
          '<div style="color:var(--cyan); font-weight:700; margin-bottom:4px;">' + escapeHtml(_t('modal_export.prepress_check_passed', null, '✓ Prepress Verification Check Passed:')) + '</div>' +
          '<div>' + escapeHtml(_t('modal_export.prepress_check_format', null, '• Format: ISO 15930-7 (PDF/X-4:2010 Prepress Master)')) + '</div>' +
          '<div>' + escapeHtml(_t('modal_export.prepress_check_color', null, '• Color: CMYK Plates with FOGRA39 Characterization')) + '</div>' +
          '<div>' + escapeHtml(_t('modal_export.prepress_check_geometry', null, '• Geometry: Vector Bézier Paths with Bar Width Reduction (BWR)')) + '</div>' +
          '<div>' + escapeHtml(_t('modal_export.prepress_check_output', { filename: filename, size: sizeStr }, '• Output Target: ' + filename + ' (' + sizeStr + ')')) + '</div>' +
          '</div>';
      } else if (lowerName.endsWith('.zip')) {
        previewContainer.innerHTML = '<div style="color:var(--text-secondary); font-size:11px; line-height:1.5;">' +
          '<div style="color:var(--emerald); font-weight:700; margin-bottom:4px;">' + escapeHtml(_t('modal_export.zip_title', null, '📦 Multi-SKU Production Archive:')) + '</div>' +
          '<div>' + escapeHtml(_t('modal_export.zip_batch', null, '• High-Throughput Batch Generation')) + '</div>' +
          '<div>' + escapeHtml(_t('modal_export.zip_bundled', null, '• Bundled: Individual Vector SVGs, Thermal Code & Proof Sheets')) + '</div>' +
          '<div>' + escapeHtml(_t('modal_export.prepress_check_output', { filename: filename, size: sizeStr }, '• Output Target: ' + filename + ' (' + sizeStr + ')')) + '</div>' +
          '</div>';
      } else {
        var textSample = (typeof content === 'string') ? content : '';
        var excerpt = textSample.slice(0, 1200);
        if (textSample.length > 1200) {
          excerpt += '\\n\\n' + _t('modal_export.chars_truncated', { count: textSample.length - 1200 }, '... [' + (textSample.length - 1200) + ' more characters truncated for preview]');
        }
        previewContainer.textContent = excerpt;
      }
    }`;

code = code.replace(oldExportModalBlock, newExportModalBlock);

// 3. Audio feedback and themes
code = code.replace(
  "showToast(muted ? 'Audio feedback muted' : 'Audio feedback enabled');",
  "showToast(muted ? _t('toast.audio_muted', null, 'Audio feedback muted') : _t('toast.audio_enabled', null, 'Audio feedback enabled'));"
);

code = code.replace(
  "showToast(!isLight ? 'Clean Room Light Theme' : 'Industrial Obsidian Theme');",
  "showToast(!isLight ? _t('toast.theme_clean_room', null, 'Clean Room Light Theme') : _t('toast.theme_obsidian', null, 'Industrial Obsidian Theme'));"
);

code = code.replace(
  "showToast(!isOutdoor ? 'High-Contrast Outdoor Theme' : 'Standard Dark Theme');",
  "showToast(!isOutdoor ? _t('toast.theme_outdoor', null, 'High-Contrast Outdoor Theme') : _t('toast.theme_standard', null, 'Standard Dark Theme'));"
);

// 4. ISO Verifier & Calibration
const oldIsoBlock = `        if (isoResultsWrap) isoResultsWrap.style.display = 'block';
        if (isoGradeBadge) {
          isoGradeBadge.textContent = 'GRADE ' + overallLetter + ' (' + overallNumeric + ' / 4.0)';
          isoGradeBadge.className = (overallLetter === 'A' || overallLetter === 'B') ? 'badge badge-green' : 'badge badge-rose';
        }

        if (isoMetricsWrap) {
          isoMetricsWrap.innerHTML = [
            '<table class="data-table" style="margin-top:8px;">',
            '<thead><tr><th>Standard</th><th>Symbology</th><th>Rmin</th><th>Symbol Contrast</th><th>Modulation</th><th>Decodability / ANU</th><th>Defects</th><th>Grade</th></tr></thead>',
            '<tbody>',
            '<tr><td>ISO/IEC 15416</td><td>' + report1d.symbology + '</td><td>' + report1d.metrics.rmin + '</td><td>' + report1d.metrics.symbolContrast + '%</td><td>' + report1d.metrics.modulation + '</td><td>' + report1d.metrics.decodability + '</td><td>' + report1d.metrics.defects + '</td><td><strong>Grade ' + report1d.overallGrade.letter + '</strong></td></tr>',
            '<tr><td>ISO/IEC 15415</td><td>' + report2d.symbology + '</td><td>' + report2d.metrics.rmin + '</td><td>' + report2d.metrics.symbolContrast + '%</td><td>' + report2d.metrics.modulation + '</td><td>' + report2d.metrics.axialNonUniformity + '</td><td>' + report2d.metrics.defects + '</td><td><strong>Grade ' + report2d.overallGrade.letter + '</strong></td></tr>',
            '</tbody></table>'
          ].join('');
        }

        showToast('✓ Optical Verification: ISO Grade ' + overallLetter + ' (' + overallNumeric + ')');`;

const newIsoBlock = `        if (isoResultsWrap) isoResultsWrap.style.display = 'block';
        if (isoGradeBadge) {
          isoGradeBadge.textContent = _t('iso.grade_badge', { grade: overallLetter, score: overallNumeric }, 'GRADE ' + overallLetter + ' (' + overallNumeric + ' / 4.0)');
          isoGradeBadge.className = (overallLetter === 'A' || overallLetter === 'B') ? 'badge badge-green' : 'badge badge-rose';
        }

        if (isoMetricsWrap) {
          isoMetricsWrap.innerHTML = [
            '<table class="data-table" style="margin-top:8px;">',
            '<thead><tr>' +
              '<th>' + escapeHtml(_t('iso.th_standard', null, 'Standard')) + '</th>' +
              '<th>' + escapeHtml(_t('iso.th_symbology', null, 'Symbology')) + '</th>' +
              '<th>' + escapeHtml(_t('iso.th_rmin', null, 'Rmin')) + '</th>' +
              '<th>' + escapeHtml(_t('iso.th_contrast', null, 'Symbol Contrast')) + '</th>' +
              '<th>' + escapeHtml(_t('iso.th_modulation', null, 'Modulation')) + '</th>' +
              '<th>' + escapeHtml(_t('iso.th_decodability', null, 'Decodability / ANU')) + '</th>' +
              '<th>' + escapeHtml(_t('iso.th_defects', null, 'Defects')) + '</th>' +
              '<th>' + escapeHtml(_t('iso.th_grade', null, 'Grade')) + '</th>' +
            '</tr></thead>',
            '<tbody>',
            '<tr><td>ISO/IEC 15416</td><td>' + report1d.symbology + '</td><td>' + report1d.metrics.rmin + '</td><td>' + report1d.metrics.symbolContrast + '%</td><td>' + report1d.metrics.modulation + '</td><td>' + report1d.metrics.decodability + '</td><td>' + report1d.metrics.defects + '</td><td><strong>' + escapeHtml(_t('iso.grade_row', { grade: report1d.overallGrade.letter }, 'Grade ' + report1d.overallGrade.letter)) + '</strong></td></tr>',
            '<tr><td>ISO/IEC 15415</td><td>' + report2d.symbology + '</td><td>' + report2d.metrics.rmin + '</td><td>' + report2d.metrics.symbolContrast + '%</td><td>' + report2d.metrics.modulation + '</td><td>' + report2d.metrics.axialNonUniformity + '</td><td>' + report2d.metrics.defects + '</td><td><strong>' + escapeHtml(_t('iso.grade_row', { grade: report2d.overallGrade.letter }, 'Grade ' + report2d.overallGrade.letter)) + '</strong></td></tr>',
            '</tbody></table>'
          ].join('');
        }

        showToast(_t('iso.toast_verified', { grade: overallLetter, score: overallNumeric }, '✓ Optical Verification: ISO Grade ' + overallLetter + ' (' + overallNumeric + ')'));`;

code = code.replace(oldIsoBlock, newIsoBlock);

// NIST calibration
code = code.replace(
  "isoComplianceBadge.textContent = 'NIST CALIBRATED (FACTOR ' + cal.calibrationFactor + ')';",
  "isoComplianceBadge.textContent = _t('iso.nist_calibrated', { factor: cal.calibrationFactor }, 'NIST CALIBRATED (FACTOR ' + cal.calibrationFactor + ')');"
);
code = code.replace(
  "showToast('⚖️ NIST Calibration Verified: ' + cal.certificateId + ' (Drift: ' + cal.sensorDrift + ')');",
  "showToast(_t('iso.toast_nist', { id: cal.certificateId, drift: cal.sensorDrift }, '⚖️ NIST Calibration Verified: ' + cal.certificateId + ' (Drift: ' + cal.sensorDrift + ')'));"
);

// Zoom and Certificate PDF toasts
code = code.replace(
  "showToast('🔍 Zoom: ' + Math.round(z * 100) + '%');",
  "showToast(_t('clearance.toast_zoom', { percent: Math.round(z * 100) }, '🔍 Zoom: ' + Math.round(z * 100) + '%'));"
);
code = code.replace(
  "showToast('↺ Zoom Reset (100%)');",
  "showToast(_t('clearance.toast_zoom_reset', null, '↺ Zoom Reset (100%)'));"
);
code = code.replace(
  "showToast('📄 Printable ISO 15415/15416 Certificate PDF Generated');",
  "showToast(_t('iso.toast_cert_pdf', null, '📄 Printable ISO 15415/15416 Certificate PDF Generated'));"
);

// Clearance snap and surface
code = code.replace(
  "showToast('⚡ Snapped to 52mm Safe Distance');",
  "showToast(_t('clearance.toast_snap', null, '⚡ Snapped to 52mm Safe Distance'));"
);
code = code.replace(
  "showToast('📄 Flat Carton Mode Active');",
  "showToast(_t('clearance.toast_carton', null, '📄 Flat Carton Mode Active'));"
);
code = code.replace(
  "showToast('🥫 3D Cylindrical Packaging Mode (' + diam + ' mm Ø)');",
  "showToast(_t('clearance.toast_cylindrical', { diam: diam }, '🥫 3D Cylindrical Packaging Mode (' + diam + ' mm Ø)'));"
);

// GS1 Synthesizer
code = code.replace(
  "showToast('Please enter barcode digits first');",
  "showToast(_t('synth.toast_enter_barcode', null, 'Please enter barcode digits first'));"
);
code = code.replace(
  "showToast('✓ Modulo-10 Check Digit Calculated: ' + chk);",
  "showToast(_t('synth.toast_check_digit_calc', { digit: chk }, '✓ Modulo-10 Check Digit Calculated: ' + chk));"
);
code = code.replace(
  "showToast('📦 PIM / DAM Metadata Exported (Salsify, Syndigo, 1WorldSync)');",
  "showToast(_t('synth.toast_pim_exported', null, '📦 PIM / DAM Metadata Exported (Salsify, Syndigo, 1WorldSync)'));"
);

// GS1 Conformance
const oldConformanceBlock = `        if (res.valid) {
          conformanceResult.innerHTML = '<span style="color:var(--emerald); font-weight:bold;">✓ GS1 CONFORMANCE PASSED</span> (Score: ' + res.score + '/100)<br>' +
            '<span style="color:var(--text-secondary);">' + res.details.join(' | ') + '</span>';
          showToast('✓ GS1 Digital Link Conformance Verified');
          if (window.DualMarkAudio) window.DualMarkAudio.successChime();
        } else {
          conformanceResult.innerHTML = '<span style="color:var(--rose); font-weight:bold;">✗ GS1 CONFORMANCE FAILED</span><br>' +
            '<span style="color:var(--rose);">' + res.errors.join('<br>') + '</span>';
          showToast('⚠ GS1 Conformance Issues Detected');
          if (window.DualMarkAudio) window.DualMarkAudio.warningBuzz();
        }`;

const newConformanceBlock = `        if (res.valid) {
          conformanceResult.innerHTML = '<span style="color:var(--emerald); font-weight:bold;">' + escapeHtml(_t('synth.gs1_conformance_passed', null, '✓ GS1 CONFORMANCE PASSED')) + '</span> (Score: ' + res.score + '/100)<br>' +
            '<span style="color:var(--text-secondary);">' + res.details.join(' | ') + '</span>';
          showToast(_t('synth.toast_conformance_ok', null, '✓ GS1 Digital Link Conformance Verified'));
          if (window.DualMarkAudio) window.DualMarkAudio.successChime();
        } else {
          conformanceResult.innerHTML = '<span style="color:var(--rose); font-weight:bold;">' + escapeHtml(_t('synth.gs1_conformance_failed', null, '✗ GS1 CONFORMANCE FAILED')) + '</span><br>' +
            '<span style="color:var(--rose);">' + res.errors.join('<br>') + '</span>';
          showToast(_t('synth.toast_conformance_issues', null, '⚠ GS1 Conformance Issues Detected'));
          if (window.DualMarkAudio) window.DualMarkAudio.warningBuzz();
        }`;

code = code.replace(oldConformanceBlock, newConformanceBlock);

// GEPIR
const oldGepirBlock = `        if (gepirResultBox) {
          var chkStatus = res.checksumValid
            ? '<strong style="color: var(--emerald);">VALID (Check Digit ' + res.expectedCheckDigit + ')</strong>'
            : '<strong style="color: var(--rose);">CHECKSUM ERROR (Expected ' + res.expectedCheckDigit + ')</strong>';
          gepirResultBox.innerHTML = 'Country / MO: <strong style="color: var(--cyan);">' + res.country + '</strong> | Checksum (Modulo 10): ' + chkStatus + ' | Status: Verified Local Registry';
        }
        if (res.checksumValid) {
          if (window.DualMarkAudio) window.DualMarkAudio.successChime();
          showToast('✓ GS1 Prefix & Checksum Verified: ' + res.memberOrg);
        } else {
          if (window.DualMarkAudio) window.DualMarkAudio.warningBuzz();
          showToast('⚠ Checksum Mismatch for ' + gtin);
        }`;

const newGepirBlock = `        if (gepirResultBox) {
          var chkStatus = res.checksumValid
            ? '<strong style="color: var(--emerald);">' + escapeHtml(_t('synth.gepir_valid', { digit: res.expectedCheckDigit }, 'VALID (Check Digit ' + res.expectedCheckDigit + ')')) + '</strong>'
            : '<strong style="color: var(--rose);">' + escapeHtml(_t('synth.gepir_checksum_error', { digit: res.expectedCheckDigit }, 'CHECKSUM ERROR (Expected ' + res.expectedCheckDigit + ')')) + '</strong>';
          gepirResultBox.innerHTML = escapeHtml(_t('synth.gepir_country_mo', null, 'Country / MO:')) + ' <strong style="color: var(--cyan);">' + res.country + '</strong> | ' + escapeHtml(_t('synth.gepir_checksum', null, 'Checksum (Modulo 10):')) + ' ' + chkStatus + ' | ' + escapeHtml(_t('synth.gepir_status_verified', null, 'Status: Verified Local Registry'));
        }
        if (res.checksumValid) {
          if (window.DualMarkAudio) window.DualMarkAudio.successChime();
          showToast(_t('synth.toast_gepir_verified', { org: res.memberOrg }, '✓ GS1 Prefix & Checksum Verified: ' + res.memberOrg));
        } else {
          if (window.DualMarkAudio) window.DualMarkAudio.warningBuzz();
          showToast(_t('synth.toast_gepir_mismatch', { gtin: gtin }, '⚠ Checksum Mismatch for ' + gtin));
        }`;

code = code.replace(oldGepirBlock, newGepirBlock);

// Dynamic Resolver
const oldResolverRender = `        tr.innerHTML = [
          '<td><strong>' + (r.itemTitle || 'Item') + '</strong></td>',
          '<td><span class="badge badge-cyan">' + r.gtin + '</span></td>',
          '<td>' + (r.lot || '*') + '</td>',
          '<td>' + (r.isRecalled ? '<span class="badge badge-red">🚨 RECALL ACTIVE</span>' : '<span class="badge badge-green">NORMAL</span>') + '</td>',
          '<td>' + geoSummary + '</td>',
          '<td>' +
            '<button class="btn btn-secondary btn-sm recall-btn" data-id="' + r.id + '">' + (r.isRecalled ? 'Deactivate Recall' : '🚨 Trigger Recall') + '</button> ' +
            '<button class="btn btn-danger btn-sm delete-btn" data-id="' + r.id + '">×</button>' +
          '</td>'
        ].join('');`;

const newResolverRender = `        var recallBadge = r.isRecalled
          ? '<span class="badge badge-red">' + escapeHtml(_t('resolver.recall_active', null, '🚨 RECALL ACTIVE')) + '</span>'
          : '<span class="badge badge-green">' + escapeHtml(_t('resolver.normal', null, 'NORMAL')) + '</span>';
        var recallBtnText = r.isRecalled
          ? escapeHtml(_t('resolver.btn_deactivate', null, 'Deactivate Recall'))
          : escapeHtml(_t('resolver.btn_trigger', null, '🚨 Trigger Recall'));
        var geoSummaryText = (r.geoRules && r.geoRules.length > 0)
          ? r.geoRules.map(function(g) { return g.country; }).join(', ')
          : escapeHtml(_t('resolver.geo_none', null, 'None'));

        tr.innerHTML = [
          '<td><strong>' + (r.itemTitle || 'Item') + '</strong></td>',
          '<td><span class="badge badge-cyan">' + r.gtin + '</span></td>',
          '<td>' + (r.lot || '*') + '</td>',
          '<td>' + recallBadge + '</td>',
          '<td>' + geoSummaryText + '</td>',
          '<td>' +
            '<button class="btn btn-secondary btn-sm recall-btn" data-id="' + r.id + '">' + recallBtnText + '</button> ' +
            '<button class="btn btn-danger btn-sm delete-btn" data-id="' + r.id + '">×</button>' +
          '</td>'
        ].join('');`;

code = code.replace(oldResolverRender, newResolverRender);

code = code.replace(
  "showToast('🚨 Recall Kill-Switch Activated for ' + updated.gtin);",
  "showToast(_t('resolver.toast_recall_activated', { gtin: updated.gtin }, '🚨 Recall Kill-Switch Activated for ' + updated.gtin));"
);
code = code.replace(
  "showToast('Recall deactivated');",
  "showToast(_t('resolver.toast_recall_deactivated', null, 'Recall deactivated'));"
);
code = code.replace(
  "showToast('Rule removed');",
  "showToast(_t('resolver.toast_rule_removed', null, 'Rule removed'));"
);
code = code.replace(
  "showToast('✓ Added Route Rule for ' + gtin);",
  "showToast(_t('resolver.toast_rule_added', { gtin: gtin }, '✓ Added Route Rule for ' + gtin));"
);

// Resolver test output
const oldResolverTestOutput = `      testOutput.innerHTML = [
        'Resolution Status: <strong>' + result.status + '</strong>',
        'Target Redirect URL: <span style="color:#10B981;">' + result.targetUrl + '</span>',
        result.message ? '<span style="color:#EF4444; font-weight:bold;">' + result.message + '</span>' : ''
      ].filter(Boolean).join('<br>');`;

const newResolverTestOutput = `      testOutput.innerHTML = [
        escapeHtml(_t('resolver.lbl_status', null, 'Resolution Status:')) + ' <strong>' + result.status + '</strong>',
        escapeHtml(_t('resolver.lbl_target', null, 'Target Redirect URL:')) + ' <span style="color:#10B981;">' + result.targetUrl + '</span>',
        result.message ? '<span style="color:#EF4444; font-weight:bold;">' + result.message + '</span>' : ''
      ].filter(Boolean).join('<br>');`;

code = code.replace(oldResolverTestOutput, newResolverTestOutput);

// Scanner
code = code.replace(
  "badgeState.textContent = 'CAMERA STREAMING';",
  "badgeState.textContent = _t('scanner.camera_streaming', null, 'CAMERA STREAMING');"
);
code = code.replace(
  "badgeState.textContent = 'CAMERA UNAVAILABLE';",
  "badgeState.textContent = _t('scanner.camera_unavailable', null, 'CAMERA UNAVAILABLE');"
);
code = code.replace(
  "showToast('Camera access unavailable (Check permissions)');",
  "showToast(_t('scanner.toast_camera_denied', null, 'Camera access unavailable (Check permissions)'));"
);

const oldScannerDecoded = `          resultBlock.innerHTML = [
            'Format: <strong>' + first.format + '</strong>',
            'Decoded Value: <span style="color:#00F0FF;">' + first.rawValue + '</span>',
            first.isGs1DigitalLink ? '<span style="color:#10B981;">[GS1 DIGITAL LINK VALIDATED] GTIN: ' + (first.gs1Data ? first.gs1Data.gtin : '') + '</span>' : ''
          ].join('<br>');`;

const newScannerDecoded = `          resultBlock.innerHTML = [
            escapeHtml(_t('scanner.lbl_format', null, 'Format:')) + ' <strong>' + first.format + '</strong>',
            escapeHtml(_t('scanner.lbl_decoded', null, 'Decoded Value:')) + ' <span style="color:#00F0FF;">' + first.rawValue + '</span>',
            first.isGs1DigitalLink ? '<span style="color:#10B981;">' + escapeHtml(_t('scanner.gs1_validated', { gtin: first.gs1Data ? first.gs1Data.gtin : '' }, '[GS1 DIGITAL LINK VALIDATED] GTIN: ' + (first.gs1Data ? first.gs1Data.gtin : ''))) + '</span>' : ''
          ].join('<br>');`;

code = code.replace(oldScannerDecoded, newScannerDecoded);

const oldScannerFileDecoded = `            if (badgeState) {
              badgeState.textContent = 'BARCODE DETECTED';
              badgeState.className = 'badge badge-green';
            }
            resultBlock.innerHTML = [
              '<div style="margin-bottom:6px;"><strong>✓ Optical Scan Successful:</strong> <span class="badge badge-emerald">' + (first.format || 'UPC-A').toUpperCase() + '</span></div>',
              '<div style="font-size:18px; font-weight:800; color:#00F0FF; letter-spacing:1px; margin: 6px 0;">' + first.rawValue + '</div>',
              '<div style="color:var(--text-secondary); font-size:11px; margin-bottom:10px;">Scanned packaging photo: ' + file.name + ' (' + res.image.width + 'x' + res.image.height + ')</div>',
              '<div style="display:flex; gap:8px; flex-wrap:wrap;">',
              '  <button id="btn-transfer-scanned-to-synth" class="btn btn-primary btn-sm" style="font-weight:700;">⚡ Transfer ' + first.rawValue + ' to Tab 1 (Dual-Code Synth)</button>',
              '</div>'
            ].join('');`;

const newScannerFileDecoded = `            if (badgeState) {
              badgeState.textContent = _t('scanner.barcode_detected', null, 'BARCODE DETECTED');
              badgeState.className = 'badge badge-green';
            }
            resultBlock.innerHTML = [
              '<div style="margin-bottom:6px;"><strong>' + escapeHtml(_t('scanner.scan_successful', null, '✓ Optical Scan Successful:')) + '</strong> <span class="badge badge-emerald">' + (first.format || 'UPC-A').toUpperCase() + '</span></div>',
              '<div style="font-size:18px; font-weight:800; color:#00F0FF; letter-spacing:1px; margin: 6px 0;">' + first.rawValue + '</div>',
              '<div style="color:var(--text-secondary); font-size:11px; margin-bottom:10px;">' + escapeHtml(_t('scanner.scanned_photo', { name: file.name, width: res.image.width, height: res.image.height }, 'Scanned packaging photo: ' + file.name + ' (' + res.image.width + 'x' + res.image.height + ')')) + '</div>',
              '<div style="display:flex; gap:8px; flex-wrap:wrap;">',
              '  <button id="btn-transfer-scanned-to-synth" class="btn btn-primary btn-sm" style="font-weight:700;">' + escapeHtml(_t('scanner.btn_transfer', { value: first.rawValue }, '⚡ Transfer ' + first.rawValue + ' to Tab 1 (Dual-Code Synth)')) + '</button>',
              '</div>'
            ].join('');`;

code = code.replace(oldScannerFileDecoded, newScannerFileDecoded);

code = code.replace(
  "showToast('⚡ Barcode ' + first.rawValue + ' transferred to Dual-Code Synthesizer!');",
  "showToast(_t('scanner.toast_transferred', { value: first.rawValue }, '⚡ Barcode ' + first.rawValue + ' transferred to Dual-Code Synthesizer!'));"
);

// FSMA Table
const oldFsmaRender = `        var sigBadge = sig
          ? '<span class="badge badge-green" title="' + (sig.auditorName || sig.signerName || 'Signed') + '">✓ ECDSA P-256</span>'
          : '<span class="badge badge-cyan" style="opacity:0.6;">Unsigned</span>';

        tr.innerHTML = [
          '<td><strong>' + rec.id + '</strong></td>',
          '<td>' + rec.eventType + '</td>',
          '<td><span class="badge badge-cyan">' + rec.tlc + '</span></td>',
          '<td><small style="color:var(--text-secondary);">' + (rec.inputTlc || '—') + '</small></td>',
          '<td>' + rec.gtin + '</td>',
          '<td>' + new Date(rec.recordedAt).toLocaleString() + '</td>',
          '<td><small style="font-family:monospace; color:#38BDF8;">' + (rec.sha256 ? rec.sha256.substring(0, 16) : '') + '...</small></td>',
          '<td>' + sigBadge + '</td>',
          '<td>' +
            '<button class="btn btn-secondary btn-sm pdf-btn" data-id="' + rec.id + '">📄 PDF Dossier</button> ' +
            '<button class="btn btn-secondary btn-sm share-btn" data-id="' + rec.id + '">📤 Share</button> ' +
            '<button class="btn btn-danger btn-sm del-btn" data-id="' + rec.id + '">×</button>' +
          '</td>'
        ].join('');`;

const newFsmaRender = `        var sigBadge = sig
          ? '<span class="badge badge-green" title="' + (sig.auditorName || sig.signerName || 'Signed') + '">✓ ECDSA P-256</span>'
          : '<span class="badge badge-cyan" style="opacity:0.6;">' + escapeHtml(_t('fsma.badge_unsigned', null, 'Unsigned')) + '</span>';

        tr.innerHTML = [
          '<td><strong>' + rec.id + '</strong></td>',
          '<td>' + rec.eventType + '</td>',
          '<td><span class="badge badge-cyan">' + rec.tlc + '</span></td>',
          '<td><small style="color:var(--text-secondary);">' + (rec.inputTlc || '—') + '</small></td>',
          '<td>' + rec.gtin + '</td>',
          '<td>' + new Date(rec.recordedAt).toLocaleString() + '</td>',
          '<td><small style="font-family:monospace; color:#38BDF8;">' + (rec.sha256 ? rec.sha256.substring(0, 16) : '') + '...</small></td>',
          '<td>' + sigBadge + '</td>',
          '<td>' +
            '<button class="btn btn-secondary btn-sm pdf-btn" data-id="' + rec.id + '">' + escapeHtml(_t('fsma.btn_pdf', null, '📄 PDF Dossier')) + '</button> ' +
            '<button class="btn btn-secondary btn-sm share-btn" data-id="' + rec.id + '">' + escapeHtml(_t('fsma.btn_share', null, '📤 Share')) + '</button> ' +
            '<button class="btn btn-danger btn-sm del-btn" data-id="' + rec.id + '">×</button>' +
          '</td>'
        ].join('');`;

code = code.replace(oldFsmaRender, newFsmaRender);

// Also add dualmark:locale_changed listener in app.js
const localeListener = `
    // Live Dynamic Locale Listener to refresh active views
    window.addEventListener('dualmark:locale_changed', function() {
      if (typeof renderRulesTable === 'function') {
        try { renderRulesTable(); } catch (e) {}
      }
      if (typeof renderRecordsTable === 'function') {
        try { renderRecordsTable(); } catch (e) {}
      }
      if (typeof updateClearanceUi === 'function') {
        try { updateClearanceUi(); } catch (e) {}
      }
    });
`;

if (!code.includes('dualmark:locale_changed')) {
  // Inject before DOMContentLoaded closing or end of file
  code = code.replace("  // 6. Global Navigation & Hotkeys", localeListener + "\n  // 6. Global Navigation & Hotkeys");
}

fs.writeFileSync(filePath, code, 'utf8');
console.log("Successfully updated web_app/js/app.js with localized strings!");
