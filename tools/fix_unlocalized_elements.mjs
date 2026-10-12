import fs from 'fs';

// 1. Add missing keys to build_all_translations.mjs
const NEW_KEYS = {
  "tour.step_counter": {
    "en-US": "Step {current} of {total}",
    "hi-IN": "चरण {current} / {total}",
    "es-ES": "Paso {current} de {total}",
    "de-DE": "Schritt {current} von {total}",
    "fr-FR": "Étape {current} sur {total}",
    "ja-JP": "ステップ {current} / {total}",
    "zh-CN": "第 {current} 步，共 {total} 步"
  },
  "synth.prefix_default": {
    "en-US": "GS1 Region: United States & Canada (GS1 US)",
    "hi-IN": "GS1 क्षेत्र: संयुक्त राज्य अमेरिका एवं कनाडा (GS1 US)",
    "es-ES": "Región GS1: Estados Unidos y Canadá (GS1 US)",
    "de-DE": "GS1-Region: Vereinigte Staaten & Kanada (GS1 US)",
    "fr-FR": "Région GS1 : États-Unis & Canada (GS1 US)",
    "ja-JP": "GS1管轄地域: 米国およびカナダ (GS1 US)",
    "zh-CN": "GS1 注册归属区: 美国与加拿大 (GS1 US)"
  },
  "synth.synced_payload": {
    "en-US": "Synchronized with 1D Payload",
    "hi-IN": "1D पेलोड के साथ सिंक्रनाइज़",
    "es-ES": "Sincronizado con carga útil 1D",
    "de-DE": "Synchronisiert mit 1D-Nutzdaten",
    "fr-FR": "Synchronisé avec les données 1D",
    "ja-JP": "1Dペイロードと完全同期",
    "zh-CN": "已与一维码有效负载保持同步"
  },
  "scanner.awaiting_acquisition": {
    "en-US": "Awaiting optical acquisition...",
    "hi-IN": "ऑप्टिकल अधिग्रहण की प्रतीक्षा में...",
    "es-ES": "Esperando adquisición óptica...",
    "de-DE": "Warte auf optische Erfassung...",
    "fr-FR": "En attente d'acquisition optique...",
    "ja-JP": "光学校正およびキャプチャ待機中...",
    "zh-CN": "等待光学对焦与条码读取..."
  },
  "scanner.cyl_flattened": {
    "en-US": "✓ Cylindrical curvature flattened into orthogonal plane.",
    "hi-IN": "✓ बेलनाकार वक्रता को ऑर्थोगोनल समतल में चपटा किया गया।",
    "es-ES": "✓ Curvatura cilíndrica aplanada en el plano ortogonal.",
    "de-DE": "✓ Zylindrische Krümmung in orthogonale Ebene entzerrt.",
    "fr-FR": "✓ Courbure cylindrique aplatie dans le plan orthogonal.",
    "ja-JP": "✓ 円柱曲面を正射影平面へ高精度展開完了。",
    "zh-CN": "✓ 圆柱体曲面已成功展平至正交基准平面。"
  }
};

let buildScript = fs.readFileSync('tools/build_all_translations.mjs', 'utf8');
const targetStr = '};\n\n// Check parity';
const insertPoint = buildScript.indexOf(targetStr);
if (insertPoint !== -1) {
  let entries = '';
  for (const [key, obj] of Object.entries(NEW_KEYS)) {
    entries += `  ${JSON.stringify(key)}: ${JSON.stringify(obj, null, 4)},\n`;
  }
  buildScript = buildScript.slice(0, insertPoint) + entries + buildScript.slice(insertPoint);
  fs.writeFileSync('tools/build_all_translations.mjs', buildScript, 'utf8');
  console.log('Appended 5 new keys to build_all_translations.mjs!');
}

// 2. Update index.html
let html = fs.readFileSync('web_app/index.html', 'utf8');

html = html.replace(
  '<small id="synth-1d-prefix-info" style="color: var(--text-secondary); font-size: 10px; margin-top: 3px; display: block;">GS1 Region: United States &amp; Canada (GS1 US)</small>',
  '<small id="synth-1d-prefix-info" style="color: var(--text-secondary); font-size: 10px; margin-top: 3px; display: block;" data-i18n="synth.prefix_default">GS1 Region: United States &amp; Canada (GS1 US)</small>'
);

html = html.replace(
  '<small style="color: var(--text-secondary); font-size: 10px; margin-top: 3px; display: block;">Synchronized with 1D Payload</small>',
  '<small style="color: var(--text-secondary); font-size: 10px; margin-top: 3px; display: block;" data-i18n="synth.synced_payload">Synchronized with 1D Payload</small>'
);

html = html.replace(
  '<span>COMPLIANT (≥ 50.0 mm)</span>',
  '<span data-i18n="clearance.status_compliant_head">COMPLIANT (≥ 50.0 mm)</span>'
);

html = html.replace(
  '<div class="status-detail" id="clearance-status-sub" style="font-size: 11px;">\n                  Edge-to-edge optical clearance satisfies Sunrise 2027 pass rate.\n                </div>',
  '<div class="status-detail" id="clearance-status-sub" style="font-size: 11px;" data-i18n="clearance.status_compliant_sub">Edge-to-edge optical clearance satisfies Sunrise 2027 pass rate.</div>'
);

html = html.replace(
  '<div class="code-block" id="scan-decoded-result" style="margin: 4px 0 0; padding: 8px 10px; font-size: 11px;">Awaiting optical acquisition...</div>',
  '<div class="code-block" id="scan-decoded-result" style="margin: 4px 0 0; padding: 8px 10px; font-size: 11px;" data-i18n="scanner.awaiting_acquisition">Awaiting optical acquisition...</div>'
);

html = html.replace(
  '<div style="font-size: 10px; color: var(--emerald); margin-top: 4px;">✓ Cylindrical curvature flattened into orthogonal plane.</div>',
  '<div style="font-size: 10px; color: var(--emerald); margin-top: 4px;" data-i18n="scanner.cyl_flattened">✓ Cylindrical curvature flattened into orthogonal plane.</div>'
);

html = html.replace(
  '<div style="font-size: 10.5px; color: var(--text-secondary);">Generates PDF/X-4 Plate, Die-Line SVG & Verified Proof Sheet simultaneously</div>',
  '<div style="font-size: 10.5px; color: var(--text-secondary);" data-i18n="exports.bundle_sub">Generates PDF/X-4 Plate, Die-Line SVG &amp; Verified Proof Sheet simultaneously</div>'
);

html = html.replace(
  '<div class="code-block" id="zpl-output-preview" style="max-height: 90px; overflow-y: auto; margin: 8px 0; font-size: 10.5px; padding: 8px;">Click "Generate ZPL" to synthesize printer code...</div>',
  '<div class="code-block" id="zpl-output-preview" style="max-height: 90px; overflow-y: auto; margin: 8px 0; font-size: 10.5px; padding: 8px;" data-i18n="exports.zpl_placeholder">Click "Generate ZPL" to synthesize printer code...</div>'
);

html = html.replace(
  '<strong style="color: var(--text-primary);">1. GS1 Trademark &amp; Standard Non-Affiliation</strong>',
  '<strong style="color: var(--text-primary);" data-i18n="modal_legal.item1_title">1. GS1 Trademark &amp; Standard Non-Affiliation</strong>'
);

html = html.replace(
  '<strong style="color: var(--text-primary);">2. FDA 21 CFR Part 11 Electronic Records Disclosure</strong>',
  '<strong style="color: var(--text-primary);" data-i18n="modal_legal.item2_title">2. FDA 21 CFR Part 11 Electronic Records Disclosure</strong>'
);

html = html.replace(
  '<strong style="color: var(--text-primary);">3. Optical Verification Limitation Notice</strong>',
  '<strong style="color: var(--text-primary);" data-i18n="modal_legal.item3_title">3. Optical Verification Limitation Notice</strong>'
);

fs.writeFileSync('web_app/index.html', html, 'utf8');
console.log('Updated index.html with new data-i18n attributes!');

// 3. Update onboarding_tour.js
let tour = fs.readFileSync('web_app/js/onboarding_tour.js', 'utf8');
tour = tour.replaceAll('contentKey: \'tour.step1_desc\'', 'contentKey: \'tour.step1_content\'');
tour = tour.replaceAll('contentKey: \'tour.step2_desc\'', 'contentKey: \'tour.step2_content\'');
tour = tour.replaceAll('contentKey: \'tour.step3_desc\'', 'contentKey: \'tour.step3_content\'');
tour = tour.replaceAll('contentKey: \'tour.step4_desc\'', 'contentKey: \'tour.step4_content\'');
tour = tour.replaceAll('contentKey: \'tour.step5_desc\'', 'contentKey: \'tour.step5_content\'');
tour = tour.replaceAll('contentKey: \'tour.step6_desc\'', 'contentKey: \'tour.step6_content\'');
tour = tour.replace('text-transform:uppercase; letter-spacing:1px;', 'letter-spacing:1px;');

fs.writeFileSync('web_app/js/onboarding_tour.js', tour, 'utf8');
console.log('Updated onboarding_tour.js with correct contentKey and case handling!');
