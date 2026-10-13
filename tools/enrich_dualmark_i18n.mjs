import fs from 'fs';

// Complete dictionary of new keys across all 7 locales
export const NEW_DUALMARK_KEYS = {
  // Modal Export Formats
  "modal_export.format_generic": {
    "en-US": "Document File",
    "hi-IN": "दस्तावेज़ फ़ाइल",
    "es-ES": "Archivo de Documento",
    "de-DE": "Dokumentdatei",
    "fr-FR": "Fichier Document",
    "ja-JP": "ドキュメントファイル",
    "zh-CN": "文档文件"
  },
  "modal_export.format_pdf": {
    "en-US": "PDF/X-4 CMYK Vector Document (ISO 15930-7)",
    "hi-IN": "PDF/X-4 CMYK वेक्टर दस्तावेज़ (ISO 15930-7)",
    "es-ES": "Documento Vectorial CMYK PDF/X-4 (ISO 15930-7)",
    "de-DE": "PDF/X-4 CMYK Vektordokument (ISO 15930-7)",
    "fr-FR": "Document Vectoriel CMYK PDF/X-4 (ISO 15930-7)",
    "ja-JP": "PDF/X-4 CMYKベクタードキュメント (ISO 15930-7)",
    "zh-CN": "PDF/X-4 CMYK 矢量文档 (ISO 15930-7)"
  },
  "modal_export.format_eps": {
    "en-US": "Adobe PostScript Vector Plate (CMYK / Spot)",
    "hi-IN": "एडोब पोस्टस्क्रिप्ट वेक्टर प्लेट (CMYK / स्पॉट)",
    "es-ES": "Placa Vectorial Adobe PostScript (CMYK / Tinta Plana)",
    "de-DE": "Adobe PostScript Vektorplatte (CMYK / Sonderfarbe)",
    "fr-FR": "Plaque Vectorielle Adobe PostScript (CMJN / Ton Direct)",
    "ja-JP": "Adobe PostScript ベクター版 (CMYK / スポットカラー)",
    "zh-CN": "Adobe PostScript 矢量印版 (CMYK / 专色)"
  },
  "modal_export.format_svg": {
    "en-US": "Scalable Vector Graphics (W3C Die-Line Proof)",
    "hi-IN": "स्केलेबल वेक्टर ग्राफिक्स (W3C डाई-लाइन प्रूफ)",
    "es-ES": "Gráficos Vectoriales Escalables (Prueba de Troquel W3C)",
    "de-DE": "Skalierbare Vektorgrafik (W3C Stanzlinien-Prüfung)",
    "fr-FR": "Graphiques Vectoriels Scalables (Épreuve Ligne de Découpe W3C)",
    "ja-JP": "スケーラブルベクターグラフィックス (W3C型抜き校正)",
    "zh-CN": "可缩放矢量图形 (W3C 刀模打样)"
  },
  "modal_export.format_png": {
    "en-US": "Raster Graphic 300 DPI (Lossless PNG)",
    "hi-IN": "रास्टर ग्राफिक 300 DPI (दोषरहित PNG)",
    "es-ES": "Gráfico Rasterizado 300 DPI (PNG Sin Pérdida)",
    "de-DE": "Rastergrafik 300 DPI (Verlustfreies PNG)",
    "fr-FR": "Graphique Matriciel 300 DPI (PNG Sans Perte)",
    "ja-JP": "ラスター画像 300 DPI (ロスレス PNG)",
    "zh-CN": "光栅位图 300 DPI (无损 PNG)"
  },
  "modal_export.format_zpl": {
    "en-US": "Zebra ZPL II Industrial Thermal Code",
    "hi-IN": "ज़ेबरा ZPL II औद्योगिक थर्मल कोड",
    "es-ES": "Código Térmico Industrial Zebra ZPL II",
    "de-DE": "Zebra ZPL II Industrieller Thermodruckcode",
    "fr-FR": "Code Thermique Industriel Zebra ZPL II",
    "ja-JP": "Zebra ZPL II 産業用サーマル印刷コード",
    "zh-CN": "Zebra ZPL II 工业热敏代码"
  },
  "modal_export.format_zip": {
    "en-US": "Master Multi-SKU Production Archive (.zip)",
    "hi-IN": "मास्टर मल्टी-SKU उत्पादन संग्रह (.zip)",
    "es-ES": "Archivo Maestro de Producción Multi-SKU (.zip)",
    "de-DE": "Master Multi-SKU Produktionsarchiv (.zip)",
    "fr-FR": "Archive Maîtresse de Production Multi-SKU (.zip)",
    "ja-JP": "マスターマルチSKU製造アーカイブ (.zip)",
    "zh-CN": "主生产多 SKU 归档包 (.zip)"
  },
  "modal_export.format_csv": {
    "en-US": "FDA FSMA 204 Sortable Spreadsheet (CSV)",
    "hi-IN": "FDA FSMA 204 क्रमबद्ध करने योग्य स्प्रेडशीट (CSV)",
    "es-ES": "Hoja de Cálculo Clasificable FDA FSMA 204 (CSV)",
    "de-DE": "FDA FSMA 204 Sortierbare Tabelle (CSV)",
    "fr-FR": "Tableur Triable FDA FSMA 204 (CSV)",
    "ja-JP": "FDA FSMA 204 ソート対応スプレッドシート (CSV)",
    "zh-CN": "FDA FSMA 204 结构化数据表格 (CSV)"
  },
  "modal_export.format_json": {
    "en-US": "Structured Data / EPCIS JSON-LD",
    "hi-IN": "संरचित डेटा / EPCIS JSON-LD",
    "es-ES": "Datos Estructurados / EPCIS JSON-LD",
    "de-DE": "Strukturierte Daten / EPCIS JSON-LD",
    "fr-FR": "Données Structurées / EPCIS JSON-LD",
    "ja-JP": "構造化データ / EPCIS JSON-LD",
    "zh-CN": "结构化数据 / EPCIS JSON-LD"
  },
  "modal_export.format_xml": {
    "en-US": "GS1 EPCIS 2.0 XML Audit Document",
    "hi-IN": "GS1 EPCIS 2.0 XML ऑडिट दस्तावेज़",
    "es-ES": "Documento de Auditoría XML GS1 EPCIS 2.0",
    "de-DE": "GS1 EPCIS 2.0 XML Audit-Dokument",
    "fr-FR": "Document d'Audit XML GS1 EPCIS 2.0",
    "ja-JP": "GS1 EPCIS 2.0 XML 監査ドキュメント",
    "zh-CN": "GS1 EPCIS 2.0 XML 审计文档"
  },
  "modal_export.format_sql": {
    "en-US": "SQLite Edge Database Script",
    "hi-IN": "SQLite एज डेटाबेस स्क्रिप्ट",
    "es-ES": "Script de Base de Datos Edge SQLite",
    "de-DE": "SQLite Edge-Datenbank-Skript",
    "fr-FR": "Script de Base de Données Edge SQLite",
    "ja-JP": "SQLite エッジデータベーススクリプト",
    "zh-CN": "SQLite 边缘数据库脚本"
  },
  "modal_export.format_js": {
    "en-US": "Cloudflare Edge Worker Script",
    "hi-IN": "क्लाउडफ्लेयर एज वर्कर स्क्रिप्ट",
    "es-ES": "Script de Cloudflare Edge Worker",
    "de-DE": "Cloudflare Edge-Worker-Skript",
    "fr-FR": "Script Cloudflare Edge Worker",
    "ja-JP": "Cloudflare Edge Worker スクリプト",
    "zh-CN": "Cloudflare Edge Worker 脚本"
  },
  "modal_export.format_conf": {
    "en-US": "Nginx Reverse Proxy Route Configuration",
    "hi-IN": "Nginx रिवर्स प्रॉक्सी रूट कॉन्फ़िगरेशन",
    "es-ES": "Configuración de Ruta Proxy Inverso Nginx",
    "de-DE": "Nginx Reverse-Proxy Routenkonfiguration",
    "fr-FR": "Configuration de Routage Proxy Inverse Nginx",
    "ja-JP": "Nginx リバースプロキシルーティング構成",
    "zh-CN": "Nginx 反向代理路由配置"
  },

  // Modal Prepress Verification Checks
  "modal_export.prepress_check_passed": {
    "en-US": "✓ Prepress Verification Check Passed:",
    "hi-IN": "✓ प्री-प्रेस सत्यापन जांच उत्तीर्ण:",
    "es-ES": "✓ Verificación de Preimpresión Aprobada:",
    "de-DE": "✓ Druckvorstufen-Prüfung bestanden:",
    "fr-FR": "✓ Contrôle Prépresse Validé avec Succès :",
    "ja-JP": "✓ 製版プリプレス検証に合格しました:",
    "zh-CN": "✓ 印前制版预检验证通过："
  },
  "modal_export.prepress_check_format": {
    "en-US": "• Format: ISO 15930-7 (PDF/X-4:2010 Prepress Master)",
    "hi-IN": "• प्रारूप: ISO 15930-7 (PDF/X-4:2010 प्री-प्रेस मास्टर)",
    "es-ES": "• Formato: ISO 15930-7 (PDF/X-4:2010 Master de Preimpresión)",
    "de-DE": "• Format: ISO 15930-7 (PDF/X-4:2010 Druckvorstufen-Master)",
    "fr-FR": "• Format : ISO 15930-7 (PDF/X-4:2010 Master Prépresse)",
    "ja-JP": "• フォーマット: ISO 15930-7 (PDF/X-4:2010 製版マスター)",
    "zh-CN": "• 格式：ISO 15930-7 (PDF/X-4:2010 印前主制版)"
  },
  "modal_export.prepress_check_color": {
    "en-US": "• Color: CMYK Plates with FOGRA39 Characterization",
    "hi-IN": "• रंग: FOGRA39 विशेषता के साथ CMYK प्लेटें",
    "es-ES": "• Color: Placas CMYK con Caracterización FOGRA39",
    "de-DE": "• Farbe: CMYK-Druckplatten mit FOGRA39-Charakterisierung",
    "fr-FR": "• Couleur : Plaques CMJN avec Caractérisation FOGRA39",
    "ja-JP": "• カラー: FOGRA39特性化CMYKプレート",
    "zh-CN": "• 色彩：符合 FOGRA39 特征化的 CMYK 分色印版"
  },
  "modal_export.prepress_check_geometry": {
    "en-US": "• Geometry: Vector Bézier Paths with Bar Width Reduction (BWR)",
    "hi-IN": "• ज्यामिति: बार चौड़ाई कमी (BWR) के साथ वेक्टर बेजियर पथ",
    "es-ES": "• Geometría: Trazados Bézier Vectoriales con Reducción de Ancho de Barra (BWR)",
    "de-DE": "• Geometrie: Vektor-Bézier-Pfade mit Balkenbreitenreduktion (BWR)",
    "fr-FR": "• Géométrie : Chemins de Bézier Vectoriels avec Réduction de Largeur de Barre (BWR)",
    "ja-JP": "• ジオメトリ: バー幅補正 (BWR) 付きベクターベジェパス",
    "zh-CN": "• 几何：带有条宽补偿缩减 (BWR) 的矢量贝塞尔路径"
  },
  "modal_export.prepress_check_output": {
    "en-US": "• Output Target: {filename} ({size})",
    "hi-IN": "• आउटपुट लक्ष्य: {filename} ({size})",
    "es-ES": "• Destino de Salida: {filename} ({size})",
    "de-DE": "• Ausgabeziel: {filename} ({size})",
    "fr-FR": "• Cible de Sortie : {filename} ({size})",
    "ja-JP": "• 出力先: {filename} ({size})",
    "zh-CN": "• 输出目标：{filename} ({size})"
  },
  "modal_export.zip_title": {
    "en-US": "📦 Multi-SKU Production Archive:",
    "hi-IN": "📦 मल्टी-SKU उत्पादन संग्रह:",
    "es-ES": "📦 Archivo de Producción Multi-SKU:",
    "de-DE": "📦 Multi-SKU Produktionsarchiv:",
    "fr-FR": "📦 Archive de Production Multi-SKU :",
    "ja-JP": "📦 マルチSKU製造アーカイブ:",
    "zh-CN": "📦 多 SKU 生产归档包："
  },
  "modal_export.zip_batch": {
    "en-US": "• High-Throughput Batch Generation",
    "hi-IN": "• उच्च-थ्रूपुट बैच जनरेशन",
    "es-ES": "• Generación por Lotes de Alto Rendimiento",
    "de-DE": "• Hochdurchsatz-Stapelverarbeitung",
    "fr-FR": "• Génération par Lots à Haut Rendement",
    "ja-JP": "• 高スループットの一括バッチ生成",
    "zh-CN": "• 高通量批量生成"
  },
  "modal_export.zip_bundled": {
    "en-US": "• Bundled: Individual Vector SVGs, Thermal Code & Proof Sheets",
    "hi-IN": "• बंडल: व्यक्तिगत वेक्टर SVG, थर्मल कोड और प्रूफ शीट",
    "es-ES": "• Incluido: SVG Vectoriales Individuales, Código Térmico y Hojas de Prueba",
    "de-DE": "• Gebündelt: Einzelne Vektor-SVGs, Thermocode & Prüfbögen",
    "fr-FR": "• Inclus : Fichiers SVG Vectoriels Individuels, Code Thermique & Feuilles d'Épreuve",
    "ja-JP": "• 同梱: 個別ベクターSVG、サーマルコード＆校正シート",
    "zh-CN": "• 打包内容：独立矢量 SVG、热敏代码及校对打样单"
  },
  "modal_export.chars_truncated": {
    "en-US": "... [{count} more characters truncated for preview]",
    "hi-IN": "... [पूर्वावलोकन के लिए {count} और वर्ण संक्षिप्त किए गए]",
    "es-ES": "... [{count} caracteres más truncados para la vista previa]",
    "de-DE": "... [{count} weitere Zeichen für die Vorschau gekürzt]",
    "fr-FR": "... [{count} caractères supplémentaires tronqués pour l'aperçu]",
    "ja-JP": "... [プレビューのためさらに {count} 文字を省略]",
    "zh-CN": "... [为预览省略了其余 {count} 个字符]"
  },

  // ISO Optical Verification & Standards
  "iso.grade_badge": {
    "en-US": "GRADE {grade} ({score} / 4.0)",
    "hi-IN": "ग्रेड {grade} ({score} / 4.0)",
    "es-ES": "GRADO {grade} ({score} / 4.0)",
    "de-DE": "STUFE {grade} ({score} / 4.0)",
    "fr-FR": "GRADE {grade} ({score} / 4.0)",
    "ja-JP": "グレード {grade} ({score} / 4.0)",
    "zh-CN": "等级 {grade} ({score} / 4.0)"
  },
  "iso.grade_row": {
    "en-US": "Grade {grade}",
    "hi-IN": "ग्रेड {grade}",
    "es-ES": "Grado {grade}",
    "de-DE": "Stufe {grade}",
    "fr-FR": "Grade {grade}",
    "ja-JP": "グレード {grade}",
    "zh-CN": "等级 {grade}"
  },
  "iso.nist_calibrated": {
    "en-US": "NIST CALIBRATED (FACTOR {factor})",
    "hi-IN": "NIST कैलिब्रेटेड (कारक {factor})",
    "es-ES": "CALIBRADO NIST (FACTOR {factor})",
    "de-DE": "NIST KALIBRIERT (FAKTOR {factor})",
    "fr-FR": "CALIBRÉ NIST (FACTEUR {factor})",
    "ja-JP": "NIST 校正済み (係数 {factor})",
    "zh-CN": "NIST 校准认证 (系数 {factor})"
  },
  "iso.th_standard": {
    "en-US": "Standard",
    "hi-IN": "मानक",
    "es-ES": "Estándar",
    "de-DE": "Norm",
    "fr-FR": "Norme",
    "ja-JP": "規格",
    "zh-CN": "标准"
  },
  "iso.th_symbology": {
    "en-US": "Symbology",
    "hi-IN": "प्रतीकात्मकता",
    "es-ES": "Simbología",
    "de-DE": "Symbologie",
    "fr-FR": "Symbologie",
    "ja-JP": "シンボル体系",
    "zh-CN": "条码符号类型"
  },
  "iso.th_rmin": {
    "en-US": "Rmin",
    "hi-IN": "Rmin",
    "es-ES": "Rmin",
    "de-DE": "Rmin",
    "fr-FR": "Rmin",
    "ja-JP": "Rmin",
    "zh-CN": "最小反射率 (Rmin)"
  },
  "iso.th_contrast": {
    "en-US": "Symbol Contrast",
    "hi-IN": "प्रतीक कंट्रास्ट",
    "es-ES": "Contraste de Símbolo",
    "de-DE": "Symbolkontrast",
    "fr-FR": "Contraste du Symbole",
    "ja-JP": "シンボルコントラスト",
    "zh-CN": "符号反差 (SC)"
  },
  "iso.th_modulation": {
    "en-US": "Modulation",
    "hi-IN": "मॉड्यूलेशन",
    "es-ES": "Modulación",
    "de-DE": "Modulation",
    "fr-FR": "Modulation",
    "ja-JP": "変調度 (MOD)",
    "zh-CN": "调制比 (MOD)"
  },
  "iso.th_decodability": {
    "en-US": "Decodability / ANU",
    "hi-IN": "डिकोडेबिलिटी / ANU",
    "es-ES": "Decodificabilidad / ANU",
    "de-DE": "Decodierbarkeit / ANU",
    "fr-FR": "Décodabilité / ANU",
    "ja-JP": "復号化性 / ANU",
    "zh-CN": "可译码度 / 轴向不均匀度 (ANU)"
  },
  "iso.th_defects": {
    "en-US": "Defects",
    "hi-IN": "दोष",
    "es-ES": "Defectos",
    "de-DE": "Defekte",
    "fr-FR": "Défauts",
    "ja-JP": "欠陥度",
    "zh-CN": "缺陷度 (Defects)"
  },
  "iso.th_grade": {
    "en-US": "Grade",
    "hi-IN": "ग्रेड",
    "es-ES": "Grado",
    "de-DE": "Stufe",
    "fr-FR": "Grade",
    "ja-JP": "判定",
    "zh-CN": "质量等级"
  },
  "iso.toast_verified": {
    "en-US": "✓ Optical Verification: ISO Grade {grade} ({score})",
    "hi-IN": "✓ ऑप्टिकल सत्यापन: ISO ग्रेड {grade} ({score})",
    "es-ES": "✓ Verificación Óptica: Grado ISO {grade} ({score})",
    "de-DE": "✓ Optische Verifikation: ISO-Stufe {grade} ({score})",
    "fr-FR": "✓ Vérification Optique : Grade ISO {grade} ({score})",
    "ja-JP": "✓ 光学検証完了: ISOグレード {grade} ({score})",
    "zh-CN": "✓ 光学检验认证：ISO 等级 {grade} ({score})"
  },
  "iso.toast_nist": {
    "en-US": "⚖️ NIST Calibration Verified: {id} (Drift: {drift})",
    "hi-IN": "⚖️ NIST अंशांकन सत्यापित: {id} (बहाव: {drift})",
    "es-ES": "⚖️ Calibración NIST Verificada: {id} (Desviación: {drift})",
    "de-DE": "⚖️ NIST-Kalibrierung verifiziert: {id} (Drift: {drift})",
    "fr-FR": "⚖️ Étalonnage NIST Vérifié : {id} (Dérive : {drift})" ,
    "ja-JP": "⚖️ NIST校正確認完了: {id} (ドリフト: {drift})",
    "zh-CN": "⚖️ NIST 校准验证完成：{id} (漂移值: {drift})"
  },
  "iso.toast_cert_pdf": {
    "en-US": "📄 Printable ISO 15415/15416 Certificate PDF Generated",
    "hi-IN": "📄 मुद्रण योग्य ISO 15415/15416 प्रमाणपत्र PDF उत्पन्न",
    "es-ES": "📄 Certificado PDF Imprimible ISO 15415/15416 Generado",
    "de-DE": "📄 Druckbares ISO 15415/15416 Zertifikat-PDF generiert",
    "fr-FR": "📄 Certificat PDF Imprimable ISO 15415/15416 Généré",
    "ja-JP": "📄 印刷用 ISO 15415/15416 証明書PDFを生成しました",
    "zh-CN": "📄 可打印的 ISO 15415/15416 认证证书 PDF 已生成"
  },

  // Clearance Station & Zoom
  "clearance.toast_snap": {
    "en-US": "⚡ Snapped to 52mm Safe Distance",
    "hi-IN": "⚡ 52मिमी सुरक्षित दूरी पर स्नैप किया गया",
    "es-ES": "⚡ Ajustado a Distancia Segura de 52mm",
    "de-DE": "⚡ Auf 52mm Sicherheitsabstand eingerastet",
    "fr-FR": "⚡ Alignement à Distance de Sécurité 52mm",
    "ja-JP": "⚡ 52mm安全距離にスナップ完了",
    "zh-CN": "⚡ 已对齐到 52mm 安全间距"
  },
  "clearance.toast_carton": {
    "en-US": "📄 Flat Carton Mode Active",
    "hi-IN": "📄 फ्लैट कार्टन मोड सक्रिय",
    "es-ES": "📄 Modo Cartón Plano Activo",
    "de-DE": "📄 Flachkarton-Modus aktiv",
    "fr-FR": "📄 Mode Carton Plat Actif",
    "ja-JP": "📄 平面カートンモード有効",
    "zh-CN": "📄 平面纸盒模式激活"
  },
  "clearance.toast_cylindrical": {
    "en-US": "🥫 3D Cylindrical Packaging Mode ({diam} mm Ø)",
    "hi-IN": "🥫 3D बेलनाकार पैकेजिंग मोड ({diam} मिमी Ø)",
    "es-ES": "🥫 Modo de Empaque Cilíndrico 3D ({diam} mm Ø)",
    "de-DE": "🥫 3D Zylindrischer Verpackungsmodus ({diam} mm Ø)",
    "fr-FR": "🥫 Mode Emballage Cylindrique 3D ({diam} mm Ø)",
    "ja-JP": "🥫 3D 円筒形パッケージモード ({diam} mm Ø)",
    "zh-CN": "🥫 3D 圆柱包装模式 ({diam} 毫米 Ø)"
  },
  "clearance.toast_zoom": {
    "en-US": "🔍 Zoom: {percent}%",
    "hi-IN": "🔍 ज़ूम: {percent}%",
    "es-ES": "🔍 Zoom: {percent}%",
    "de-DE": "🔍 Zoom: {percent}%",
    "fr-FR": "🔍 Zoom : {percent}%",
    "ja-JP": "🔍 ズーム: {percent}%",
    "zh-CN": "🔍 缩放比: {percent}%"
  },
  "clearance.toast_zoom_reset": {
    "en-US": "↺ Zoom Reset (100%)",
    "hi-IN": "↺ ज़ूम रीसेट (100%)",
    "es-ES": "↺ Zoom Restablecido (100%)",
    "de-DE": "↺ Zoom zurückgesetzt (100%)",
    "fr-FR": "↺ Zoom Réinitialisé (100%)",
    "ja-JP": "↺ ズームリセット (100%)",
    "zh-CN": "↺ 缩放重置 (100%)"
  },

  // GS1 Synthesizer, Conformance & GEPIR
  "synth.gs1_conformance_passed": {
    "en-US": "✓ GS1 CONFORMANCE PASSED",
    "hi-IN": "✓ GS1 अनुरूपता उत्तीर्ण",
    "es-ES": "✓ CONFORMIDAD GS1 APROBADA",
    "de-DE": "✓ GS1-KONFORMITÄT BESTANDEN",
    "fr-FR": "✓ CONFORMITÉ GS1 VALIDÉE",
    "ja-JP": "✓ GS1 適合性検証合格",
    "zh-CN": "✓ GS1 规范符合性验证通过"
  },
  "synth.gs1_conformance_failed": {
    "en-US": "✗ GS1 CONFORMANCE FAILED",
    "hi-IN": "✗ GS1 अनुरूपता विफल",
    "es-ES": "✗ CONFORMIDAD GS1 FALLIDA",
    "de-DE": "✗ GS1-KONFORMITÄT FEHLGESCHLAGEN",
    "fr-FR": "✗ ÉCHEC DE CONFORMITÉ GS1",
    "ja-JP": "✗ GS1 適合性検証不合格",
    "zh-CN": "✗ GS1 规范符合性未通过"
  },
  "synth.gepir_country_mo": {
    "en-US": "Country / MO:",
    "hi-IN": "देश / MO:",
    "es-ES": "País / OM:",
    "de-DE": "Land / MO:",
    "fr-FR": "Pays / OM :",
    "ja-JP": "国 / 組織 (MO):",
    "zh-CN": "国家 / 成员组织 (MO)："
  },
  "synth.gepir_checksum": {
    "en-US": "Checksum (Modulo 10):",
    "hi-IN": "चेकसम (Modulo 10):",
    "es-ES": "Suma de Comprobación (Módulo 10):",
    "de-DE": "Prüfziffer (Modulo 10):",
    "fr-FR": "Somme de Contrôle (Modulo 10) :",
    "ja-JP": "チェックサム (Modulo 10):",
    "zh-CN": "校验和 (模 10)："
  },
  "synth.gepir_valid": {
    "en-US": "VALID (Check Digit {digit})",
    "hi-IN": "वैध (जांच अंक {digit})",
    "es-ES": "VÁLIDO (Dígito de Control {digit})",
    "de-DE": "GÜLTIG (Prüfziffer {digit})",
    "fr-FR": "VALIDE (Chiffre de Contrôle {digit})",
    "ja-JP": "有効 (チェックディジット {digit})",
    "zh-CN": "有效 (校验位 {digit})"
  },
  "synth.gepir_checksum_error": {
    "en-US": "CHECKSUM ERROR (Expected {digit})",
    "hi-IN": "चेकसम त्रुटि (अपेक्षित {digit})",
    "es-ES": "ERROR DE COMPROBACIÓN (Esperado {digit})",
    "de-DE": "PRÜFZIFFER-FEHLER (Erwartet {digit})",
    "fr-FR": "ERREUR DE SOMME DE CONTRÔLE (Attendu {digit})",
    "ja-JP": "チェックサムエラー (期待値 {digit})",
    "zh-CN": "校验和错误 (期望值为 {digit})"
  },
  "synth.gepir_status_verified": {
    "en-US": "Status: Verified Local Registry",
    "hi-IN": "स्थिति: सत्यापित स्थानीय रजिस्ट्री",
    "es-ES": "Estado: Registro Local Verificado",
    "de-DE": "Status: Verifiziertes lokales Register",
    "fr-FR": "État : Registre Local Vérifié",
    "ja-JP": "ステータス: ローカルレジストリ検証済み",
    "zh-CN": "状态：本地注册库校验通过"
  },
  "synth.toast_conformance_ok": {
    "en-US": "✓ GS1 Digital Link Conformance Verified",
    "hi-IN": "✓ GS1 डिजिटल लिंक अनुरूपता सत्यापित",
    "es-ES": "✓ Conformidad GS1 Digital Link Verificada",
    "de-DE": "✓ GS1 Digital Link Konformität verifiziert",
    "fr-FR": "✓ Conformité GS1 Digital Link Vérifiée",
    "ja-JP": "✓ GS1 デジタルリンク適合性を検証しました",
    "zh-CN": "✓ GS1 数字链接合规性验证通过"
  },
  "synth.toast_conformance_issues": {
    "en-US": "⚠ GS1 Conformance Issues Detected",
    "hi-IN": "⚠ GS1 अनुरूपता समस्याएं पाई गईं",
    "es-ES": "⚠ Problemas de Conformidad GS1 Detectados",
    "de-DE": "⚠ GS1-Konformitätsprobleme erkannt",
    "fr-FR": "⚠ Anomalies de Conformité GS1 Détectées",
    "ja-JP": "⚠ GS1 適合性の問題を検出しました",
    "zh-CN": "⚠ 检测到 GS1 合规性问题"
  },
  "synth.toast_pim_exported": {
    "en-US": "📦 PIM / DAM Metadata Exported (Salsify, Syndigo, 1WorldSync)",
    "hi-IN": "📦 PIM / DAM मेटाडेटा निर्यात (Salsify, Syndigo, 1WorldSync)",
    "es-ES": "📦 Metadatos PIM / DAM Exportados (Salsify, Syndigo, 1WorldSync)",
    "de-DE": "📦 PIM / DAM Metadaten exportiert (Salsify, Syndigo, 1WorldSync)",
    "fr-FR": "📦 Métadonnées PIM / DAM Exportées (Salsify, Syndigo, 1WorldSync)",
    "ja-JP": "📦 PIM / DAM メタデータをエクスポートしました (Salsify, Syndigo, 1WorldSync)",
    "zh-CN": "📦 PIM / DAM 元数据已导出 (Salsify, Syndigo, 1WorldSync)"
  },
  "synth.toast_enter_barcode": {
    "en-US": "Please enter barcode digits first",
    "hi-IN": "कृपया पहले बारकोड अंक दर्ज करें",
    "es-ES": "Ingrese primero los dígitos del código de barras",
    "de-DE": "Bitte zuerst Barcode-Ziffern eingeben",
    "fr-FR": "Veuillez d'abord saisir les chiffres du code-barres",
    "ja-JP": "最初にバーコードの数字を入力してください",
    "zh-CN": "请先输入条形码数字"
  },
  "synth.toast_check_digit_calc": {
    "en-US": "✓ Modulo-10 Check Digit Calculated: {digit}",
    "hi-IN": "✓ मोड्युलो-10 चेक अंक परिकलित: {digit}",
    "es-ES": "✓ Dígito de Control Módulo 10 Calculado: {digit}",
    "de-DE": "✓ Modulo-10 Prüfziffer berechnet: {digit}",
    "fr-FR": "✓ Chiffre de Contrôle Modulo-10 Calculé : {digit}",
    "ja-JP": "✓ Modulo-10 チェックディジット算出: {digit}",
    "zh-CN": "✓ 模 10 校验位已计算：{digit}"
  },
  "synth.toast_gepir_verified": {
    "en-US": "✓ GS1 Prefix & Checksum Verified: {org}",
    "hi-IN": "✓ GS1 उपसर्ग और चेकसम सत्यापित: {org}",
    "es-ES": "✓ Prefijo GS1 y Suma Verificados: {org}",
    "de-DE": "✓ GS1-Präfix & Prüfziffer verifiziert: {org}",
    "fr-FR": "✓ Préfixe GS1 & Somme de Contrôle Vérifiés : {org}",
    "ja-JP": "✓ GS1 プレフィックスとチェックサムを検証: {org}",
    "zh-CN": "✓ GS1 前缀与校验和验证成功：{org}"
  },
  "synth.toast_gepir_mismatch": {
    "en-US": "⚠ Checksum Mismatch for {gtin}",
    "hi-IN": "⚠ {gtin} के लिए चेकसम बेमेल",
    "es-ES": "⚠ Suma de Comprobación No Coincide para {gtin}",
    "de-DE": "⚠ Prüfziffer-Abweichung für {gtin}",
    "fr-FR": "⚠ Incohérence de Somme de Contrôle pour {gtin}",
    "ja-JP": "⚠ {gtin} のチェックサム不一致",
    "zh-CN": "⚠ {gtin} 的校验和不匹配"
  },

  // Dynamic Resolver
  "resolver.recall_active": {
    "en-US": "🚨 RECALL ACTIVE",
    "hi-IN": "🚨 रिकॉल सक्रिय",
    "es-ES": "🚨 RETIRADA ACTIVA",
    "de-DE": "🚨 RÜCKRUF AKTIV",
    "fr-FR": "🚨 RAPPEL ACTIF",
    "ja-JP": "🚨 リコール発令中",
    "zh-CN": "🚨 召回已激活"
  },
  "resolver.normal": {
    "en-US": "NORMAL",
    "hi-IN": "सामान्य",
    "es-ES": "NORMAL",
    "de-DE": "NORMAL",
    "fr-FR": "NORMAL",
    "ja-JP": "正常",
    "zh-CN": "正常状态"
  },
  "resolver.btn_deactivate": {
    "en-US": "Deactivate Recall",
    "hi-IN": "रिकॉल निष्क्रिय करें",
    "es-ES": "Desactivar Retirada",
    "de-DE": "Rückruf deaktivieren",
    "fr-FR": "Désactiver le Rappel",
    "ja-JP": "リコール解除",
    "zh-CN": "取消召回"
  },
  "resolver.btn_trigger": {
    "en-US": "🚨 Trigger Recall",
    "hi-IN": "🚨 रिकॉल ट्रिगर करें",
    "es-ES": "🚨 Activar Retirada",
    "de-DE": "🚨 Rückruf auslösen",
    "fr-FR": "🚨 Déclencher le Rappel",
    "ja-JP": "🚨 リコール発令",
    "zh-CN": "🚨 触发召回"
  },
  "resolver.geo_none": {
    "en-US": "None",
    "hi-IN": "कोई नहीं",
    "es-ES": "Ninguno",
    "de-DE": "Keine",
    "fr-FR": "Aucun",
    "ja-JP": "なし",
    "zh-CN": "无"
  },
  "resolver.lbl_status": {
    "en-US": "Resolution Status:",
    "hi-IN": "समाधान स्थिति:",
    "es-ES": "Estado de Resolución:",
    "de-DE": "Auflösungsstatus:",
    "fr-FR": "État de Résolution :",
    "ja-JP": "解決ステータス:",
    "zh-CN": "解析状态："
  },
  "resolver.lbl_target": {
    "en-US": "Target Redirect URL:",
    "hi-IN": "लक्ष्य पुनर्निर्देशन URL:",
    "es-ES": "URL de Redirección Destino:",
    "de-DE": "Ziel-Weiterleitungs-URL:",
    "fr-FR": "URL de Redirection Cible :",
    "ja-JP": "リダイレクト先URL:",
    "zh-CN": "目标重定向链接："
  },
  "resolver.toast_recall_activated": {
    "en-US": "🚨 Recall Kill-Switch Activated for {gtin}",
    "hi-IN": "🚨 {gtin} के लिए रिकॉल किल-स्विच सक्रिय किया गया",
    "es-ES": "🚨 Interruptor de Retirada Activado para {gtin}",
    "de-DE": "🚨 Rückruf-Notschalter aktiviert für {gtin}",
    "fr-FR": "🚨 Coupe-Circuit de Rappel Activé pour {gtin}",
    "ja-JP": "🚨 {gtin} のリコール停止スイッチが作動しました",
    "zh-CN": "🚨 已激活针对 {gtin} 的紧急召回阻断机制"
  },
  "resolver.toast_recall_deactivated": {
    "en-US": "Recall deactivated",
    "hi-IN": "रिकॉल निष्क्रिय किया गया",
    "es-ES": "Retirada desactivada",
    "de-DE": "Rückruf deaktiviert",
    "fr-FR": "Rappel désactivé",
    "ja-JP": "リコールを解除しました",
    "zh-CN": "召回状态已解除"
  },
  "resolver.toast_rule_removed": {
    "en-US": "Rule removed",
    "hi-IN": "नियम हटा दिया गया",
    "es-ES": "Regla eliminada",
    "de-DE": "Regel entfernt",
    "fr-FR": "Règle supprimée",
    "ja-JP": "ルールを削除しました",
    "zh-CN": "路由规则已移除"
  },
  "resolver.toast_rule_added": {
    "en-US": "✓ Added Route Rule for {gtin}",
    "hi-IN": "✓ {gtin} के लिए रूट नियम जोड़ा गया",
    "es-ES": "✓ Regla de Ruta Añadida para {gtin}",
    "de-DE": "✓ Routenregel für {gtin} hinzugefügt",
    "fr-FR": "✓ Règle de Routage Ajoutée pour {gtin}",
    "ja-JP": "✓ {gtin} のルーティングルールを追加しました",
    "zh-CN": "✓ 已为 {gtin} 添加路由重定向规则"
  },

  // Optical Scanner & Dewarp
  "scanner.camera_streaming": {
    "en-US": "CAMERA STREAMING",
    "hi-IN": "कैमरा स्ट्रीमिंग",
    "es-ES": "CÁMARA TRANSMITIENDO",
    "de-DE": "KAMERA AKTIV",
    "fr-FR": "CAMÉRA EN DIRECT",
    "ja-JP": "カメラストリーミング中",
    "zh-CN": "摄像头正在传输"
  },
  "scanner.camera_unavailable": {
    "en-US": "CAMERA UNAVAILABLE",
    "hi-IN": "कैमरा अनुपलब्ध",
    "es-ES": "CÁMARA NO DISPONIBLE",
    "de-DE": "KAMERA NICHT VERFÜGBAR",
    "fr-FR": "CAMÉRA INDISPONIBLE",
    "ja-JP": "カメラ利用不可",
    "zh-CN": "摄像头不可用"
  },
  "scanner.barcode_detected": {
    "en-US": "BARCODE DETECTED",
    "hi-IN": "बारकोड पहचाना गया",
    "es-ES": "CÓDIGO DETECTADO",
    "de-DE": "BARCODE ERKANNT",
    "fr-FR": "CODE-BARRES DÉTECTÉ",
    "ja-JP": "バーコード検出",
    "zh-CN": "已识别条码"
  },
  "scanner.lbl_format": {
    "en-US": "Format:",
    "hi-IN": "प्रारूप:",
    "es-ES": "Formato:",
    "de-DE": "Format:",
    "fr-FR": "Format :",
    "ja-JP": "フォーマット:",
    "zh-CN": "格式："
  },
  "scanner.lbl_decoded": {
    "en-US": "Decoded Value:",
    "hi-IN": "डिकोड किया गया मान:",
    "es-ES": "Valor Decodificado:",
    "de-DE": "Dekodierter Wert:",
    "fr-FR": "Valeur Décodée :",
    "ja-JP": "復号値:",
    "zh-CN": "解码数值："
  },
  "scanner.gs1_validated": {
    "en-US": "[GS1 DIGITAL LINK VALIDATED] GTIN: {gtin}",
    "hi-IN": "[GS1 डिजिटल लिंक सत्यापित] GTIN: {gtin}",
    "es-ES": "[GS1 DIGITAL LINK VALIDADO] GTIN: {gtin}",
    "de-DE": "[GS1 DIGITAL LINK VALIDIERUNG ERFOLGREICH] GTIN: {gtin}",
    "fr-FR": "[GS1 DIGITAL LINK VALIDÉ] GTIN : {gtin}",
    "ja-JP": "[GS1 デジタルリンク検証済み] GTIN: {gtin}",
    "zh-CN": "[GS1 数字链接校验通过] GTIN: {gtin}"
  },
  "scanner.scan_successful": {
    "en-US": "✓ Optical Scan Successful:",
    "hi-IN": "✓ ऑप्टिकल स्कैन सफल:",
    "es-ES": "✓ Escaneo Óptico Exitoso:",
    "de-DE": "✓ Optischer Scan erfolgreich:",
    "fr-FR": "✓ Scan Optique Réussi :",
    "ja-JP": "✓ 光学スキャン成功:",
    "zh-CN": "✓ 光学扫描成功："
  },
  "scanner.scanned_photo": {
    "en-US": "Scanned packaging photo: {name} ({width}x{height})",
    "hi-IN": "स्कैन किया गया पैकेजिंग फोटो: {name} ({width}x{height})",
    "es-ES": "Foto de empaque escaneada: {name} ({width}x{height})",
    "de-DE": "Gescannte Verpackungsaufnahme: {name} ({width}x{height})",
    "fr-FR": "Photo d'emballage scannée : {name} ({width}x{height})",
    "ja-JP": "スキャンしたパッケージ画像: {name} ({width}x{height})",
    "zh-CN": "扫描包装图像：{name} ({width}x{height})"
  },
  "scanner.btn_transfer": {
    "en-US": "⚡ Transfer {value} to Tab 1 (Dual-Code Synth)",
    "hi-IN": "⚡ टैब 1 (ड्यूल-कोड सिंथ) में {value} स्थानांतरित करें",
    "es-ES": "⚡ Transferir {value} a Pestaña 1 (Sintetizador)",
    "de-DE": "⚡ {value} in Tab 1 (Generator) übertragen",
    "fr-FR": "⚡ Transférer {value} vers l'Onglet 1 (Synthèse)",
    "ja-JP": "⚡ {value} をタブ1 (生成) に転送",
    "zh-CN": "⚡ 将 {value} 传输至标签页 1 (合成制版)"
  },
  "scanner.toast_transferred": {
    "en-US": "⚡ Barcode {value} transferred to Dual-Code Synthesizer!",
    "hi-IN": "⚡ बारकोड {value} ड्यूल-कोड सिंथेसाइज़र में स्थानांतरित!",
    "es-ES": "⚡ ¡Código de barras {value} transferido al sintetizador!",
    "de-DE": "⚡ Barcode {value} in Dual-Code-Generator übertragen!",
    "fr-FR": "⚡ Code-barres {value} transféré vers le synthétiseur !",
    "ja-JP": "⚡ バーコード {value} をデュアルコード生成ツールに転送しました！",
    "zh-CN": "⚡ 条码 {value} 已同步至双码合成器！"
  },
  "scanner.toast_camera_denied": {
    "en-US": "Camera access unavailable (Check permissions)",
    "hi-IN": "कैमरा एक्सेस अनुपलब्ध (अनुमतियाँ जांचें)",
    "es-ES": "Acceso a la cámara no disponible (Verifique los permisos)",
    "de-DE": "Kamerazugriff nicht verfügbar (Berechtigungen prüfen)",
    "fr-FR": "Accès caméra indisponible (Vérifiez les permissions)",
    "ja-JP": "カメラにアクセスできません (権限を確認してください)",
    "zh-CN": "无法访问摄像头（请检查系统权限）"
  },

  // FSMA 204 Table
  "fsma.badge_unsigned": {
    "en-US": "Unsigned",
    "hi-IN": "अहस्ताक्षरित",
    "es-ES": "Sin Firmar",
    "de-DE": "Unsigniert",
    "fr-FR": "Non Signé",
    "ja-JP": "未署名",
    "zh-CN": "未签名"
  },
  "fsma.btn_pdf": {
    "en-US": "📄 PDF Dossier",
    "hi-IN": "📄 PDF डोजियर",
    "es-ES": "📄 Expediente PDF",
    "de-DE": "📄 PDF-Dossier",
    "fr-FR": "📄 Dossier PDF",
    "ja-JP": "📄 PDF報告書",
    "zh-CN": "📄 PDF 档案"
  },
  "fsma.btn_share": {
    "en-US": "📤 Share",
    "hi-IN": "📤 साझा करें",
    "es-ES": "📤 Compartir",
    "de-DE": "📤 Teilen",
    "fr-FR": "📤 Partager",
    "ja-JP": "📤 共有"
    ,"zh-CN": "📤 分享"
  },

  // Audio & Theme Toasts
  "toast.audio_muted": {
    "en-US": "Audio feedback muted",
    "hi-IN": "ऑडियो फीडबैक म्यूट किया गया",
    "es-ES": "Respuesta de audio silenciada",
    "de-DE": "Audio-Feedback stummgeschaltet",
    "fr-FR": "Retour audio mis en sourdine",
    "ja-JP": "音声フィードバックをミュートしました",
    "zh-CN": "操作音效已静音"
  },
  "toast.audio_enabled": {
    "en-US": "Audio feedback enabled",
    "hi-IN": "ऑडियो फीडबैक सक्षम किया गया",
    "es-ES": "Respuesta de audio activada",
    "de-DE": "Audio-Feedback aktiviert",
    "fr-FR": "Retour audio activé",
    "ja-JP": "音声フィードバックを有効にしました",
    "zh-CN": "操作音效已启用"
  },
  "toast.theme_clean_room": {
    "en-US": "Clean Room Light Theme",
    "hi-IN": "क्लीन रूम लाइट थीम",
    "es-ES": "Tema Claro Sala Limpia",
    "de-DE": "Reinraum Helles Design",
    "fr-FR": "Thème Clair Salle Blanche",
    "ja-JP": "クリーンルーム ライトテーマ",
    "zh-CN": "洁净车间浅色主题"
  },
  "toast.theme_obsidian": {
    "en-US": "Industrial Obsidian Theme",
    "hi-IN": "औद्योगिक ओब्सीडियन थीम",
    "es-ES": "Tema Obsidiana Industrial",
    "de-DE": "Industrielles Obsidian-Design",
    "fr-FR": "Thème Obsidienne Industrielle",
    "ja-JP": "工業用 オブシディアンテーマ" ,
    "zh-CN": "工业曜石深色主题"
  },
  "toast.theme_outdoor": {
    "en-US": "High-Contrast Outdoor Theme",
    "hi-IN": "उच्च-कंट्रास्ट आउटडोर थीम",
    "es-ES": "Tema Exterior de Alto Contraste",
    "de-DE": "Kontrastreiches Außendesign",
    "fr-FR": "Thème Extérieur à Fort Contraste",
    "ja-JP": "高コントラスト 屋外テーマ",
    "zh-CN": "高对比度户外采光主题"
  },
  "toast.theme_standard": {
    "en-US": "Standard Dark Theme",
    "hi-IN": "मानक डार्क थीम",
    "es-ES": "Tema Oscuro Estándar",
    "de-DE": "Standard Dunkles Design",
    "fr-FR": "Thème Sombre Standard",
    "ja-JP": "標準ダークテーマ",
    "zh-CN": "标准深色主题"
  }
};

// Injection into build_all_translations.mjs
const builderFile = 'tools/build_all_translations.mjs';
let content = fs.readFileSync(builderFile, 'utf8');

// Insert new keys before the closing brace of D
// In build_all_translations.mjs: "const D = {" starts at line 7
// Find the end of D: "};\n\n// Generate complete JSON" or similar
const endDIndex = content.indexOf('};\n\n// Check parity');
if (endDIndex === -1) {
  console.error("Could not find end of object D in build_all_translations.mjs");
  process.exit(1);
}

// Convert NEW_DUALMARK_KEYS into formatted JS object entries
let additions = '\n  // --- Enriched Localization Keys (Automated Injection) ---\n';
for (const [key, locMap] of Object.entries(NEW_DUALMARK_KEYS)) {
  additions += `  "${key}": {\n`;
  const entries = Object.entries(locMap);
  entries.forEach(([loc, str], i) => {
    const comma = (i < entries.length - 1) ? ',' : '';
    additions += `    "${loc}": ${JSON.stringify(str)}${comma}\n`;
  });
  additions += '  },\n';
}

content = content.slice(0, endDIndex) + additions + content.slice(endDIndex);
fs.writeFileSync(builderFile, content, 'utf8');
console.log(`Successfully injected ${Object.keys(NEW_DUALMARK_KEYS).length} new keys into ${builderFile}!`);
