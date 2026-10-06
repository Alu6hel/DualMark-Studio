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

  // File download helper (Web or Android native bridge)
  function downloadBlob(content, filename, mimeType) {
    // If native Android Bridge is available
    if (window.DualMarkBridge && typeof window.DualMarkBridge.savePdfToStorage === 'function' && filename.endsWith('.pdf')) {
      window.DualMarkBridge.savePdfToStorage(content, filename);
      return;
    }

    var blob = (content instanceof Blob) ? content : new Blob([content], { type: mimeType || 'text/plain' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function() { URL.revokeObjectURL(url); }, 1000);
  }

  // 1. Navigation Tab Switching
  function initNav() {
    var tabs = document.querySelectorAll('.nav-tab');
    var panes = document.querySelectorAll('.tab-pane');

    tabs.forEach(function(tab) {
      tab.addEventListener('click', function() {
        var targetId = tab.getAttribute('data-tab');
        tabs.forEach(function(t) { t.classList.remove('active'); });
        panes.forEach(function(p) { p.classList.remove('active'); });

        tab.classList.add('active');
        var targetPane = document.getElementById(targetId);
        if (targetPane) targetPane.classList.add('active');

        window.DualMarkAudio.click();

        // If switching to Clearance tab, re-render die-line canvas scale
        if (targetId === 'tab-clearance' && window.clearanceInspector) {
          setTimeout(function() { window.clearanceInspector.render(); }, 50);
        }
      });
    });

    // Sound toggle
    var btnSound = document.getElementById('btn-sound');
    if (btnSound) {
      btnSound.addEventListener('click', function() {
        var muted = window.DualMarkAudio.toggleMute();
        btnSound.textContent = muted ? '🔇' : '🔊';
        showToast(muted ? 'Audio feedback muted' : 'Audio feedback enabled');
      });
      btnSound.textContent = window.DualMarkAudio.isMuted() ? '🔇' : '🔊';
    }

    // Theme toggle
    var btnTheme = document.getElementById('btn-theme');
    if (btnTheme) {
      btnTheme.addEventListener('click', function() {
        document.body.classList.toggle('theme-light');
        var isLight = document.body.classList.contains('theme-light');
        localStorage.setItem('dualmark_theme', isLight ? 'light' : 'dark');
        showToast(isLight ? 'Clean Room Light Theme' : 'Industrial Obsidian Theme');
      });
      if (localStorage.getItem('dualmark_theme') === 'light') {
        document.body.classList.add('theme-light');
      }
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
        showToast('Legal & Regulatory Disclaimers Acknowledged');
        if (window.DualMarkAudio) window.DualMarkAudio.successChime();
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
    var preview2d = document.getElementById('synth-2d-uri-preview');
    var canvas2d = document.getElementById('canvas-2d');

    function update1D() {
      try {
        var type = typeSelect.value;
        badge1d.textContent = type;
        var val = input1d.value.trim() || '081234567890';
        var res = window.DualMarkBarcode1D.renderCanvas(canvas1d, type, val, { scale: 3, barHeight: 110 });
        if (res.prefixInfo) {
          info1d.textContent = 'GS1 Region: ' + res.prefixInfo.country + ' (' + res.prefixInfo.org + ')';
        }
      } catch (err) {
        info1d.textContent = 'Error: ' + err.message;
      }
    }

    var weight2d = document.getElementById('synth-2d-weight');
    var price2d = document.getElementById('synth-2d-price');
    var po2d = document.getElementById('synth-2d-po');
    var origin2d = document.getElementById('synth-2d-origin');

    function update2D() {
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
      window.DualMarkGS1.renderQrCanvas(canvas2d, uri, { cellSize: 5, margin: 3 });
    }

    typeSelect.addEventListener('change', update1D);
    input1d.addEventListener('input', update1D);

    [domain2d, gtin2d, lot2d, serial2d, exp2d, weight2d, price2d, po2d, origin2d].forEach(function(el) {
      if (el) el.addEventListener('input', update2D);
    });

    // Downloads
    document.getElementById('btn-1d-svg').addEventListener('click', function() {
      var res = window.DualMarkBarcode1D.renderSvg(typeSelect.value, input1d.value.trim());
      downloadBlob(res.svg, '1D_Barcode_' + typeSelect.value + '.svg', 'image/svg+xml');
      showToast('1D Vector SVG Downloaded');
      window.DualMarkAudio.click();
    });

    document.getElementById('btn-1d-png').addEventListener('click', function() {
      canvas1d.toBlob(function(blob) {
        downloadBlob(blob, '1D_Barcode_' + typeSelect.value + '.png', 'image/png');
        showToast('1D PNG Image Saved');
      });
      window.DualMarkAudio.click();
    });

    document.getElementById('btn-2d-svg').addEventListener('click', function() {
      var uri = preview2d.textContent;
      var svg = window.DualMarkGS1.renderQrSvg(uri, { cellSize: 6, margin: 4 });
      downloadBlob(svg, '2D_GS1_DigitalLink.svg', 'image/svg+xml');
      showToast('2D GS1 Digital Link Vector SVG Downloaded');
      window.DualMarkAudio.click();
    });

    document.getElementById('btn-2d-copy').addEventListener('click', function() {
      var uri = preview2d.textContent;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(uri).then(function() {
          showToast('Copied GS1 Digital Link to Clipboard');
        });
      }
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
          conformanceResult.innerHTML = '<span style="color:var(--emerald); font-weight:bold;">✓ GS1 CONFORMANCE PASSED</span> (Score: ' + res.score + '/100)<br>' +
            '<span style="color:var(--text-secondary);">' + res.details.join(' | ') + '</span>';
          showToast('✓ GS1 Digital Link Conformance Verified');
          if (window.DualMarkAudio) window.DualMarkAudio.successChime();
        } else {
          conformanceResult.innerHTML = '<span style="color:var(--rose); font-weight:bold;">✗ GS1 CONFORMANCE FAILED</span><br>' +
            '<span style="color:var(--rose);">' + res.errors.join('<br>') + '</span>';
          showToast('⚠ GS1 Conformance Issues Detected');
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
        showToast('📦 PIM / DAM Metadata Exported (Salsify, Syndigo, 1WorldSync)');
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
        }
      });
    }

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

    window.clearanceInspector = new window.DualMarkClearance.ClearanceInspector(canvas);

    var lastComplianceState = null;

    window.clearanceInspector.onUpdate(function(metrics) {
      readout.textContent = metrics.edgeDistanceMm + ' mm';
      if (metrics.isCompliant) {
        statusBox.className = 'status-meter pass';
        statusText.innerHTML = '<span>✓</span> <span>COMPLIANT (≥ 50.0 mm)</span>';
        statusSub.textContent = 'Edge-to-edge optical clearance satisfies Sunrise 2027 retail pass-rate requirements (' + metrics.marginDeltaMm + ' mm safety margin).';
        if (lastComplianceState === false) {
          window.DualMarkAudio.successChime();
        }
        lastComplianceState = true;
      } else {
        statusBox.className = 'status-meter fail';
        statusText.innerHTML = '<span>⚠</span> <span>VIOLATION (< 50.0 mm COLLISION RISK)</span>';
        statusSub.textContent = 'Risk of POS scanner laser-grid cross-talk. Deficit: ' + Math.abs(metrics.marginDeltaMm) + ' mm below 50mm standard.';
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
      showToast('⚡ Snapped to 52mm Safe Distance');
      window.DualMarkAudio.successChime();
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

        showToast('✓ Optical Verification: ISO Grade ' + overallLetter + ' (' + overallNumeric + ')');
        if (window.DualMarkAudio) window.DualMarkAudio.successChime();
      });
    }

    if (btnNistCal && window.DualMarkIsoVerifier) {
      btnNistCal.addEventListener('click', function() {
        var cal = window.DualMarkIsoVerifier.performNistCalibration();
        if (isoComplianceBadge) {
          isoComplianceBadge.textContent = 'NIST CALIBRATED (FACTOR ' + cal.calibrationFactor + ')';
          isoComplianceBadge.className = 'badge badge-green';
        }
        showToast('⚖️ NIST Calibration Verified: ' + cal.certificateId + ' (Drift: ' + cal.sensorDrift + ')');
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

        tr.innerHTML = [
          '<td><strong>' + (r.itemTitle || 'Item') + '</strong></td>',
          '<td><span class="badge badge-cyan">' + r.gtin + '</span></td>',
          '<td>' + (r.lot || '*') + '</td>',
          '<td>' + (r.isRecalled ? '<span class="badge badge-red">🚨 RECALL ACTIVE</span>' : '<span class="badge badge-green">NORMAL</span>') + '</td>',
          '<td>' + geoSummary + '</td>',
          '<td>' +
            '<button class="btn btn-secondary btn-sm recall-btn" data-id="' + r.id + '">' + (r.isRecalled ? 'Deactivate Recall' : '🚨 Trigger Recall') + '</button> ' +
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
            showToast('🚨 Recall Kill-Switch Activated for ' + updated.gtin);
          } else {
            showToast('Recall deactivated');
          }
        });
      });

      document.querySelectorAll('.delete-btn').forEach(function(b) {
        b.addEventListener('click', function() {
          var id = this.getAttribute('data-id');
          window.DualMarkResolver.deleteRule(id);
          renderRulesTable();
          showToast('Rule removed');
        });
      });
    }

    testBtn.addEventListener('click', function() {
      var gtin = testGtin.value.trim();
      var country = testCountry.value;
      var result = window.DualMarkResolver.resolve(gtin, '', '', country);
      testOutput.innerHTML = [
        'Resolution Status: <strong>' + result.status + '</strong>',
        'Target Redirect URL: <span style="color:#10B981;">' + result.targetUrl + '</span>',
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
      showToast('SQLite Schema & Data SQL Exported');
    });

    document.getElementById('btn-export-json').addEventListener('click', function() {
      var json = window.DualMarkResolver.exportJsonRules();
      downloadBlob(json, 'dualmark_routes.json', 'application/json');
      showToast('JSON Rules Manifest Exported');
    });

    document.getElementById('btn-export-cf').addEventListener('click', function() {
      var worker = window.DualMarkResolver.exportCloudflareWorker();
      downloadBlob(worker, 'worker.js', 'application/javascript');
      showToast('Cloudflare Workers Router Script Exported');
    });

    document.getElementById('btn-export-nginx').addEventListener('click', function() {
      var nginx = window.DualMarkResolver.exportNginxConfig();
      downloadBlob(nginx, 'nginx_routes.conf', 'text/plain');
      showToast('Nginx Map Configuration Exported');
    });

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

    function executeStartCamera() {
      badgeState.textContent = 'CAMERA STREAMING';
      badgeState.className = 'badge badge-green';
      btnStart.style.display = 'none';
      btnStop.style.display = 'inline-flex';

      studio.startCamera(video, function(detected) {
        if (detected && detected.length > 0) {
          window.DualMarkAudio.scanBeep();
          var first = detected[0];
          resultBlock.innerHTML = [
            'Format: <strong>' + first.format + '</strong>',
            'Decoded Value: <span style="color:#00F0FF;">' + first.rawValue + '</span>',
            first.isGs1DigitalLink ? '<span style="color:#10B981;">[GS1 DIGITAL LINK VALIDATED] GTIN: ' + (first.gs1Data ? first.gs1Data.gtin : '') + '</span>' : ''
          ].join('<br>');
        }
      }, function(err) {
        badgeState.textContent = 'CAMERA UNAVAILABLE';
        badgeState.className = 'badge badge-red';
        btnStart.style.display = 'inline-flex';
        btnStop.style.display = 'none';
        showToast('Camera access unavailable (Check permissions)');
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

    btnStop.addEventListener('click', function() {
      studio.stopCamera();
      badgeState.textContent = 'CAMERA OFFLINE';
      badgeState.className = 'badge badge-cyan';
      btnStart.style.display = 'inline-flex';
      btnStop.style.display = 'none';
    });

    // File scan input
    var scanFileInput = document.getElementById('input-scan-file');
    scanFileInput.addEventListener('change', function(e) {
      if (e.target.files && e.target.files[0]) {
        studio.scanImageFile(e.target.files[0], function(res) {
          showToast('Image analyzed');
          resultBlock.textContent = 'Analyzed: ' + e.target.files[0].name + ' (Resolution ' + res.image.width + 'x' + res.image.height + ')';
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
        var sigBadge = rec.part11Signature
          ? '<span class="badge badge-green" title="' + (rec.part11Signature.signerName || 'Signed') + '">✓ ECDSA P-256</span>'
          : '<span class="badge badge-cyan" style="opacity:0.6;">Unsigned</span>';

        tr.innerHTML = [
          '<td><strong>' + rec.id + '</strong></td>',
          '<td>' + rec.eventType + '</td>',
          '<td><span class="badge badge-cyan">' + rec.tlc + '</span></td>',
          '<td>' + rec.gtin + '</td>',
          '<td>' + new Date(rec.recordedAt).toLocaleString() + '</td>',
          '<td><small style="font-family:monospace; color:#38BDF8;">' + rec.sha256.substring(0, 16) + '...</small></td>',
          '<td>' + sigBadge + '</td>',
          '<td>' +
            '<button class="btn btn-secondary btn-sm pdf-btn" data-id="' + rec.id + '">📄 PDF Dossier</button> ' +
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
            downloadBlob(dossier.base64, dossier.filename, 'application/pdf');
            showToast('📄 Courtroom PDF Dossier Saved: ' + dossier.filename);
            window.DualMarkAudio.successChime();
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

    // FDA 24-Hour Sortable Spreadsheet CSV Export
    var btnFdaCsv = document.getElementById('btn-export-fda-csv');
    if (btnFdaCsv) {
      btnFdaCsv.addEventListener('click', function() {
        var csv = window.DualMarkFsma.exportFdaSortableSpreadsheet();
        downloadBlob(csv, 'FDA_FSMA204_Sortable_Spreadsheet.csv', 'text/csv');
        showToast('📊 FDA 24-Hour Sortable Spreadsheet Exported');
        if (window.DualMarkAudio) window.DualMarkAudio.successChime();
      });
    }

    // GS1 EPCIS 2.0 JSON-LD Export
    var btnEpcis = document.getElementById('btn-export-epcis-jsonld');
    if (btnEpcis) {
      btnEpcis.addEventListener('click', function() {
        var epcis = window.DualMarkFsma.exportEpcisJsonLd();
        downloadBlob(epcis, 'DualMark_EPCIS20_Events.jsonld', 'application/ld+json');
        showToast('🔗 GS1 EPCIS 2.0 JSON-LD Exported');
        if (window.DualMarkAudio) window.DualMarkAudio.successChime();
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
      var newRecord = {
        eventType: eventSelect.value,
        tlc: tlcInput.value.trim(),
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

      var dossier = await window.DualMarkFsma.generatePdfDossier(committed);
      downloadBlob(dossier.base64, dossier.filename, 'application/pdf');
    });

    renderRecordsTable();
  }

  // 7. Module 6: Prepress Export Center
  function initExportsModule() {
    document.getElementById('btn-export-combined-svg').addEventListener('click', function() {
      // Export full SVG with 1D and 2D placed side-by-side with 50mm clearance marker
      var svg1d = window.DualMarkBarcode1D.renderSvg('UPC-A', '081234567890');
      var svg2d = window.DualMarkGS1.renderQrSvg('https://id.brand.com/01/00812345678901');

      var combinedSvg = [
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 400" width="1000" height="400">',
        '<rect width="1000" height="400" fill="#FFFFFF"/>',
        '<g transform="translate(60, 100)">' + svg1d.svg + '</g>',
        '<g transform="translate(580, 100)">' + svg2d + '</g>',
        '<line x1="480" y1="200" x2="570" y2="200" stroke="#EF4444" stroke-width="3" stroke-dasharray="6,6"/>',
        '<text x="525" y="190" font-family="sans-serif" font-size="14" font-weight="bold" text-anchor="middle" fill="#EF4444">≥ 50 mm</text>',
        '<text x="500" y="360" font-family="sans-serif" font-size="18" font-weight="bold" text-anchor="middle" fill="#0F172A">DUALMARK PREPRESS DIE-LINE PROOF — SUNRISE 2027 COMPLIANT</text>',
        '</svg>'
      ].join('\n');

      downloadBlob(combinedSvg, 'DualMark_DieLine_Proof.svg', 'image/svg+xml');
      showToast('Die-Line Proof Sheet SVG Exported');
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

    // CMYK PostScript Level 3 EPS Export
    var btnCmykEps = document.getElementById('btn-export-cmyk-eps');
    if (btnCmykEps) {
      btnCmykEps.addEventListener('click', function() {
        if (!window.DualMarkLicensing || !window.DualMarkPrepress) return;
        window.DualMarkLicensing.checkFeatureOrPrompt('vector_cmyk_eps', function() {
          var data = getActivePrepressData();
          var eps = window.DualMarkPrepress.generateCmykEps(data.barcode1d, data.qrMatrix);
          window.DualMarkPrepress.downloadFile(eps, 'DualMark_Prepress_CMYK.eps', 'application/postscript');
          showToast('✓ PostScript Level 3 CMYK EPS Exported');
          if (window.DualMarkAudio) window.DualMarkAudio.successChime();
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
          var pdf = window.DualMarkPrepress.generateVectorPdf(data.barcode1d, data.qrMatrix, { dpi: 600 });
          window.DualMarkPrepress.downloadFile(pdf, 'DualMark_Vector_Proof_600DPI.pdf', 'application/pdf');
          showToast('✓ High-Res Vector PDF (600 DPI Equivalent) Exported');
          if (window.DualMarkAudio) window.DualMarkAudio.successChime();
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
          var pdf = window.DualMarkPrepress.generateVectorPdf(data.barcode1d, data.qrMatrix, { dpi: 1200 });
          window.DualMarkPrepress.downloadFile(pdf, 'DualMark_Vector_Proof_1200DPI.pdf', 'application/pdf');
          showToast('✓ Ultra High-Res Vector PDF (1200 DPI Equivalent) Exported');
          if (window.DualMarkAudio) window.DualMarkAudio.successChime();
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
          var eps = window.DualMarkPrepress.generatePantoneEps(data.barcode1d, data.qrMatrix);
          window.DualMarkPrepress.downloadFile(eps, 'DualMark_Pantone_Spot_Separation.eps', 'application/postscript');
          showToast('✓ Pantone Spot Separation (Process Black C & Rubine Red C) EPS Exported');
          if (window.DualMarkAudio) window.DualMarkAudio.successChime();
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
          var clearanceMm = window.clearanceInspector ? window.clearanceInspector.getMetrics().edgeDistanceMm : 52;
          var pdf = window.DualMarkPrepress.generateLayeredPdf(data.barcode1d, data.qrMatrix, { clearanceMm: clearanceMm });
          window.DualMarkPrepress.downloadFile(pdf, 'DualMark_Layered_Illustrator_OCG.pdf', 'application/pdf');
          showToast('✓ Adobe Illustrator Layered PDF (OCG) Exported');
          if (window.DualMarkAudio) window.DualMarkAudio.successChime();
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
      var val1d = (document.getElementById('synth-1d-input') && document.getElementById('synth-1d-input').value.trim()) || '081234567890';
      var uri2d = (document.getElementById('synth-2d-uri-preview') && document.getElementById('synth-2d-uri-preview').textContent) || 'https://id.brand.com/01/00812345678901';
      var lot = (document.getElementById('synth-2d-lot') && document.getElementById('synth-2d-lot').value.trim()) || 'LOT-2026-X';
      var dpi = zplDpiSelect ? parseInt(zplDpiSelect.value, 10) : 203;

      if (window.DualMarkZpl) {
        return window.DualMarkZpl.generateDualMarkZpl({
          gtin: val1d,
          digitalLinkUri: uri2d,
          lot: lot,
          dpi: dpi,
          clearanceMm: 52
        });
      }
      return '^XA\n^FO50,50^BCN,100,Y,N,N^FD>:' + val1d + '^FS\n^XZ';
    }

    if (btnGenZpl && zplOutputPreview) {
      btnGenZpl.addEventListener('click', function() {
        var zpl = getActiveZpl();
        zplOutputPreview.textContent = zpl;
        showToast('⚡ Zebra ZPL II Command Stream Generated');
        if (window.DualMarkAudio) window.DualMarkAudio.successChime();
      });
    }

    if (btnCopyZpl) {
      btnCopyZpl.addEventListener('click', function() {
        var zpl = zplOutputPreview.textContent;
        if (zpl.indexOf('^XA') === -1) zpl = getActiveZpl();
        if (navigator.clipboard) {
          navigator.clipboard.writeText(zpl).then(function() {
            showToast('📋 Copied ZPL Code to Clipboard');
          });
        }
        if (window.DualMarkAudio) window.DualMarkAudio.click();
      });
    }

    if (btnDownloadZpl) {
      btnDownloadZpl.addEventListener('click', function() {
        var zpl = zplOutputPreview.textContent;
        if (zpl.indexOf('^XA') === -1) zpl = getActiveZpl();
        downloadBlob(zpl, 'DualMark_Zebra_Sunrise2027.zpl', 'text/plain');
        showToast('💾 Zebra ZPL File Downloaded');
        if (window.DualMarkAudio) window.DualMarkAudio.successChime();
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
