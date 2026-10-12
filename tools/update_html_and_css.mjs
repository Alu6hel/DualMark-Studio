import fs from 'fs';

let html = fs.readFileSync('web_app/index.html', 'utf8');

// 1. Replace the 5 inline grid 1fr 1fr with form-row-2col class
html = html.replace(
  /<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">/g,
  '<div class="form-row-2col">'
);

// 2. Add data-i18n to Header & Badges
html = html.replace(
  '<span class="brand-badge">SUNRISE 2027</span>',
  '<span class="brand-badge" data-i18n="brand.badge_sunrise">SUNRISE 2027</span>'
);
html = html.replace(
  '<span id="header-license-badge" class="brand-badge badge-free" style="cursor:pointer;" title="Click to view Commercial Licensing & Editions">FREE</span>',
  '<span id="header-license-badge" class="brand-badge badge-free" style="cursor:pointer;" title="Click to view Commercial Licensing & Editions" data-i18n="badge.free" data-i18n-title="header.tooltip_settings">FREE</span>'
);
html = html.replace(
  'id="mascot-companion-wrap" style="display: flex; align-items: center; justify-content: center; cursor: pointer; margin-right: 2px;" title="Marky — DualMark AI Assistant (Click for Status)"',
  'id="mascot-companion-wrap" style="display: flex; align-items: center; justify-content: center; cursor: pointer; margin-right: 2px;" title="Marky — DualMark AI Assistant (Click for Status)" data-i18n-title="header.tooltip_mascot"'
);
html = html.replace(
  '<button id="btn-tour" class="icon-btn" title="Interactive Guided Tour" aria-label="Take Tour">❓</button>',
  '<button id="btn-tour" class="icon-btn" title="Interactive Guided Tour" aria-label="Take Tour" data-i18n-title="header.tooltip_tour">❓</button>'
);
html = html.replace(
  '<button id="btn-quick-settings" class="icon-btn" title="Workstation Settings & Controls" aria-label="Settings">⚙️</button>',
  '<button id="btn-quick-settings" class="icon-btn" title="Workstation Settings & Controls" aria-label="Settings" data-i18n-title="header.tooltip_settings">⚙️</button>'
);

// 3. Settings Drawer
html = html.replace(
  '<span id="badge-mascot-status" class="badge badge-cyan" style="font-size: 10px; padding: 2px 6px;">Active</span>',
  '<span id="badge-mascot-status" class="badge badge-cyan" style="font-size: 10px; padding: 2px 6px;" data-i18n="settings.mascot_status_active">Active</span>'
);
html = html.replace(
  '<option value="default">🌌 Industrial Obsidian (Standard Dark)</option>',
  '<option value="default" data-i18n="settings.theme_obsidian">🌌 Industrial Obsidian (Standard Dark)</option>'
);
html = html.replace(
  '<option value="theme-mascot-amber">🦺 Mascot Safety Amber (Engineer Hardhat)</option>',
  '<option value="theme-mascot-amber" data-i18n="settings.theme_mascot_amber_opt">🦺 Mascot Safety Amber (Engineer Hardhat)</option>'
);
html = html.replace(
  '<option value="theme-mascot-cyber">🥽 Mascot Cyber Visor (Holographic HUD)</option>',
  '<option value="theme-mascot-cyber" data-i18n="settings.theme_mascot_cyber_opt">🥽 Mascot Cyber Visor (Holographic HUD)</option>'
);
html = html.replace(
  '<option value="theme-light">🌓 Clean Room (Light Mode)</option>',
  '<option value="theme-light" data-i18n="settings.theme_light_opt">🌓 Clean Room (Light Mode)</option>'
);
html = html.replace(
  '<option value="theme-outdoor">☀️ High-Contrast Dock (Outdoor)</option>',
  '<option value="theme-outdoor" data-i18n="settings.theme_outdoor_opt">☀️ High-Contrast Dock (Outdoor)</option>'
);

// 4. Tab 1 Synth
html = html.replace(
  '<span class="presets-tag">1-Click Industry Presets</span>',
  '<span class="presets-tag" data-i18n="synth.presets_tag">1-Click Industry Presets</span>'
);
html = html.replace(
  '<span class="presets-sub">• Instant Packaging Profiles</span>',
  '<span class="presets-sub" data-i18n="synth.presets_sub">• Instant Packaging Profiles</span>'
);
html = html.replace(
  '<span class="card-title-sub">Legacy POS &amp; Sunrise 2027</span>',
  '<span class="card-title-sub" data-i18n="synth.proof_sub">Legacy POS &amp; Sunrise 2027</span>'
);
html = html.replace(
  '<small style="color:var(--text-secondary); font-weight:700; font-size:10px; margin-bottom:6px; text-transform:uppercase;">1D POS Barcode (<span id="barcode-type-badge">UPC-A</span>)</small>',
  '<small style="color:var(--text-secondary); font-weight:700; font-size:10px; margin-bottom:6px; text-transform:uppercase;"><span data-i18n="synth.proof_1d_title">1D POS Barcode</span> (<span id="barcode-type-badge">UPC-A</span>)</small>'
);
html = html.replace(
  '<small style="color:var(--text-secondary); font-weight:700; font-size:10px; margin-bottom:6px; text-transform:uppercase;">2D GS1 Matrix (<span id="badge-2d-standard">ISO/IEC 18004</span>)</small>',
  '<small style="color:var(--text-secondary); font-weight:700; font-size:10px; margin-bottom:6px; text-transform:uppercase;"><span data-i18n="synth.proof_2d_title">2D GS1 Matrix</span> (<span id="badge-2d-standard">ISO/IEC 18004</span>)</small>'
);

// Synth Proof Action Buttons
html = html.replace(
  '<button class="btn btn-primary btn-sm" id="btn-tab1-prepress-bundle">🚀 Master Bundle</button>',
  '<button class="btn btn-primary btn-sm" id="btn-tab1-prepress-bundle" data-i18n="synth.btn_master_bundle">🚀 Master Bundle</button>'
);
html = html.replace(
  '<button class="btn btn-secondary btn-sm" id="btn-1d-svg">💾 1D SVG</button>',
  '<button class="btn btn-secondary btn-sm" id="btn-1d-svg" data-i18n="synth.btn_1d_svg">💾 1D SVG</button>'
);
html = html.replace(
  '<button class="btn btn-secondary btn-sm" id="btn-1d-png">🖼️ 1D PNG</button>',
  '<button class="btn btn-secondary btn-sm" id="btn-1d-png" data-i18n="synth.btn_1d_png">🖼️ 1D PNG</button>'
);
html = html.replace(
  '<button class="btn btn-emerald btn-sm" id="btn-2d-svg">💾 2D SVG</button>',
  '<button class="btn btn-emerald btn-sm" id="btn-2d-svg" data-i18n="synth.btn_2d_svg">💾 2D SVG</button>'
);
html = html.replace(
  '<button class="btn btn-secondary btn-sm" id="btn-2d-copy">📋 Copy URI</button>',
  '<button class="btn btn-secondary btn-sm" id="btn-2d-copy" data-i18n="synth.btn_2d_copy">📋 Copy URI</button>'
);
html = html.replace(
  '<button class="btn btn-primary btn-sm" id="btn-gs1-conformance">✓ GS1 Audit</button>',
  '<button class="btn btn-primary btn-sm" id="btn-gs1-conformance" data-i18n="synth.btn_gs1_audit">✓ GS1 Audit</button>'
);
html = html.replace(
  '<button class="btn btn-secondary btn-sm" id="btn-export-pim">📦 PIM</button>',
  '<button class="btn btn-secondary btn-sm" id="btn-export-pim" data-i18n="synth.btn_pim">📦 PIM</button>'
);

// Synth Input Form
html = html.replace(
  '<span>⚡ Smart Auto-Sync 1D ↔ 2D</span>',
  '<span data-i18n="synth.auto_sync">⚡ Smart Auto-Sync 1D ↔ 2D</span>'
);
html = html.replace(
  '<label style="font-size: 11px;">1D Symbology Standard</label>',
  '<label style="font-size: 11px;" data-i18n="synth.1d_type_label">1D Symbology Standard</label>'
);
html = html.replace(
  '<option value="UPC-A" selected>UPC-A (12-Digit Retail Item)</option>',
  '<option value="UPC-A" selected data-i18n="synth.1d_opt_upca">UPC-A (12-Digit Retail Item)</option>'
);
html = html.replace(
  '<option value="EAN-13">EAN-13 (13-Digit International)</option>',
  '<option value="EAN-13" data-i18n="synth.1d_opt_ean13">EAN-13 (13-Digit International)</option>'
);
html = html.replace(
  '<option value="Code-128">Code 128 (Alphanumeric Supply Chain)</option>',
  '<option value="Code-128" data-i18n="synth.1d_opt_code128">Code 128 (Alphanumeric Supply Chain)</option>'
);
html = html.replace(
  '<option value="ITF-14">ITF-14 (14-Digit Shipping Corrugated Box)</option>',
  '<option value="ITF-14" data-i18n="synth.1d_opt_itf14">ITF-14 (14-Digit Shipping Corrugated Box)</option>'
);

html = html.replace(
  '<label style="font-size: 11px;">2D Symbology Standard</label>',
  '<label style="font-size: 11px;" data-i18n="synth.2d_type_label">2D Symbology Standard</label>'
);
html = html.replace(
  '<option value="QR" selected>GS1 Digital Link (QR Code — Consumer Retail)</option>',
  '<option value="QR" selected data-i18n="synth.2d_opt_qr">GS1 Digital Link (QR Code — Consumer Retail)</option>'
);
html = html.replace(
  '<option value="DataMatrix">GS1 DataMatrix (ISO 16022 ECC 200 — Pharma/UDI)</option>',
  '<option value="DataMatrix" data-i18n="synth.2d_opt_datamatrix">GS1 DataMatrix (ISO 16022 ECC 200 — Pharma/UDI)</option>'
);
html = html.replace(
  '<option value="DotCode">GS1 DotCode (ISO 20835 — High-Speed Inkjet/Laser)</option>',
  '<option value="DotCode" data-i18n="synth.2d_opt_dotcode">GS1 DotCode (ISO 20835 — High-Speed Inkjet/Laser)</option>'
);

html = html.replace(
  '<label style="font-size: 11px;">Master Product Code / UPC-A</label>',
  '<label style="font-size: 11px;" data-i18n="synth.master_code_label">Master Product Code / UPC-A</label>'
);
html = html.replace(
  '<button class="btn btn-secondary btn-sm" id="btn-1d-calc-chk" style="padding: 1px 6px; font-size: 9.5px;" title="Auto-Calculate Modulo-10 Check Digit">✓ Auto Check</button>',
  '<button class="btn btn-secondary btn-sm" id="btn-1d-calc-chk" style="padding: 1px 6px; font-size: 9.5px;" title="Auto-Calculate Modulo-10 Check Digit" data-i18n="synth.btn_auto_check">✓ Auto Check</button>'
);
html = html.replace(
  '<input type="text" id="synth-1d-input" class="mono-input" value="081234567890" maxlength="14" placeholder="Enter barcode number">',
  '<input type="text" id="synth-1d-input" class="mono-input" value="081234567890" maxlength="14" placeholder="Enter barcode number" data-i18n-placeholder="synth.1d_input_placeholder">'
);
html = html.replace(
  '<label style="font-size: 11px;">GTIN-14 (AI 01) [Sunrise 2027]</label>',
  '<label style="font-size: 11px;" data-i18n="synth.gtin14_label">GTIN-14 (AI 01) [Sunrise 2027]</label>'
);
html = html.replace(
  '<label style="font-size: 11px;">Brand Resolver Domain</label>',
  '<label style="font-size: 11px;" data-i18n="synth.domain_label">Brand Resolver Domain</label>'
);
html = html.replace(
  '<input type="text" id="synth-2d-domain" class="mono-input" value="https://id.brand.com" placeholder="https://id.brand.com">',
  '<input type="text" id="synth-2d-domain" class="mono-input" value="https://id.brand.com" placeholder="https://id.brand.com" data-i18n-placeholder="synth.domain_placeholder">'
);
html = html.replace(
  '<label style="font-size: 11px;">Batch / Lot (AI 10)</label>',
  '<label style="font-size: 11px;" data-i18n="synth.lot_label">Batch / Lot (AI 10)</label>'
);
html = html.replace(
  '<label style="font-size: 11px;">Serial (AI 21)</label>',
  '<label style="font-size: 11px;" data-i18n="synth.serial_label">Serial (AI 21)</label>'
);
html = html.replace(
  '<label style="font-size: 11px;">Exp (AI 17) [YYMMDD]</label>',
  '<label style="font-size: 11px;" data-i18n="synth.exp_label">Exp (AI 17) [YYMMDD]</label>'
);
html = html.replace(
  '<input type="text" id="synth-2d-exp" class="mono-input" value="271231" maxlength="6" placeholder="YYMMDD">',
  '<input type="text" id="synth-2d-exp" class="mono-input" value="271231" maxlength="6" placeholder="YYMMDD" data-i18n-placeholder="synth.exp_placeholder">'
);
html = html.replace(
  '<label style="font-size: 11px;">Calendar Date</label>',
  '<label style="font-size: 11px;" data-i18n="synth.cal_label">Calendar Date</label>'
);
html = html.replace(
  '<span>📦 Advanced Supply Chain &amp; Logistics AIs (Weight, Price, PO, Origin)</span>',
  '<span data-i18n="synth.extended_ais_btn">📦 Advanced Supply Chain &amp; Logistics AIs (Weight, Price, PO, Origin)</span>'
);
html = html.replace(
  '<label style="font-size: 10px;">Weight kg (AI 3102)</label>',
  '<label style="font-size: 10px;" data-i18n="synth.weight_label">Weight kg (AI 3102)</label>'
);
html = html.replace(
  '<label style="font-size: 10px;">Price (AI 3922)</label>',
  '<label style="font-size: 10px;" data-i18n="synth.price_label">Price (AI 3922)</label>'
);
html = html.replace(
  '<label style="font-size: 10px;">PO # (AI 400)</label>',
  '<label style="font-size: 10px;" data-i18n="synth.po_label">PO # (AI 400)</label>'
);
html = html.replace(
  '<label style="font-size: 10px;">Origin (AI 422)</label>',
  '<label style="font-size: 10px;" data-i18n="synth.origin_label">Origin (AI 422)</label>'
);
html = html.replace(
  '<label style="font-size: 10px;">GS1 Digital Link URI</label>',
  '<label style="font-size: 10px;" data-i18n="synth.uri_label">GS1 Digital Link URI</label>'
);
html = html.replace(
  '<span>GS1 Prefix &amp; Registry Validator</span>',
  '<span data-i18n="synth.gepir_title">GS1 Prefix &amp; Registry Validator</span>'
);
html = html.replace(
  '<input type="text" id="gepir-check-input" class="mono-input" value="00812345678901" placeholder="Enter GTIN-12/13/14" style="flex: 1;">',
  '<input type="text" id="gepir-check-input" class="mono-input" value="00812345678901" placeholder="Enter GTIN-12/13/14" style="flex: 1;" data-i18n-placeholder="synth.gepir_placeholder">'
);
html = html.replace(
  '<button class="btn btn-secondary" id="btn-gepir-validate" style="white-space: nowrap;">🔍 Verify</button>',
  '<button class="btn btn-secondary" id="btn-gepir-validate" style="white-space: nowrap;" data-i18n="synth.btn_verify">🔍 Verify</button>'
);

// 5. Tab 2 Clearance
html = html.replace(
  '<span class="badge badge-cyan">SUNRISE 2027 AUDITOR</span>',
  '<span class="badge badge-cyan" data-i18n="clearance.badge_auditor">SUNRISE 2027 AUDITOR</span>'
);
html = html.replace(
  '<option value="snack" selected>Snack Bar (150 x 55 mm)</option>',
  '<option value="snack" selected data-i18n="clearance.preset_snack">Snack Bar (150 x 55 mm)</option>'
);
html = html.replace(
  '<option value="blister">Blister Pack (110 x 75 mm)</option>',
  '<option value="blister" data-i18n="clearance.preset_blister">Blister Pack (110 x 75 mm)</option>'
);
html = html.replace(
  '<option value="bottle">Bottle Label (180 x 85 mm)</option>',
  '<option value="bottle" data-i18n="clearance.preset_bottle">Bottle Label (180 x 85 mm)</option>'
);
html = html.replace(
  '<option value="pharma">Pharma Carton (90 x 50 mm)</option>',
  '<option value="pharma" data-i18n="clearance.preset_pharma">Pharma Carton (90 x 50 mm)</option>'
);
html = html.replace(
  '<option value="retail_box">Folding Carton (220 x 160 mm)</option>',
  '<option value="retail_box" data-i18n="clearance.preset_carton">Folding Carton (220 x 160 mm)</option>'
);
html = html.replace(
  '<button class="btn btn-primary btn-sm" id="btn-snap-50mm" style="padding: 7px 12px;">⚡ Snap 50mm</button>',
  '<button class="btn btn-primary btn-sm" id="btn-snap-50mm" style="padding: 7px 12px;" data-i18n="clearance.btn_snap">⚡ Snap 50mm</button>'
);
html = html.replace(
  '<button class="btn" id="btn-zoom-out" title="Zoom Out" style="padding: 7px 10px;">🔍−</button>',
  '<button class="btn" id="btn-zoom-out" title="Zoom Out" style="padding: 7px 10px;" data-i18n-title="clearance.btn_zoom_out">🔍−</button>'
);
html = html.replace(
  '<button class="btn" id="btn-zoom-reset" title="Reset Zoom" style="padding: 7px 10px;">↺</button>',
  '<button class="btn" id="btn-zoom-reset" title="Reset Zoom" style="padding: 7px 10px;" data-i18n-title="clearance.btn_zoom_reset">↺</button>'
);
html = html.replace(
  '<button class="btn" id="btn-zoom-in" title="Zoom In" style="padding: 7px 10px;">🔍+</button>',
  '<button class="btn" id="btn-zoom-in" title="Zoom In" style="padding: 7px 10px;" data-i18n-title="clearance.btn_zoom_in">🔍+</button>'
);
html = html.replace(
  '<span style="font-size: 11px; font-weight: 700; color: var(--text-secondary);">SURFACE:</span>',
  '<span style="font-size: 11px; font-weight: 700; color: var(--text-secondary);" data-i18n="clearance.surface_label">SURFACE:</span>'
);
html = html.replace(
  '<button type="button" class="segmented-item active" data-geom="flat" id="seg-geom-flat">📄 Flat Carton</button>',
  '<button type="button" class="segmented-item active" data-geom="flat" id="seg-geom-flat" data-i18n="clearance.surface_flat">📄 Flat Carton</button>'
);
html = html.replace(
  '<button type="button" class="segmented-item" data-geom="cylindrical" id="seg-geom-cyl">🥫 3D Cylinder / Can</button>',
  '<button type="button" class="segmented-item" data-geom="cylindrical" id="seg-geom-cyl" data-i18n="clearance.surface_cyl">🥫 3D Cylinder / Can</button>'
);
html = html.replace(
  '<small style="color: var(--text-muted); font-size: 10px;">Threshold: 50.0 mm</small>',
  '<small style="color: var(--text-muted); font-size: 10px;" data-i18n="clearance.threshold_label">Threshold: 50.0 mm</small>'
);
html = html.replace(
  '<span>ISO/IEC 15416 &amp; 15415 Optical Grading Station</span>',
  '<span data-i18n="clearance.iso_station_title">ISO/IEC 15416 &amp; 15415 Optical Grading Station</span>'
);
html = html.replace(
  '<span class="badge badge-purple" id="iso-compliance-badge">CALIBRATED VERIFIER (ISO/IEC 15426)</span>',
  '<span class="badge badge-purple" id="iso-compliance-badge" data-i18n="clearance.iso_badge">CALIBRATED VERIFIER (ISO/IEC 15426)</span>'
);
html = html.replace(
  '<button class="btn btn-primary" id="btn-run-iso-grading">🔍 Run ISO Grade</button>',
  '<button class="btn btn-primary" id="btn-run-iso-grading" data-i18n="clearance.btn_iso_grade">🔍 Run ISO Grade</button>'
);
html = html.replace(
  '<button class="btn btn-secondary" id="btn-nist-calibration">⚖️ NIST Check</button>',
  '<button class="btn btn-secondary" id="btn-nist-calibration" data-i18n="clearance.btn_nist">⚖️ NIST Check</button>'
);
html = html.replace(
  '<button class="btn btn-emerald" id="btn-iso-cert-pdf">📄 PDF Cert</button>',
  '<button class="btn btn-emerald" id="btn-iso-cert-pdf" data-i18n="clearance.btn_pdf_cert">📄 PDF Cert</button>'
);
html = html.replace(
  '<span style="font-weight: 700; font-size: 13px;">ISO/IEC Optical Grade Report</span>',
  '<span style="font-weight: 700; font-size: 13px;" data-i18n="clearance.iso_report_title">ISO/IEC Optical Grade Report</span>'
);

// 6. Tab 3 Resolver
html = html.replace(
  '<span class="badge badge-emerald">STANDALONE EDGE ROUTING</span>',
  '<span class="badge badge-emerald" data-i18n="resolver.badge">STANDALONE EDGE ROUTING</span>'
);
html = html.replace('<th>Item / SKU</th>', '<th data-i18n="resolver.th_sku">Item / SKU</th>');
html = html.replace('<th>GTIN-14</th>', '<th data-i18n="resolver.th_gtin">GTIN-14</th>');
html = html.replace('<th>Batch / Lot</th>', '<th data-i18n="resolver.th_lot">Batch / Lot</th>');
html = html.replace('<th>Recall Kill-Switch</th>', '<th data-i18n="resolver.th_recall">Recall Kill-Switch</th>');
html = html.replace('<th>Geo-Rules</th>', '<th data-i18n="resolver.th_geo">Geo-Rules</th>');
html = html.replace('<th>Action</th>', '<th data-i18n="resolver.th_action">Action</th>');

html = html.replace(
  '<input type="text" id="test-resolve-gtin" class="mono-input" value="00812345678901" placeholder="Test GTIN">',
  '<input type="text" id="test-resolve-gtin" class="mono-input" value="00812345678901" placeholder="Test GTIN" data-i18n-placeholder="resolver.placeholder_gtin">'
);
html = html.replace(
  '<button class="btn btn-primary" id="btn-test-resolve" style="white-space: nowrap;">⚡ Resolve</button>',
  '<button class="btn btn-primary" id="btn-test-resolve" style="white-space: nowrap;" data-i18n="resolver.btn_resolve">⚡ Resolve</button>'
);
html = html.replace(
  '<button class="btn btn-secondary" id="btn-add-resolve-rule" style="white-space: nowrap;">➕ Add Route</button>',
  '<button class="btn btn-secondary" id="btn-add-resolve-rule" style="white-space: nowrap;" data-i18n="resolver.btn_add_route">➕ Add Route</button>'
);
html = html.replace(
  '<button class="btn btn-secondary" id="btn-export-sql">🗄️ SQLite (.sql)</button>',
  '<button class="btn btn-secondary" id="btn-export-sql" data-i18n="resolver.btn_sqlite">🗄️ SQLite (.sql)</button>'
);
html = html.replace(
  '<button class="btn btn-secondary" id="btn-export-json">📄 JSON Rules</button>',
  '<button class="btn btn-secondary" id="btn-export-json" data-i18n="resolver.btn_json">📄 JSON Rules</button>'
);
html = html.replace(
  '<button class="btn btn-secondary" id="btn-export-cf">⚡ Cloudflare</button>',
  '<button class="btn btn-secondary" id="btn-export-cf" data-i18n="resolver.btn_cloudflare">⚡ Cloudflare</button>'
);
html = html.replace(
  '<button class="btn btn-secondary" id="btn-export-nginx">🌐 Nginx</button>',
  '<button class="btn btn-secondary" id="btn-export-nginx" data-i18n="resolver.btn_nginx">🌐 Nginx</button>'
);
html = html.replace(
  '<button class="btn btn-secondary" id="btn-export-linkset">🔗 GS1 Linkset</button>',
  '<button class="btn btn-secondary" id="btn-export-linkset" data-i18n="resolver.btn_linkset">🔗 GS1 Linkset</button>'
);

// 7. Tab 4 Scanner
html = html.replace(
  '<span class="badge badge-cyan" id="scanner-state-badge">CAMERA OFFLINE</span>',
  '<span class="badge badge-cyan" id="scanner-state-badge" data-i18n="scanner.state_offline">CAMERA OFFLINE</span>'
);
html = html.replace(
  '<button class="btn btn-primary glove-touch-btn" id="btn-start-camera" data-i18n="btn.scan">📷 Start Camera</button>',
  '<button class="btn btn-primary glove-touch-btn" id="btn-start-camera" data-i18n="scanner.btn_start">📷 Start Camera</button>'
);
html = html.replace(
  '<button class="btn btn-danger glove-touch-btn" id="btn-stop-camera" style="display:none;">🛑 Stop</button>',
  '<button class="btn btn-danger glove-touch-btn" id="btn-stop-camera" style="display:none;" data-i18n="scanner.btn_stop">🛑 Stop</button>'
);
html = html.replace(
  '<button class="btn btn-secondary glove-touch-btn" id="btn-toggle-torch">🔦 Light</button>',
  '<button class="btn btn-secondary glove-touch-btn" id="btn-toggle-torch" data-i18n="scanner.btn_light">🔦 Light</button>'
);
html = html.replace(
  '<button class="btn btn-secondary glove-touch-btn" id="btn-calibrate-target" data-i18n="btn.calibrate" title="Calibrate Optical Scale with 20mm Coupon or ID-1 Card">📐 Calibrate</button>',
  '<button class="btn btn-secondary glove-touch-btn" id="btn-calibrate-target" data-i18n="scanner.btn_calibrate" data-i18n-title="scanner.btn_calibrate_tooltip" title="Calibrate Optical Scale with 20mm Coupon or ID-1 Card">📐 Calibrate</button>'
);
html = html.replace(
  '<label class="btn btn-secondary glove-touch-btn" style="cursor: pointer; margin: 0;">\n              📁 Upload <input type="file" id="input-scan-file" accept="image/*" style="display:none;">\n            </label>',
  '<label class="btn btn-secondary glove-touch-btn" style="cursor: pointer; margin: 0;">\n              <span data-i18n="scanner.btn_upload">📁 Upload</span> <input type="file" id="input-scan-file" accept="image/*" style="display:none;">\n            </label>'
);
html = html.replace(
  '<label for="chk-continuous-scan" style="font-size: 11px; cursor: pointer; color: var(--cyan); margin: 0;">Continuous 50mm Tracking</label>',
  '<label for="chk-continuous-scan" style="font-size: 11px; cursor: pointer; color: var(--cyan); margin: 0;" data-i18n="scanner.continuous_tracking">Continuous 50mm Tracking</label>'
);
html = html.replace(
  '<label style="font-size: 10px;">Decoded Payload</label>',
  '<label style="font-size: 10px;" data-i18n="scanner.decoded_title">Decoded Payload</label>'
);
html = html.replace(
  '<span style="font-size: 11px; font-weight: 800; color: var(--emerald);">⚡ 1-TAP FSMA 204 TRACEABILITY</span>',
  '<span style="font-size: 11px; font-weight: 800; color: var(--emerald);" data-i18n="scanner.quick_cte_title">⚡ 1-TAP FSMA 204 TRACEABILITY</span>'
);
html = html.replace(
  '<span class="badge badge-green" style="font-size: 9.5px;">PARSED METADATA</span>',
  '<span class="badge badge-green" style="font-size: 9.5px;" data-i18n="scanner.quick_cte_badge">PARSED METADATA</span>'
);
html = html.replace(
  '<button class="btn btn-emerald btn-sm" id="btn-quick-log-cte" style="flex: 1; padding: 7px 10px; font-weight: 700;">⚡ Log to FSMA Chain (1-Tap)</button>',
  '<button class="btn btn-emerald btn-sm" id="btn-quick-log-cte" style="flex: 1; padding: 7px 10px; font-weight: 700;" data-i18n="scanner.btn_log_cte">⚡ Log to FSMA Chain (1-Tap)</button>'
);
html = html.replace(
  '<button class="btn btn-secondary btn-sm" id="btn-view-fsma-cte" style="padding: 7px 10px;">View in FSMA</button>',
  '<button class="btn btn-secondary btn-sm" id="btn-view-fsma-cte" style="padding: 7px 10px;" data-i18n="scanner.btn_view_fsma">View in FSMA</button>'
);
html = html.replace(
  '<span>Surface &amp; Geometry Corrector</span>',
  '<span data-i18n="scanner.surface_title">Surface &amp; Geometry Corrector</span>'
);
html = html.replace(
  '<span class="badge badge-emerald">DEWARP &amp; UNROLLER</span>',
  '<span class="badge badge-emerald" data-i18n="scanner.surface_badge">DEWARP &amp; UNROLLER</span>'
);
html = html.replace(
  '<button type="button" class="segmented-item active" data-surface="document" id="seg-surface-doc">📄 Document Flatten</button>',
  '<button type="button" class="segmented-item active" data-surface="document" id="seg-surface-doc" data-i18n="scanner.mode_doc">📄 Document Flatten</button>'
);
html = html.replace(
  '<button type="button" class="segmented-item" data-surface="cylindrical" id="seg-surface-cyl">🥫 Cylindrical Unroller</button>',
  '<button type="button" class="segmented-item" data-surface="cylindrical" id="seg-surface-cyl" data-i18n="scanner.mode_cyl">🥫 Cylindrical Unroller</button>'
);
html = html.replace(
  '<label class="btn btn-secondary" style="cursor: pointer; margin: 0;">\n                📁 Load Photo <input type="file" id="input-dewarp-file" accept="image/*" style="display:none;">\n              </label>',
  '<label class="btn btn-secondary" style="cursor: pointer; margin: 0;">\n                <span data-i18n="scanner.btn_load_photo">📁 Load Photo</span> <input type="file" id="input-dewarp-file" accept="image/*" style="display:none;">\n              </label>'
);
html = html.replace(
  '<button class="btn btn-secondary" id="btn-autodetect-corners" title="Auto-detect quad corners using Canny & Sobel gradient analysis">🎯 Auto-Detect Corners</button>',
  '<button class="btn btn-secondary" id="btn-autodetect-corners" title="Auto-detect quad corners using Canny & Sobel gradient analysis" data-i18n="scanner.btn_autodetect" data-i18n-title="scanner.btn_autodetect_tooltip">🎯 Auto-Detect Corners</button>'
);
html = html.replace(
  '<button class="btn btn-emerald" id="btn-flatten-dewarp">⚡ Flatten &amp; Binarize</button>',
  '<button class="btn btn-emerald" id="btn-flatten-dewarp" data-i18n="scanner.btn_flatten">⚡ Flatten &amp; Binarize</button>'
);
html = html.replace(
  '<button class="btn btn-secondary" id="btn-unroll-cylindrical" style="white-space: nowrap;">🔄 Unroll</button>',
  '<button class="btn btn-secondary" id="btn-unroll-cylindrical" style="white-space: nowrap;" data-i18n="scanner.btn_unroll">🔄 Unroll</button>'
);

// 8. Tab 5 FSMA
html = html.replace(
  '<span class="badge badge-cyan">21 CFR PART 1 SUBPART S</span>',
  '<span class="badge badge-cyan" data-i18n="fsma.badge">21 CFR PART 1 SUBPART S</span>'
);
html = html.replace(
  '<h4 style="margin-bottom: 10px; font-size: 13px; color: var(--emerald);">+ Record Critical Tracking Event (CTE)</h4>',
  '<h4 style="margin-bottom: 10px; font-size: 13px; color: var(--emerald);" data-i18n="fsma.record_cte_title">+ Record Critical Tracking Event (CTE)</h4>'
);
html = html.replace(
  '<label>CTE Event Type</label>',
  '<label data-i18n="fsma.cte_type_label">CTE Event Type</label>'
);
html = html.replace(
  '<option value="RECEIVING CTE" selected>Receiving CTE (Received from Prior Facility)</option>',
  '<option value="RECEIVING CTE" selected data-i18n="fsma.opt_receiving">Receiving CTE (Received from Prior Facility)</option>'
);
html = html.replace(
  '<option value="TRANSFORMATION CTE">Transformation CTE (Manufacturing / Repackaging)</option>',
  '<option value="TRANSFORMATION CTE" data-i18n="fsma.opt_transform">Transformation CTE (Manufacturing / Repackaging)</option>'
);
html = html.replace(
  '<option value="SHIPPING CTE">Shipping CTE (Dispatched to Retail / Distribution)</option>',
  '<option value="SHIPPING CTE" data-i18n="fsma.opt_shipping">Shipping CTE (Dispatched to Retail / Distribution)</option>'
);
html = html.replace(
  '<option value="INITIAL PACKING CTE">Initial Packing CTE (First packing of raw farm produce)</option>',
  '<option value="INITIAL PACKING CTE" data-i18n="fsma.opt_initial_packing">Initial Packing CTE (First packing of raw farm produce)</option>'
);
html = html.replace(
  '<label>Traceability Lot Code (TLC)</label>',
  '<label data-i18n="fsma.tlc_label">Traceability Lot Code (TLC)</label>'
);
html = html.replace(
  '<label>Parent TLC (Genealogy)</label>',
  '<label data-i18n="fsma.parent_tlc_label">Parent TLC (Genealogy)</label>'
);
html = html.replace(
  '<input type="text" id="fsma-input-tlc" class="mono-input" value="TLC-RAW-ALMOND-08" placeholder="Parent Lot Code">',
  '<input type="text" id="fsma-input-tlc" class="mono-input" value="TLC-RAW-ALMOND-08" placeholder="Parent Lot Code" data-i18n-placeholder="fsma.parent_tlc_placeholder">'
);
html = html.replace(
  '<label>GTIN-14</label>',
  '<label data-i18n="fsma.gtin_label">GTIN-14</label>'
);
html = html.replace(
  '<label>FTL Commodity</label>',
  '<label data-i18n="fsma.ftl_label">FTL Commodity</label>'
);
html = html.replace(
  '<option value="Nut Butters (peanut butter, almond butter, cashew butter)" selected>Nut Butters (almond/peanut/cashew)</option>',
  '<option value="Nut Butters (peanut butter, almond butter, cashew butter)" selected data-i18n="fsma.ftl_opt_nut_butters">Nut Butters (almond/peanut/cashew)</option>'
);
html = html.replace(
  '<option value="Cheeses, other than hard cheeses (soft, semi-soft)">Soft / Semi-Soft Cheeses</option>',
  '<option value="Cheeses, other than hard cheeses (soft, semi-soft)" data-i18n="fsma.ftl_opt_cheeses">Soft / Semi-Soft Cheeses</option>'
);
html = html.replace(
  '<option value="Shell Eggs (fresh chicken eggs for consumption)">Shell Eggs</option>',
  '<option value="Shell Eggs (fresh chicken eggs for consumption)" data-i18n="fsma.ftl_opt_eggs">Shell Eggs</option>'
);
html = html.replace(
  '<option value="Leafy Greens (spinach, romaine, arugula, kale)">Leafy Greens (spinach/romaine)</option>',
  '<option value="Leafy Greens (spinach, romaine, arugula, kale)" data-i18n="fsma.ftl_opt_greens">Leafy Greens (spinach/romaine)</option>'
);
html = html.replace(
  '<option value="Finfish, fresh and frozen (salmon, tuna, cod, halibut)">Finfish (fresh/frozen)</option>',
  '<option value="Finfish, fresh and frozen (salmon, tuna, cod, halibut)" data-i18n="fsma.ftl_opt_finfish">Finfish (fresh/frozen)</option>'
);
html = html.replace(
  '<option value="Cucumbers (fresh, unpickled)">Cucumbers</option>',
  '<option value="Cucumbers (fresh, unpickled)" data-i18n="fsma.ftl_opt_cucumbers">Cucumbers</option>'
);
html = html.replace(
  '<option value="Fresh Herbs (cilantro, basil, parsley, mint)">Fresh Herbs</option>',
  '<option value="Fresh Herbs (cilantro, basil, parsley, mint)" data-i18n="fsma.ftl_opt_herbs">Fresh Herbs</option>'
);
html = html.replace(
  '<option value="Tomatoes (roma, beefsteak, grape, cherry)">Tomatoes</option>',
  '<option value="Tomatoes (roma, beefsteak, grape, cherry)" data-i18n="fsma.ftl_opt_tomatoes">Tomatoes</option>'
);
html = html.replace(
  '<option value="Ready-to-Eat Deli Salads">Ready-to-Eat Deli Salads</option>',
  '<option value="Ready-to-Eat Deli Salads" data-i18n="fsma.ftl_opt_salads">Ready-to-Eat Deli Salads</option>'
);
html = html.replace(
  '<label>Quantity &amp; Unit</label>',
  '<label data-i18n="fsma.qty_label">Quantity &amp; Unit</label>'
);
html = html.replace(
  '<label>Facility GLN</label>',
  '<label data-i18n="fsma.gln_label">Facility GLN</label>'
);
html = html.replace(
  '<button class="btn btn-secondary btn-sm" id="btn-refresh-gps" style="white-space: nowrap; padding: 7px 12px;">📍 GPS</button>',
  '<button class="btn btn-secondary btn-sm" id="btn-refresh-gps" style="white-space: nowrap; padding: 7px 12px;" data-i18n="fsma.btn_gps">📍 GPS</button>'
);
html = html.replace(
  '<button class="btn btn-emerald" id="btn-commit-cte" data-i18n="btn.add_cte" style="width: 100%;">⚡ Commit CTE Record &amp; Chain Hash</button>',
  '<button class="btn btn-emerald" id="btn-commit-cte" data-i18n="fsma.btn_commit" style="width: 100%;">⚡ Commit CTE Record &amp; Chain Hash</button>'
);

html = html.replace(
  '<span style="font-size: 12px; font-weight: 700; color: var(--emerald);">Compliance Dossier Suite</span>',
  '<span style="font-size: 12px; font-weight: 700; color: var(--emerald);" data-i18n="fsma.dossier_title">Compliance Dossier Suite</span>'
);
html = html.replace(
  '<small style="display: block; font-size: 10px; color: var(--text-secondary);">SHA-256 Chain-of-Custody Cryptographic Ledger</small>',
  '<small style="display: block; font-size: 10px; color: var(--text-secondary);" data-i18n="fsma.dossier_sub">SHA-256 Chain-of-Custody Cryptographic Ledger</small>'
);
html = html.replace(
  '<button class="btn btn-secondary btn-sm" id="btn-sign-part11" style="padding: 4px 10px; font-size: 11px;">✍️ 21 CFR Part 11 Sign</button>',
  '<button class="btn btn-secondary btn-sm" id="btn-sign-part11" style="padding: 4px 10px; font-size: 11px;" data-i18n="fsma.btn_part11_sign">✍️ 21 CFR Part 11 Sign</button>'
);
html = html.replace(
  '<button class="btn btn-primary" id="btn-export-fda-csv">📊 FDA CSV</button>',
  '<button class="btn btn-primary" id="btn-export-fda-csv" data-i18n="fsma.btn_fda_csv">📊 FDA CSV</button>'
);
html = html.replace(
  '<button class="btn btn-emerald" id="btn-export-epcis-jsonld">🔗 EPCIS JSON-LD</button>',
  '<button class="btn btn-emerald" id="btn-export-epcis-jsonld" data-i18n="fsma.btn_epcis_jsonld">🔗 EPCIS JSON-LD</button>'
);
html = html.replace(
  '<button class="btn btn-secondary" id="btn-export-epcis-xml">📄 EPCIS XML</button>',
  '<button class="btn btn-secondary" id="btn-export-epcis-xml" data-i18n="fsma.btn_epcis_xml">📄 EPCIS XML</button>'
);
html = html.replace(
  '<button class="btn btn-secondary" id="btn-share-latest-dossier">📤 Share Dossier</button>',
  '<button class="btn btn-secondary" id="btn-share-latest-dossier" data-i18n="fsma.btn_share_dossier">📤 Share Dossier</button>'
);
html = html.replace(
  '<h4 style="margin-bottom: 12px; font-size: 14px;">Archived Chain-of-Custody Records</h4>',
  '<h4 style="margin-bottom: 12px; font-size: 14px;" data-i18n="fsma.archived_records_title">Archived Chain-of-Custody Records</h4>'
);

// FSMA Table Headers
html = html.replace('<th>Event ID</th>', '<th data-i18n="fsma.th_event_id">Event ID</th>');
html = html.replace('<th>Type</th>', '<th data-i18n="fsma.th_type">Type</th>');
html = html.replace('<th>TLC Lot</th>', '<th data-i18n="fsma.th_tlc_lot">TLC Lot</th>');
html = html.replace('<th>Parent TLC</th>', '<th data-i18n="fsma.th_parent_tlc">Parent TLC</th>');
html = html.replace('<th>GTIN</th>', '<th data-i18n="fsma.th_gtin">GTIN</th>');
html = html.replace('<th>Recorded Timestamp</th>', '<th data-i18n="fsma.th_timestamp">Recorded Timestamp</th>');
html = html.replace('<th>SHA-256 Hash</th>', '<th data-i18n="fsma.th_hash">SHA-256 Hash</th>');
html = html.replace('<th>Part 11 Sig</th>', '<th data-i18n="fsma.th_part11">Part 11 Sig</th>');
html = html.replace('<th>Actions</th>', '<th data-i18n="fsma.th_actions">Actions</th>');

// 9. Tab 6 Prepress Export Center
html = html.replace(
  '<span class="badge badge-cyan">AIR-GAPPED WORKSTATION</span>',
  '<span class="badge badge-cyan" data-i18n="exports.badge">AIR-GAPPED WORKSTATION</span>'
);
html = html.replace(
  '<span style="font-size: 12px; font-weight: 800; color: var(--cyan);">1-TAP MASTER PACKAGING BUNDLE</span>',
  '<span style="font-size: 12px; font-weight: 800; color: var(--cyan);" data-i18n="exports.bundle_title">1-TAP MASTER PACKAGING BUNDLE</span>'
);
html = html.replace(
  '<div style="font-size: 10.5px; color: var(--text-secondary);">Generates PDF/X-4 Plate, Die-Line SVG &amp; Verified Proof Sheet simultaneously</div>',
  '<div style="font-size: 10.5px; color: var(--text-secondary);" data-i18n="exports.bundle_sub">Generates PDF/X-4 Plate, Die-Line SVG &amp; Verified Proof Sheet simultaneously</div>'
);
html = html.replace(
  '<button class="btn btn-emerald" id="btn-export-master-package" style="font-weight: 700; padding: 8px 16px;">📦 1-Click Master Prepress Bundle</button>',
  '<button class="btn btn-emerald" id="btn-export-master-package" style="font-weight: 700; padding: 8px 16px;" data-i18n="exports.btn_master_bundle">📦 1-Click Master Prepress Bundle</button>'
);

html = html.replace(
  '<button type="button" class="segmented-item active" data-export-pane="pane-prepress">🏆 Prepress Plates</button>',
  '<button type="button" class="segmented-item active" data-export-pane="pane-prepress" data-i18n="exports.seg_prepress">🏆 Prepress Plates</button>'
);
html = html.replace(
  '<button type="button" class="segmented-item" data-export-pane="pane-zebra">🖨️ Zebra Thermal</button>',
  '<button type="button" class="segmented-item" data-export-pane="pane-zebra" data-i18n="exports.seg_zebra">🖨️ Zebra Thermal</button>'
);
html = html.replace(
  '<button type="button" class="segmented-item" data-export-pane="pane-batch">📦 Batch CSV</button>',
  '<button type="button" class="segmented-item" data-export-pane="pane-batch" data-i18n="exports.seg_batch">📦 Batch CSV</button>'
);

html = html.replace(
  '<span style="font-size: 13px; font-weight: 700; color: var(--cyan);">Prepress Vector Plates &amp; BWR Compensation</span>',
  '<span style="font-size: 13px; font-weight: 700; color: var(--cyan);" data-i18n="exports.bwr_title">Prepress Vector Plates &amp; BWR Compensation</span>'
);
html = html.replace(
  '<button class="btn btn-primary" id="btn-export-pdf-x4" data-i18n="btn.export_pdf">🏆 PDF/X-4 Master</button>',
  '<button class="btn btn-primary" id="btn-export-pdf-x4" data-i18n="exports.btn_pdf_x4">🏆 PDF/X-4 Master</button>'
);
html = html.replace(
  '<button class="btn btn-primary" id="btn-export-cmyk-eps" data-i18n="btn.export_eps">📄 CMYK EPS</button>',
  '<button class="btn btn-primary" id="btn-export-cmyk-eps" data-i18n="exports.btn_cmyk_eps">📄 CMYK EPS</button>'
);
html = html.replace(
  '<button class="btn btn-secondary" id="btn-export-pantone-eps">🎨 Pantone Spot</button>',
  '<button class="btn btn-secondary" id="btn-export-pantone-eps" data-i18n="exports.btn_pantone_eps">🎨 Pantone Spot</button>'
);
html = html.replace(
  '<button class="btn btn-emerald" id="btn-export-layered-pdf">📑 Layered PDF</button>',
  '<button class="btn btn-emerald" id="btn-export-layered-pdf" data-i18n="exports.btn_layered_pdf">📑 Layered PDF</button>'
);
html = html.replace(
  '<button class="btn btn-secondary" id="btn-export-pdf-600">📐 600 DPI</button>',
  '<button class="btn btn-secondary" id="btn-export-pdf-600" data-i18n="exports.btn_pdf_600">📐 600 DPI</button>'
);
html = html.replace(
  '<button class="btn btn-secondary" id="btn-export-pdf-1200">📐 1200 DPI</button>',
  '<button class="btn btn-secondary" id="btn-export-pdf-1200" data-i18n="exports.btn_pdf_1200">📐 1200 DPI</button>'
);
html = html.replace(
  '<button class="btn btn-secondary" id="btn-export-combined-svg">📐 Die-Line SVG</button>',
  '<button class="btn btn-secondary" id="btn-export-combined-svg" data-i18n="exports.btn_dieline_svg">📐 Die-Line SVG</button>'
);
html = html.replace(
  '<button class="btn btn-secondary" id="btn-print-labels">🖨️ Proof Sheet</button>',
  '<button class="btn btn-secondary" id="btn-print-labels" data-i18n="exports.btn_proof_sheet">🖨️ Proof Sheet</button>'
);

// Pane 2: Zebra
html = html.replace(
  '<span>Zebra ZPL II Thermal Printer &amp; Socket Spooler</span>',
  '<span data-i18n="exports.zpl_title">Zebra ZPL II Thermal Printer &amp; Socket Spooler</span>'
);
html = html.replace(
  '<span id="zebra-status-pill" class="badge badge-emerald" style="font-size: 10px;">STATUS: READY</span>',
  '<span id="zebra-status-pill" class="badge badge-emerald" style="font-size: 10px;" data-i18n="exports.zpl_status_ready">STATUS: READY</span>'
);
html = html.replace(
  '<span class="badge badge-cyan">RAW PORT 9100</span>',
  '<span class="badge badge-cyan" data-i18n="exports.zpl_port_badge">RAW PORT 9100</span>'
);
html = html.replace(
  '<option value="203" selected>203 DPI (8 dots/mm — Shipping)</option>',
  '<option value="203" selected data-i18n="exports.zpl_opt_203">203 DPI (8 dots/mm — Shipping)</option>'
);
html = html.replace(
  '<option value="300">300 DPI (12 dots/mm — Packaging)</option>',
  '<option value="300" data-i18n="exports.zpl_opt_300">300 DPI (12 dots/mm — Packaging)</option>'
);
html = html.replace(
  '<option value="600">600 DPI (24 dots/mm — Pharma)</option>',
  '<option value="600" data-i18n="exports.zpl_opt_600">600 DPI (24 dots/mm — Pharma)</option>'
);
html = html.replace(
  '<button class="btn btn-primary btn-sm" id="btn-generate-zpl" style="padding: 6px 12px; white-space: nowrap;">⚡ Generate ZPL</button>',
  '<button class="btn btn-primary btn-sm" id="btn-generate-zpl" style="padding: 6px 12px; white-space: nowrap;" data-i18n="exports.btn_generate_zpl">⚡ Generate ZPL</button>'
);
html = html.replace(
  '<button class="btn btn-emerald btn-sm" id="btn-copy-zpl">📋 Copy ZPL</button>',
  '<button class="btn btn-emerald btn-sm" id="btn-copy-zpl" data-i18n="exports.btn_copy_zpl">📋 Copy ZPL</button>'
);
html = html.replace(
  '<button class="btn btn-secondary btn-sm" id="btn-download-zpl">💾 Save .zpl</button>',
  '<button class="btn btn-secondary btn-sm" id="btn-download-zpl" data-i18n="exports.btn_download_zpl">💾 Save .zpl</button>'
);
html = html.replace(
  '<input type="text" id="tcp-printer-ip" class="mono-input" value="192.168.1.100" placeholder="Printer IP" style="font-size: 11px; padding: 6px 8px;">',
  '<input type="text" id="tcp-printer-ip" class="mono-input" value="192.168.1.100" placeholder="Printer IP" style="font-size: 11px; padding: 6px 8px;" data-i18n-placeholder="exports.placeholder_printer_ip">'
);
html = html.replace(
  '<button class="btn btn-primary btn-sm" id="btn-send-tcp-socket" style="white-space: nowrap; padding: 6px 12px;">🖨️ Send TCP</button>',
  '<button class="btn btn-primary btn-sm" id="btn-send-tcp-socket" style="white-space: nowrap; padding: 6px 12px;" data-i18n="exports.btn_send_tcp">🖨️ Send TCP</button>'
);
html = html.replace(
  '<button class="btn btn-secondary btn-sm" id="btn-poll-zebra-status" data-i18n="btn.poll_status" style="white-space: nowrap; padding: 6px 12px;">📊 Poll ~HS</button>',
  '<button class="btn btn-secondary btn-sm" id="btn-poll-zebra-status" data-i18n="exports.btn_poll_status" style="white-space: nowrap; padding: 6px 12px;">📊 Poll ~HS</button>'
);
html = html.replace(
  '<input type="text" id="bt-printer-mac" class="mono-input" value="00:11:22:33:AA:BB" placeholder="Bluetooth MAC (e.g. Zebra ZQ)" style="font-size: 11px; padding: 6px 8px;">',
  '<input type="text" id="bt-printer-mac" class="mono-input" value="00:11:22:33:AA:BB" placeholder="Bluetooth MAC (e.g. Zebra ZQ)" style="font-size: 11px; padding: 6px 8px;" data-i18n-placeholder="exports.placeholder_bt_mac">'
);
html = html.replace(
  '<button class="btn btn-secondary btn-sm" id="btn-send-bt-spp" style="white-space: nowrap; padding: 6px 12px;">📱 Send BT SPP</button>',
  '<button class="btn btn-secondary btn-sm" id="btn-send-bt-spp" style="white-space: nowrap; padding: 6px 12px;" data-i18n="exports.btn_send_bt">📱 Send BT SPP</button>'
);
html = html.replace(
  '<button class="btn btn-emerald btn-sm" id="btn-scan-ble-printers" data-i18n="btn.scan_ble" style="white-space: nowrap; padding: 6px 12px;">🔍 Scan BLE</button>',
  '<button class="btn btn-emerald btn-sm" id="btn-scan-ble-printers" data-i18n="exports.btn_scan_ble" style="white-space: nowrap; padding: 6px 12px;">🔍 Scan BLE</button>'
);
html = html.replace(
  '<button class="btn btn-primary btn-sm" id="btn-send-ble-gatt" style="white-space: nowrap; padding: 6px 12px; display: none;">⚡ Send BLE</button>',
  '<button class="btn btn-primary btn-sm" id="btn-send-ble-gatt" style="white-space: nowrap; padding: 6px 12px; display: none;" data-i18n="exports.btn_send_ble">⚡ Send BLE</button>'
);

// Pane 3: Batch CSV
html = html.replace(
  '<span>Batch CSV Multi-SKU Synthesis</span>',
  '<span data-i18n="exports.batch_title">Batch CSV Multi-SKU Synthesis</span>'
);
html = html.replace(
  '<span class="badge badge-emerald">ZIP ARCHIVE</span>',
  '<span class="badge badge-emerald" data-i18n="exports.batch_badge">ZIP ARCHIVE</span>'
);
html = html.replace(
  '<button class="btn btn-emerald btn-sm" id="btn-run-batch-zip">📦 Generate ZIP</button>',
  '<button class="btn btn-emerald btn-sm" id="btn-run-batch-zip" data-i18n="exports.btn_generate_zip">📦 Generate ZIP</button>'
);
html = html.replace(
  '<button class="btn btn-secondary btn-sm" id="btn-batch-proof-sheet">📑 Proof Sheet</button>',
  '<button class="btn btn-secondary btn-sm" id="btn-batch-proof-sheet" data-i18n="exports.btn_batch_proof">📑 Proof Sheet</button>'
);
html = html.replace(
  '<button class="btn btn-secondary btn-sm" id="btn-export-all-rules">🗄️ Routing Bundle</button>',
  '<button class="btn btn-secondary btn-sm" id="btn-export-all-rules" data-i18n="exports.btn_routing_bundle">🗄️ Routing Bundle</button>'
);

// 10. Modals
// Camera rationale
html = html.replace(
  '<span class="badge badge-cyan" style="font-size: 10px; font-weight: bold;">HARDWARE SENSOR ACCESS</span>',
  '<span class="badge badge-cyan" style="font-size: 10px; font-weight: bold;" data-i18n="modal_camera.badge">HARDWARE SENSOR ACCESS</span>'
);
html = html.replace(
  '<h3 style="margin: 4px 0 0; font-size: 17px; font-weight: 800;">Camera Permission Rationale</h3>',
  '<h3 style="margin: 4px 0 0; font-size: 17px; font-weight: 800;" data-i18n="modal_camera.title">Camera Permission Rationale</h3>'
);
html = html.replace(
  '<p style="font-size: 13px; color: var(--text-primary); line-height: 1.6; margin-bottom: 12px;">\n        DualMark Studio requests access to your device camera strictly for <strong>real-time optical barcode scanning</strong> and <strong>perspective dewarping of packaging bills of lading</strong>.\n      </p>',
  '<p style="font-size: 13px; color: var(--text-primary); line-height: 1.6; margin-bottom: 12px;" data-i18n="modal_camera.body">DualMark Studio requests access to your device camera strictly for real-time optical barcode scanning and perspective dewarping of packaging bills of lading.</p>'
);
html = html.replace(
  '<div style="background: var(--bg-secondary); border-radius: 8px; padding: 12px; margin-bottom: 16px; font-size: 12px; color: var(--text-secondary); line-height: 1.5;">\n        🔒 <strong>Zero Data Collection Policy:</strong> Camera video frames are analyzed entirely in volatile RAM on-device and are never recorded, saved, uploaded, or transmitted across any network.\n      </div>',
  '<div style="background: var(--bg-secondary); border-radius: 8px; padding: 12px; margin-bottom: 16px; font-size: 12px; color: var(--text-secondary); line-height: 1.5;" data-i18n="modal_camera.policy">🔒 Zero Data Collection Policy: Camera video frames are analyzed entirely in volatile RAM on-device and are never recorded, saved, uploaded, or transmitted across any network.</div>'
);
html = html.replace(
  '<button class="btn btn-primary" id="btn-camera-grant">Grant Camera Permission</button>',
  '<button class="btn btn-primary" id="btn-camera-grant" data-i18n="modal_camera.btn_grant">Grant Camera Permission</button>'
);
html = html.replace(
  '<button class="btn btn-secondary" id="btn-camera-fallback">Import Image File Instead (Offline Fallback)</button>',
  '<button class="btn btn-secondary" id="btn-camera-fallback" data-i18n="modal_camera.btn_fallback">Import Image File Instead (Offline Fallback)</button>'
);
html = html.replace(
  '<button class="btn btn-outline" id="btn-camera-dismiss">Cancel</button>',
  '<button class="btn btn-outline" id="btn-camera-dismiss" data-i18n="modal_camera.btn_cancel">Cancel</button>'
);

// Legal modal
html = html.replace(
  '<span class="badge badge-cyan" style="font-size: 10px; font-weight: bold;">STANDARDS &amp; REGULATORY NOTICE</span>',
  '<span class="badge badge-cyan" style="font-size: 10px; font-weight: bold;" data-i18n="modal_legal.badge">STANDARDS &amp; REGULATORY NOTICE</span>'
);
html = html.replace(
  '<h3 style="margin: 4px 0 0; font-size: 17px; font-weight: 800;">Legal &amp; Compliance Disclaimers</h3>',
  '<h3 style="margin: 4px 0 0; font-size: 17px; font-weight: 800;" data-i18n="modal_legal.title">Legal &amp; Compliance Disclaimers</h3>'
);
html = html.replace(
  'GS1, UPC, EAN, GS1 Digital Link, and DataBar are registered trademarks of GS1 AISBL. DualMark Studio is an independent prepress engineering tool and is not endorsed by, sponsored by, or affiliated with GS1 AISBL.',
  '<span data-i18n="modal_legal.sec1">GS1, UPC, EAN, GS1 Digital Link, and DataBar are registered trademarks of GS1 AISBL. DualMark Studio is an independent prepress engineering tool and is not endorsed by, sponsored by, or affiliated with GS1 AISBL.</span>'
);
html = html.replace(
  'DualMark Studio provides client-side SHA-256 cryptographic audit trails for FSMA Rule 204 CTE/KDE event records. Users remain solely responsible for facility-level validation and operational controls required under 21 CFR Part 11.',
  '<span data-i18n="modal_legal.sec2">DualMark Studio provides client-side SHA-256 cryptographic audit trails for FSMA Rule 204 CTE/KDE event records. Users remain solely responsible for facility-level validation and operational controls required under 21 CFR Part 11.</span>'
);
html = html.replace(
  'The 50mm Die-Line clearance inspector is a prepress design layout aid. It does not replace ISO/IEC 15416 (1D) or ISO/IEC 15415 (2D) calibrated optical barcode verifiers.',
  '<span data-i18n="modal_legal.sec3">The 50mm Die-Line clearance inspector is a prepress design layout aid. It does not replace ISO/IEC 15416 (1D) or ISO/IEC 15415 (2D) calibrated optical barcode verifiers.</span>'
);
html = html.replace(
  '<a href="legal/privacy_policy.html" target="_blank" class="btn btn-secondary btn-sm" style="text-decoration:none;">Privacy Policy</a>',
  '<a href="legal/privacy_policy.html" target="_blank" class="btn btn-secondary btn-sm" style="text-decoration:none;" data-i18n="modal_legal.link_privacy">Privacy Policy</a>'
);
html = html.replace(
  '<a href="legal/terms_of_service.html" target="_blank" class="btn btn-secondary btn-sm" style="text-decoration:none;">Terms of Service</a>',
  '<a href="legal/terms_of_service.html" target="_blank" class="btn btn-secondary btn-sm" style="text-decoration:none;" data-i18n="modal_legal.link_terms">Terms of Service</a>'
);
html = html.replace(
  '<a href="legal/data_deletion.html" target="_blank" class="btn btn-secondary btn-sm" style="text-decoration:none;">Data Deletion</a>',
  '<a href="legal/data_deletion.html" target="_blank" class="btn btn-secondary btn-sm" style="text-decoration:none;" data-i18n="modal_legal.link_deletion">Data Deletion</a>'
);
html = html.replace(
  '<button class="btn btn-primary btn-sm" id="btn-legal-confirm">Acknowledge</button>',
  '<button class="btn btn-primary btn-sm" id="btn-legal-confirm" data-i18n="modal_legal.btn_confirm">Acknowledge</button>'
);

fs.writeFileSync('web_app/index.html', html, 'utf8');
console.log('Successfully updated web_app/index.html with data-i18n tags and responsive form rows!');

// Now update style.css to support .form-row-2col and bottom-nav ellipsis
let css = fs.readFileSync('web_app/css/style.css', 'utf8');

if (!css.includes('.form-row-2col')) {
  const responsiveFormRules = `
/* Responsive Two-Column Form Row (Prevents Select Dropdown Truncation on Mobile) */
.form-row-2col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 12px;
}

@media (max-width: 580px) {
  .form-row-2col {
    grid-template-columns: 1fr;
    gap: 10px;
  }
}
`;
  css += '\n' + responsiveFormRules;
}

// Ensure bottom nav labels don't clip / overflow in multi-lingual modes
css = css.replace(
  /\.bottom-nav-label\s*\{[^}]*\}/,
  `.bottom-nav-label {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.01em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  display: block;
}`
);

fs.writeFileSync('web_app/css/style.css', css, 'utf8');
console.log('Successfully updated web_app/css/style.css with responsive .form-row-2col and nav label safety!');
