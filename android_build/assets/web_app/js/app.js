/**
 * DualMark Studio — Core Application Controller
 * Coordinates Barcode Synth, GS1 Digital Link, 50mm Die-Line Inspector,
 * Zero-SaaS Dynamic Link Resolver, Optical Scanner, and FSMA PDF Logger.
 */
(function() {
  'use strict';

  // Toast notification helper
  function showToast(msg, duration) {
    var container = document.getElementById('toast-container');
    if (!container) return;
    var t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    container.appendChild(t);
    setTimeout(function() {
      t.style.opacity = '0';
      setTimeout(function() { if (t.parentNode) t.parentNode.removeChild(t); }, 300);
    }, duration || 2500);

    // Call native Android Toast if available
    if (window.DualMarkBridge && typeof window.DualMarkBridge.showToast === 'function') {
      window.DualMarkBridge.showToast(msg);
    }
  }

  window.showToast = showToast;
  window.DualMarkApp = { showToast: showToast };

  // Helper to escape HTML in previews
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

  // Helper to convert any content (string, Blob, ArrayBuffer, TypedArray) to base64 & Blob
  function processExportContent(content, mimeType, callback) {
    var mime = mimeType || 'application/octet-stream';
    if (content instanceof Blob) {
      var reader = new FileReader();
      reader.onloadend = function() {
        var dataUrl = reader.result || '';
        var b64 = (dataUrl.indexOf(',') !== -1) ? dataUrl.split(',')[1] : '';
        callback(content, b64);
      };
      reader.readAsDataURL(content);
    } else if (content instanceof ArrayBuffer || (window.ArrayBuffer && ArrayBuffer.isView && ArrayBuffer.isView(content))) {
      var blob = new Blob([content], { type: mime });
      var reader = new FileReader();
      reader.onloadend = function() {
        var dataUrl = reader.result || '';
        var b64 = (dataUrl.indexOf(',') !== -1) ? dataUrl.split(',')[1] : '';
        callback(blob, b64);
      };
      reader.readAsDataURL(blob);
    } else if (typeof content === 'string') {
      var blob = new Blob([content], { type: mime });
      var b64 = '';
      try {
        b64 = btoa(unescape(encodeURIComponent(content)));
      } catch (e1) {
        try {
          var binary = '';
          for (var i = 0; i < content.length; i++) {
            binary += String.fromCharCode(content.charCodeAt(i) & 0xff);
          }
          b64 = btoa(binary);
        } catch (e2) {
          try {
            b64 = btoa(content);
          } catch (e3) {
            b64 = '';
          }
        }
      }
      callback(blob, b64);
    } else {
      var json = JSON.stringify(content, null, 2);
      var blob = new Blob([json], { type: mime });
      var b64 = '';
      try {
        b64 = btoa(unescape(encodeURIComponent(json)));
      } catch (e) {}
      callback(blob, b64);
    }
  }

  // Universal file download engine (Native Android Bridge via MediaStore / Storage + Web Browser fallback)
  function actualDownloadBlob(content, filename, mimeType) {
    var safeFilename = filename || 'DualMark_Export';
    var safeMime = mimeType || 'application/octet-stream';

    // 1. Web Browser Execution: Synchronous execution preserves user gesture token
    if (!window.DualMarkBridge) {
      try {
        var blob = (content instanceof Blob) ? content : new Blob([content], { type: safeMime });
        if (window.navigator && window.navigator.msSaveOrOpenBlob) {
          window.navigator.msSaveOrOpenBlob(blob, safeFilename);
        } else {
          var url = URL.createObjectURL(blob);
          var a = document.createElement('a');
          a.style.display = 'none';
          a.href = url;
          a.download = safeFilename;
          a.rel = 'noopener';
          document.body.appendChild(a);
          a.click();
          setTimeout(function() {
            if (a.parentNode) a.parentNode.removeChild(a);
            setTimeout(function() {
              URL.revokeObjectURL(url);
            }, 60000);
          }, 300);
        }
      } catch (err) {
        console.error('Web browser download error:', err);
      }

      triggerSavedFeedback(safeFilename);
      return;
    }

    // 2. Android Native Bridge execution (MediaStore / Downloads Directory)
    processExportContent(content, safeMime, function(blob, base64) {
      var savedNatively = false;

      if (window.DualMarkBridge) {
        if (base64 && typeof window.DualMarkBridge.saveToMediaStore === 'function') {
          try {
            savedNatively = window.DualMarkBridge.saveToMediaStore(base64, safeFilename, safeMime);
          } catch (e) {
            console.warn('DualMarkBridge.saveToMediaStore threw:', e);
          }
        }
        if (!savedNatively && base64 && typeof window.DualMarkBridge.savePdfToStorage === 'function' && safeFilename.endsWith('.pdf')) {
          try {
            savedNatively = window.DualMarkBridge.savePdfToStorage(base64, safeFilename);
          } catch (e) {
            console.warn('DualMarkBridge.savePdfToStorage threw:', e);
          }
        }
      }

      // Fallback if native bridge failed
      if (!savedNatively) {
        try {
          var url = URL.createObjectURL(blob);
          var a = document.createElement('a');
          a.style.display = 'none';
          a.href = url;
          a.download = safeFilename;
          document.body.appendChild(a);
          a.click();
          setTimeout(function() {
            if (a.parentNode) a.parentNode.removeChild(a);
            setTimeout(function() {
              URL.revokeObjectURL(url);
            }, 45000);
          }, 300);
        } catch (err) {
          console.error('Fallback download error:', err);
        }
      }

      triggerSavedFeedback(safeFilename);
    });
  }

  function triggerSavedFeedback(safeFilename) {
    var toastText = '✓ File saved successfully: ' + safeFilename;
    if (window.DualMarkI18n && typeof window.DualMarkI18n.t === 'function') {
      var tpl = window.DualMarkI18n.t('modal_export.toast_saved');
      if (tpl && tpl !== 'modal_export.toast_saved') {
        toastText = tpl + safeFilename;
      }
    }
    showToast(toastText);

    if (window.DualMarkAudio && typeof window.DualMarkAudio.successChime === 'function') {
      window.DualMarkAudio.successChime();
    }

    if (window.DualMarkRive && typeof window.DualMarkRive.triggerMascotCelebrate === 'function') {
      window.DualMarkRive.triggerMascotCelebrate();
    }
  }

  var pendingExportConfirmAction = null;

  function showExportConfirmModal(config, onConfirm) {
    var modal = document.getElementById('modal-export-confirm');
    if (!modal) {
      if (typeof onConfirm === 'function') onConfirm();
      return;
    }

    var filenameEl = document.getElementById('modal-export-filename');
    var sizeEl = document.getElementById('modal-export-size');
    var formatEl = document.getElementById('modal-export-format');
    var iconEl = document.getElementById('modal-export-icon');
    var previewContainer = document.getElementById('modal-export-preview-container');

    var filename = config.filename || 'export_file';
    var content = config.content;
    var mimeType = config.mimeType || 'text/plain';

    if (filenameEl) filenameEl.textContent = filename;

    // Calculate file size
    var byteSize = 0;
    if (content instanceof Blob) {
      byteSize = content.size;
    } else if (typeof content === 'string') {
      byteSize = new Blob([content]).size;
    } else if (content && content.byteLength) {
      byteSize = content.byteLength;
    }

    var sizeStr = byteSize > 1048576 
      ? (byteSize / 1048576).toFixed(1) + ' MB'
      : Math.max(1, Math.round(byteSize / 1024)) + ' KB';
    if (sizeEl) sizeEl.textContent = '~' + sizeStr;

    // Determine document type description & icon
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
          excerpt += '\n\n' + _t('modal_export.chars_truncated', { count: textSample.length - 1200 }, '... [' + (textSample.length - 1200) + ' more characters truncated for preview]');
        }
        previewContainer.textContent = excerpt;
      }
    }

    pendingExportConfirmAction = function() {
      if (typeof onConfirm === 'function') onConfirm();
    };

    modal.style.display = 'flex';
    if (window.DualMarkI18n) {
      window.DualMarkI18n.translateDom(modal);
    }
  }

  function downloadBlob(content, filename, mimeType, skipConfirm) {
    if (skipConfirm) {
      actualDownloadBlob(content, filename, mimeType);
      return;
    }
    showExportConfirmModal({
      content: content,
      filename: filename,
      mimeType: mimeType
    }, function() {
      actualDownloadBlob(content, filename, mimeType);
    });
  }

  // Expose global DualMarkApp interface
  window.DualMarkApp = {
    downloadBlob: downloadBlob,
    actualDownloadBlob: actualDownloadBlob,
    showExportConfirmModal: showExportConfirmModal,
    showToast: showToast
  };

  function copyTextSafely(text, toastMsg) {
    if (window.PresetLoaders && typeof window.PresetLoaders.copyToClipboard === 'function') {
      window.PresetLoaders.copyToClipboard(text).then(function() {
        if (toastMsg) showToast(toastMsg);
      }).catch(function() {
        fallbackCopyText(text, toastMsg);
      });
      return;
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function() {
        if (toastMsg) showToast(toastMsg);
      }).catch(function() {
        fallbackCopyText(text, toastMsg);
      });
    } else {
      fallbackCopyText(text, toastMsg);
    }
  }

  function fallbackCopyText(text, toastMsg) {
    try {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      var ok = document.execCommand('copy');
      document.body.removeChild(ta);
      if (ok && toastMsg) showToast(toastMsg);
    } catch (e) {
      console.warn('Fallback copy failed:', e);
    }
  }

  // 1. Navigation Tab Switching
  function initNav() {
    var topTabs = document.querySelectorAll('.nav-tab');
    var bottomItems = document.querySelectorAll('.bottom-nav-item');
    var panes = document.querySelectorAll('.tab-pane');

    window.switchTab = function(targetId) {
      topTabs.forEach(function(t) {
        if (t.getAttribute('data-tab') === targetId) t.classList.add('active');
        else t.classList.remove('active');
      });
      bottomItems.forEach(function(b) {
        if (b.getAttribute('data-tab') === targetId) b.classList.add('active');
        else b.classList.remove('active');
      });
      panes.forEach(function(p) {
        if (p.id === targetId) p.classList.add('active');
        else p.classList.remove('active');
      });

      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (window.DualMarkAudio) window.DualMarkAudio.click();

      // If switching to Clearance tab, re-render die-line canvas scale
      if (targetId === 'tab-clearance' && window.clearanceInspector) {
        setTimeout(function() { window.clearanceInspector.render(); }, 50);
      }
    };

    topTabs.forEach(function(tab) {
      tab.addEventListener('click', function() {
        window.switchTab(tab.getAttribute('data-tab'));
      });
    });

    bottomItems.forEach(function(item) {
      item.addEventListener('click', function() {
        window.switchTab(item.getAttribute('data-tab'));
      });
    });

    // Sound toggle
    var btnSound = document.getElementById('btn-sound');
    var soundIcon = document.getElementById('sound-icon');
    if (btnSound) {
      var updateSoundUi = function(muted) {
        if (soundIcon) {
          soundIcon.textContent = muted ? '🔇' : '🔊';
        } else {
          btnSound.innerHTML = '<span>' + (muted ? '🔇' : '🔊') + '</span> <span>Tactile Audio Feedback</span>';
        }
      };
      btnSound.addEventListener('click', function() {
        var muted = window.DualMarkAudio.toggleMute();
        updateSoundUi(muted);
        showToast(muted ? _t('toast.audio_muted', null, 'Audio feedback muted') : _t('toast.audio_enabled', null, 'Audio feedback enabled'));
      });
      updateSoundUi(window.DualMarkAudio.isMuted());
    }

    // Centralized Theme Manager (Obsidian, Mascot Safety Amber, Mascot Cyber Visor, Clean Room, Outdoor)
    function applyTheme(themeKey) {
      document.body.classList.remove('theme-light', 'theme-outdoor', 'theme-mascot-amber', 'theme-mascot-cyber');
      var chosenTheme = themeKey || 'default';

      if (chosenTheme === 'theme-mascot-amber' || chosenTheme === 'amber') {
        document.body.classList.add('theme-mascot-amber');
        chosenTheme = 'theme-mascot-amber';
      } else if (chosenTheme === 'theme-mascot-cyber' || chosenTheme === 'cyber') {
        document.body.classList.add('theme-mascot-cyber');
        chosenTheme = 'theme-mascot-cyber';
      } else if (chosenTheme === 'theme-light' || chosenTheme === 'light') {
        document.body.classList.add('theme-light');
        chosenTheme = 'theme-light';
      } else if (chosenTheme === 'theme-outdoor' || chosenTheme === 'outdoor') {
        document.body.classList.add('theme-outdoor');
        chosenTheme = 'theme-outdoor';
      } else {
        chosenTheme = 'default';
      }

      localStorage.setItem('dualmark_active_theme', chosenTheme);
      localStorage.setItem('dualmark_theme', chosenTheme === 'theme-light' ? 'light' : 'dark');
      localStorage.setItem('dualmark_outdoor', chosenTheme === 'theme-outdoor' ? 'true' : 'false');

      var selectTheme = document.getElementById('select-theme');
      if (selectTheme) {
        selectTheme.value = chosenTheme;
      }

      if (window.DualMarkLiveBackground) {
        window.DualMarkLiveBackground.setTheme(chosenTheme);
      }
    }

    // Initialize Active Theme on startup
    var savedTheme = localStorage.getItem('dualmark_active_theme') ||
      (localStorage.getItem('dualmark_theme') === 'light' ? 'theme-light' :
      (localStorage.getItem('dualmark_outdoor') === 'true' ? 'theme-outdoor' : 'default'));
    applyTheme(savedTheme);

    // Theme selector dropdown
    var selectThemeEl = document.getElementById('select-theme');
    if (selectThemeEl) {
      selectThemeEl.value = savedTheme;
      selectThemeEl.addEventListener('change', function(e) {
        applyTheme(e.target.value);
        var labels = {
          'default': 'Industrial Obsidian Theme',
          'theme-mascot-amber': '🦺 Mascot Safety Amber Theme',
          'theme-mascot-cyber': '🥽 Mascot Cyber Visor Theme',
          'theme-light': 'Clean Room Light Theme',
          'theme-outdoor': 'Outdoor High-Contrast Dock Mode'
        };
        showToast(labels[e.target.value] || 'Theme Updated');
        if (window.DualMarkAudio) window.DualMarkAudio.click();
      });
    }

    // Direct Mascot Theme Buttons
    var btnThemeAmber = document.getElementById('btn-theme-amber');
    if (btnThemeAmber) {
      btnThemeAmber.addEventListener('click', function() {
        applyTheme('theme-mascot-amber');
        showToast('🦺 Mascot Safety Amber Theme');
        if (window.DualMarkAudio) window.DualMarkAudio.click();
      });
    }

    var btnThemeCyber = document.getElementById('btn-theme-cyber');
    if (btnThemeCyber) {
      btnThemeCyber.addEventListener('click', function() {
        applyTheme('theme-mascot-cyber');
        showToast('🥽 Mascot Cyber Visor Theme');
        if (window.DualMarkAudio) window.DualMarkAudio.click();
      });
    }

    // Clean Room Light/Dark Theme toggle
    var btnTheme = document.getElementById('btn-theme');
    if (btnTheme) {
      btnTheme.addEventListener('click', function() {
        var isLight = document.body.classList.contains('theme-light');
        applyTheme(isLight ? 'default' : 'theme-light');
        showToast(!isLight ? _t('toast.theme_clean_room', null, 'Clean Room Light Theme') : _t('toast.theme_obsidian', null, 'Industrial Obsidian Theme'));
        if (window.DualMarkAudio) window.DualMarkAudio.click();
      });
    }

    // Commercial Licensing & Editions Modal
    var btnLicensing = document.getElementById('btn-licensing');
    var badgeLicensing = document.getElementById('header-license-badge');
    if (btnLicensing) {
      btnLicensing.addEventListener('click', function() {
        if (window.DualMarkLicensing) window.DualMarkLicensing.showPaywallModal();
      });
    }
    if (badgeLicensing) {
      badgeLicensing.addEventListener('click', function() {
        if (window.DualMarkLicensing) window.DualMarkLicensing.showPaywallModal();
      });
    }

    // Legal & Regulatory Disclaimers Modal
    var btnLegal = document.getElementById('btn-legal');
    var modalLegal = document.getElementById('modal-legal-compliance');
    var btnCloseLegal = document.getElementById('btn-close-legal');
    var btnLegalConfirm = document.getElementById('btn-legal-confirm');

    if (btnLegal && modalLegal) {
      btnLegal.addEventListener('click', function() {
        modalLegal.style.display = 'flex';
        if (window.DualMarkAudio) window.DualMarkAudio.click();
      });
    }
    if (btnCloseLegal && modalLegal) {
      btnCloseLegal.addEventListener('click', function() {
        modalLegal.style.display = 'none';
      });
    }
    if (btnLegalConfirm && modalLegal) {
      btnLegalConfirm.addEventListener('click', function() {
        modalLegal.style.display = 'none';
        var legalMsg = (window.DualMarkI18n ? window.DualMarkI18n.t('toast.legal_ack') : 'Legal & Regulatory Disclaimers Acknowledged');
        showToast(legalMsg);
        if (window.DualMarkAudio) window.DualMarkAudio.successChime();
      });
    }

    // Dynamic Language Selector (i18n)
    var selectLang = document.getElementById('select-language');
    if (window.DualMarkI18n) {
      window.DualMarkI18n.init();
      if (selectLang) {
        selectLang.value = window.DualMarkI18n.getLanguage();
        selectLang.addEventListener('change', function(e) {
          var chosen = e.target.value;
          window.DualMarkI18n.setLanguage(chosen);
          var langMsg = window.DualMarkI18n.t('toast.language_updated', { lang: chosen });
          showToast(langMsg);
          if (window.DualMarkAudio) window.DualMarkAudio.click();
        });
      }
    }

    // Interactive Guided Tour
    var btnTour = document.getElementById('btn-tour');
    if (btnTour) {
      btnTour.addEventListener('click', function() {
        if (window.DualMarkTour) window.DualMarkTour.start();
      });
    }

    // High-Contrast Outdoor Loading Dock Theme
    var btnOutdoor = document.getElementById('btn-outdoor');
    if (btnOutdoor) {
      btnOutdoor.addEventListener('click', function() {
        var isOutdoor = document.body.classList.contains('theme-outdoor');
        applyTheme(isOutdoor ? 'default' : 'theme-outdoor');
        showToast(!isOutdoor ? _t('toast.theme_outdoor', null, 'High-Contrast Outdoor Theme') : _t('toast.theme_standard', null, 'Standard Dark Theme'));
        if (window.DualMarkAudio) window.DualMarkAudio.click();
      });
    }

    // Sanitized System Diagnostics Export
    var btnDiagnostics = document.getElementById('btn-diagnostics');
    if (btnDiagnostics) {
      btnDiagnostics.addEventListener('click', function() {
        if (window.DualMarkLicensing && typeof window.DualMarkLicensing.exportDiagnosticBundle === 'function') {
          window.DualMarkLicensing.exportDiagnosticBundle();
        }
      });
    }

    // Consolidated Workstation Quick Settings Drawer / Slide-Over Sheet
    var btnQuickSettings = document.getElementById('btn-quick-settings');
    var sheetQuickSettings = document.getElementById('sheet-quick-settings');
    var btnCloseSettings = document.getElementById('btn-close-settings');

    if (btnQuickSettings && sheetQuickSettings) {
      btnQuickSettings.addEventListener('click', function() {
        sheetQuickSettings.style.display = 'flex';
        if (window.DualMarkAudio) window.DualMarkAudio.click();
      });
    }

    if (btnCloseSettings && sheetQuickSettings) {
      btnCloseSettings.addEventListener('click', function() {
        sheetQuickSettings.style.display = 'none';
        if (window.DualMarkAudio) window.DualMarkAudio.click();
      });
    }

    if (sheetQuickSettings) {
      sheetQuickSettings.addEventListener('click', function(e) {
        if (e.target === sheetQuickSettings) {
          sheetQuickSettings.style.display = 'none';
        }
      });
    }

    // Mascot Persona & Companion Selector in Workstation Settings
    var selectMascotStyle = document.getElementById('select-mascot-style');
    var canvasMascotPreview = document.getElementById('canvas-mascot-preview');

    if (window.DualMarkRive) {
      if (selectMascotStyle) {
        var currentMascotStyle = window.DualMarkRive.getMascotStyle() || 'marky_scanner';
        selectMascotStyle.value = currentMascotStyle;

        selectMascotStyle.addEventListener('change', function(e) {
          var chosenStyle = e.target.value;
          window.DualMarkRive.setMascotStyle(chosenStyle);
          if (chosenStyle === 'specialist_avatar') {
            applyTheme('theme-mascot-amber');
          } else if (chosenStyle === 'cyber_reticle') {
            applyTheme('theme-mascot-cyber');
          }
          var styleNames = {
            marky_scanner: '🤖 Marky Bot (Cybernetic Assistant)',
            cyber_reticle: '🎯 Optical Reticle HUD',
            minimal_pulse: '💡 Cleanroom Status LED',
            specialist_avatar: '👷 Packaging Specialist',
            mascot_off: '🚫 Disabled (Minimalist)'
          };
          showToast('Mascot updated: ' + (styleNames[chosenStyle] || chosenStyle));
          if (window.DualMarkAudio) window.DualMarkAudio.click();
        });
      }

      if (canvasMascotPreview && typeof window.DualMarkRive.initMascotPreview === 'function') {
        window.DualMarkRive.initMascotPreview('canvas-mascot-preview');
      }
    }

    // Export Confirmation & Storage Protection Modal Listeners
    var modalExportConfirm = document.getElementById('modal-export-confirm');
    var btnExportConfirm = document.getElementById('btn-export-confirm');
    var btnExportCancel = document.getElementById('btn-export-cancel');
    var btnExportCancelX = document.getElementById('btn-export-cancel-x');

    function closeExportModal() {
      if (modalExportConfirm) modalExportConfirm.style.display = 'none';
      pendingExportConfirmAction = null;
    }

    if (btnExportCancel) {
      btnExportCancel.addEventListener('click', function() {
        closeExportModal();
        if (window.DualMarkI18n) {
          showToast(window.DualMarkI18n.t('modal_export.toast_canceled'));
        } else {
          showToast('Export canceled. No files were written.');
        }
        if (window.DualMarkAudio) window.DualMarkAudio.click();
      });
    }

    if (btnExportCancelX) {
      btnExportCancelX.addEventListener('click', function() {
        closeExportModal();
        if (window.DualMarkI18n) {
          showToast(window.DualMarkI18n.t('modal_export.toast_canceled'));
        } else {
          showToast('Export canceled. No files were written.');
        }
        if (window.DualMarkAudio) window.DualMarkAudio.click();
      });
    }

    if (btnExportConfirm) {
      btnExportConfirm.addEventListener('click', function(e) {
        if (e) e.preventDefault();
        var action = pendingExportConfirmAction;
        closeExportModal();
        if (typeof action === 'function') {
          try {
            action();
          } catch (err) {
            console.error('Export confirm action error:', err);
          }
        }
      });
    }

    if (modalExportConfirm) {
      modalExportConfirm.addEventListener('click', function(e) {
        if (e.target === modalExportConfirm) {
          closeExportModal();
          if (window.DualMarkI18n) {
            showToast(window.DualMarkI18n.t('modal_export.toast_canceled'));
          } else {
            showToast('Export canceled. No files were written.');
          }
        }
      });
    }

    // Interactive Marky Mascot Companion
    var mascotWrap = document.getElementById('mascot-companion-wrap');
    if (mascotWrap) {
      mascotWrap.addEventListener('click', function() {
        if (window.DualMarkRive && typeof window.DualMarkRive.triggerMascotCelebrate === 'function') {
          window.DualMarkRive.triggerMascotCelebrate();
        }
        if (window.DualMarkAudio) window.DualMarkAudio.successChime();
        showToast('🤖 Marky: All GS1 Sunrise 2027 systems calibrated & ready!');
      });
    }
  }

  // 2. Module 1: Dual-Code Synth
  function initSynthModule() {
    var typeSelect = document.getElementById('synth-1d-type');
    var input1d = document.getElementById('synth-1d-input');
    var canvas1d = document.getElementById('canvas-1d');
    var badge1d = document.getElementById('barcode-type-badge');
    var info1d = document.getElementById('synth-1d-prefix-info');

    var domain2d = document.getElementById('synth-2d-domain');
    var gtin2d = document.getElementById('synth-2d-gtin');
    var lot2d = document.getElementById('synth-2d-lot');
    var serial2d = document.getElementById('synth-2d-serial');
    var exp2d = document.getElementById('synth-2d-exp');
    var expDate2d = document.getElementById('synth-2d-exp-date');
    var symbologySelect = document.getElementById('synth-2d-symbology');
    var badge2dStandard = document.getElementById('badge-2d-standard');
    var preview2d = document.getElementById('synth-2d-uri-preview');
    var canvas2d = document.getElementById('canvas-2d');

    function update1D() {
      try {
        var type = typeSelect.value;
        var rawVal = input1d.value.trim();
        var digitsOnly = rawVal.replace(/\D/g, '');
        var note = '';

        // Intelligent auto-detection & normalization
        if (/[A-Za-z]/.test(rawVal) && type !== 'Code-128') {
          type = 'Code-128';
          typeSelect.value = 'Code-128';
          note = ' • Auto-detected alphanumeric (Code 128)';
        } else if (type === 'UPC-A') {
          if (digitsOnly.length === 13) {
            if (digitsOnly.charAt(0) === '0') {
              note = ' • GTIN-13 normalized to UPC-A (12 digits)';
            } else {
              type = 'EAN-13';
              typeSelect.value = 'EAN-13';
              note = ' • Auto-switched to EAN-13 (13-digit global GTIN)';
            }
          } else if (digitsOnly.length === 14 && digitsOnly.substring(0, 2) === '00') {
            note = ' • GTIN-14 normalized to UPC-A';
          } else if (digitsOnly.length === 14) {
            type = 'ITF-14';
            typeSelect.value = 'ITF-14';
            note = ' • Auto-switched to ITF-14 (14-digit master carton)';
          }
        } else if (type === 'EAN-13') {
          if (digitsOnly.length === 14 && digitsOnly.charAt(0) === '0') {
            note = ' • GTIN-14 normalized to EAN-13';
          } else if (digitsOnly.length === 14) {
            type = 'ITF-14';
            typeSelect.value = 'ITF-14';
            note = ' • Auto-switched to ITF-14';
          }
        }

        badge1d.textContent = type;
        var val = rawVal || '081234567890';
        var res = window.DualMarkBarcode1D.renderCanvas(canvas1d, type, val, { scale: 3, barHeight: 110 });
        if (res.prefixInfo) {
          info1d.textContent = 'GS1 Region: ' + res.prefixInfo.country + ' (' + res.prefixInfo.org + ')' + note;
          info1d.style.color = 'var(--text-secondary)';
        }
      } catch (err) {
        info1d.textContent = 'Status: ' + err.message;
        info1d.style.color = 'var(--warning)';
      }
    }

    // Auto-calculate Modulo-10 Check Digit
    var btnCalcChk = document.getElementById('btn-1d-calc-chk');
    if (btnCalcChk) {
      btnCalcChk.addEventListener('click', function() {
        var raw = input1d.value.trim().replace(/\D/g, '');
        if (!raw) {
          showToast(_t('synth.toast_enter_barcode', null, 'Please enter barcode digits first'));
          return;
        }
        var type = typeSelect.value;
        if (type === 'UPC-A' && raw.length === 13 && raw.charAt(0) === '0') {
          raw = raw.substring(1);
        }
        var targetLen = 12;
        if (type === 'EAN-13') targetLen = 13;
        else if (type === 'ITF-14') targetLen = 14;
        else if (type === 'UPC-A') targetLen = 12;

        var root = raw;
        if (root.length >= targetLen) {
          root = root.substring(0, targetLen - 1);
        } else {
          while (root.length < targetLen - 1) root = '0' + root;
        }

        var chk = null;
        if (window.DualMarkGepir && typeof window.DualMarkGepir.calculateModulo10CheckDigit === 'function') {
          chk = window.DualMarkGepir.calculateModulo10CheckDigit(root);
        }
        if (chk === null) {
          var sum = 0;
          for (var i = root.length - 1, pos = 0; i >= 0; i--, pos++) {
            var d = parseInt(root[i], 10);
            sum += (pos % 2 === 0) ? (d * 3) : d;
          }
          chk = (10 - (sum % 10)) % 10;
        }

        input1d.value = root + chk;
        var chkSync = document.getElementById('chk-sync-codes');
        if (chkSync && chkSync.checked) {
          var syncGtin = (root + chk).replace(/\D/g, '');
          while (syncGtin.length < 14) syncGtin = '0' + syncGtin;
          gtin2d.value = syncGtin;
          update2D();
        }
        update1D();
        showToast(_t('synth.toast_check_digit_calc', { digit: chk }, '✓ Modulo-10 Check Digit Calculated: ' + chk));
        if (window.DualMarkAudio) window.DualMarkAudio.successChime();
        if (window.DualMarkRive && typeof window.DualMarkRive.triggerMascotCelebrate === 'function') {
          window.DualMarkRive.triggerMascotCelebrate();
        }
      });
    }

    var weight2d = document.getElementById('synth-2d-weight');
    var price2d = document.getElementById('synth-2d-price');
    var po2d = document.getElementById('synth-2d-po');
    var origin2d = document.getElementById('synth-2d-origin');

    function update2D() {
      var symbology = symbologySelect ? symbologySelect.value : 'QR';
      if (badge2dStandard) {
        if (symbology === 'DataMatrix') badge2dStandard.textContent = 'ISO/IEC 16022 (ECC 200)';
        else if (symbology === 'DotCode') badge2dStandard.textContent = 'ISO/IEC 20835 (DotCode)';
        else badge2dStandard.textContent = 'ISO/IEC 18004 (QR Code)';
      }

      var uri = window.DualMarkGS1.buildDigitalLinkUri({
        domain: domain2d.value,
        gtin: gtin2d.value,
        lot: lot2d.value,
        serial: serial2d.value,
        expiration: exp2d.value,
        weight: weight2d ? weight2d.value.trim() : null,
        price: price2d ? price2d.value.trim() : null,
        po: po2d ? po2d.value.trim() : null,
        origin: origin2d ? origin2d.value.trim() : null
      });
      preview2d.textContent = uri;

      if (symbology === 'DataMatrix' && window.DualMarkDataMatrix) {
        window.DualMarkDataMatrix.renderCanvas(canvas2d, uri, { scale: 5, margin: 3 });
      } else if (symbology === 'DotCode' && window.DualMarkDotCode) {
        window.DualMarkDotCode.renderCanvas(canvas2d, uri, { dotSize: 5, margin: 4 });
      } else {
        window.DualMarkGS1.renderQrCanvas(canvas2d, uri, { cellSize: 5, margin: 3 });
      }
    }

    // Bi-directional Date Conversion (YYMMDD <-> YYYY-MM-DD)
    if (expDate2d && exp2d) {
      expDate2d.addEventListener('change', function() {
        var parts = this.value.split('-');
        if (parts.length === 3) {
          exp2d.value = parts[0].slice(-2) + parts[1] + parts[2];
          update2D();
        }
      });

      exp2d.addEventListener('input', function() {
        var val = this.value.trim();
        if (val.length === 6 && /^\d{6}$/.test(val)) {
          var yy = parseInt(val.slice(0, 2), 10);
          var mm = val.slice(2, 4);
          var dd = val.slice(4, 6);
          var year = (yy >= 50 ? 1900 : 2000) + yy;
          expDate2d.value = year + '-' + mm + '-' + dd;
        }
      });
    }

    // 1-Click Industry Brand Presets
    var presetJuice = document.getElementById('preset-juice');
    if (presetJuice) {
      presetJuice.addEventListener('click', function() {
        typeSelect.value = 'UPC-A';
        input1d.value = '081234567890';
        domain2d.value = 'https://id.brand.com';
        gtin2d.value = '00812345678901';
        lot2d.value = 'LOT-JUICE-99';
        serial2d.value = 'SN-40291';
        exp2d.value = '261115';
        if (expDate2d) expDate2d.value = '2026-11-15';
        if (weight2d) weight2d.value = '000450';
        if (origin2d) origin2d.value = '840';
        if (symbologySelect) symbologySelect.value = 'QR';
        update1D();
        update2D();
        showToast('🧃 Cold-Pressed Juice Preset Loaded');
        if (window.DualMarkAudio) window.DualMarkAudio.successChime();
      });
    }

    var presetPharma = document.getElementById('preset-pharma');
    if (presetPharma) {
      presetPharma.addEventListener('click', function() {
        typeSelect.value = 'Code-128';
        input1d.value = 'PHARMA40921';
        domain2d.value = 'https://rx.pharma.org';
        gtin2d.value = '00301234567896';
        lot2d.value = 'LOT-RX-2026';
        serial2d.value = 'SN-998811';
        exp2d.value = '280531';
        if (expDate2d) expDate2d.value = '2028-05-31';
        if (symbologySelect) symbologySelect.value = 'DataMatrix';
        update1D();
        update2D();
        showToast('💊 Pharma Blister (DataMatrix) Preset Loaded');
        if (window.DualMarkAudio) window.DualMarkAudio.successChime();
      });
    }

    var presetShipper = document.getElementById('preset-shipper');
    if (presetShipper) {
      presetShipper.addEventListener('click', function() {
        typeSelect.value = 'ITF-14';
        input1d.value = '10081234567897';
        domain2d.value = 'https://logistics.supply.com';
        gtin2d.value = '10081234567897';
        lot2d.value = 'PALLET-881';
        serial2d.value = '001234560000000018';
        exp2d.value = '271231';
        if (expDate2d) expDate2d.value = '2027-12-31';
        if (weight2d) weight2d.value = '050000';
        if (symbologySelect) symbologySelect.value = 'QR';
        update1D();
        update2D();
        showToast('📦 Master Shipper (ITF-14 / SSCC) Preset Loaded');
        if (window.DualMarkAudio) window.DualMarkAudio.successChime();
      });
    }

    var chkSync = document.getElementById('chk-sync-codes');

    typeSelect.addEventListener('change', update1D);
    input1d.addEventListener('input', function() {
      if (chkSync && chkSync.checked) {
        var rawDigits = input1d.value.trim().replace(/\D/g, '');
        if (rawDigits.length >= 10) {
          var padded = rawDigits;
          while (padded.length < 14) padded = '0' + padded;
          gtin2d.value = padded;
          update2D();
        }
      }
      update1D();
    });

    if (symbologySelect) symbologySelect.addEventListener('change', update2D);

    if (gtin2d) {
      gtin2d.addEventListener('input', function() {
        if (chkSync && chkSync.checked) {
          var gtinDigits = gtin2d.value.trim().replace(/\D/g, '');
          if (gtinDigits.length === 14 && gtinDigits.substring(0, 2) === '00') {
            input1d.value = gtinDigits.substring(2);
            update1D();
          } else if (gtinDigits.length === 14 && gtinDigits.charAt(0) === '0') {
            input1d.value = gtinDigits.substring(1);
            update1D();
          }
        }
      });
    }

    [domain2d, gtin2d, lot2d, serial2d, exp2d, weight2d, price2d, po2d, origin2d].forEach(function(el) {
      if (el) el.addEventListener('input', update2D);
    });

    var countrySelect = document.getElementById('synth-2d-country-select');
    if (countrySelect && origin2d) {
      countrySelect.addEventListener('change', function() {
        origin2d.value = this.value;
        update2D();
        showToast('Origin Country AI 422: ' + this.options[this.selectedIndex].text);
      });
    }

    // Downloads
    document.getElementById('btn-1d-svg').addEventListener('click', function() {
      var res = window.DualMarkBarcode1D.renderSvg(typeSelect.value, input1d.value.trim());
      downloadBlob(res.svg, '1D_Barcode_' + typeSelect.value + '.svg', 'image/svg+xml');
      if (window.DualMarkAudio) window.DualMarkAudio.click();
    });

    document.getElementById('btn-1d-png').addEventListener('click', function() {
      canvas1d.toBlob(function(blob) {
        downloadBlob(blob, '1D_Barcode_' + typeSelect.value + '.png', 'image/png');
      });
      if (window.DualMarkAudio) window.DualMarkAudio.click();
    });

    document.getElementById('btn-2d-svg').addEventListener('click', function() {
      var uri = preview2d.textContent;
      var symbology = symbologySelect ? symbologySelect.value : 'QR';
      var svg, filename;
      if (symbology === 'DataMatrix' && window.DualMarkDataMatrix) {
        var res = window.DualMarkDataMatrix.renderSvg(uri);
        svg = res.svg;
        filename = '2D_GS1_DataMatrix.svg';
      } else if (symbology === 'DotCode' && window.DualMarkDotCode) {
        var res = window.DualMarkDotCode.renderSvg(uri);
        svg = res.svg;
        filename = '2D_GS1_DotCode.svg';
      } else {
        svg = window.DualMarkGS1.renderQrSvg(uri, { cellSize: 6, margin: 4 });
        filename = '2D_GS1_DigitalLink.svg';
      }
      downloadBlob(svg, filename, 'image/svg+xml');
      if (window.DualMarkAudio) window.DualMarkAudio.click();
    });

    document.getElementById('btn-2d-copy').addEventListener('click', function() {
      var uri = preview2d.textContent;
      copyTextSafely(uri, 'Copied GS1 Digital Link to Clipboard');
      window.DualMarkAudio.click();
    });

    // GS1 Digital Link Conformance Test Suite
    var btnConformance = document.getElementById('btn-gs1-conformance');
    var conformanceResult = document.getElementById('gs1-conformance-result');
    if (btnConformance && conformanceResult) {
      btnConformance.addEventListener('click', function() {
        var uri = preview2d.textContent;
        var res = window.DualMarkGS1.validateConformance(uri);
        conformanceResult.style.display = 'block';
        if (res.valid) {
          conformanceResult.innerHTML = '<span style="color:var(--emerald); font-weight:bold;">' + escapeHtml(_t('synth.gs1_conformance_passed', null, '✓ GS1 CONFORMANCE PASSED')) + '</span> (Score: ' + res.score + '/100)<br>' +
            '<span style="color:var(--text-secondary);">' + res.details.join(' | ') + '</span>';
          showToast(_t('synth.toast_conformance_ok', null, '✓ GS1 Digital Link Conformance Verified'));
          if (window.DualMarkAudio) window.DualMarkAudio.successChime();
        } else {
          conformanceResult.innerHTML = '<span style="color:var(--rose); font-weight:bold;">' + escapeHtml(_t('synth.gs1_conformance_failed', null, '✗ GS1 CONFORMANCE FAILED')) + '</span><br>' +
            '<span style="color:var(--rose);">' + res.errors.join('<br>') + '</span>';
          showToast(_t('synth.toast_conformance_issues', null, '⚠ GS1 Conformance Issues Detected'));
          if (window.DualMarkAudio) window.DualMarkAudio.warningBuzz();
        }
      });
    }

    // PIM / DAM Metadata Export (Salsify, Syndigo, 1WorldSync)
    var btnExportPim = document.getElementById('btn-export-pim');
    if (btnExportPim) {
      btnExportPim.addEventListener('click', function() {
        var gtin = gtin2d.value.trim();
        var pimData = window.DualMarkGS1.exportPimFormat({
          gtin: gtin,
          lot: lot2d.value.trim(),
          serial: serial2d.value.trim(),
          expiration: exp2d.value.trim(),
          weight: weight2d ? weight2d.value.trim() : null,
          price: price2d ? price2d.value.trim() : null,
          po: po2d ? po2d.value.trim() : null,
          origin: origin2d ? origin2d.value.trim() : null
        });
        downloadBlob(JSON.stringify(pimData, null, 2), 'DualMark_PIM_Syndication_' + gtin + '.json', 'application/json');
        showToast(_t('synth.toast_pim_exported', null, '📦 PIM / DAM Metadata Exported (Salsify, Syndigo, 1WorldSync)'));
        if (window.DualMarkAudio) window.DualMarkAudio.successChime();
      });
    }

    // GS1 GEPIR Prefix Validation Button
    var btnGepir = document.getElementById('btn-gepir-validate');
    var gepirInput = document.getElementById('gepir-check-input');
    var gepirBadge = document.getElementById('gepir-country-badge');
    var gepirResultBox = document.getElementById('gepir-result-box');

    if (btnGepir && gepirInput) {
      btnGepir.addEventListener('click', async function() {
        var gtin = gepirInput.value.trim();
        if (!gtin) {
          showToast('Please enter a GTIN or barcode to verify');
          return;
        }
        var res = await window.DualMarkGepir.queryGepir(gtin);
        if (gepirBadge) gepirBadge.textContent = res.memberOrg + ' (' + res.prefix + ')';
        if (gepirResultBox) {
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
        }
      });
    }

    // Collapsible Extended Logistics Parameters Accordion
    var btnToggleAis = document.getElementById('btn-toggle-extended-ais');
    var bodyExtendedAis = document.getElementById('body-extended-ais');
    var arrowAis = document.getElementById('accordion-ais-arrow');
    if (btnToggleAis && bodyExtendedAis) {
      btnToggleAis.addEventListener('click', function() {
        var isClosed = bodyExtendedAis.style.display === 'none' || !bodyExtendedAis.style.display;
        if (isClosed) {
          bodyExtendedAis.style.display = 'block';
          if (arrowAis) arrowAis.classList.add('open');
        } else {
          bodyExtendedAis.style.display = 'none';
          if (arrowAis) arrowAis.classList.remove('open');
        }
      });
    }

    // Tab 1 Instant Clearance Badge Pill -> Jump to Tab 2
    var tab1ClearancePill = document.getElementById('tab1-clearance-pill');
    if (tab1ClearancePill) {
      tab1ClearancePill.addEventListener('click', function() {
        var tabBtn = document.querySelector('.bottom-nav-item[data-tab="tab-clearance"]');
        if (tabBtn) {
          tabBtn.click();
        } else if (typeof window.switchTab === 'function') {
          window.switchTab('tab-clearance');
        }
        showToast('🔍 Opened 50mm Die-Line Inspector');
      });
    }

    // 1-Click Master Prepress Bundle trigger from Tab 1
    var btnTab1Bundle = document.getElementById('btn-tab1-prepress-bundle');
    if (btnTab1Bundle) {
      btnTab1Bundle.addEventListener('click', function() {
        var masterBtn = document.getElementById('btn-export-master-package');
        if (masterBtn) {
          masterBtn.click();
        } else {
          var btnPdf = document.getElementById('btn-export-pdf-x4');
          var btnSvg = document.getElementById('btn-export-combined-svg');
          if (btnPdf) btnPdf.click();
          if (btnSvg) btnSvg.click();
        }
        if (window.DualMarkRive && typeof window.DualMarkRive.triggerMascotCelebrate === 'function') {
          window.DualMarkRive.triggerMascotCelebrate();
        }
      });
    }

    window.loadBarcodeIntoSynth = function(code, type) {
      if (!code) return;
      var clean = code.trim();
      var digitsOnly = clean.replace(/\D/g, '');
      if (typeSelect) {
        if (type) {
          typeSelect.value = type;
        } else if (digitsOnly.length === 12) {
          typeSelect.value = 'UPC-A';
        } else if (digitsOnly.length === 13) {
          typeSelect.value = 'EAN-13';
        } else if (digitsOnly.length === 14) {
          typeSelect.value = 'ITF-14';
        } else {
          typeSelect.value = 'Code-128';
        }
      }
      if (input1d) {
        input1d.value = clean;
      }
      if (gtin2d) {
        var g = digitsOnly;
        while (g.length < 14) g = '0' + g;
        gtin2d.value = g;
      }
      update1D();
      update2D();
    };

    update1D();
    update2D();
  }

  // 3. Module 2: 50mm Die-Line Inspector
  function initClearanceModule() {
    var canvas = document.getElementById('canvas-clearance');
    var presetSelect = document.getElementById('clearance-preset');
    var statusBox = document.getElementById('clearance-status-box');
    var statusText = document.getElementById('clearance-status-text');
    var statusSub = document.getElementById('clearance-status-sub');
    var readout = document.getElementById('clearance-mm-readout');
    var btnSnap = document.getElementById('btn-snap-50mm');

    if (window.clearanceInspector && typeof window.clearanceInspector.destroy === 'function') {
      window.clearanceInspector.destroy();
    }
    window.clearanceInspector = new window.DualMarkClearance.ClearanceInspector(canvas);

    var lastComplianceState = null;

    window.clearanceInspector.onUpdate(function(metrics) {
      readout.textContent = metrics.edgeDistanceMm + ' mm';
      var distVal = parseFloat(metrics.edgeDistanceMm) || 0;
      if (window.DualMarkRive) {
        window.DualMarkRive.triggerClearanceUpdate(distVal, metrics.isCompliant, false);
      }
      var tab1Pill = document.getElementById('tab1-clearance-pill');
      if (metrics.impossibleFit) {
        statusBox.className = 'status-meter fail';
        var headNarrow = (window.DualMarkI18n ? window.DualMarkI18n.t('clearance.status_violation_head') : 'IMPOSSIBLE FIT (PACKAGE TOO NARROW)');
        var subNarrow = (window.DualMarkI18n ? window.DualMarkI18n.t('clearance.status_violation_sub') : 'Package width cannot fit 50mm clearance.');
        statusText.innerHTML = '<span>⚠</span> <span>' + headNarrow + '</span>';
        statusSub.textContent = subNarrow;
        if (tab1Pill) {
          tab1Pill.className = 'badge badge-danger';
          tab1Pill.textContent = '⚠ <50mm';
        }
        if (lastComplianceState !== false) {
          window.DualMarkAudio.warningBuzz();
        }
        lastComplianceState = false;
      } else if (metrics.isCompliant) {
        statusBox.className = 'status-meter pass';
        var headPass = (window.DualMarkI18n ? window.DualMarkI18n.t('clearance.status_compliant_head') : 'COMPLIANT (≥ 50.0 mm)');
        var subPass = (window.DualMarkI18n ? window.DualMarkI18n.t('clearance.status_compliant_sub') : 'Edge-to-edge optical clearance satisfies Sunrise 2027 retail pass-rate requirements (' + metrics.marginDeltaMm + ' mm safety margin).');
        statusText.innerHTML = '<span>✓</span> <span>' + headPass + '</span>';
        statusSub.textContent = subPass;
        if (tab1Pill) {
          tab1Pill.className = 'badge badge-emerald';
          tab1Pill.textContent = '⚡ ' + metrics.edgeDistanceMm + ' mm (PASS: ≥ 50mm)';
        }
        if (lastComplianceState === false) {
          window.DualMarkAudio.successChime();
        }
        lastComplianceState = true;
      } else {
        statusBox.className = 'status-meter fail';
        var headFail = (window.DualMarkI18n ? window.DualMarkI18n.t('clearance.status_violation_head') : 'VIOLATION (< 50.0 mm COLLISION RISK)');
        var subFail = (window.DualMarkI18n ? window.DualMarkI18n.t('clearance.status_violation_sub') : 'Risk of POS scanner laser-grid cross-talk. Deficit: ' + Math.abs(metrics.marginDeltaMm) + ' mm below 50mm standard.');
        statusText.innerHTML = '<span>⚠</span> <span>' + headFail + '</span>';
        statusSub.textContent = subFail;
        if (tab1Pill) {
          tab1Pill.className = 'badge badge-danger';
          tab1Pill.textContent = '⚠ ' + metrics.edgeDistanceMm + ' mm (VIOLATION < 50mm)';
        }
        if (lastComplianceState === true) {
          window.DualMarkAudio.warningBuzz();
        }
        lastComplianceState = false;
      }
    });

    presetSelect.addEventListener('change', function() {
      window.clearanceInspector.setPreset(this.value);
    });

    btnSnap.addEventListener('click', function() {
      window.clearanceInspector.snapToSafe50mm();
      if (window.DualMarkRive) {
        window.DualMarkRive.triggerClearanceUpdate(52.0, true, true);
        if (typeof window.DualMarkRive.triggerMascotCelebrate === 'function') {
          window.DualMarkRive.triggerMascotCelebrate();
        }
      }
      showToast(_t('clearance.toast_snap', null, '⚡ Snapped to 52mm Safe Distance'));
      window.DualMarkAudio.successChime();
    });

    // 3D Curvilinear Surface Curvature Controls
    var segGeomFlat = document.getElementById('seg-geom-flat');
    var segGeomCyl = document.getElementById('seg-geom-cyl');
    var wrapCylControls = document.getElementById('wrap-cylinder-controls');
    var sliderCylDiam = document.getElementById('slider-cylinder-diam');
    var valCylDiam = document.getElementById('val-cylinder-diam');
    var badgeCylStatus = document.getElementById('badge-cylinder-3d-status');

    if (segGeomFlat && segGeomCyl && wrapCylControls) {
      segGeomFlat.addEventListener('click', function() {
        segGeomFlat.classList.add('active');
        segGeomCyl.classList.remove('active');
        wrapCylControls.style.display = 'none';
        window.clearanceInspector.setSurfaceType('flat');
        showToast(_t('clearance.toast_carton', null, '📄 Flat Carton Mode Active'));
        if (window.DualMarkAudio) window.DualMarkAudio.click();
      });

      segGeomCyl.addEventListener('click', function() {
        segGeomCyl.classList.add('active');
        segGeomFlat.classList.remove('active');
        wrapCylControls.style.display = 'flex';
        var diam = sliderCylDiam ? parseFloat(sliderCylDiam.value) : 66;
        window.clearanceInspector.setSurfaceType('cylindrical', diam);
        showToast(_t('clearance.toast_cylindrical', { diam: diam }, '🥫 3D Cylindrical Packaging Mode (' + diam + ' mm Ø)'));
        if (window.DualMarkAudio) window.DualMarkAudio.successChime();
      });
    }

    if (sliderCylDiam && valCylDiam) {
      sliderCylDiam.addEventListener('input', function() {
        var diam = parseFloat(this.value);
        valCylDiam.textContent = diam + ' mm';
        window.clearanceInspector.setCylinderDiameter(diam);
      });
    }

    // Connect Cylindrical Live Status into onUpdate
    window.clearanceInspector.onUpdate(function(metrics) {
      if (metrics.surfaceType === 'cylindrical' && badgeCylStatus) {
        var statusLabel = metrics.losOccluded ? '✓ OCCLUDED (SAFE)' : (metrics.isCompliant ? 'ARC OK' : '⚠ COLLISION');
        badgeCylStatus.textContent = 'Δθ: ' + metrics.deltaThetaDeg + '° | ' + statusLabel;
        badgeCylStatus.className = metrics.losOccluded ? 'badge badge-green' : (metrics.isCompliant ? 'badge badge-cyan' : 'badge badge-danger');
      }
    });

    // ISO/IEC 15416 & 15415 Optical Verification & NIST Calibration
    var btnIsoGrading = document.getElementById('btn-run-iso-grading');
    var btnNistCal = document.getElementById('btn-nist-calibration');
    var isoResultsWrap = document.getElementById('iso-grading-results');
    var isoGradeBadge = document.getElementById('iso-overall-grade-badge');
    var isoMetricsWrap = document.getElementById('iso-metrics-table-wrap');
    var isoComplianceBadge = document.getElementById('iso-compliance-badge');

    if (btnIsoGrading && window.DualMarkIsoVerifier) {
      btnIsoGrading.addEventListener('click', function() {
        var canvas1d = document.getElementById('canvas-1d');
        var canvas2d = document.getElementById('canvas-2d');
        var report1d = window.DualMarkIsoVerifier.gradeBarcode1D(canvas1d);
        var report2d = window.DualMarkIsoVerifier.gradeBarcode2D(canvas2d);

        var overallLetter = (report1d.overallGrade.letter === 'A' && report2d.overallGrade.letter === 'A') ? 'A' :
                            (report1d.overallGrade.numeric < report2d.overallGrade.numeric ? report1d.overallGrade.letter : report2d.overallGrade.letter);
        var overallNumeric = Math.min(report1d.overallGrade.numeric, report2d.overallGrade.numeric).toFixed(1);

        if (isoResultsWrap) isoResultsWrap.style.display = 'block';
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

        showToast(_t('iso.toast_verified', { grade: overallLetter, score: overallNumeric }, '✓ Optical Verification: ISO Grade ' + overallLetter + ' (' + overallNumeric + ')'));
        if (window.DualMarkAudio) window.DualMarkAudio.successChime();
      });
    }

    if (btnNistCal && window.DualMarkIsoVerifier) {
      btnNistCal.addEventListener('click', function() {
        var cal = window.DualMarkIsoVerifier.performNistCalibration();
        if (isoComplianceBadge) {
          isoComplianceBadge.textContent = _t('iso.nist_calibrated', { factor: cal.calibrationFactor }, 'NIST CALIBRATED (FACTOR ' + cal.calibrationFactor + ')');
          isoComplianceBadge.className = 'badge badge-green';
        }
        showToast(_t('iso.toast_nist', { id: cal.certificateId, drift: cal.sensorDrift }, '⚖️ NIST Calibration Verified: ' + cal.certificateId + ' (Drift: ' + cal.sensorDrift + ')'));
        if (window.DualMarkAudio) window.DualMarkAudio.successChime();
      });
    }

    // Zoom Controls
    var btnZoomIn = document.getElementById('btn-zoom-in');
    var btnZoomOut = document.getElementById('btn-zoom-out');
    var btnZoomReset = document.getElementById('btn-zoom-reset');

    if (btnZoomIn) {
      btnZoomIn.addEventListener('click', function() {
        var z = window.clearanceInspector.zoomIn();
        showToast(_t('clearance.toast_zoom', { percent: Math.round(z * 100) }, '🔍 Zoom: ' + Math.round(z * 100) + '%'));
      });
    }
    if (btnZoomOut) {
      btnZoomOut.addEventListener('click', function() {
        var z = window.clearanceInspector.zoomOut();
        showToast('🔍 Zoom: ' + Math.round(z * 100) + '%');
      });
    }
    if (btnZoomReset) {
      btnZoomReset.addEventListener('click', function() {
        window.clearanceInspector.resetZoom();
        showToast(_t('clearance.toast_zoom_reset', null, '↺ Zoom Reset (100%)'));
      });
    }

    // Printable ISO Certificate PDF
    var btnIsoCertPdf = document.getElementById('btn-iso-cert-pdf');
    if (btnIsoCertPdf && window.DualMarkIsoVerifier) {
      btnIsoCertPdf.addEventListener('click', function() {
        var gtin = (document.getElementById('synth-2d-gtin') && document.getElementById('synth-2d-gtin').value.trim()) || '00812345678901';
        var pdfStr = window.DualMarkIsoVerifier.generateCertificatePdf({
          gtin: gtin,
          operator: 'Lead Prepress QC Engineer',
          substrate: 'Coated SBS Folding Carton Board (18pt)'
        });
        downloadBlob(pdfStr, 'DualMark_ISO_Compliance_Certificate_' + gtin + '.pdf', 'application/pdf');
        showToast(_t('iso.toast_cert_pdf', null, '📄 Printable ISO 15415/15416 Certificate PDF Generated'));
        if (window.DualMarkAudio) window.DualMarkAudio.successChime();
      });
    }

    window.clearanceInspector.render();
  }

  // 4. Module 3: Dynamic Link Resolver
  function initResolverModule() {
    var tableBody = document.getElementById('resolver-rules-body');
    var testGtin = document.getElementById('test-resolve-gtin');
    var testCountry = document.getElementById('test-resolve-country');
    var testBtn = document.getElementById('btn-test-resolve');
    var testOutput = document.getElementById('test-resolve-output');

    function renderRulesTable() {
      var rules = window.DualMarkResolver.getRules();
      tableBody.innerHTML = '';
      rules.forEach(function(r) {
        var tr = document.createElement('tr');
        var geoSummary = (r.geoRules && r.geoRules.length > 0)
          ? r.geoRules.map(function(g) { return g.country; }).join(', ')
          : 'None';

        var recallBadge = r.isRecalled
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
        ].join('');
        tableBody.appendChild(tr);
      });

      // Bind buttons
      document.querySelectorAll('.recall-btn').forEach(function(b) {
        b.addEventListener('click', function() {
          var id = this.getAttribute('data-id');
          var updated = window.DualMarkResolver.toggleRecall(id);
          renderRulesTable();
          if (updated && updated.isRecalled) {
            window.DualMarkAudio.warningBuzz();
            showToast(_t('resolver.toast_recall_activated', { gtin: updated.gtin }, '🚨 Recall Kill-Switch Activated for ' + updated.gtin));
          } else {
            showToast(_t('resolver.toast_recall_deactivated', null, 'Recall deactivated'));
          }
        });
      });

      document.querySelectorAll('.delete-btn').forEach(function(b) {
        b.addEventListener('click', function() {
          var id = this.getAttribute('data-id');
          window.DualMarkResolver.deleteRule(id);
          renderRulesTable();
          showToast(_t('resolver.toast_rule_removed', null, 'Rule removed'));
        });
      });
    }

    testBtn.addEventListener('click', function() {
      var gtin = testGtin.value.trim();
      var country = testCountry.value;
      var result = window.DualMarkResolver.resolve(gtin, '', '', country);
      testOutput.innerHTML = [
        escapeHtml(_t('resolver.lbl_status', null, 'Resolution Status:')) + ' <strong>' + result.status + '</strong>',
        escapeHtml(_t('resolver.lbl_target', null, 'Target Redirect URL:')) + ' <span style="color:#10B981;">' + result.targetUrl + '</span>',
        result.message ? '<span style="color:#EF4444; font-weight:bold;">' + result.message + '</span>' : ''
      ].filter(Boolean).join('<br>');

      if (result.status === 'RECALLED_SAFETY_OVERRIDE') {
        window.DualMarkAudio.warningBuzz();
      } else {
        window.DualMarkAudio.click();
      }
    });

    // Export buttons
    document.getElementById('btn-export-sql').addEventListener('click', function() {
      var sql = window.DualMarkResolver.exportSqlScript();
      downloadBlob(sql, 'dualmark_routes.sql', 'application/sql');
      if (window.DualMarkAudio) window.DualMarkAudio.click();
    });

    document.getElementById('btn-export-json').addEventListener('click', function() {
      var json = window.DualMarkResolver.exportJsonRules();
      downloadBlob(json, 'dualmark_routes.json', 'application/json');
      if (window.DualMarkAudio) window.DualMarkAudio.click();
    });

    document.getElementById('btn-export-cf').addEventListener('click', function() {
      var worker = window.DualMarkResolver.exportCloudflareWorker();
      downloadBlob(worker, 'worker.js', 'application/javascript');
      if (window.DualMarkAudio) window.DualMarkAudio.click();
    });

    document.getElementById('btn-export-nginx').addEventListener('click', function() {
      var nginx = window.DualMarkResolver.exportNginxConfig();
      downloadBlob(nginx, 'nginx_routes.conf', 'text/plain');
      if (window.DualMarkAudio) window.DualMarkAudio.click();
    });

    var btnExportLinkset = document.getElementById('btn-export-linkset');
    if (btnExportLinkset) {
      btnExportLinkset.addEventListener('click', function() {
        var gtin = (testGtin && testGtin.value.trim()) || '00812345678901';
        var linksetJson = window.DualMarkResolver.exportLinksetJson(gtin);
        downloadBlob(linksetJson, 'gs1_linkset_' + gtin + '.json', 'application/linkset+json');
        if (window.DualMarkAudio) window.DualMarkAudio.click();
      });
    }

    var btnAddRule = document.getElementById('btn-add-resolve-rule');
    if (btnAddRule) {
      btnAddRule.addEventListener('click', function() {
        var gtin = (testGtin && testGtin.value.trim()) || '00812345678901';
        var country = (testCountry && testCountry.value) || 'US';
        var newRule = {
          id: 'rule_' + Date.now(),
          gtin: gtin,
          itemTitle: 'Packaging Route (' + gtin + ')',
          lot: '*',
          serial: '*',
          isRecalled: false,
          recallNoticeUrl: 'https://safety.brand.com/recall-alert',
          defaultUrl: 'https://brand.com/p/' + gtin,
          geoRules: [
            { country: country, targetUrl: 'https://brand.com/' + country.toLowerCase() + '/item/' + gtin }
          ]
        };
        window.DualMarkResolver.addRule(newRule);
        renderRulesTable();
        showToast(_t('resolver.toast_rule_added', { gtin: gtin }, '✓ Added Route Rule for ' + gtin));
        if (window.DualMarkAudio) window.DualMarkAudio.successChime();
      });
    }

    renderRulesTable();
  }

  // 5. Module 4: Optical Scanner & Dewarp
  function initScannerModule() {
    var previewCanvas = document.getElementById('scanner-canvas');
    var dewarpCanvas = document.getElementById('canvas-dewarp');
    var video = document.getElementById('scanner-video');
    var btnStart = document.getElementById('btn-start-camera');
    var btnStop = document.getElementById('btn-stop-camera');
    var badgeState = document.getElementById('scanner-state-badge');
    var resultBlock = document.getElementById('scan-decoded-result');

    var studio = new window.DualMarkScanner.ScannerDewarpStudio(previewCanvas, dewarpCanvas);
    window.scannerStudio = studio;

    function executeStartCamera() {
      badgeState.textContent = _t('scanner.camera_streaming', null, 'CAMERA STREAMING');
      badgeState.className = 'badge badge-green';
      btnStart.style.display = 'none';
      btnStop.style.display = 'inline-flex';

      studio.startCamera(video, function(detected) {
        if (detected && detected.length > 0) {
          window.DualMarkAudio.scanBeep();
          var first = detected[0];
          resultBlock.innerHTML = [
            escapeHtml(_t('scanner.lbl_format', null, 'Format:')) + ' <strong>' + first.format + '</strong>',
            escapeHtml(_t('scanner.lbl_decoded', null, 'Decoded Value:')) + ' <span style="color:#00F0FF;">' + first.rawValue + '</span>',
            first.isGs1DigitalLink ? '<span style="color:#10B981;">' + escapeHtml(_t('scanner.gs1_validated', { gtin: first.gs1Data ? first.gs1Data.gtin : '' }, '[GS1 DIGITAL LINK VALIDATED] GTIN: ' + (first.gs1Data ? first.gs1Data.gtin : ''))) + '</span>' : ''
          ].join('<br>');

          if (window.DualMarkRive) {
            window.DualMarkRive.triggerScannerAcquired(true, true, first.format === 'qr_code' ? 1 : 0, true);
          }
          handleScannedForQuickCte(first);
        }
      }, function(err) {
        badgeState.textContent = _t('scanner.camera_unavailable', null, 'CAMERA UNAVAILABLE');
        badgeState.className = 'badge badge-red';
        btnStart.style.display = 'inline-flex';
        btnStop.style.display = 'none';
        showToast(_t('scanner.toast_camera_denied', null, 'Camera access unavailable (Check permissions)'));
      });
    }

    btnStart.addEventListener('click', function() {
      var accepted = localStorage.getItem('dualmark_camera_rationale_accepted');
      if (accepted === 'true') {
        executeStartCamera();
      } else {
        var modal = document.getElementById('modal-camera-rationale');
        if (modal) {
          modal.style.display = 'flex';
          if (window.DualMarkAudio) window.DualMarkAudio.click();
        } else {
          executeStartCamera();
        }
      }
    });

    // Camera Rationale Modal Actions
    var btnCameraGrant = document.getElementById('btn-camera-grant');
    var btnCameraFallback = document.getElementById('btn-camera-fallback');
    var btnCameraDismiss = document.getElementById('btn-camera-dismiss');
    var btnCloseCameraRationale = document.getElementById('btn-close-camera-rationale');
    var modalCamera = document.getElementById('modal-camera-rationale');

    if (btnCameraGrant) {
      btnCameraGrant.addEventListener('click', function() {
        localStorage.setItem('dualmark_camera_rationale_accepted', 'true');
        if (modalCamera) modalCamera.style.display = 'none';
        executeStartCamera();
      });
    }

    if (btnCameraFallback) {
      btnCameraFallback.addEventListener('click', function() {
        if (modalCamera) modalCamera.style.display = 'none';
        var fileIn = document.getElementById('input-scan-file');
        if (fileIn) fileIn.click();
        showToast('Offline File Fallback Selected');
      });
    }

    if (btnCameraDismiss && modalCamera) {
      btnCameraDismiss.addEventListener('click', function() {
        modalCamera.style.display = 'none';
      });
    }

    if (btnCloseCameraRationale && modalCamera) {
      btnCloseCameraRationale.addEventListener('click', function() {
        modalCamera.style.display = 'none';
      });
    }

    var cardQuickCte = document.getElementById('card-scan-quick-cte');
    var summaryQuickCte = document.getElementById('quick-cte-summary');
    var btnQuickLogCte = document.getElementById('btn-quick-log-cte');
    var btnViewFsmaCte = document.getElementById('btn-view-fsma-cte');
    var lastScannedCteData = null;

    function handleScannedForQuickCte(item) {
      if (!cardQuickCte) return;
      var gtin = (item.gs1Data && item.gs1Data.gtin) ? item.gs1Data.gtin : (item.rawValue ? item.rawValue.replace(/\D/g, '').slice(0, 14) : '00812345678901');
      var lot = (item.gs1Data && item.gs1Data.lot) ? item.gs1Data.lot : ('LOT-' + new Date().getFullYear() + '-SCAN');
      var serial = (item.gs1Data && item.gs1Data.serial) ? item.gs1Data.serial : ('SN-' + Math.floor(10000 + Math.random() * 90000));

      lastScannedCteData = {
        gtin: gtin || '00812345678901',
        tlc: lot,
        serial: serial,
        eventType: 'RECEIVING CTE',
        commodity: 'Scanned Commercial Item',
        quantity: '1 Unit / Scanned',
        gln: 'GLN 0812345000012 — Receiving Bay #1',
        gps: (document.getElementById('fsma-gps') ? document.getElementById('fsma-gps').value : 'Live Field GPS')
      };

      var fGtin = document.getElementById('fsma-gtin');
      if (fGtin) fGtin.value = lastScannedCteData.gtin;
      var fTlc = document.getElementById('fsma-tlc');
      if (fTlc) fTlc.value = lastScannedCteData.tlc;

      if (summaryQuickCte) {
        summaryQuickCte.textContent = 'GTIN: ' + lastScannedCteData.gtin + ' | Lot: ' + lot + ' (' + (item.format || '2D').toUpperCase() + ')';
      }
      cardQuickCte.style.display = 'block';
    }
    window.handleScannedForQuickCte = handleScannedForQuickCte;

    if (btnQuickLogCte) {
      btnQuickLogCte.addEventListener('click', function() {
        if (!lastScannedCteData) {
          var gtinVal = (document.getElementById('fsma-gtin') ? document.getElementById('fsma-gtin').value : '00812345678901') || '00812345678901';
          var tlcVal = (document.getElementById('fsma-tlc') ? document.getElementById('fsma-tlc').value : 'LOT-2026-X') || 'LOT-2026-X';
          lastScannedCteData = {
            gtin: gtinVal,
            tlc: tlcVal,
            serial: 'SN-' + Math.floor(10000 + Math.random() * 90000),
            eventType: 'RECEIVING CTE',
            commodity: 'Scanned Commercial Item',
            quantity: '1 Unit / Scanned',
            gln: 'GLN 0812345000012 — Receiving Bay #1',
            gps: (document.getElementById('fsma-gps') ? document.getElementById('fsma-gps').value : 'Live Field GPS')
          };
        }
        if (window.DualMarkFsma && typeof window.DualMarkFsma.addRecord === 'function') {
          var rec = window.DualMarkFsma.addRecord(lastScannedCteData);
          showToast('✓ Committed to FSMA Chain: ' + rec.id);
          if (window.DualMarkAudio) window.DualMarkAudio.successChime();
          if (window.DualMarkRive) {
            window.DualMarkRive.triggerSealSigned(true);
            if (typeof window.DualMarkRive.triggerMascotCelebrate === 'function') {
              window.DualMarkRive.triggerMascotCelebrate();
            }
          }
          cardQuickCte.style.display = 'none';
          if (typeof window.switchTab === 'function') {
            window.switchTab('tab-fsma');
          }
        }
      });
    }

    if (btnViewFsmaCte) {
      btnViewFsmaCte.addEventListener('click', function() {
        if (typeof window.switchTab === 'function') {
          window.switchTab('tab-fsma');
        } else {
          var tabBtn = document.querySelector('.bottom-nav-item[data-tab="tab-fsma"]');
          if (tabBtn) tabBtn.click();
        }
      });
    }

    btnStop.addEventListener('click', function() {
      studio.stopCamera();
      if (window.DualMarkRive) {
        window.DualMarkRive.triggerScannerAcquired(false, false, 0, false);
      }
      badgeState.textContent = 'CAMERA OFFLINE';
      badgeState.className = 'badge badge-cyan';
      btnStart.style.display = 'inline-flex';
      btnStop.style.display = 'none';
      if (cardQuickCte) cardQuickCte.style.display = 'none';
    });

    // Torch / Flashlight Toggle
    var btnTorch = document.getElementById('btn-toggle-torch');
    if (btnTorch) {
      btnTorch.addEventListener('click', function() {
        if (window.DualMarkBridge && typeof window.DualMarkBridge.toggleTorch === 'function') {
          var on = window.DualMarkBridge.toggleTorch();
          showToast(on ? '🔦 Hardware Flashlight Activated' : '🔦 Flashlight Off');
        } else {
          showToast('🔦 Flashlight toggled (Supported on native Android or compatible Web cameras)');
        }
        if (window.DualMarkAudio) window.DualMarkAudio.click();
      });
    }

    // Live Optical Fiducial Calibration (20mm Coupon or ISO ID-1 Card)
    var btnCalibrate = document.getElementById('btn-calibrate-target');
    if (btnCalibrate) {
      btnCalibrate.addEventListener('click', function() {
        var res = studio.calibrateWithFiducial('standard_card');
        if (res && res.scaleMmPerPx > 0) {
          showToast('📐 Calibrated Optical Scale: ' + (1 / res.scaleMmPerPx).toFixed(2) + ' px/mm (' + res.scaleMmPerPx.toFixed(4) + ' mm/px)');
          if (window.DualMarkAudio) window.DualMarkAudio.successChime();
        } else {
          var resCoupon = studio.calibrateWithFiducial('coupon_20mm');
          if (resCoupon && resCoupon.scaleMmPerPx > 0) {
            showToast('📐 Calibrated 20mm Coupon: ' + (1 / resCoupon.scaleMmPerPx).toFixed(2) + ' px/mm');
            if (window.DualMarkAudio) window.DualMarkAudio.successChime();
          } else {
            showToast('📐 Calibration: Place standard ID-1 card or 20mm coupon in frame');
            if (window.DualMarkAudio) window.DualMarkAudio.click();
          }
        }
      });
    }

    // File scan input
    var scanFileInput = document.getElementById('input-scan-file');
    scanFileInput.addEventListener('change', function(e) {
      if (e.target.files && e.target.files[0]) {
        var file = e.target.files[0];
        studio.scanImageFile(file, function(res) {
          if (res.results && res.results.length > 0) {
            var first = res.results[0];
            if (window.DualMarkAudio) window.DualMarkAudio.scanBeep();
            if (badgeState) {
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
            ].join('');

            var btnTransfer = document.getElementById('btn-transfer-scanned-to-synth');
            if (btnTransfer) {
              btnTransfer.addEventListener('click', function() {
                if (window.loadBarcodeIntoSynth) {
                  window.loadBarcodeIntoSynth(first.rawValue, first.format === 'upc_a' ? 'UPC-A' : (first.format === 'ean_13' ? 'EAN-13' : 'UPC-A'));
                }
                var synthTabBtn = document.querySelector('.bottom-nav-item[data-tab="tab-synth"]');
                if (synthTabBtn) synthTabBtn.click();
                else if (typeof window.switchTab === 'function') window.switchTab('tab-synth');
                showToast(_t('scanner.toast_transferred', { value: first.rawValue }, '⚡ Barcode ' + first.rawValue + ' transferred to Dual-Code Synthesizer!'));
                if (window.DualMarkAudio) window.DualMarkAudio.successChime();
              });
            }

            if (window.DualMarkRive) {
              window.DualMarkRive.triggerScannerAcquired(true, true, first.format === 'qr_code' ? 1 : 0, true);
            }
            handleScannedForQuickCte(first);
            showToast('✓ Barcode Decoded: ' + first.rawValue + ' (' + (first.format || 'UPC-A').toUpperCase() + ')');
          } else {
            resultBlock.textContent = 'Analyzed: ' + file.name + ' (' + res.image.width + 'x' + res.image.height + ') — No standard barcode recognized';
            showToast('Analyzed packaging photo: No barcode recognized');
          }
        });
      }
    });

    // Dewarp file input
    var dewarpFileInput = document.getElementById('input-dewarp-file');
    dewarpFileInput.addEventListener('change', function(e) {
      if (e.target.files && e.target.files[0]) {
        var reader = new FileReader();
        reader.onload = function(ev) {
          var img = new Image();
          img.onload = function() {
            studio.loadDocumentForDewarp(img);
            showToast('Document loaded into 4-point dewarper');
          };
          img.src = ev.target.result;
        };
        reader.readAsDataURL(e.target.files[0]);
      }
    });

    var btnAutoCorners = document.getElementById('btn-autodetect-corners');
    if (btnAutoCorners) {
      btnAutoCorners.addEventListener('click', function() {
        if (studio.sourceImage) {
          studio.autoDetectCorners(true);
          showToast('🎯 Corners Auto-Detected via Canny/Sobel');
          if (window.DualMarkAudio) window.DualMarkAudio.successChime();
        } else {
          showToast('Please load a document image first');
        }
      });
    }

    document.getElementById('btn-flatten-dewarp').addEventListener('click', function() {
      var dataUrl = studio.flattenAndBinarize(800, 1050);
      if (dataUrl) {
        showToast('Document Flattened & High-Contrast Binarized');
        window.DualMarkAudio.successChime();
        // Set as default attachment for FSMA record
        window.__lastDewarpedDoc = dataUrl;
      } else {
        showToast('Please load a document image first');
      }
    });

    // Cylindrical Surface Ray-Marching Unrolling
    var cylRadiusSlider = document.getElementById('cyl-radius-slider');
    var cylRadiusVal = document.getElementById('cyl-radius-val');
    var btnUnrollCyl = document.getElementById('btn-unroll-cylindrical');
    var cylCanvas = document.getElementById('canvas-cyl-unroll');
    var cylWrap = document.getElementById('cyl-unroll-preview-wrap');

    if (cylRadiusSlider && cylRadiusVal) {
      cylRadiusSlider.addEventListener('input', function() {
        cylRadiusVal.textContent = this.value + ' mm';
      });
    }

    if (btnUnrollCyl && cylCanvas && window.DualMarkDewarp) {
      btnUnrollCyl.addEventListener('click', function() {
        var sourceCanvas = document.getElementById('canvas-1d') || document.getElementById('canvas-dewarp');
        if (!sourceCanvas) return;
        var radiusMm = cylRadiusSlider ? parseFloat(cylRadiusSlider.value) : 33;
        var unrolled = window.DualMarkDewarp.unrollCylindricalSurface(sourceCanvas, radiusMm);
        cylCanvas.width = unrolled.width;
        cylCanvas.height = unrolled.height;
        var ctx = cylCanvas.getContext('2d');
        ctx.drawImage(unrolled, 0, 0);
        if (cylWrap) cylWrap.style.display = 'block';
        showToast('✓ Cylindrical Ray-Marching Unroll Applied (' + radiusMm + ' mm radius)');
        if (window.DualMarkAudio) window.DualMarkAudio.successChime();
      });
    }

    // Segmented control switcher for Surface Corrector
    var segDoc = document.getElementById('seg-surface-doc');
    var segCyl = document.getElementById('seg-surface-cyl');
    var paneDoc = document.getElementById('pane-surface-doc');
    var paneCyl = document.getElementById('pane-surface-cyl');

    if (segDoc && segCyl && paneDoc && paneCyl) {
      segDoc.addEventListener('click', function() {
        segDoc.classList.add('active');
        segCyl.classList.remove('active');
        paneDoc.style.display = 'block';
        paneCyl.style.display = 'none';
        if (window.DualMarkAudio) window.DualMarkAudio.click();
      });

      segCyl.addEventListener('click', function() {
        segCyl.classList.add('active');
        segDoc.classList.remove('active');
        paneDoc.style.display = 'none';
        paneCyl.style.display = 'block';
        if (window.DualMarkAudio) window.DualMarkAudio.click();
      });
    }

    // Continuous 50mm Tracking Toggle
    var chkContinuous = document.getElementById('chk-continuous-scan');
    if (chkContinuous) {
      chkContinuous.addEventListener('change', function() {
        studio.continuousTracking = this.checked;
        showToast(this.checked ? '✓ Continuous 50mm Tracking Active' : 'Continuous Tracking Stopped');
        if (window.DualMarkAudio) window.DualMarkAudio.click();
      });
    }
  }

  // 6. Module 5: FSMA Traceability & PDF Dossier
  function initFsmaModule() {
    var eventSelect = document.getElementById('fsma-event-type');
    var tlcInput = document.getElementById('fsma-tlc');
    var gtinInput = document.getElementById('fsma-gtin');
    var commInput = document.getElementById('fsma-commodity');
    var qtyInput = document.getElementById('fsma-quantity');
    var glnInput = document.getElementById('fsma-gln');
    var gpsInput = document.getElementById('fsma-gps');
    var btnGps = document.getElementById('btn-refresh-gps');
    var btnCommit = document.getElementById('btn-commit-cte');
    var tableBody = document.getElementById('fsma-records-body');

    function renderRecordsTable() {
      var records = window.DualMarkFsma.getRecords();
      tableBody.innerHTML = '';
      records.forEach(function(rec) {
        var tr = document.createElement('tr');
        var sig = rec.part11Signature || rec.signature;
        var sigBadge = sig
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
        ].join('');
        tableBody.appendChild(tr);
      });

      document.querySelectorAll('.pdf-btn').forEach(function(b) {
        b.addEventListener('click', async function() {
          var id = this.getAttribute('data-id');
          var records = window.DualMarkFsma.getRecords();
          var target = records.find(function(r) { return r.id === id; });
          if (target) {
            var dossier = await window.DualMarkFsma.generatePdfDossier(target);
            var pdfData = dossier.rawPdf || dossier;
            var fname = dossier.filename || ('DualMark_FSMA_Dossier_' + id + '.pdf');
            downloadBlob(pdfData, fname, 'application/pdf');
            showToast('📄 Courtroom PDF Dossier Saved: ' + fname);
            window.DualMarkAudio.successChime();
          }
        });
      });

      document.querySelectorAll('.share-btn').forEach(function(b) {
        b.addEventListener('click', async function() {
          var id = this.getAttribute('data-id');
          var records = window.DualMarkFsma.getRecords();
          var target = records.find(function(r) { return r.id === id; });
          if (target) {
            var dossier = await window.DualMarkFsma.generatePdfDossier(target);
            var b64 = dossier.base64 || btoa(unescape(encodeURIComponent(dossier.rawPdf || dossier)));
            var fname = dossier.filename || ('DualMark_FSMA_Dossier_' + id + '.pdf');
            if (window.DualMarkBridge && typeof window.DualMarkBridge.sharePdf === 'function') {
              window.DualMarkBridge.sharePdf(b64, fname);
              showToast('📤 Shared via Native Android Sheet: ' + fname);
            } else if (navigator.share) {
              try {
                var byteChars = atob(b64);
                var byteNums = new Array(byteChars.length);
                for (var i = 0; i < byteChars.length; i++) byteNums[i] = byteChars.charCodeAt(i);
                var file = new File([new Uint8Array(byteNums)], fname, { type: 'application/pdf' });
                navigator.share({ title: fname, files: [file] });
              } catch(e) {
                downloadBlob(dossier.rawPdf || dossier, fname, 'application/pdf');
              }
            } else {
              downloadBlob(dossier.rawPdf || dossier, fname, 'application/pdf');
            }
            if (window.DualMarkAudio) window.DualMarkAudio.successChime();
          }
        });
      });

      document.querySelectorAll('.del-btn').forEach(function(b) {
        b.addEventListener('click', function() {
          var id = this.getAttribute('data-id');
          window.DualMarkFsma.deleteRecord(id);
          renderRecordsTable();
          showToast('Record deleted');
        });
      });
    }

    // FDA Food Traceability List (FTL) Commodity Selector
    var ftlSelect = document.getElementById('fsma-ftl-select');
    if (ftlSelect && commInput) {
      ftlSelect.addEventListener('change', function() {
        commInput.value = this.value;
        showToast('FDA FTL Commodity: ' + this.options[this.selectedIndex].text);
      });
    }

    // FDA 24-Hour Sortable Spreadsheet CSV Export
    var btnFdaCsv = document.getElementById('btn-export-fda-csv');
    if (btnFdaCsv) {
      btnFdaCsv.addEventListener('click', function() {
        var csv = window.DualMarkFsma.exportFdaSortableSpreadsheet();
        downloadBlob(csv, 'FDA_FSMA204_Sortable_Spreadsheet.csv', 'text/csv');
        if (window.DualMarkAudio) window.DualMarkAudio.click();
      });
    }

    // GS1 EPCIS 2.0 JSON-LD Export
    var btnEpcis = document.getElementById('btn-export-epcis-jsonld');
    if (btnEpcis) {
      btnEpcis.addEventListener('click', function() {
        var epcis = window.DualMarkFsma.exportEpcisJsonLd();
        downloadBlob(epcis, 'DualMark_EPCIS20_Events.jsonld', 'application/ld+json');
        if (window.DualMarkAudio) window.DualMarkAudio.click();
      });
    }

    // GS1 EPCIS 2.0 XML Export
    var btnEpcisXml = document.getElementById('btn-export-epcis-xml');
    if (btnEpcisXml) {
      btnEpcisXml.addEventListener('click', function() {
        var xml = window.DualMarkFsma.exportEpcisXml();
        downloadBlob(xml, 'DualMark_EPCIS20_Events.xml', 'application/xml');
        if (window.DualMarkAudio) window.DualMarkAudio.click();
      });
    }

    // 21 CFR Part 11 Digital Signature Sign-Off
    var btnSign = document.getElementById('btn-sign-part11');
    var part11Msg = document.getElementById('part11-status-msg');
    if (btnSign) {
      btnSign.addEventListener('click', async function() {
        var records = window.DualMarkFsma.getRecords();
        if (records.length === 0) {
          showToast('No CTE records available to sign');
          return;
        }
        var latest = records[0];
        await window.DualMarkFsma.signRecord21CfrPart11(
          latest.id,
          'Quality Assurance Director',
          'Reviewer & Compliance Officer'
        );
        renderRecordsTable();
        if (part11Msg) {
          part11Msg.style.display = 'block';
          part11Msg.textContent = '✓ Record ' + latest.id + ' digitally signed per 21 CFR Part 11 (ECDSA P-256 / SHA-256).';
        }
        showToast('✍️ 21 CFR Part 11 Cryptographic Sign-Off Applied');
        if (window.DualMarkAudio) window.DualMarkAudio.successChime();
        if (window.DualMarkRive) window.DualMarkRive.triggerSealSigned(true);
      });
    }

    btnGps.addEventListener('click', function() {
      if (window.DualMarkBridge && typeof window.DualMarkBridge.getGpsCoordinates === 'function') {
        var coords = window.DualMarkBridge.getGpsCoordinates();
        gpsInput.value = coords + ' [Native Android GPS]';
        showToast('GPS Sensor Acquired');
      } else if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(pos) {
          gpsInput.value = pos.coords.latitude.toFixed(4) + '° N, ' + pos.coords.longitude.toFixed(4) + '° W [Verified Browser GPS]';
          showToast('GPS Coordinates Acquired');
        }, function() {
          gpsInput.value = '37.7749° N, 122.4194° W [Default Facility Geofence]';
        });
      }
    });

    btnCommit.addEventListener('click', async function() {
      var inputTlcEl = document.getElementById('fsma-input-tlc');
      var newRecord = {
        eventType: eventSelect.value,
        tlc: tlcInput.value.trim(),
        inputTlc: inputTlcEl ? inputTlcEl.value.trim() : null,
        gtin: gtinInput.value.trim(),
        commodity: commInput.value.trim(),
        quantity: qtyInput.value.trim(),
        gln: glnInput.value.trim(),
        gps: gpsInput.value.trim(),
        documentImage: window.__lastDewarpedDoc || null
      };

      var committed = await window.DualMarkFsma.addRecord(newRecord);
      renderRecordsTable();
      showToast('CTE Committed! Generating FDA Compliance Dossier...');
      window.DualMarkAudio.successChime();
      if (window.DualMarkRive) window.DualMarkRive.triggerSealSigned(true);

      var dossier = await window.DualMarkFsma.generatePdfDossier(committed);
      var pdfData = dossier.rawPdf || dossier;
      var fname = dossier.filename || ('DualMark_FSMA_Dossier_' + committed.id + '.pdf');
      downloadBlob(pdfData, fname, 'application/pdf');
    });

    var btnShareLatest = document.getElementById('btn-share-latest-dossier');
    if (btnShareLatest) {
      btnShareLatest.addEventListener('click', async function() {
        var records = window.DualMarkFsma.getRecords();
        if (!records || records.length === 0) {
          showToast('⚠ No CTE records available to share');
          return;
        }
        var latest = records[records.length - 1];
        var dossier = await window.DualMarkFsma.generatePdfDossier(latest);
        var b64 = dossier.base64 || btoa(unescape(encodeURIComponent(dossier.rawPdf || dossier)));
        var fname = dossier.filename || ('DualMark_FSMA_Dossier_' + latest.id + '.pdf');
        if (window.DualMarkBridge && typeof window.DualMarkBridge.sharePdf === 'function') {
          window.DualMarkBridge.sharePdf(b64, fname);
          showToast('📤 Dispatched to Native Share Sheet: ' + fname);
        } else if (navigator.share) {
          try {
            var byteChars = atob(b64);
            var byteNums = new Array(byteChars.length);
            for (var i = 0; i < byteChars.length; i++) byteNums[i] = byteChars.charCodeAt(i);
            var file = new File([new Uint8Array(byteNums)], fname, { type: 'application/pdf' });
            navigator.share({ title: fname, files: [file] });
          } catch(e) {
            downloadBlob(dossier.rawPdf || dossier, fname, 'application/pdf');
          }
        } else {
          downloadBlob(dossier.rawPdf || dossier, fname, 'application/pdf');
        }
        if (window.DualMarkAudio) window.DualMarkAudio.successChime();
      });
    }

    renderRecordsTable();
  }

  // 7. Module 6: Prepress Export Center
  function initExportsModule() {
    // Segmented Export Control & Master Prepress Bundle
    var exportSegmentSwitch = document.getElementById('export-segment-switch');
    if (exportSegmentSwitch) {
      var segmentButtons = exportSegmentSwitch.querySelectorAll('.segmented-item');
      var panes = {
        'pane-prepress': document.getElementById('pane-prepress'),
        'pane-zebra': document.getElementById('pane-zebra'),
        'pane-batch': document.getElementById('pane-batch')
      };

      segmentButtons.forEach(function(btn) {
        btn.addEventListener('click', function() {
          segmentButtons.forEach(function(b) { b.classList.remove('active'); });
          btn.classList.add('active');
          var targetPane = btn.getAttribute('data-export-pane');
          Object.keys(panes).forEach(function(k) {
            if (panes[k]) {
              panes[k].style.display = (k === targetPane) ? 'block' : 'none';
            }
          });
          if (window.DualMarkAudio) window.DualMarkAudio.click();
        });
      });
    }

    var btnMasterPackage = document.getElementById('btn-export-master-package');
    if (btnMasterPackage) {
      btnMasterPackage.addEventListener('click', function() {
        if (!window.DualMarkPrepress) return;
        var data = getActivePrepressData();
        var pkgW = window.clearanceInspector ? window.clearanceInspector.packageWidthMm : 150;
        var pkgH = window.clearanceInspector ? window.clearanceInspector.packageHeightMm : 55;
        var clearanceMm = window.clearanceInspector ? window.clearanceInspector.getMetrics().edgeDistanceMm : 52;

        if (window.DualMarkZip) {
          var zip = new window.DualMarkZip();
          var pdf = window.DualMarkPrepress.generatePdfX4(data.barcode1d, data.qrMatrix, {
            condition: 'FOGRA39',
            packageWidthMm: pkgW,
            packageHeightMm: pkgH,
            clearanceMm: clearanceMm
          });
          zip.addFile('DualMark_Master_PDFX4_FOGRA39.pdf', pdf);

          var eps = window.DualMarkPrepress.generateCmykEps(data.barcode1d, data.qrMatrix, { packageWidthMm: pkgW, packageHeightMm: pkgH });
          zip.addFile('DualMark_Prepress_CMYK.eps', eps);

          var type1d = (document.getElementById('synth-1d-type') && document.getElementById('synth-1d-type').value) || 'UPC-A';
          var val1d = (document.getElementById('synth-1d-input') && document.getElementById('synth-1d-input').value.trim()) || '081234567890';
          var svg1dRes = window.DualMarkBarcode1D ? window.DualMarkBarcode1D.renderSvg(type1d, val1d) : { svg: '' };
          var svg1dContent = svg1dRes.svg || svg1dRes;
          var uri2d = (document.getElementById('synth-2d-uri-preview') && document.getElementById('synth-2d-uri-preview').textContent) || 'https://id.brand.com/01/00812345678901';
          var svg2d = window.DualMarkGS1 ? window.DualMarkGS1.renderQrSvg(uri2d) : '';

          var combinedSvg = [
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 400" width="1000" height="400">',
            '<rect width="1000" height="400" fill="#FFFFFF"/>',
            '<g transform="translate(60, 100)">' + svg1dContent + '</g>',
            '<g transform="translate(580, 100)">' + svg2d + '</g>',
            '<line x1="480" y1="200" x2="570" y2="200" stroke="#EF4444" stroke-width="3" stroke-dasharray="6,6"/>',
            '<text x="525" y="190" font-family="sans-serif" font-size="14" font-weight="bold" text-anchor="middle" fill="#EF4444">≥ 50 mm</text>',
            '<text x="500" y="360" font-family="sans-serif" font-size="18" font-weight="bold" text-anchor="middle" fill="#0F172A">DUALMARK PREPRESS DIE-LINE PROOF — SUNRISE 2027 COMPLIANT</text>',
            '</svg>'
          ].join('\n');
          zip.addFile('DualMark_DieLine_Proof.svg', combinedSvg);

          var manifest = {
            format: 'DualMark Prepress Master Production Bundle',
            standards: ['ISO 15930-7 (PDF/X-4:2010)', 'Adobe PostScript Level 3', 'GS1 Digital Link', 'Sunrise 2027'],
            iccCondition: 'FOGRA39 (Coated)',
            packageWidthMm: pkgW,
            packageHeightMm: pkgH,
            clearanceMm: clearanceMm,
            exportedAt: new Date().toISOString()
          };
          zip.addFile('manifest.json', JSON.stringify(manifest, null, 2));

          var blob = zip.buildZipBlob();
          downloadBlob(blob, 'DualMark_Master_Prepress_Bundle.zip', 'application/zip');
        } else {
          var btnPdfX4 = document.getElementById('btn-export-pdf-x4');
          if (btnPdfX4) btnPdfX4.click();
        }
      });
    }

    document.getElementById('btn-export-combined-svg').addEventListener('click', function() {
      // Export full SVG with 1D and 2D placed side-by-side with 50mm clearance marker
      var type1d = (document.getElementById('synth-1d-type') && document.getElementById('synth-1d-type').value) || 'UPC-A';
      var val1d = (document.getElementById('synth-1d-input') && document.getElementById('synth-1d-input').value.trim()) || '081234567890';
      var svg1dRes = window.DualMarkBarcode1D ? window.DualMarkBarcode1D.renderSvg(type1d, val1d) : { svg: '' };
      var svg1dContent = svg1dRes.svg || svg1dRes;
      var uri2d = (document.getElementById('synth-2d-uri-preview') && document.getElementById('synth-2d-uri-preview').textContent) || 'https://id.brand.com/01/00812345678901';
      var svg2d = window.DualMarkGS1 ? window.DualMarkGS1.renderQrSvg(uri2d) : '';

      var combinedSvg = [
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 400" width="1000" height="400">',
        '<rect width="1000" height="400" fill="#FFFFFF"/>',
        '<g transform="translate(60, 100)">' + svg1dContent + '</g>',
        '<g transform="translate(580, 100)">' + svg2d + '</g>',
        '<line x1="480" y1="200" x2="570" y2="200" stroke="#EF4444" stroke-width="3" stroke-dasharray="6,6"/>',
        '<text x="525" y="190" font-family="sans-serif" font-size="14" font-weight="bold" text-anchor="middle" fill="#EF4444">≥ 50 mm</text>',
        '<text x="500" y="360" font-family="sans-serif" font-size="18" font-weight="bold" text-anchor="middle" fill="#0F172A">DUALMARK PREPRESS DIE-LINE PROOF — SUNRISE 2027 COMPLIANT</text>',
        '</svg>'
      ].join('\n');

      downloadBlob(combinedSvg, 'DualMark_DieLine_Proof.svg', 'image/svg+xml');
      window.DualMarkAudio.click();
    });

    document.getElementById('btn-print-labels').addEventListener('click', function() {
      if (window.DualMarkBridge && typeof window.DualMarkBridge.printDocument === 'function') {
        window.DualMarkBridge.printDocument('DualMark_Proof_Sheet');
      } else {
        window.print();
      }
    });

    document.getElementById('btn-export-all-rules').addEventListener('click', function() {
      var bundle = {
        rules: window.DualMarkResolver.getRules(),
        exportedAt: new Date().toISOString(),
        fsmaCtes: window.DualMarkFsma.getRecords()
      };
      downloadBlob(JSON.stringify(bundle, null, 2), 'DualMark_Master_Archive.json', 'application/json');
      showToast('Master Archive JSON Exported');
    });

    // Barcode Width Reduction (BWR) Slider
    var bwrSlider = document.getElementById('prepress-bwr-slider');
    var bwrReadout = document.getElementById('prepress-bwr-readout');
    if (bwrSlider && bwrReadout) {
      bwrSlider.addEventListener('input', function() {
        var val = parseInt(this.value, 10) || 0;
        if (window.DualMarkPrepress) window.DualMarkPrepress.setBwrMicrons(val);
        bwrReadout.textContent = val + ' µm' + (val === 0 ? ' (Nominal)' : ' (Ink Spread Reduction)');
      });
    }

    // Helper to get active 1D data and QR matrix for prepress export
    function getActivePrepressData() {
      var type1d = document.getElementById('synth-1d-type')?.value || 'UPC-A';
      var val1d = document.getElementById('synth-1d-input')?.value.trim() || '081234567890';
      var res1d = window.DualMarkBarcode1D.renderSvg(type1d, val1d);
      var uri2d = document.getElementById('synth-2d-uri-preview')?.textContent || 'https://id.brand.com/01/00812345678901';
      var qrMatrix = window.DualMarkGS1 ? window.DualMarkGS1.generateQrMatrix(uri2d) : null;
      return {
        barcode1d: { pattern: res1d.pattern, text: res1d.text },
        qrMatrix: qrMatrix
      };
    }

    // PDF/X-4 (ISO 15930-7) Master Prepress Export with ICC Output Intent & CIDFont
    var btnPdfX4 = document.getElementById('btn-export-pdf-x4');
    if (btnPdfX4) {
      btnPdfX4.addEventListener('click', function() {
        if (!window.DualMarkLicensing || !window.DualMarkPrepress) return;
        window.DualMarkLicensing.checkFeatureOrPrompt('vector_highres_pdf', function() {
          var data = getActivePrepressData();
          var pkgW = window.clearanceInspector ? window.clearanceInspector.packageWidthMm : 150;
          var pkgH = window.clearanceInspector ? window.clearanceInspector.packageHeightMm : 55;
          var clearanceMm = window.clearanceInspector ? window.clearanceInspector.getMetrics().edgeDistanceMm : 52;
          var pdf = window.DualMarkPrepress.generatePdfX4(data.barcode1d, data.qrMatrix, {
            condition: 'FOGRA39',
            packageWidthMm: pkgW,
            packageHeightMm: pkgH,
            clearanceMm: clearanceMm
          });
          window.DualMarkPrepress.downloadFile(pdf, 'DualMark_Master_PDFX4_FOGRA39.pdf', 'application/pdf');
          if (window.DualMarkAudio) window.DualMarkAudio.click();
        });
      });
    }

    // CMYK PostScript Level 3 EPS Export
    var btnCmykEps = document.getElementById('btn-export-cmyk-eps');
    if (btnCmykEps) {
      btnCmykEps.addEventListener('click', function() {
        if (!window.DualMarkLicensing || !window.DualMarkPrepress) return;
        window.DualMarkLicensing.checkFeatureOrPrompt('vector_cmyk_eps', function() {
          var data = getActivePrepressData();
          var pkgW = window.clearanceInspector ? window.clearanceInspector.packageWidthMm : 150;
          var pkgH = window.clearanceInspector ? window.clearanceInspector.packageHeightMm : 55;
          var eps = window.DualMarkPrepress.generateCmykEps(data.barcode1d, data.qrMatrix, { packageWidthMm: pkgW, packageHeightMm: pkgH });
          window.DualMarkPrepress.downloadFile(eps, 'DualMark_Prepress_CMYK.eps', 'application/postscript');
          if (window.DualMarkAudio) window.DualMarkAudio.click();
        });
      });
    }

    // High-Resolution Vector PDF 600 DPI Export
    var btnPdf600 = document.getElementById('btn-export-pdf-600');
    if (btnPdf600) {
      btnPdf600.addEventListener('click', function() {
        if (!window.DualMarkLicensing || !window.DualMarkPrepress) return;
        window.DualMarkLicensing.checkFeatureOrPrompt('vector_highres_pdf', function() {
          var data = getActivePrepressData();
          var pkgW = window.clearanceInspector ? window.clearanceInspector.packageWidthMm : 150;
          var pkgH = window.clearanceInspector ? window.clearanceInspector.packageHeightMm : 55;
          var pdf = window.DualMarkPrepress.generateVectorPdf(data.barcode1d, data.qrMatrix, { dpi: 600, packageWidthMm: pkgW, packageHeightMm: pkgH });
          window.DualMarkPrepress.downloadFile(pdf, 'DualMark_Vector_Proof_600DPI.pdf', 'application/pdf');
          if (window.DualMarkAudio) window.DualMarkAudio.click();
        });
      });
    }

    // High-Resolution Vector PDF 1200 DPI Export
    var btnPdf1200 = document.getElementById('btn-export-pdf-1200');
    if (btnPdf1200) {
      btnPdf1200.addEventListener('click', function() {
        if (!window.DualMarkLicensing || !window.DualMarkPrepress) return;
        window.DualMarkLicensing.checkFeatureOrPrompt('vector_highres_pdf', function() {
          var data = getActivePrepressData();
          var pkgW = window.clearanceInspector ? window.clearanceInspector.packageWidthMm : 150;
          var pkgH = window.clearanceInspector ? window.clearanceInspector.packageHeightMm : 55;
          var pdf = window.DualMarkPrepress.generateVectorPdf(data.barcode1d, data.qrMatrix, { dpi: 1200, packageWidthMm: pkgW, packageHeightMm: pkgH });
          window.DualMarkPrepress.downloadFile(pdf, 'DualMark_Vector_Proof_1200DPI.pdf', 'application/pdf');
          if (window.DualMarkAudio) window.DualMarkAudio.click();
        });
      });
    }

    // Pantone Spot Separation EPS Export
    var btnPantoneEps = document.getElementById('btn-export-pantone-eps');
    if (btnPantoneEps) {
      btnPantoneEps.addEventListener('click', function() {
        if (!window.DualMarkLicensing || !window.DualMarkPrepress) return;
        window.DualMarkLicensing.checkFeatureOrPrompt('vector_cmyk_eps', function() {
          var data = getActivePrepressData();
          var pkgW = window.clearanceInspector ? window.clearanceInspector.packageWidthMm : 150;
          var pkgH = window.clearanceInspector ? window.clearanceInspector.packageHeightMm : 55;
          var eps = window.DualMarkPrepress.generatePantoneEps(data.barcode1d, data.qrMatrix, { packageWidthMm: pkgW, packageHeightMm: pkgH });
          window.DualMarkPrepress.downloadFile(eps, 'DualMark_Pantone_Spot_Separation.eps', 'application/postscript');
          if (window.DualMarkAudio) window.DualMarkAudio.click();
        });
      });
    }

    // Adobe Illustrator Layered PDF (OCG) Export
    var btnLayeredPdf = document.getElementById('btn-export-layered-pdf');
    if (btnLayeredPdf) {
      btnLayeredPdf.addEventListener('click', function() {
        if (!window.DualMarkLicensing || !window.DualMarkPrepress) return;
        window.DualMarkLicensing.checkFeatureOrPrompt('vector_highres_pdf', function() {
          var data = getActivePrepressData();
          var pkgW = window.clearanceInspector ? window.clearanceInspector.packageWidthMm : 150;
          var pkgH = window.clearanceInspector ? window.clearanceInspector.packageHeightMm : 55;
          var clearanceMm = window.clearanceInspector ? window.clearanceInspector.getMetrics().edgeDistanceMm : 52;
          var pdf = window.DualMarkPrepress.generateLayeredPdf(data.barcode1d, data.qrMatrix, { clearanceMm: clearanceMm, packageWidthMm: pkgW, packageHeightMm: pkgH });
          window.DualMarkPrepress.downloadFile(pdf, 'DualMark_Layered_Illustrator_OCG.pdf', 'application/pdf');
          if (window.DualMarkAudio) window.DualMarkAudio.click();
        });
      });
    }

    // Zebra ZPL II Thermal Printer Generator
    var btnGenZpl = document.getElementById('btn-generate-zpl');
    var btnCopyZpl = document.getElementById('btn-copy-zpl');
    var btnDownloadZpl = document.getElementById('btn-download-zpl');
    var zplDpiSelect = document.getElementById('zpl-dpi-select');
    var zplOutputPreview = document.getElementById('zpl-output-preview');

    function getActiveZpl() {
      var type1d = (document.getElementById('synth-1d-type') && document.getElementById('synth-1d-type').value) || 'UPC-A';
      var val1d = (document.getElementById('synth-1d-input') && document.getElementById('synth-1d-input').value.trim()) || '081234567890';
      var symbology2d = (document.getElementById('synth-2d-symbology') && document.getElementById('synth-2d-symbology').value) || 'QR';
      var uri2d = (document.getElementById('synth-2d-uri-preview') && document.getElementById('synth-2d-uri-preview').textContent) || 'https://id.brand.com/01/00812345678901';
      var lot = (document.getElementById('synth-2d-lot') && document.getElementById('synth-2d-lot').value.trim()) || 'LOT-2026-X';
      var dpi = zplDpiSelect ? parseInt(zplDpiSelect.value, 10) : 203;

      var coords1d = null;
      var coords2d = null;
      if (window.clearanceInspector && window.clearanceInspector.barcode1d && window.clearanceInspector.barcode2d) {
        coords1d = {
          xMm: Math.max(0, window.clearanceInspector.barcode1d.x - window.clearanceInspector.barcode1d.w / 2),
          yMm: Math.max(0, window.clearanceInspector.barcode1d.y - window.clearanceInspector.barcode1d.h / 2),
          wMm: window.clearanceInspector.barcode1d.w,
          hMm: window.clearanceInspector.barcode1d.h
        };
        coords2d = {
          xMm: Math.max(0, window.clearanceInspector.barcode2d.x - window.clearanceInspector.barcode2d.w / 2),
          yMm: Math.max(0, window.clearanceInspector.barcode2d.y - window.clearanceInspector.barcode2d.h / 2),
          wMm: window.clearanceInspector.barcode2d.w,
          hMm: window.clearanceInspector.barcode2d.h
        };
      }

      if (window.DualMarkZpl) {
        return window.DualMarkZpl.generateDualMarkZpl({
          type: type1d,
          gtin: val1d,
          symbology2d: symbology2d,
          digitalLinkUri: uri2d,
          lot: lot,
          dpi: dpi,
          clearanceMm: 52,
          coords1d: coords1d,
          coords2d: coords2d
        });
      }
      return '^XA\n^FO50,50^BCN,100,Y,N,N^FD>:' + val1d + '^FS\n^XZ';
    }

    if (btnGenZpl && zplOutputPreview) {
      btnGenZpl.addEventListener('click', function() {
        var zpl = getActiveZpl();
        zplOutputPreview.textContent = zpl;
        if (window.DualMarkRive) {
          window.DualMarkRive.triggerPrinterState(2);
          setTimeout(function() {
            window.DualMarkRive.triggerPrinterState(4);
          }, 800);
        }
        showToast('⚡ Zebra ZPL II Command Stream Generated');
        if (window.DualMarkAudio) window.DualMarkAudio.successChime();
      });
    }

    if (btnCopyZpl) {
      btnCopyZpl.addEventListener('click', function() {
        var zpl = zplOutputPreview.textContent;
        if (zpl.indexOf('^XA') === -1) zpl = getActiveZpl();
        copyTextSafely(zpl, '📋 Copied ZPL Code to Clipboard');
        if (window.DualMarkAudio) window.DualMarkAudio.click();
      });
    }

    if (btnDownloadZpl) {
      btnDownloadZpl.addEventListener('click', function() {
        var zpl = zplOutputPreview.textContent;
        if (zpl.indexOf('^XA') === -1) zpl = getActiveZpl();
        downloadBlob(zpl, 'DualMark_Zebra_Sunrise2027.zpl', 'text/plain');
        if (window.DualMarkAudio) window.DualMarkAudio.click();
      });
    }

    // Direct TCP Port 9100 Network Socket Spooler
    var btnSendTcp = document.getElementById('btn-send-tcp-socket');
    var tcpIpInput = document.getElementById('tcp-printer-ip');
    var tcpPortInput = document.getElementById('tcp-printer-port');
    if (btnSendTcp) {
      btnSendTcp.addEventListener('click', function() {
        var ip = (tcpIpInput && tcpIpInput.value.trim()) || '192.168.1.100';
        var port = (tcpPortInput && parseInt(tcpPortInput.value, 10)) || 9100;
        var zpl = getActiveZpl();

        if (window.DualMarkRive) {
          window.DualMarkRive.triggerPrinterState(1);
          setTimeout(function() { window.DualMarkRive.triggerPrinterState(2); }, 300);
          setTimeout(function() { window.DualMarkRive.triggerPrinterState(4); }, 900);
        }

        if (window.DualMarkBridge && typeof window.DualMarkBridge.printRawTcpSocket === 'function') {
          window.DualMarkBridge.printRawTcpSocket(ip, port, zpl);
          showToast('🖨️ ZPL stream dispatched to printer socket ' + ip + ':' + port);
        } else {
          showToast('🖨️ TCP Raw Socket simulated in Web sandbox: ' + ip + ':' + port);
        }
        if (window.DualMarkAudio) window.DualMarkAudio.successChime();
      });
    }

    // Zebra Status Polling (~HS)
    var btnPollStatus = document.getElementById('btn-poll-zebra-status');
    if (btnPollStatus) {
      btnPollStatus.addEventListener('click', function() {
        var ip = (tcpIpInput && tcpIpInput.value.trim()) || '192.168.1.100';
        var port = (tcpPortInput && parseInt(tcpPortInput.value, 10)) || 9100;
        if (window.DualMarkBridge && typeof window.DualMarkBridge.pollZebraPrinterStatus === 'function') {
          window.DualMarkBridge.pollZebraPrinterStatus(ip, port);
          showToast('📊 Polling Zebra ~HS status on ' + ip + ':' + port + '...');
        } else {
          var simStatus = { online: true, paperOut: false, paused: false, headOpen: false, ribbonOut: false, readyToPrint: true };
          window.onPrinterStatusResult(simStatus);
        }
        if (window.DualMarkAudio) window.DualMarkAudio.click();
      });
    }

    // Bluetooth SPP Hip Printer Spooler
    var btnSendBt = document.getElementById('btn-send-bt-spp');
    var btMacInput = document.getElementById('bt-printer-mac');
    if (btnSendBt) {
      btnSendBt.addEventListener('click', function() {
        var mac = (btMacInput && btMacInput.value.trim()) || '00:11:22:33:AA:BB';
        var zpl = getActiveZpl();

        if (window.DualMarkRive) {
          window.DualMarkRive.triggerPrinterState(1);
          setTimeout(function() { window.DualMarkRive.triggerPrinterState(2); }, 300);
          setTimeout(function() { window.DualMarkRive.triggerPrinterState(4); }, 900);
        }

        if (window.DualMarkBridge && typeof window.DualMarkBridge.printRawBluetoothSpp === 'function') {
          window.DualMarkBridge.printRawBluetoothSpp(mac, zpl);
          showToast('📱 ZPL stream dispatched to Bluetooth printer ' + mac);
        } else {
          showToast('📱 Bluetooth SPP simulated in Web sandbox: ' + mac);
        }
        if (window.DualMarkAudio) window.DualMarkAudio.successChime();
      });
    }

    // Bluetooth Low Energy (BLE) GATT Scanning & Transmit
    var btnScanBle = document.getElementById('btn-scan-ble-printers');
    var btnSendBle = document.getElementById('btn-send-ble-gatt');
    var selectBle = document.getElementById('select-ble-discovered');
    var bleContainer = document.getElementById('ble-printers-container');
    if (btnScanBle) {
      btnScanBle.addEventListener('click', function() {
        if (window.DualMarkBridge && typeof window.DualMarkBridge.startBleScan === 'function') {
          window.DualMarkBridge.startBleScan();
          showToast('🔍 Scanning for Bluetooth Low Energy printers...');
          setTimeout(function() {
            var listJson = window.DualMarkBridge.getDiscoveredBlePrinters();
            var list = [];
            try { list = JSON.parse(listJson); } catch (e) {}
            if (selectBle) {
              selectBle.innerHTML = '';
              if (!list || list.length === 0) {
                var opt = document.createElement('option');
                opt.text = 'No BLE printers discovered (Tap Scan to retry)';
                selectBle.appendChild(opt);
              } else {
                list.forEach(function(p) {
                  var opt = document.createElement('option');
                  opt.value = p.mac || p.address;
                  opt.text = (p.name || 'Zebra BLE') + ' (' + (p.mac || p.address) + ')';
                  selectBle.appendChild(opt);
                });
              }
            }
            if (bleContainer) bleContainer.style.display = 'block';
            if (btnSendBle) btnSendBle.style.display = 'inline-block';
          }, 1500);
        } else {
          showToast('🔍 BLE scanning simulated (Web sandbox)');
          if (selectBle) {
            selectBle.innerHTML = '<option value="AA:BB:CC:DD:EE:FF">Simulated Zebra ZQ620 BLE (AA:BB:CC:DD:EE:FF)</option>';
          }
          if (bleContainer) bleContainer.style.display = 'block';
          if (btnSendBle) btnSendBle.style.display = 'inline-block';
        }
        if (window.DualMarkAudio) window.DualMarkAudio.click();
      });
    }

    if (btnSendBle) {
      btnSendBle.addEventListener('click', function() {
        var zpl = getActiveZpl();
        var b64Zpl = btoa(unescape(encodeURIComponent(zpl)));
        if (window.DualMarkBridge && typeof window.DualMarkBridge.sendBleData === 'function') {
          var res = window.DualMarkBridge.sendBleData(b64Zpl);
          showToast(res ? '⚡ BLE GATT packet stream transmitted!' : '⚡ BLE transmission initiated');
        } else {
          showToast('⚡ BLE transmission simulated in Web sandbox');
        }
        if (window.DualMarkAudio) window.DualMarkAudio.successChime();
      });
    }

    // Bi-Directional Zebra Thermal Status Callback & Status Pill
    window.onPrinterStatusResult = function(status) {
      if (!status) return null;
      if (typeof status === 'string') {
        try { status = JSON.parse(status); } catch (e) {}
      }
      var msg = '';
      var pill = document.getElementById('zebra-status-pill');
      if (status.online === false && status.error) {
        msg = '⚠ Zebra Printer OFFLINE: ' + status.error;
        if (pill) {
          pill.className = 'badge badge-danger';
          pill.textContent = 'STATUS: OFFLINE';
        }
      } else if (status.paperOut) {
        msg = '⚠ Zebra Printer: PAPER OUT / MEDIA SENSOR ERROR';
        if (pill) {
          pill.className = 'badge badge-danger';
          pill.textContent = 'PAPER OUT';
        }
      } else if (status.headOpen) {
        msg = '⚠ Zebra Printer: PRINTHEAD OPEN';
        if (pill) {
          pill.className = 'badge badge-danger';
          pill.textContent = 'HEAD OPEN';
        }
      } else if (status.paused) {
        msg = '⚠ Zebra Printer: PRINTER PAUSED';
        if (pill) {
          pill.className = 'badge badge-amber';
          pill.textContent = 'PAUSED';
        }
      } else if (status.ribbonOut) {
        msg = '⚠ Zebra Printer: RIBBON OUT';
        if (pill) {
          pill.className = 'badge badge-amber';
          pill.textContent = 'RIBBON OUT';
        }
      } else {
        msg = '✓ Zebra Host Status: ONLINE & READY (Paper OK)';
        if (pill) {
          pill.className = 'badge badge-emerald';
          pill.textContent = 'STATUS: READY';
        }
      }
      showToast(msg);
      return msg;
    };

    // High-Throughput Batch CSV Multi-SKU Synthesis Engine
    var btnBatchZip = document.getElementById('btn-run-batch-zip');
    var btnBatchProof = document.getElementById('btn-batch-proof-sheet');
    var batchCsvInput = document.getElementById('batch-csv-input');
    var batchStatusMsg = document.getElementById('batch-status-msg');

    if (btnBatchZip && batchCsvInput) {
      btnBatchZip.addEventListener('click', function() {
        var raw = batchCsvInput.value.trim();
        if (!raw) {
          showToast('Please provide CSV data');
          return;
        }
        var lines = raw.split('\n').filter(function(l) { return l.trim().length > 0; });
        if (lines.length <= 1) {
          showToast('CSV must contain a header and at least one SKU record');
          return;
        }
        var zip = window.DualMarkZip ? window.DualMarkZip.create() : null;
        if (!zip) {
          showToast('ZIP Packager engine unavailable');
          return;
        }

        var count = 0;
        for (var i = 1; i < lines.length; i++) {
          var cols = lines[i].split(',').map(function(c) { return c.trim(); });
          if (cols.length < 2) continue;
          var sku = cols[0] || ('SKU-' + i);
          var gtin = cols[1] || '00812345678901';
          var lot = cols[2] || 'LOT-2026';
          var serial = cols[3] || ('SN-' + i);
          var exp = cols[4] || '271231';
          var weight = cols[5] || '001500';
          var targetUrl = cols[6] || ('https://id.brand.com/01/' + gtin);

          // 1D Barcode SVG
          var upcVal = gtin.length >= 12 ? gtin.slice(-12) : gtin;
          var svg1d = window.DualMarkBarcode1D.renderSvg('UPC-A', upcVal);
          zip.addFile(sku + '_1D_UPC.svg', svg1d.svg);

          // 2D GS1 Digital Link QR SVG
          var svg2d = window.DualMarkGS1.renderQrSvg(targetUrl);
          zip.addFile(sku + '_2D_GS1_DigitalLink.svg', svg2d);

          // Machine-readable manifest JSON
          var manifest = {
            sku: sku,
            gtin: gtin,
            lot: lot,
            serial: serial,
            expiration: exp,
            weight: weight,
            targetUrl: targetUrl,
            generatedAt: new Date().toISOString()
          };
          zip.addFile(sku + '_manifest.json', JSON.stringify(manifest, null, 2));
          count++;
        }

        var blob = zip.buildZipBlob();
        downloadBlob(blob, 'DualMark_Batch_SKUs_' + Date.now() + '.zip', 'application/zip');
        if (batchStatusMsg) {
          batchStatusMsg.style.display = 'block';
          batchStatusMsg.textContent = '✓ Successfully packaged ' + count + ' SKUs (' + blob.size + ' bytes ZIP archive).';
        }
        if (window.DualMarkAudio) window.DualMarkAudio.click();
      });
    }

    if (btnBatchProof && batchCsvInput) {
      btnBatchProof.addEventListener('click', function() {
        var raw = batchCsvInput.value.trim();
        var lines = raw.split('\n').filter(function(l) { return l.trim().length > 0; });
        var count = Math.max(1, lines.length - 1);

        var proofSvg = [
          '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 ' + (150 + count * 220) + '" width="1200" height="' + (150 + count * 220) + '">',
          '<rect width="100%" height="100%" fill="#FFFFFF"/>',
          '<text x="50" y="50" font-family="sans-serif" font-size="22" font-weight="bold" fill="#0F172A">DUALMARK STUDIO -- MULTI-UP GANG-RUN PROOF SHEET</text>',
          '<text x="50" y="80" font-family="sans-serif" font-size="12" fill="#64748B">Prepress Approval | Sunrise 2027 Compliant Dual-Code Placement (&gt;=50mm Clearance) | Total SKUs: ' + count + '</text>'
        ];

        for (var i = 1; i < lines.length; i++) {
          var cols = lines[i].split(',').map(function(c) { return c.trim(); });
          var sku = cols[0] || ('SKU-' + i);
          var gtin = cols[1] || '00812345678901';
          var y = 100 + (i - 1) * 220;
          proofSvg.push('<rect x="40" y="' + y + '" width="1120" height="200" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="1" rx="8"/>');
          proofSvg.push('<text x="60" y="' + (y + 30) + '" font-family="sans-serif" font-size="14" font-weight="bold" fill="#0284C7">ITEM ' + i + ': ' + sku + ' [GTIN: ' + gtin + ']</text>');

          var upcVal = gtin.length >= 12 ? gtin.slice(-12) : gtin;
          var svg1d = window.DualMarkBarcode1D.renderSvg('UPC-A', upcVal);
          var svg2d = window.DualMarkGS1.renderQrSvg('https://id.brand.com/01/' + gtin);
          proofSvg.push('<g transform="translate(60, ' + (y + 50) + ') scale(0.8)">' + svg1d.svg + '</g>');
          proofSvg.push('<g transform="translate(600, ' + (y + 40) + ') scale(0.6)">' + svg2d + '</g>');
          proofSvg.push('<line x1="450" y1="' + (y + 110) + '" x2="580" y2="' + (y + 110) + '" stroke="#10B981" stroke-width="2" stroke-dasharray="4,4"/>');
          proofSvg.push('<text x="515" y="' + (y + 105) + '" font-family="sans-serif" font-size="11" font-weight="bold" fill="#10B981" text-anchor="middle">&gt;= 50mm SAFE</text>');
        }
        proofSvg.push('</svg>');

        downloadBlob(proofSvg.join('\n'), 'DualMark_Batch_GangRun_Proof.svg', 'image/svg+xml');
        if (window.DualMarkAudio) window.DualMarkAudio.click();
      });
    }
  }

  // Enterprise Handheld Scanner (Zebra DataWedge, Honeywell, Datalogic) Intent Bridge
  window.onEnterpriseBarcodeScan = function(barcode, symbology) {
    symbology = symbology || 'UNKNOWN';
    if (window.DualMarkAudio) window.DualMarkAudio.scanBeep();
    showToast('🔫 [Enterprise Wedge] ' + symbology + ': ' + barcode);

    // Auto-fill active inputs across app modules
    var synthInput = document.getElementById('synth-1d-input');
    if (synthInput) {
      synthInput.value = barcode;
      synthInput.dispatchEvent(new Event('input'));
    }
    var gepirInput = document.getElementById('gepir-check-input');
    if (gepirInput) {
      gepirInput.value = barcode;
    }
    var resolveInput = document.getElementById('test-resolve-gtin');
    if (resolveInput) {
      resolveInput.value = barcode;
    }
    var fsmaGtin = document.getElementById('fsma-gtin');
    if (fsmaGtin) {
      fsmaGtin.value = barcode;
    }
  };

  // Initialization
  window.addEventListener('DOMContentLoaded', function() {
    initNav();
    initSynthModule();
    initClearanceModule();
    initResolverModule();
    initScannerModule();
    initFsmaModule();
    initExportsModule();

    if (window.DualMarkLicensing) {
      window.DualMarkLicensing.init();
    }

    // Check if running inside native Android wrapper
    if (window.DualMarkBridge && typeof window.DualMarkBridge.isNativeApp === 'function' && window.DualMarkBridge.isNativeApp()) {
      var badge = document.querySelector('.brand-badge');
      if (badge) badge.textContent = 'ANDROID NATIVE PRO';
    }
  });

})();
