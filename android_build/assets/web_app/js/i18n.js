/**
 * DualMark Studio — Dynamic Multi-Lingual Localization Engine (i18n)
 * Provides comprehensive translations for all 6 target locales:
 * en-US (English), es-ES (Spanish), de-DE (German), fr-FR (French), ja-JP (Japanese), zh-CN (Chinese).
 *
 * Runs 100% client-side and offline with automatic system locale detection.
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.DualMarkI18n = factory();
  }
})(typeof self !== 'undefined' ? self : this, function() {
  'use strict';

  const SUPPORTED_LOCALES = ['en-US', 'es-ES', 'de-DE', 'fr-FR', 'ja-JP', 'zh-CN'];
  const DEFAULT_LOCALE = 'en-US';

  const TRANSLATIONS = {
    'en-US': {
      'app.title': 'DualMark Studio',
      'app.subtitle': 'Packaging Pre-Flight & Field Traceability',
      'tab.design': '1. Design & Synthesizer',
      'tab.dieline': '2. 50mm Die-Line Safe Zone',
      'tab.scanner': '3. 2D Camera Caliper',
      'tab.fsma': '4. FSMA 204 Traceability',
      'tab.prepress': '5. Industrial Prepress',
      'btn.generate': 'Generate Dual-Code Proof',
      'btn.export_pdf': 'Export PDF/X-4 Master',
      'btn.export_eps': 'Export Pantone CMYK EPS',
      'btn.print_zpl': 'Print Thermal Label (ZPL II)',
      'btn.scan': 'Start Camera Scanner',
      'btn.add_cte': 'Commit FSMA CTE Record',
      'field.gtin': 'GTIN-14 / Barcode',
      'field.lot': 'Batch / Lot Code',
      'field.exp': 'Expiration Date',
      'field.serial': 'Serial Number',
      'field.bwr': 'BWR Compensation (µm)',
      'badge.compliant': '50mm Clearance Certified',
      'badge.non_compliant': 'Clearance Violation (<50mm)',
      'badge.grade_a': 'ISO/IEC Grade A (4.0/4.0)',
      'status.printer_online': 'Zebra Printer: Online & Ready',
      'status.printer_paper_out': '⚠ Zebra Printer: Media / Paper Out',
      'status.printer_head_open': '⚠ Zebra Printer: Printhead Open',
      'status.printer_ribbon_out': '⚠ Zebra Printer: Ribbon Out',
      'status.ble_connected': 'Bluetooth LE Printer: Connected',
      'modal.license_title': 'Commercial Prepress License',
      'modal.legal_title': 'Regulatory & Standards Disclosures',
      'theme.outdoor': 'Outdoor Loading Dock Mode',
      'role.designer': 'Packaging Engineer',
      'role.auditor': 'Regulatory Auditor',
      'role.pressman': 'Pressman / Operator',
      'nav.synth': 'Synth',
      'nav.clearance': '50mm',
      'nav.resolver': 'Resolver',
      'nav.scanner': 'Scanner',
      'nav.fsma': 'FSMA 204',
      'nav.exports': 'Exports',
      'btn.poll_status': 'Poll ~HS',
      'btn.scan_ble': 'Scan BLE',
      'btn.calibrate': 'Calibrate'
    },
    'es-ES': {
      'app.title': 'DualMark Studio',
      'app.subtitle': 'Preimpresión de Empaques y Trazabilidad',
      'tab.design': '1. Diseño y Sintetizador',
      'tab.dieline': '2. Zona Segura de Troquel 50mm',
      'tab.scanner': '3. Calibrador Óptico 2D',
      'tab.fsma': '4. Trazabilidad FSMA 204',
      'tab.prepress': '5. Preimpresión Industrial',
      'btn.generate': 'Generar Prueba de Doble Código',
      'btn.export_pdf': 'Exportar Maestro PDF/X-4',
      'btn.export_eps': 'Exportar EPS CMYK Pantone',
      'btn.print_zpl': 'Imprimir Etiqueta Térmica (ZPL II)',
      'btn.scan': 'Iniciar Escáner de Cámara',
      'btn.add_cte': 'Confirmar Registro CTE FSMA',
      'field.gtin': 'GTIN-14 / Código de Barras',
      'field.lot': 'Lote de Producción',
      'field.exp': 'Fecha de Caducidad',
      'field.serial': 'Número de Serie',
      'field.bwr': 'Compensación BWR (µm)',
      'badge.compliant': 'Certificado Despeje 50mm',
      'badge.non_compliant': 'Violación de Despeje (<50mm)',
      'badge.grade_a': 'Grado ISO/IEC A (4.0/4.0)',
      'status.printer_online': 'Impresora Zebra: En Línea y Lista',
      'status.printer_paper_out': '⚠ Impresora Zebra: Sin Papel',
      'status.printer_head_open': '⚠ Impresora Zebra: Cabezal Abierto',
      'status.printer_ribbon_out': '⚠ Impresora Zebra: Sin Cinta',
      'status.ble_connected': 'Impresora Bluetooth LE: Conectada',
      'modal.license_title': 'Licencia Comercial de Preimpresión',
      'modal.legal_title': 'Divulgaciones Normativas y Estándares',
      'theme.outdoor': 'Modo Alto Contraste para Andén',
      'role.designer': 'Ingeniero de Empaques',
      'role.auditor': 'Auditor Normativo',
      'role.pressman': 'Operador de Prensa',
      'nav.synth': 'Sintetizador',
      'nav.clearance': '50mm',
      'nav.resolver': 'Resolutor',
      'nav.scanner': 'Escáner',
      'nav.fsma': 'FSMA 204',
      'nav.exports': 'Exportaciones',
      'btn.poll_status': 'Consultar ~HS',
      'btn.scan_ble': 'Escanear BLE',
      'btn.calibrate': 'Calibrar'
    },
    'de-DE': {
      'app.title': 'DualMark Studio',
      'app.subtitle': 'Verpackungsvorstufe & Rückverfolgbarkeit',
      'tab.design': '1. Design & Synthesizer',
      'tab.dieline': '2. 50mm Stanzkontur-Sicherheitszone',
      'tab.scanner': '3. 2D Kamera-Messschieber',
      'tab.fsma': '4. FSMA 204 Rückverfolgbarkeit',
      'tab.prepress': '5. Industrielle Druckvorstufe',
      'btn.generate': 'Dual-Code Prüfmuster Erstellen',
      'btn.export_pdf': 'PDF/X-4 Master Exportieren',
      'btn.export_eps': 'Pantone CMYK EPS Exportieren',
      'btn.print_zpl': 'Thermodruck (ZPL II)',
      'btn.scan': 'Kamerascanner Starten',
      'btn.add_cte': 'FSMA CTE Datensatz Festschreiben',
      'field.gtin': 'GTIN-14 / Barcode',
      'field.lot': 'Chargennummer / Lot',
      'field.exp': 'Verfallsdatum',
      'field.serial': 'Seriennummer',
      'field.bwr': 'BWR Balkenbreitenkorrektur (µm)',
      'badge.compliant': '50mm Abstand Zertifiziert',
      'badge.non_compliant': 'Abstandsverletzung (<50mm)',
      'badge.grade_a': 'ISO/IEC Qualitätsstufe A (4.0/4.0)',
      'status.printer_online': 'Zebra Drucker: Online & Bereit',
      'status.printer_paper_out': '⚠ Zebra Drucker: Kein Papier / Medienfehler',
      'status.printer_head_open': '⚠ Zebra Drucker: Druckkopf Offen',
      'status.printer_ribbon_out': '⚠ Zebra Drucker: Farbband Aufgebraucht',
      'status.ble_connected': 'Bluetooth LE Drucker: Verbunden',
      'modal.license_title': 'Gewerbliche Druckvorstufenlizenz',
      'modal.legal_title': 'Regulatorische Erklärungen & Standards',
      'theme.outdoor': 'Verladerampen-Modus (Hoher Kontrast)',
      'role.designer': 'Verpackungsingenieur',
      'role.auditor': 'Konformitätsprüfer',
      'role.pressman': 'Druckmaschinenführer',
      'nav.synth': 'Synthese',
      'nav.clearance': '50mm',
      'nav.resolver': 'Resolver',
      'nav.scanner': 'Scanner',
      'nav.fsma': 'FSMA 204',
      'nav.exports': 'Exporte',
      'btn.poll_status': 'Status ~HS',
      'btn.scan_ble': 'BLE Scannen',
      'btn.calibrate': 'Kalibrieren'
    },
    'fr-FR': {
      'app.title': 'DualMark Studio',
      'app.subtitle': 'Prépresse Emballage & Traçabilité',
      'tab.design': '1. Conception & Synthèse',
      'tab.dieline': '2. Zone de Sécurité Filet 50mm',
      'tab.scanner': '3. Pied à Coulisse Optique 2D',
      'tab.fsma': '4. Traçabilité FSMA 204',
      'tab.prepress': '5. Prépresse Industrielle',
      'btn.generate': 'Générer Épreuve Double Code',
      'btn.export_pdf': 'Exporter Master PDF/X-4',
      'btn.export_eps': 'Exporter EPS Pantone CMJN',
      'btn.print_zpl': 'Imprimer Étiquette Thermique (ZPL II)',
      'btn.scan': 'Démarrer Scanner Caméra',
      'btn.add_cte': 'Enregistrer Événement CTE FSMA',
      'field.gtin': 'GTIN-14 / Code-barres',
      'field.lot': 'Numéro de Lot',
      'field.exp': 'Date de Péremption',
      'field.serial': 'Numéro de Série',
      'field.bwr': 'Compensation BWR (µm)',
      'badge.compliant': 'Dégagement 50mm Certifié',
      'badge.non_compliant': 'Dégagement Insuffisant (<50mm)',
      'badge.grade_a': 'Grade ISO/IEC A (4.0/4.0)',
      'status.printer_online': 'Imprimante Zebra: En Ligne & Prête',
      'status.printer_paper_out': '⚠ Imprimante Zebra: Papier Épuisé',
      'status.printer_head_open': '⚠ Imprimante Zebra: Tête Ouverte',
      'status.printer_ribbon_out': '⚠ Imprimante Zebra: Ruban Épuisé',
      'status.ble_connected': 'Imprimante Bluetooth LE: Connectée',
      'modal.license_title': 'Licence Commerciale Prépresse',
      'modal.legal_title': 'Déclarations Réglementaires et Normes',
      'theme.outdoor': 'Mode Quai de Chargement (Haut Contraste)',
      'role.designer': 'Ingénieur Emballage',
      'role.auditor': 'Auditeur Réglementaire',
      'role.pressman': 'Conducteur de Presse',
      'nav.synth': 'Synthèse',
      'nav.clearance': '50mm',
      'nav.resolver': 'Résolveur',
      'nav.scanner': 'Scanner',
      'nav.fsma': 'FSMA 204',
      'nav.exports': 'Exports',
      'btn.poll_status': 'Sonder ~HS',
      'btn.scan_ble': 'Scanner BLE',
      'btn.calibrate': 'Étalonner'
    },
    'ja-JP': {
      'app.title': 'DualMark Studio',
      'app.subtitle': '包装プリプレス＆トレーサビリティ',
      'tab.design': '1. デザイン＆シンセサイザー',
      'tab.dieline': '2. 50mm抜型安全マージン',
      'tab.scanner': '3. 2Dカメラノギス測定',
      'tab.fsma': '4. FSMA 204トレーサビリティ',
      'tab.prepress': '5. 工業用プリプレス',
      'btn.generate': 'デュアルコード校正生成',
      'btn.export_pdf': 'PDF/X-4マスター出力',
      'btn.export_eps': 'Pantone CMYK EPS出力',
      'btn.print_zpl': 'サーマル印刷 (ZPL II)',
      'btn.scan': 'カメラスキャン開始',
      'btn.add_cte': 'FSMA CTEイベント登録',
      'field.gtin': 'GTIN-14 / バーコード',
      'field.lot': 'ロット番号 / バッチ',
      'field.exp': '消費期限 / 有効期限',
      'field.serial': 'シリアル番号',
      'field.bwr': 'BWR線幅補正 (µm)',
      'badge.compliant': '50mmクリアランス認証済',
      'badge.non_compliant': 'クリアランス違反 (<50mm)',
      'badge.grade_a': 'ISO/IEC グレード A (4.0/4.0)',
      'status.printer_online': 'Zebraプリンター: オンライン準備完了',
      'status.printer_paper_out': '⚠ Zebraプリンター: 用紙切れ',
      'status.printer_head_open': '⚠ Zebraプリンター: ヘッド開放',
      'status.printer_ribbon_out': '⚠ Zebraプリンター: リボン切れ',
      'status.ble_connected': 'Bluetooth LEプリンター: 接続中',
      'modal.license_title': '商用プリプレスライセンス',
      'modal.legal_title': '規制および標準規格の開示',
      'theme.outdoor': '荷受場高コントラストモード',
      'role.designer': 'パッケージ設計者',
      'role.auditor': '法規制監査員',
      'role.pressman': '印刷オペレーター',
      'nav.synth': 'シンセサイザ',
      'nav.clearance': '50mm',
      'nav.resolver': 'リゾルバ',
      'nav.scanner': 'スキャナ',
      'nav.fsma': 'FSMA 204',
      'nav.exports': '出力',
      'btn.poll_status': '状態取得 ~HS',
      'btn.scan_ble': 'BLE スキャン',
      'btn.calibrate': '光学校正'
    },
    'zh-CN': {
      'app.title': 'DualMark Studio',
      'app.subtitle': '包装印前工程与供应链追溯系统',
      'tab.design': '1. 设计与双码生成器',
      'tab.dieline': '2. 50mm模切刀线安全区',
      'tab.scanner': '3. 2D相机光学卡尺',
      'tab.fsma': '4. FSMA 204追溯账本',
      'tab.prepress': '5. 工业级印前输出',
      'btn.generate': '生成双码打样',
      'btn.export_pdf': '导出PDF/X-4主文件',
      'btn.export_eps': '导出Pantone CMYK EPS',
      'btn.print_zpl': '热敏标签打印 (ZPL II)',
      'btn.scan': '启动相机扫描仪',
      'btn.add_cte': '提交FSMA CTE事件记录',
      'field.gtin': 'GTIN-14 / 商品条码',
      'field.lot': '批次号 / 生产批号',
      'field.exp': '有效期至',
      'field.serial': '单品序列号',
      'field.bwr': 'BWR线条宽度补偿 (µm)',
      'badge.compliant': '50mm净距认证合格',
      'badge.non_compliant': '净距不足 (<50mm违规)',
      'badge.grade_a': 'ISO/IEC A级质量认证 (4.0/4.0)',
      'status.printer_online': 'Zebra打印机: 在线就绪',
      'status.printer_paper_out': '⚠ Zebra打印机: 缺纸/介质错误',
      'status.printer_head_open': '⚠ Zebra打印机: 打印头未合',
      'status.printer_ribbon_out': '⚠ Zebra打印机: 色带用尽',
      'status.ble_connected': '低功耗蓝牙(BLE)打印机: 已连接',
      'modal.license_title': '商业印前授权许可',
      'modal.legal_title': '法规与行业标准合规披露',
      'theme.outdoor': '仓库装卸区高对比度模式',
      'role.designer': '包装工程师',
      'role.auditor': '法规审计员',
      'role.pressman': '印刷机机长',
      'nav.synth': '双码合成',
      'nav.clearance': '50mm',
      'nav.resolver': '解析器',
      'nav.scanner': '扫描仪',
      'nav.fsma': 'FSMA 204',
      'nav.exports': '印前导出',
      'btn.poll_status': '查询 ~HS',
      'btn.scan_ble': '扫描低功耗蓝牙',
      'btn.calibrate': '光学校准'
    }
  };

  let currentLocale = DEFAULT_LOCALE;

  function detectSystemLocale() {
    if (typeof navigator !== 'undefined' && navigator.language) {
      const navLang = navigator.language;
      // Match exact locale
      if (SUPPORTED_LOCALES.includes(navLang)) return navLang;
      // Match language prefix (e.g., 'es' -> 'es-ES')
      const prefix = navLang.split('-')[0].toLowerCase();
      const match = SUPPORTED_LOCALES.find(l => l.toLowerCase().startsWith(prefix));
      if (match) return match;
    }
    return DEFAULT_LOCALE;
  }

  function setLanguage(locale) {
    if (SUPPORTED_LOCALES.includes(locale)) {
      currentLocale = locale;
    } else {
      const match = SUPPORTED_LOCALES.find(l => l.startsWith(locale));
      currentLocale = match || DEFAULT_LOCALE;
    }
    if (typeof document !== 'undefined') {
      document.documentElement.lang = currentLocale;
      translateDom();
    }
    return currentLocale;
  }

  function getLanguage() {
    return currentLocale;
  }

  function getSupportedLanguages() {
    return [...SUPPORTED_LOCALES];
  }

  function t(key, params = {}) {
    const dict = TRANSLATIONS[currentLocale] || TRANSLATIONS[DEFAULT_LOCALE];
    let text = dict[key] || TRANSLATIONS[DEFAULT_LOCALE][key] || key;
    for (const [k, v] of Object.entries(params)) {
      text = text.replace(new RegExp(`{${k}}`, 'g'), v);
    }
    return text;
  }

  function translateDom(rootElement = null) {
    if (typeof document === 'undefined') return;
    const root = rootElement || document;
    const elements = root.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (key) {
        const val = t(key);
        if (el.tagName === 'INPUT' && (el.type === 'button' || el.type === 'submit')) {
          el.value = val;
        } else if (el.placeholder !== undefined && el.hasAttribute('data-i18n-placeholder')) {
          el.placeholder = val;
        } else {
          el.textContent = val;
        }
      }
    });
  }

  function init() {
    const detected = detectSystemLocale();
    setLanguage(detected);
  }

  return {
    init,
    setLanguage,
    getLanguage,
    getSupportedLanguages,
    t,
    translateDom,
    TRANSLATIONS
  };
});
