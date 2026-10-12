import fs from 'fs';

// 1. First, update index.html to use the existing canonical keys from build_all_translations.mjs
let html = fs.readFileSync('web_app/index.html', 'utf8');

const keyReplacements = {
  'data-i18n="synth.btn_verify"': 'data-i18n="synth.gepir_btn_verify"',
  'data-i18n="synth.cal_label"': 'data-i18n="synth.calendar_label"',
  'data-i18n-placeholder="synth.gepir_placeholder"': 'data-i18n-placeholder="synth.gepir_input_placeholder"',
  'data-i18n="clearance.btn_iso_grade"': 'data-i18n="clearance.btn_run_iso"',
  'data-i18n="clearance.iso_badge"': 'data-i18n="clearance.iso_calibrated_badge"',
  'data-i18n="clearance.btn_pdf_cert"': 'data-i18n="clearance.btn_iso_cert_pdf"',
  'data-i18n="resolver.badge"': 'data-i18n="resolver.badge_edge"',
  'data-i18n="scanner.state_offline"': 'data-i18n="scanner.badge_offline"',
  'data-i18n="scanner.btn_light"': 'data-i18n="scanner.btn_torch"',
  'data-i18n="scanner.quick_cte_badge"': 'data-i18n="scanner.parsed_badge"',
  'data-i18n="scanner.btn_log_cte"': 'data-i18n="scanner.btn_quick_log"',
  'data-i18n="scanner.surface_title"': 'data-i18n="scanner.surface_studio_title"',
  'data-i18n="scanner.surface_badge"': 'data-i18n="scanner.surface_studio_badge"',
  'data-i18n="fsma.badge"': 'data-i18n="fsma.badge_cfr"',
  'data-i18n="fsma.opt_transform"': 'data-i18n="fsma.opt_transformation"',
  'data-i18n="fsma.ftl_opt_nut_butters"': 'data-i18n="fsma.ftl_nut_butters"',
  'data-i18n="fsma.ftl_opt_cheeses"': 'data-i18n="fsma.ftl_cheeses"',
  'data-i18n="fsma.ftl_opt_eggs"': 'data-i18n="fsma.ftl_eggs"',
  'data-i18n="fsma.ftl_opt_greens"': 'data-i18n="fsma.ftl_greens"',
  'data-i18n="fsma.ftl_opt_finfish"': 'data-i18n="fsma.ftl_finfish"',
  'data-i18n="fsma.ftl_opt_cucumbers"': 'data-i18n="fsma.ftl_cucumbers"',
  'data-i18n="fsma.ftl_opt_herbs"': 'data-i18n="fsma.ftl_herbs"',
  'data-i18n="fsma.ftl_opt_tomatoes"': 'data-i18n="fsma.ftl_tomatoes"',
  'data-i18n="fsma.ftl_opt_salads"': 'data-i18n="fsma.ftl_deli_salads"',
  'data-i18n="fsma.btn_part11_sign"': 'data-i18n="fsma.btn_part11"',
  'data-i18n="fsma.btn_fda_csv"': 'data-i18n="fsma.btn_csv"',
  'data-i18n="fsma.btn_epcis_jsonld"': 'data-i18n="fsma.btn_jsonld"',
  'data-i18n="fsma.btn_epcis_xml"': 'data-i18n="fsma.btn_xml"',
  'data-i18n="fsma.btn_share_dossier"': 'data-i18n="fsma.btn_share"',
  'data-i18n="exports.badge"': 'data-i18n="exports.badge_airgap"',
  'data-i18n="exports.bundle_title"': 'data-i18n="exports.bundle_headline"',
  'data-i18n="exports.btn_pantone_eps"': 'data-i18n="exports.btn_pantone"',
  'data-i18n="exports.zpl_title"': 'data-i18n="exports.zebra_card_title"',
  'data-i18n="exports.zpl_status_ready"': 'data-i18n="exports.zebra_status_ready"',
  'data-i18n="exports.zpl_opt_203"': 'data-i18n="exports.dpi_203"',
  'data-i18n="exports.zpl_opt_300"': 'data-i18n="exports.dpi_300"',
  'data-i18n="exports.zpl_opt_600"': 'data-i18n="exports.dpi_600"',
  'data-i18n="exports.btn_download_zpl"': 'data-i18n="exports.btn_save_zpl"',
  'data-i18n-placeholder="exports.placeholder_printer_ip"': 'data-i18n-placeholder="exports.tcp_ip_placeholder"',
  'data-i18n="exports.btn_poll_status"': 'data-i18n="exports.btn_poll_hs"',
  'data-i18n-placeholder="exports.placeholder_bt_mac"': 'data-i18n-placeholder="exports.bt_mac_placeholder"',
  'data-i18n="exports.btn_send_bt"': 'data-i18n="exports.btn_send_spp"',
  'data-i18n="exports.batch_badge"': 'data-i18n="exports.batch_badge_zip"',
  'data-i18n="exports.btn_generate_zip"': 'data-i18n="exports.btn_batch_zip"',
  'data-i18n="exports.btn_routing_bundle"': 'data-i18n="exports.btn_batch_routing"',
  'data-i18n="modal_camera.body"': 'data-i18n="modal_camera.desc"',
  'data-i18n="modal_camera.policy"': 'data-i18n="modal_camera.zero_data"',
  'data-i18n="modal_legal.link_privacy"': 'data-i18n="modal_legal.btn_privacy"',
  'data-i18n="modal_legal.link_terms"': 'data-i18n="modal_legal.btn_terms"',
  'data-i18n="modal_legal.link_deletion"': 'data-i18n="modal_legal.btn_deletion"'
};

for (const [from, to] of Object.entries(keyReplacements)) {
  html = html.replaceAll(from, to);
}

fs.writeFileSync('web_app/index.html', html, 'utf8');
console.log('Synchronized index.html with canonical keys.');

// 2. Now add the new additional keys to build_all_translations.mjs
const ADDITIONAL_KEYS = {
  "synth.domain_placeholder": {
    "en-US": "https://id.brand.com",
    "hi-IN": "https://id.brand.com",
    "es-ES": "https://id.brand.com",
    "de-DE": "https://id.brand.com",
    "fr-FR": "https://id.brand.com",
    "ja-JP": "https://id.brand.com",
    "zh-CN": "https://id.brand.com"
  },
  "synth.exp_placeholder": {
    "en-US": "YYMMDD",
    "hi-IN": "YYMMDD (वर्ष माह दिन)",
    "es-ES": "AAMMDD",
    "de-DE": "JJMMTT",
    "fr-FR": "AAMMJJ",
    "ja-JP": "YYMMDD",
    "zh-CN": "年月日 (YYMMDD)"
  },
  "synth.uri_label": {
    "en-US": "GS1 Digital Link URI",
    "hi-IN": "GS1 डिजिटल लिंक यूआरआई (URI)",
    "es-ES": "URI de GS1 Digital Link",
    "de-DE": "GS1 Digital Link URI",
    "fr-FR": "URI GS1 Digital Link",
    "ja-JP": "GS1デジタルリンクURI",
    "zh-CN": "GS1 数字链接 URI"
  },
  "clearance.preset_carton": {
    "en-US": "Folding Carton (220 x 160 mm)",
    "hi-IN": "फोल्डिंग कार्टन (220 x 160 मिमी)",
    "es-ES": "Caja Plegadiza (220 x 160 mm)",
    "de-DE": "Faltschachtel (220 x 160 mm)",
    "fr-FR": "Boîte Pliante (220 x 160 mm)",
    "ja-JP": "折りたたみカートン (220 x 160 mm)",
    "zh-CN": "折叠纸盒 (220 x 160 毫米)"
  },
  "clearance.btn_zoom_out": {
    "en-US": "Zoom Out",
    "hi-IN": "ज़ूम आउट",
    "es-ES": "Alejar",
    "de-DE": "Verkleinern",
    "fr-FR": "Zoom arrière",
    "ja-JP": "縮小",
    "zh-CN": "缩小"
  },
  "clearance.btn_zoom_reset": {
    "en-US": "Reset Zoom",
    "hi-IN": "ज़ूम रीसेट करें",
    "es-ES": "Restablecer Zoom",
    "de-DE": "Zoom zurücksetzen",
    "fr-FR": "Réinitialiser le zoom",
    "ja-JP": "ズームリセット",
    "zh-CN": "重置缩放"
  },
  "clearance.btn_zoom_in": {
    "en-US": "Zoom In",
    "hi-IN": "ज़ूम इन",
    "es-ES": "Acercar",
    "de-DE": "Vergrößern",
    "fr-FR": "Zoom avant",
    "ja-JP": "拡大",
    "zh-CN": "放大"
  },
  "clearance.surface_flat": {
    "en-US": "📄 Flat Carton",
    "hi-IN": "📄 सपाट कार्टन",
    "es-ES": "📄 Cartón Plano",
    "de-DE": "📄 Flacher Karton",
    "fr-FR": "📄 Carton Plat",
    "ja-JP": "📄 平面カートン",
    "zh-CN": "📄 平面纸盒"
  },
  "clearance.surface_cyl": {
    "en-US": "🥫 3D Cylinder / Can",
    "hi-IN": "🥫 3D सिलेंडर / कैन",
    "es-ES": "🥫 Cilindro 3D / Lata",
    "de-DE": "🥫 3D-Zylinder / Dose",
    "fr-FR": "🥫 Cylindre 3D / Canette",
    "ja-JP": "🥫 3D円柱 / 缶",
    "zh-CN": "🥫 3D圆柱体 / 易拉罐"
  },
  "resolver.placeholder_gtin": {
    "en-US": "Test GTIN",
    "hi-IN": "परीक्षण जीटीआईएन (GTIN)",
    "es-ES": "GTIN de prueba",
    "de-DE": "Test-GTIN",
    "fr-FR": "GTIN de test",
    "ja-JP": "テストGTIN",
    "zh-CN": "测试 GTIN"
  },
  "scanner.continuous_tracking": {
    "en-US": "Continuous 50mm Tracking",
    "hi-IN": "निरंतर 50 मिमी ट्रैकिंग",
    "es-ES": "Seguimiento Continuo de 50mm",
    "de-DE": "Kontinuierliches 50mm-Tracking",
    "fr-FR": "Suivi Continu 50mm",
    "ja-JP": "連続50mmトラッキング",
    "zh-CN": "连续 50mm 距离跟踪"
  },
  "scanner.btn_calibrate_tooltip": {
    "en-US": "Calibrate Optical Scale with 20mm Coupon or ID-1 Card",
    "hi-IN": "20 मिमी कूपन या आईडी-1 कार्ड से ऑप्टिकल स्केल कैलिब्रेट करें",
    "es-ES": "Calibrar escala óptica con cupón de 20 mm o tarjeta ID-1",
    "de-DE": "Optischen Maßstab mit 20mm-Coupon oder ID-1-Karte kalibrieren",
    "fr-FR": "Calibrer l'échelle optique avec coupon de 20 mm ou carte ID-1",
    "ja-JP": "20mmクーポンまたはID-1カードで光学スケールを校正",
    "zh-CN": "使用 20mm 标定块或 ID-1 标准卡校准光学比例尺"
  },
  "scanner.mode_doc": {
    "en-US": "📄 Document Flatten",
    "hi-IN": "📄 दस्तावेज़ समतलीकरण",
    "es-ES": "📄 Aplanar Documento",
    "de-DE": "📄 Dokument begradigen",
    "fr-FR": "📄 Aplatir Document",
    "ja-JP": "📄 文書歪み補正",
    "zh-CN": "📄 单据透视展平"
  },
  "scanner.mode_cyl": {
    "en-US": "🥫 Cylindrical Unroller",
    "hi-IN": "🥫 बेलनाकार अनरोलर",
    "es-ES": "🥫 Desenrollador Cilíndrico",
    "de-DE": "🥫 Zylindrische Entzerrung",
    "fr-FR": "🥫 Dérouleur Cylindrique",
    "ja-JP": "🥫 円柱曲面展開",
    "zh-CN": "🥫 圆柱曲面展平"
  },
  "scanner.btn_autodetect_tooltip": {
    "en-US": "Auto-detect quad corners using Canny & Sobel gradient analysis",
    "hi-IN": "कैनि और सोबेल ग्रेडिएंट विश्लेषण का उपयोग करके चतुर्भुज कोनों का स्वतः पता लगाएं",
    "es-ES": "Detección automática de esquinas mediante análisis Canny y Sobel",
    "de-DE": "Ecken automatisch mit Canny- & Sobel-Gradientenanalyse erkennen",
    "fr-FR": "Détection automatique des coins par analyse de gradient Canny & Sobel",
    "ja-JP": "CannyおよびSobel勾配解析による四角形コーナーの自動検出",
    "zh-CN": "使用 Canny 与 Sobel 梯度分析自动检测四边形角点"
  },
  "fsma.record_cte_title": {
    "en-US": "+ Record Critical Tracking Event (CTE)",
    "hi-IN": "+ क्रिटिकल ट्रैकिंग इवेंट (CTE) रिकॉर्ड करें",
    "es-ES": "+ Registrar Evento Crítico de Trazabilidad (CTE)",
    "de-DE": "+ Kritisches Rückverfolgungsereignis (CTE) erfassen",
    "fr-FR": "+ Enregistrer Événement Critique de Traçabilité (CTE)",
    "ja-JP": "+ クリティカルトラッキングイベント (CTE) を記録",
    "zh-CN": "+ 记录关键溯源事件 (CTE)"
  },
  "fsma.cte_type_label": {
    "en-US": "CTE Event Type",
    "hi-IN": "CTE घटना प्रकार",
    "es-ES": "Tipo de Evento CTE",
    "de-DE": "CTE-Ereignistyp",
    "fr-FR": "Type d'événement CTE",
    "ja-JP": "CTEイベントタイプ",
    "zh-CN": "CTE 事件类型"
  },
  "fsma.ftl_label": {
    "en-US": "FTL Commodity",
    "hi-IN": "FTL खाद्य वस्तु (कमोडिटी)",
    "es-ES": "Mercancía FTL",
    "de-DE": "FTL-Warengruppe",
    "fr-FR": "Marchandise FTL",
    "ja-JP": "FTL対象品目",
    "zh-CN": "FTL 食品安全清单品类"
  },
  "fsma.qty_label": {
    "en-US": "Quantity & Unit",
    "hi-IN": "मात्रा एवं इकाई",
    "es-ES": "Cantidad y Unidad",
    "de-DE": "Menge & Einheit",
    "fr-FR": "Quantité & Unité",
    "ja-JP": "数量と単位",
    "zh-CN": "数量与单位"
  },
  "fsma.archived_records_title": {
    "en-US": "Archived Chain-of-Custody Records",
    "hi-IN": "संग्रहीत कस्टडी-श्रृंखला रिकॉर्ड",
    "es-ES": "Registros de Cadena de Custodia Archivados",
    "de-DE": "Archivierte lückenlose Nachweise (Chain-of-Custody)",
    "fr-FR": "Registres Archivés de Chaîne de Responsabilité",
    "ja-JP": "保管された管理証跡 (Chain-of-Custody) 記録",
    "zh-CN": "已归档的监管链凭证记录"
  },
  "fsma.th_event_id": {
    "en-US": "Event ID",
    "hi-IN": "इवेंट आईडी",
    "es-ES": "ID de Evento",
    "de-DE": "Ereignis-ID",
    "fr-FR": "ID d'événement",
    "ja-JP": "イベントID",
    "zh-CN": "事件 ID"
  },
  "fsma.th_tlc_lot": {
    "en-US": "TLC Lot",
    "hi-IN": "टीएलसी लॉट",
    "es-ES": "Lote TLC",
    "de-DE": "TLC-Charge",
    "fr-FR": "Lot TLC",
    "ja-JP": "TLCロット",
    "zh-CN": "TLC 追溯批号"
  },
  "fsma.th_part11": {
    "en-US": "Part 11 Sig",
    "hi-IN": "पार्ट 11 हस्ताक्षर",
    "es-ES": "Firma Part 11",
    "de-DE": "Part-11-Signatur",
    "fr-FR": "Sign. Part 11",
    "ja-JP": "Part 11署名",
    "zh-CN": "Part 11 电子签名"
  },
  "exports.zpl_port_badge": {
    "en-US": "RAW PORT 9100",
    "hi-IN": "रॉ पोर्ट 9100",
    "es-ES": "PUERTO RAW 9100",
    "de-DE": "RAW-PORT 9100",
    "fr-FR": "PORT RAW 9100",
    "ja-JP": "RAWポート 9100",
    "zh-CN": "RAW 端口 9100"
  },
  "exports.btn_send_ble": {
    "en-US": "⚡ Send BLE",
    "hi-IN": "⚡ BLE भेजें",
    "es-ES": "⚡ Enviar BLE",
    "de-DE": "⚡ Senden BLE",
    "fr-FR": "⚡ Envoyer BLE",
    "ja-JP": "⚡ BLE送信",
    "zh-CN": "⚡ 发送至 BLE"
  },
  "modal_legal.sec1": {
    "en-US": "GS1, UPC, EAN, GS1 Digital Link, and DataBar are registered trademarks of GS1 AISBL. DualMark Studio is an independent prepress engineering tool and is not endorsed by, sponsored by, or affiliated with GS1 AISBL.",
    "hi-IN": "GS1, UPC, EAN, GS1 Digital Link एवं DataBar GS1 AISBL के पंजीकृत ट्रेडमार्क हैं। ड्यूल-मार्क स्टूडियो एक स्वतंत्र प्रीप्रेस इंजीनियरिंग टूल है और GS1 AISBL से संबद्ध नहीं है।",
    "es-ES": "GS1, UPC, EAN, GS1 Digital Link y DataBar son marcas registradas de GS1 AISBL. DualMark Studio es una herramienta de preprensa independiente y no está patrocinada ni afiliada a GS1 AISBL.",
    "de-DE": "GS1, UPC, EAN, GS1 Digital Link und DataBar sind eingetragene Marken von GS1 AISBL. DualMark Studio ist ein unabhängiges Druckvorstufen-Tool und wird nicht von GS1 AISBL gesponsert oder unterstützt.",
    "fr-FR": "GS1, UPC, EAN, GS1 Digital Link et DataBar sont des marques déposées de GS1 AISBL. DualMark Studio est un outil prépresse indépendant non affilié à GS1 AISBL.",
    "ja-JP": "GS1、UPC、EAN、GS1 Digital LinkおよびDataBarはGS1 AISBLの登録商標です。DualMark Studioは独立した製版エンジニアリングツールであり、GS1 AISBLの推奨・提携はありません。",
    "zh-CN": "GS1、UPC、EAN、GS1 Digital Link 及 DataBar 均为 GS1 AISBL 的注册商标。DualMark Studio 是独立的印前制版工程工具，非 GS1 AISBL 官方赞助或关联机构。"
  },
  "modal_legal.sec2": {
    "en-US": "DualMark Studio provides client-side SHA-256 cryptographic audit trails for FSMA Rule 204 CTE/KDE event records. Users remain solely responsible for facility-level validation and operational controls required under 21 CFR Part 11.",
    "hi-IN": "ड्यूल-मार्क स्टूडियो FSMA नियम 204 CTE/KDE इवेंट रिकॉर्ड के लिए क्लाइंट-साइड SHA-256 क्रिप्टोग्राफ़िक ऑडिट ट्रेल प्रदान करता है। 21 CFR Part 11 के तहत आवश्यक नियंत्रणों के लिए उपयोगकर्ता स्वयं जिम्मेदार हैं।",
    "es-ES": "DualMark Studio proporciona pistas de auditoría criptográficas SHA-256 del lado del cliente para eventos CTE/KDE bajo la Norma 204 de FSMA. Los usuarios son responsables de los controles exigidos por 21 CFR Parte 11.",
    "de-DE": "DualMark Studio bietet clientseitige kryptografische SHA-256-Audit-Trails für FSMA-Regel-204-Ereignisse. Benutzer sind selbst verantwortlich für betriebliche Kontrollen nach 21 CFR Part 11.",
    "fr-FR": "DualMark Studio fournit des pistes d'audit cryptographiques SHA-256 locales pour la règle FSMA 204. Les utilisateurs restent responsables de la conformité avec la norme 21 CFR Part 11.",
    "ja-JP": "DualMark StudioはFSMA規則204のCTE/KDE記録用にクライアント側SHA-256暗号監査証跡を提供します。21 CFR Part 11に必要な施設運用管理はユーザーの責任となります。",
    "zh-CN": "DualMark Studio 为 FSMA 第 204 条规则的 CTE/KDE 溯源记录提供客户端 SHA-256 加密审计日志。用户需自行负责 21 CFR Part 11 所需的设施级验证和合规管控。"
  },
  "modal_legal.sec3": {
    "en-US": "The 50mm Die-Line clearance inspector is a prepress design layout aid. It does not replace ISO/IEC 15416 (1D) or ISO/IEC 15415 (2D) calibrated optical barcode verifiers.",
    "hi-IN": "50 मिमी डाई-लाइन क्लीयरेंस इंस्पेक्टर एक प्रीप्रेस लेआउट सहायता उपकरण है। यह ISO/IEC 15416 या ISO/IEC 15415 कैलिब्रेटेड ऑप्टिकल सत्यापनकर्ताओं का विकल्प नहीं है।",
    "es-ES": "El inspector de separación de 50 mm es una ayuda de diseño para preprensa. No sustituye a los verificadores ópticos calibrados ISO/IEC 15416 (1D) o ISO/IEC 15415 (2D).",
    "de-DE": "Die 50-mm-Abstandsprüfung ist eine Vorstufen-Layouthilfe. Sie ersetzt keine kalibrierten optischen ISO/IEC 15416- oder ISO/IEC 15415-Barcode-Prüfgeräte.",
    "fr-FR": "L'inspecteur de dégagement de 50 mm est une aide à la mise en page prépresse. Il ne remplace pas les vérificateurs optiques étalonnés ISO/IEC 15416 ou 15415.",
    "ja-JP": "50mmダイライン離隔インスペクターは製版レイアウト支援機能です。ISO/IEC 15416 (1D) または ISO/IEC 15415 (2D) 校正済光学検証機の代替ではありません。",
    "zh-CN": "50mm 模切刀线净空检查器仅作为印前排版辅助工具。不可替代 ISO/IEC 15416 (一维码) 或 ISO/IEC 15415 (二维码) 校准光学条码检测仪。"
  }
};

let buildScript = fs.readFileSync('tools/build_all_translations.mjs', 'utf8');

const targetStr = '};\n\n// Check parity';
const insertPoint = buildScript.indexOf(targetStr);
if (insertPoint !== -1) {
  let entries = '';
  for (const [key, obj] of Object.entries(ADDITIONAL_KEYS)) {
    entries += `  ${JSON.stringify(key)}: ${JSON.stringify(obj, null, 4)},\n`;
  }
  buildScript = buildScript.slice(0, insertPoint) + entries + buildScript.slice(insertPoint);
  fs.writeFileSync('tools/build_all_translations.mjs', buildScript, 'utf8');
  console.log('Appended additional keys to tools/build_all_translations.mjs!');
} else {
  console.error('Could not find insertPoint in tools/build_all_translations.mjs');
}
