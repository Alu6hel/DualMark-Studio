import fs from 'fs';

// Full locales
const LOCALES = ["en-US", "hi-IN", "es-ES", "de-DE", "fr-FR", "ja-JP", "zh-CN"];

// Complete Master Dictionary
const D = {
  // App & Header
  "app.title": {
    "en-US": "DualMark Studio",
    "hi-IN": "ड्यूल-मार्क स्टूडियो",
    "es-ES": "DualMark Studio",
    "de-DE": "DualMark Studio",
    "fr-FR": "DualMark Studio",
    "ja-JP": "デュアルマーク・スタジオ",
    "zh-CN": "双码制版工作室 (DualMark Studio)"
  },
  "app.subtitle": {
    "en-US": "Packaging Pre-Flight & Field Traceability",
    "hi-IN": "पैकेजिंग प्री-फ्लाइट एवं फील्ड ट्रेसिबिलिटी",
    "es-ES": "Preimpresión de Empaques y Trazabilidad en Campo",
    "de-DE": "Druckvorstufe für Verpackungen & Feld-Rückverfolgbarkeit",
    "fr-FR": "Prépresse Emballage & Traçabilité Terrain",
    "ja-JP": "パッケージ製版プリフライト＆現場トレーサビリティ",
    "zh-CN": "包装印前制版预检与现场溯源"
  },
  "brand.badge_sunrise": {
    "en-US": "SUNRISE 2027",
    "hi-IN": "सनराइज 2027",
    "es-ES": "SUNRISE 2027",
    "de-DE": "SUNRISE 2027",
    "fr-FR": "SUNRISE 2027",
    "ja-JP": "SUNRISE 2027",
    "zh-CN": "日出计划 2027"
  },
  "badge.free": {
    "en-US": "FREE",
    "hi-IN": "निःशुल्क",
    "es-ES": "GRATIS",
    "de-DE": "GRATIS",
    "fr-FR": "GRATUIT",
    "ja-JP": "無料版",
    "zh-CN": "免费版"
  },
  "badge.pro": {
    "en-US": "PRO",
    "hi-IN": "प्रो",
    "es-ES": "PRO",
    "de-DE": "PRO",
    "fr-FR": "PRO",
    "ja-JP": "PRO",
    "zh-CN": "专业版"
  },
  "badge.enterprise": {
    "en-US": "ENTERPRISE",
    "hi-IN": "एंटरप्राइज",
    "es-ES": "EMPRESA",
    "de-DE": "ENTERPRISE",
    "fr-FR": "ENTREPRISE",
    "ja-JP": "エンタープライズ",
    "zh-CN": "企业版"
  },
  "header.tooltip_mascot": {
    "en-US": "Marky — DualMark AI Assistant (Click for Status)",
    "hi-IN": "मार्की — ड्यूलमार्क एआई सहायक (स्थिति देखने के लिए क्लिक करें)",
    "es-ES": "Marky — Asistente IA de DualMark (Clic para ver estado)",
    "de-DE": "Marky — DualMark KI-Assistent (Klicken für Status)",
    "fr-FR": "Marky — Assistant IA DualMark (Cliquez pour l'état)",
    "ja-JP": "Marky — DualMark AIアシスタント（ステータス表示）",
    "zh-CN": "Marky — DualMark AI助手（点击查看状态）"
  },
  "header.tooltip_tour": {
    "en-US": "Interactive Guided Tour",
    "hi-IN": "इंटरएक्टिव निर्देशित दौरा",
    "es-ES": "Guía Interactiva",
    "de-DE": "Interaktive Führung",
    "fr-FR": "Visite Guidée Interactive",
    "ja-JP": "機能ガイドツアー",
    "zh-CN": "交互式功能导览"
  },
  "header.tooltip_settings": {
    "en-US": "Workstation Settings & Controls",
    "hi-IN": "कार्यक्षेत्र सेटिंग्स एवं नियंत्रण",
    "es-ES": "Configuración y Controles de la Estación",
    "de-DE": "Arbeitsplatz-Einstellungen & Steuerung",
    "fr-FR": "Paramètres & Contrôles du Poste",
    "ja-JP": "ワークステーション設定と操作",
    "zh-CN": "工作站系统设置与控制"
  },

  // Bottom Nav
  "nav.synth": {
    "en-US": "Synth",
    "hi-IN": "सिंथ",
    "es-ES": "Sintetizador",
    "de-DE": "Generator",
    "fr-FR": "Synthèse",
    "ja-JP": "生成",
    "zh-CN": "合成制版"
  },
  "nav.clearance": {
    "en-US": "50mm",
    "hi-IN": "50मिमी",
    "es-ES": "50mm",
    "de-DE": "50mm",
    "fr-FR": "50mm",
    "ja-JP": "50mm",
    "zh-CN": "50毫米"
  },
  "nav.resolver": {
    "en-US": "Resolver",
    "hi-IN": "रिज़ॉल्वर",
    "es-ES": "Resolutor",
    "de-DE": "Resolver",
    "fr-FR": "Résolveur",
    "ja-JP": "リゾルバ",
    "zh-CN": "解析器"
  },
  "nav.scanner": {
    "en-US": "Scanner",
    "hi-IN": "स्कैनर",
    "es-ES": "Escáner",
    "de-DE": "Scanner",
    "fr-FR": "Scanner",
    "ja-JP": "スキャナ",
    "zh-CN": "扫描仪"
  },
  "nav.fsma": {
    "en-US": "FSMA 204",
    "hi-IN": "एफएसएमए 204",
    "es-ES": "FSMA 204",
    "de-DE": "FSMA 204",
    "fr-FR": "FSMA 204",
    "ja-JP": "FSMA 204",
    "zh-CN": "FSMA 204"
  },
  "nav.exports": {
    "en-US": "Exports",
    "hi-IN": "निर्यात",
    "es-ES": "Exportar",
    "de-DE": "Exporte",
    "fr-FR": "Exports",
    "ja-JP": "出力",
    "zh-CN": "工业导出"
  },

  // Settings
  "settings.title": {
    "en-US": "Workstation Settings",
    "hi-IN": "कार्यक्षेत्र सेटिंग्स",
    "es-ES": "Configuración de la Estación",
    "de-DE": "Arbeitsplatz-Einstellungen",
    "fr-FR": "Paramètres du Poste de Travail",
    "ja-JP": "ワークステーション設定",
    "zh-CN": "工作站系统设置"
  },
  "settings.sub": {
    "en-US": "Environment, Audio & Legal Controls",
    "hi-IN": "पर्यावरण, ऑडियो एवं विनियामक नियंत्रण",
    "es-ES": "Entorno, Audio y Controles Legales",
    "de-DE": "Umgebungs-, Audio- & Rechtskontrollen",
    "fr-FR": "Environnement, Audio & Contrôles Légaux",
    "ja-JP": "動作環境・音声・コンプライアンス管理",
    "zh-CN": "运行环境、声效及合规性控制"
  },
  "settings.language_label": {
    "en-US": "Display Language (i18n)",
    "hi-IN": "प्रदर्शन भाषा (i18n)",
    "es-ES": "Idioma de Visualización (i18n)",
    "de-DE": "Anzeigesprache (i18n)",
    "fr-FR": "Langue d'Affichage (i18n)",
    "ja-JP": "表示言語 (i18n)",
    "zh-CN": "界面显示语言 (i18n)"
  },
  "settings.mascot_title": {
    "en-US": "Header Mascot & Companion",
    "hi-IN": "हेडर शुभंकर एवं साथी सहायक",
    "es-ES": "Mascota y Compañero de Encabezado",
    "de-DE": "Kopfzeilen-Maskottchen & Begleiter",
    "fr-FR": "Mascotte et Compagnon d'En-tête",
    "ja-JP": "ヘッダーマスコット＆AIアシスタント",
    "zh-CN": "标题栏吉祥物与AI助手"
  },
  "settings.mascot_desc": {
    "en-US": "Choose your real-time vector assistant persona displayed in the header.",
    "hi-IN": "हेडर में प्रदर्शित अपना सक्रिय वेक्टर सहायक व्यक्तित्व चुनें।",
    "es-ES": "Elija la personalidad de su asistente vectorial en el encabezado.",
    "de-DE": "Wählen Sie Ihren vektoriellen Echtzeit-Assistenten für die Kopfzeile.",
    "fr-FR": "Choisissez la personnalité de votre assistant vectoriel dans l'en-tête.",
    "ja-JP": "ヘッダーに表示されるベクターAIアシスタントを選択します。",
    "zh-CN": "选择在标题栏显示的实时矢量助手形象与风格。"
  },
  "settings.mascot_status_active": {
    "en-US": "Active",
    "hi-IN": "सक्रिय",
    "es-ES": "Activo",
    "de-DE": "Aktiv",
    "fr-FR": "Actif",
    "ja-JP": "有効",
    "zh-CN": "运行中"
  },
  "settings.mascot_opt_marky": {
    "en-US": "🤖 Marky Bot (Cybernetic Assistant)",
    "hi-IN": "🤖 मार्की बॉट (साइबरनेटिक सहायक)",
    "es-ES": "🤖 Marky Bot (Asistente Cibernético)",
    "de-DE": "🤖 Marky Bot (Kybernetischer Assistent)",
    "fr-FR": "🤖 Robot Marky (Assistant Cybernétique)",
    "ja-JP": "🤖 マーキーボット (サイバネティック)",
    "zh-CN": "🤖 Marky 机器人 (智能机械助手)"
  },
  "settings.mascot_opt_reticle": {
    "en-US": "🎯 Optical Reticle HUD",
    "hi-IN": "🎯 ऑप्टिकल रेटिकल एचयूडी",
    "es-ES": "🎯 Retícula Óptica HUD",
    "de-DE": "🎯 Optisches Fadenkreuz-HUD",
    "fr-FR": "🎯 Réticule Optique HUD",
    "ja-JP": "🎯 光学レティクルHUD",
    "zh-CN": "🎯 光学瞄准准星 HUD"
  },
  "settings.mascot_opt_pulse": {
    "en-US": "💡 Cleanroom Status LED",
    "hi-IN": "💡 क्लीनरूम स्थिति एलईडी",
    "es-ES": "💡 LED de Estado de Sala Limpia",
    "de-DE": "💡 Reinraum-Status-LED",
    "fr-FR": "💡 LED d'État Salle Blanche",
    "ja-JP": "💡 クリーンルーム状態LED",
    "zh-CN": "💡 洁净车间状态指示灯"
  },
  "settings.mascot_opt_specialist": {
    "en-US": "👷 Packaging Specialist",
    "hi-IN": "👷 पैकेजिंग विशेषज्ञ (इंजीनियर)",
    "es-ES": "👷 Especialista en Empaque",
    "de-DE": "👷 Verpackungsspezialist",
    "fr-FR": "👷 Spécialiste Emballage",
    "ja-JP": "👷 包装エンジニア",
    "zh-CN": "👷 包装工程技术专家"
  },
  "settings.mascot_opt_off": {
    "en-US": "🚫 Disabled (Minimalist)",
    "hi-IN": "🚫 अक्षम (न्यूनतम मोड)",
    "es-ES": "🚫 Desactivado (Minimalista)",
    "de-DE": "🚫 Deaktiviert (Minimalistisch)",
    "fr-FR": "🚫 Désactivé (Minimaliste)",
    "ja-JP": "🚫 非表示 (ミニマリスト)",
    "zh-CN": "🚫 停用吉祥物 (极简模式)"
  },
  "settings.environment_title": {
    "en-US": "Environment & Audio",
    "hi-IN": "पर्यावरण एवं थीम",
    "es-ES": "Entorno y Audio",
    "de-DE": "Umgebung & Audio",
    "fr-FR": "Environnement & Audio",
    "ja-JP": "環境とサウンド",
    "zh-CN": "运行环境与声效反馈"
  },
  "settings.theme_obsidian": {
    "en-US": "🌌 Industrial Obsidian (Standard Dark)",
    "hi-IN": "🌌 औद्योगिक ओब्सीडियन (मानक डार्क)",
    "es-ES": "🌌 Obsidiana Industrial (Oscuro Estándar)",
    "de-DE": "🌌 Industrielles Obsidian (Standard Dunkel)",
    "fr-FR": "🌌 Obsidienne Industrielle (Sombre Standard)",
    "ja-JP": "🌌 インダストリアル・オブシディアン (ダーク標準)",
    "zh-CN": "🌌 工业黑曜石深色主题 (标准深色)"
  },
  "settings.theme_mascot_amber_opt": {
    "en-US": "🦺 Mascot Safety Amber (Engineer Hardhat)",
    "hi-IN": "🦺 सुरक्षा एम्बर (इंजीनियर सुरक्षा हेलमेट)",
    "es-ES": "🦺 Ámbar de Seguridad (Casco de Ingeniero)",
    "de-DE": "🦺 Sicherheits-Bernstein (Schutzhelm)",
    "fr-FR": "🦺 Ambre Sécurité (Casque Ingénieur)",
    "ja-JP": "🦺 セーフティ・アンバー (安全ヘルメット)",
    "zh-CN": "🦺 安全警示琥珀黄 (工程安全帽配色)"
  },
  "settings.theme_mascot_cyber_opt": {
    "en-US": "🥽 Mascot Cyber Visor (Holographic HUD)",
    "hi-IN": "🥽 साइबर वाइज़र (होलोग्राफिक एचयूडी)",
    "es-ES": "🥽 Visor Cibernético (HUD Holográfico)",
    "de-DE": "🥽 Cyber-Visier (Holografisches HUD)",
    "fr-FR": "🥽 Cyber Visière (HUD Holographique)",
    "ja-JP": "🥽 サイバーバイザー (ホログラフィックHUD)",
    "zh-CN": "🥽 赛博视镜极客青 (全息HUD配色)"
  },
  "settings.theme_light_opt": {
    "en-US": "🌓 Clean Room (Light Mode)",
    "hi-IN": "🌓 क्लीन रूम (लाइट मोड)",
    "es-ES": "🌓 Sala Limpia (Modo Claro)",
    "de-DE": "🌓 Reinraum (Heller Modus)",
    "fr-FR": "🌓 Salle Blanche (Mode Clair)",
    "ja-JP": "🌓 クリーンルーム (ライトモード)",
    "zh-CN": "🌓 洁净室高亮浅色主题 (明亮模式)"
  },
  "settings.theme_outdoor_opt": {
    "en-US": "☀️ High-Contrast Dock (Outdoor)",
    "hi-IN": "☀️ आउटडोर उच्च-कंट्रास्ट डॉक मोड",
    "es-ES": "☀️ Muelle de Alto Contraste (Exterior)",
    "de-DE": "☀️ Kontrastreicher Ladebereich (Außenbereich)",
    "fr-FR": "☀️ Quai Haute Contraste (Extérieur)",
    "ja-JP": "☀️ 高コントラスト・屋外ドックモード",
    "zh-CN": "☀️ 户外货台高对比度模式 (强光环境)"
  },
  "settings.theme_mascot_amber": {
    "en-US": "Mascot Safety Amber",
    "hi-IN": "शुभंकर सुरक्षा एम्बर",
    "es-ES": "Mascota Ámbar de Seguridad",
    "de-DE": "Sicherheits-Bernstein Thema",
    "fr-FR": "Ambre Sécurité Mascotte",
    "ja-JP": "セーフティ・アンバー",
    "zh-CN": "安全警示琥珀黄主题"
  },
  "settings.theme_mascot_cyber": {
    "en-US": "Mascot Cyber Visor",
    "hi-IN": "शुभंकर साइबर वाइज़र",
    "es-ES": "Mascota Visor Cibernético",
    "de-DE": "Cyber-Visier Thema",
    "fr-FR": "Cyber Visière Mascotte",
    "ja-JP": "サイバーバイザー",
    "zh-CN": "赛博全息视镜主题"
  },
  "settings.theme_toggle": {
    "en-US": "Clean Room Theme (Light / Dark)",
    "hi-IN": "क्लीन रूम थीम (लाइट / डार्क)",
    "es-ES": "Tema de Sala Limpia (Claro / Oscuro)",
    "de-DE": "Reinraum-Design (Hell / Dunkel)",
    "fr-FR": "Thème Salle Blanche (Clair / Sombre)",
    "ja-JP": "クリーンルームテーマ (ライト/ダーク)",
    "zh-CN": "洁净室主题切换 (浅色/深色)"
  },
  "settings.outdoor_toggle": {
    "en-US": "Outdoor High-Contrast Dock Mode",
    "hi-IN": "आउटडोर उच्च-कंट्रास्ट डॉक मोड",
    "es-ES": "Modo Exterior de Alto Contraste",
    "de-DE": "Kontrastreicher Außenmodus",
    "fr-FR": "Mode Quai Haute Contraste Extérieur",
    "ja-JP": "屋外高コントラスト・ドックモード",
    "zh-CN": "室外装卸区高对比度模式"
  },
  "settings.audio_toggle": {
    "en-US": "Tactile Audio Feedback",
    "hi-IN": "स्पर्श ऑडियो फीडबैक",
    "es-ES": "Retroalimentación de Audio Táctil",
    "de-DE": "Taktiles Audio-Feedback",
    "fr-FR": "Retour Audio Tactile",
    "ja-JP": "操作サウンドフィードバック",
    "zh-CN": "触控操作声效反馈"
  },
  "settings.regulatory_title": {
    "en-US": "System & Regulatory",
    "hi-IN": "प्रणाली एवं विनियामक",
    "es-ES": "Sistema y Regulaciones",
    "de-DE": "System & Regulatorik",
    "fr-FR": "Système & Réglementation",
    "ja-JP": "システムと法規制情報",
    "zh-CN": "系统与行业合规许可"
  },
  "settings.btn_licensing": {
    "en-US": "Commercial Licensing & Editions",
    "hi-IN": "व्यावसायिक लाइसेंसिंग एवं संस्करण",
    "es-ES": "Licencias Comerciales y Ediciones",
    "de-DE": "Kommerzielle Lizenzierung & Editionen",
    "fr-FR": "Licences Commerciales & Éditions",
    "ja-JP": "商用ライセンス＆エディション",
    "zh-CN": "商业授权许可与版本管理"
  },
  "settings.btn_diagnostics": {
    "en-US": "Export System Diagnostics",
    "hi-IN": "सिस्टम डायग्नोस्टिक्स निर्यात करें",
    "es-ES": "Exportar Diagnóstico del Sistema",
    "de-DE": "Systemdiagnose Exportieren",
    "fr-FR": "Exporter Diagnostics Système",
    "ja-JP": "システム診断レポート出力",
    "zh-CN": "导出工作站诊断日志"
  },
  "settings.btn_legal": {
    "en-US": "GS1 & FDA Part 11 Disclaimers",
    "hi-IN": "जीएस1 एवं एफडीए पार्ट 11 अस्वीकरण",
    "es-ES": "Descargos de Responsabilidad GS1 y FDA Parte 11",
    "de-DE": "GS1 & FDA Part 11 Haftungsausschluss",
    "fr-FR": "Avis de Non-Responsabilité GS1 et FDA Part 11",
    "ja-JP": "GS1＆FDA Part 11 免責事項",
    "zh-CN": "GS1商标与FDA Part 11法律声明"
  },

  // TAB 1: SYNTH
  "synth.presets_tag": {
    "en-US": "1-Click Industry Presets",
    "hi-IN": "1-क्लिक उद्योग प्रीसेट",
    "es-ES": "Preajustes de la Industria a 1-Clic",
    "de-DE": "1-Klick Industrieprofile",
    "fr-FR": "Profils Industriels en 1 Clic",
    "ja-JP": "1クリック業界プリセット",
    "zh-CN": "一键行业预设模版"
  },
  "synth.presets_sub": {
    "en-US": "• Instant Packaging Profiles",
    "hi-IN": "• त्वरित पैकेजिंग प्रोफाइल",
    "es-ES": "• Perfiles Inmediatos de Empaque",
    "de-DE": "• Sofortige Verpackungsprofile",
    "fr-FR": "• Profils d'Emballage Instantanés",
    "ja-JP": "• 即時パッケージ設定",
    "zh-CN": "• 预置包装参数配置"
  },
  "synth.preset_juice": {
    "en-US": "Cold-Pressed Juice",
    "hi-IN": "कोल्ड-प्रेस्ड जूस",
    "es-ES": "Jugo Prensado en Frío",
    "de-DE": "Kaltgepresster Saft",
    "fr-FR": "Jus Pressé à Froid",
    "ja-JP": "コールドプレスジュース",
    "zh-CN": "冷压果汁 (零售瓶装)"
  },
  "synth.preset_pharma": {
    "en-US": "Pharma Blister",
    "hi-IN": "फार्मा ब्लिस्टर",
    "es-ES": "Blíster Farmacéutico",
    "de-DE": "Pharma-Blisterpackung",
    "fr-FR": "Blister Pharmaceutique",
    "ja-JP": "医薬品PTPシート",
    "zh-CN": "医药泡罩包装 (DSCSA)"
  },
  "synth.preset_shipper": {
    "en-US": "Master Shipper",
    "hi-IN": "मास्टर शिपर",
    "es-ES": "Caja Maestra de Envío",
    "de-DE": "Versand-Umkarton",
    "fr-FR": "Carton d'Expédition",
    "ja-JP": "外装段ボール箱",
    "zh-CN": "主运输外箱 (瓦楞纸箱)"
  },
  "synth.preset_produce": {
    "en-US": "Fresh Produce",
    "hi-IN": "ताज़ी उपज (फल/सब्जियां)",
    "es-ES": "Productos Frescos",
    "de-DE": "Frische Erzeugnisse",
    "fr-FR": "Produits Frais",
    "ja-JP": "生鮮農産品",
    "zh-CN": "新鲜农产品 (果蔬)"
  },
  "synth.preset_seafood": {
    "en-US": "Frozen Seafood",
    "hi-IN": "फ्रोजन सीफ़ूड",
    "es-ES": "Mariscos Congelados",
    "de-DE": "Gefrorene Meeresfrüchte",
    "fr-FR": "Fruits de Mer Surgelés",
    "ja-JP": "冷凍水産品",
    "zh-CN": "冷冻水产品 (海鲜)"
  },
  "synth.preset_dairy": {
    "en-US": "Dairy / Beverage",
    "hi-IN": "डेयरी / पेय",
    "es-ES": "Lácteos y Bebidas",
    "de-DE": "Milchprodukte & Getränke",
    "fr-FR": "Produits Laitiers / Boissons",
    "ja-JP": "乳製品・飲料",
    "zh-CN": "乳制品与饮料"
  },
  "synth.proof_title": {
    "en-US": "Dual-Code Packaging Proof",
    "hi-IN": "ड्यूल-कोड पैकेजिंग प्रूफ",
    "es-ES": "Prueba de Empaque de Código Dual",
    "de-DE": "Dual-Code Verpackungsnachweis",
    "fr-FR": "Épreuve d'Emballage Double Code",
    "ja-JP": "デュアルコード製版校正",
    "zh-CN": "双码制版实时打样验证"
  },
  "synth.proof_sub": {
    "en-US": "Legacy POS & Sunrise 2027",
    "hi-IN": "पारंपरिक पीओएस एवं सनराइज 2027",
    "es-ES": "POS Tradicional y Sunrise 2027",
    "de-DE": "Klassisches POS & Sunrise 2027",
    "fr-FR": "Caisse Classique & Sunrise 2027",
    "ja-JP": "従来POSレジ＆Sunrise 2027共存",
    "zh-CN": "传统POS收银与日出计划2027并存"
  },
  "synth.proof_1d_title": {
    "en-US": "1D POS Barcode",
    "hi-IN": "1डी पीओएस बारकोड",
    "es-ES": "Código de Barras 1D POS",
    "de-DE": "1D POS-Barcode",
    "fr-FR": "Code-barres 1D POS",
    "ja-JP": "1D POSバーコード",
    "zh-CN": "一维 POS收银条码"
  },
  "synth.proof_2d_title": {
    "en-US": "2D GS1 Matrix",
    "hi-IN": "2डी जीएस1 मैट्रिक्स",
    "es-ES": "Matriz 2D GS1",
    "de-DE": "2D GS1-Matrix",
    "fr-FR": "Matrice 2D GS1",
    "ja-JP": "2D GS1マトリックス",
    "zh-CN": "二维 GS1数字矩阵码"
  },
  "synth.btn_master_bundle": {
    "en-US": "🚀 Master Bundle",
    "hi-IN": "🚀 मास्टर बंडल",
    "es-ES": "🚀 Paquete Maestro",
    "de-DE": "🚀 Master-Paket",
    "fr-FR": "🚀 Lot Maître",
    "ja-JP": "🚀 マスター一括",
    "zh-CN": "🚀 一键总打包"
  },
  "synth.btn_1d_svg": {
    "en-US": "💾 1D SVG",
    "hi-IN": "💾 1डी एसवीजी",
    "es-ES": "💾 1D SVG",
    "de-DE": "💾 1D SVG",
    "fr-FR": "💾 1D SVG",
    "ja-JP": "💾 1D SVG",
    "zh-CN": "💾 1D SVG"
  },
  "synth.btn_1d_png": {
    "en-US": "🖼️ 1D PNG",
    "hi-IN": "🖼️ 1डी पीएनजी",
    "es-ES": "🖼️ 1D PNG",
    "de-DE": "🖼️ 1D PNG",
    "fr-FR": "🖼️ 1D PNG",
    "ja-JP": "🖼️ 1D PNG",
    "zh-CN": "🖼️ 1D PNG"
  },
  "synth.btn_2d_svg": {
    "en-US": "💾 2D SVG",
    "hi-IN": "💾 2डी एसवीजी",
    "es-ES": "💾 2D SVG",
    "de-DE": "💾 2D SVG",
    "fr-FR": "💾 2D SVG",
    "ja-JP": "💾 2D SVG",
    "zh-CN": "💾 2D SVG"
  },
  "synth.btn_2d_copy": {
    "en-US": "📋 Copy URI",
    "hi-IN": "📋 यूआरआई कॉपी करें",
    "es-ES": "📋 Copiar URI",
    "de-DE": "📋 URI kopieren",
    "fr-FR": "📋 Copier l'URI",
    "ja-JP": "📋 URIコピー",
    "zh-CN": "📋 复制链接"
  },
  "synth.btn_gs1_audit": {
    "en-US": "✓ GS1 Audit",
    "hi-IN": "✓ जीएस1 ऑडिट",
    "es-ES": "✓ Auditoría GS1",
    "de-DE": "✓ GS1-Audit",
    "fr-FR": "✓ Audit GS1",
    "ja-JP": "✓ GS1監査",
    "zh-CN": "✓ GS1合规审计"
  },
  "synth.btn_pim": {
    "en-US": "📦 PIM",
    "hi-IN": "📦 पीआईएम",
    "es-ES": "📦 PIM",
    "de-DE": "📦 PIM",
    "fr-FR": "📦 PIM",
    "ja-JP": "📦 PIM",
    "zh-CN": "📦 PIM主数据"
  },
  "synth.input_title": {
    "en-US": "Master Product & GS1 Payload Specifications",
    "hi-IN": "मास्टर उत्पाद एवं जीएस1 पेलोड विनिर्देश",
    "es-ES": "Especificaciones de Producto Maestro y Carga GS1",
    "de-DE": "Produktstamm- & GS1-Nutzlastspezifikationen",
    "fr-FR": "Spécifications du Produit Maître & Données GS1",
    "ja-JP": "マスター商品＆GS1ペイロード仕様設定",
    "zh-CN": "双码制版参数与GS1数据载荷配置"
  },
  "synth.auto_sync": {
    "en-US": "⚡ Smart Auto-Sync 1D ↔ 2D",
    "hi-IN": "⚡ स्मार्ट ऑटो-सिंक 1डी ↔ 2डी",
    "es-ES": "⚡ Sincronización Inteligente 1D ↔ 2D",
    "de-DE": "⚡ Intelligente Auto-Synchronisation 1D ↔ 2D",
    "fr-FR": "⚡ Auto-Synchro Intelligente 1D ↔ 2D",
    "ja-JP": "⚡ スマート自動同期 1D ↔ 2D",
    "zh-CN": "⚡ 智能双码自动关联同步 1D ↔ 2D"
  },
  "synth.1d_type_label": {
    "en-US": "1D Symbology Standard",
    "hi-IN": "1डी सिम्बोलॉजी मानक",
    "es-ES": "Estándar de Simbología 1D",
    "de-DE": "1D-Simbologie-Standard",
    "fr-FR": "Norme de Symbologie 1D",
    "ja-JP": "1Dシンボル規格",
    "zh-CN": "一维码制标准"
  },
  "synth.1d_opt_upca": {
    "en-US": "UPC-A (12-Digit Retail Item)",
    "hi-IN": "यूपीसी-ए (12-अंकीय खुदरा वस्तु)",
    "es-ES": "UPC-A (Artículo Minorista de 12 Dígitos)",
    "de-DE": "UPC-A (12-stelliger Einzelhandelsartikel)",
    "fr-FR": "UPC-A (Article de Détail à 12 Chiffres)",
    "ja-JP": "UPC-A (12桁 北米小売商品)",
    "zh-CN": "UPC-A (12位北美零售商品条码)"
  },
  "synth.1d_opt_ean13": {
    "en-US": "EAN-13 (13-Digit International)",
    "hi-IN": "ईएएन-13 (13-अंकीय अंतरराष्ट्रीय)",
    "es-ES": "EAN-13 (Internacional de 13 Dígitos)",
    "de-DE": "EAN-13 (13-stellig International)",
    "fr-FR": "EAN-13 (International à 13 Chiffres)",
    "ja-JP": "EAN-13 (13桁 国際標準商品コード)",
    "zh-CN": "EAN-13 (13位国际通用商品条码)"
  },
  "synth.1d_opt_code128": {
    "en-US": "Code 128 (Alphanumeric Supply Chain)",
    "hi-IN": "कोड 128 (अल्फ़ान्यूमेरिक आपूर्ति श्रृंखला)",
    "es-ES": "Code 128 (Cadena de Suministro Alfanumérica)",
    "de-DE": "Code 128 (Alphanumerische Lieferkette)",
    "fr-FR": "Code 128 (Chaîne Logistique Alphanumérique)",
    "ja-JP": "Code 128 (英数字サプライチェーン)",
    "zh-CN": "Code 128 (字母数字供应链条码)"
  },
  "synth.1d_opt_itf14": {
    "en-US": "ITF-14 (14-Digit Shipping Corrugated Box)",
    "hi-IN": "आईटीएफ-14 (14-अंकीय शिपिंग डिब्बा)",
    "es-ES": "ITF-14 (Caja de Cartón Corrugado de 14 Dígitos)",
    "de-DE": "ITF-14 (14-stelliger Wellpappe-Versandkarton)",
    "fr-FR": "ITF-14 (Carton Ondulé d'Expédition à 14 Chiffres)",
    "ja-JP": "ITF-14 (14桁 集合包装用段ボール)",
    "zh-CN": "ITF-14 (14位瓦楞纸箱物流储运条码)"
  },
  "synth.2d_type_label": {
    "en-US": "2D Symbology Standard",
    "hi-IN": "2डी सिम्बोलॉजी मानक",
    "es-ES": "Estándar de Simbología 2D",
    "de-DE": "2D-Simbologie-Standard",
    "fr-FR": "Norme de Symbologie 2D",
    "ja-JP": "2Dシンボル規格",
    "zh-CN": "二维码制标准"
  },
  "synth.2d_opt_qr": {
    "en-US": "GS1 Digital Link (QR Code — Consumer Retail)",
    "hi-IN": "जीएस1 डिजिटल लिंक (क्यूआर कोड — उपभोक्ता खुदरा)",
    "es-ES": "GS1 Digital Link (Código QR — Consumo Minorista)",
    "de-DE": "GS1 Digital Link (QR-Code — Verbraucher-Einzelhandel)",
    "fr-FR": "GS1 Digital Link (Code QR — Vente au Détail)",
    "ja-JP": "GS1デジタルリンク (QRコード — 一般小売向)",
    "zh-CN": "GS1数字链接 (QR码 — 消费品零售)"
  },
  "synth.2d_opt_datamatrix": {
    "en-US": "GS1 DataMatrix (ISO 16022 ECC 200 — Pharma/UDI)",
    "hi-IN": "जीएस1 डेटा मैट्रिक्स (आईएसओ 16022 — फार्मा/यूडीआई)",
    "es-ES": "GS1 DataMatrix (ISO 16022 ECC 200 — Farma/UDI)",
    "de-DE": "GS1 DataMatrix (ISO 16022 ECC 200 — Pharma/UDI)",
    "fr-FR": "GS1 DataMatrix (ISO 16022 ECC 200 — Pharma/UDI)",
    "ja-JP": "GS1データマトリックス (ISO 16022 — 医療品/UDI)",
    "zh-CN": "GS1 DataMatrix (ISO 16022 ECC 200 — 医药/医疗器械UDI)"
  },
  "synth.2d_opt_dotcode": {
    "en-US": "GS1 DotCode (ISO 20835 — High-Speed Inkjet/Laser)",
    "hi-IN": "जीएस1 डॉटकोड (आईएसओ 20835 — हाई-स्पीड इंकजेट/लेजर)",
    "es-ES": "GS1 DotCode (ISO 20835 — Inyección de Tinta/Láser)",
    "de-DE": "GS1 DotCode (ISO 20835 — Hochgeschwindigkeits-Tintenstrahl/Laser)",
    "fr-FR": "GS1 DotCode (ISO 20835 — Jet d'Encre/Laser Haute Vitesse)",
    "ja-JP": "GS1ドットコード (ISO 20835 — 高速インクジェット/レーザー)",
    "zh-CN": "GS1 DotCode 点阵码 (ISO 20835 — 高速喷墨/激光标刻)"
  },
  "synth.master_code_label": {
    "en-US": "Master Product Code / UPC-A",
    "hi-IN": "मास्टर उत्पाद कोड / यूपीसी-ए",
    "es-ES": "Código de Producto Maestro / UPC-A",
    "de-DE": "Produktstamm-Code / UPC-A",
    "fr-FR": "Code Produit Maître / UPC-A",
    "ja-JP": "マスター商品コード / UPC-A",
    "zh-CN": "主商品代码 / UPC-A"
  },
  "synth.btn_auto_check": {
    "en-US": "✓ Auto Check",
    "hi-IN": "✓ स्वतः जांच",
    "es-ES": "✓ Comprobación Automática",
    "de-DE": "✓ Auto-Prüfziffer",
    "fr-FR": "✓ Vérif Auto",
    "ja-JP": "✓ 自動チェック",
    "zh-CN": "✓ 自动校验"
  },
  "synth.1d_input_placeholder": {
    "en-US": "Enter barcode number",
    "hi-IN": "बारकोड संख्या दर्ज करें",
    "es-ES": "Ingrese el número de código",
    "de-DE": "Barcodenummer eingeben",
    "fr-FR": "Saisir le numéro de code",
    "ja-JP": "バーコード番号を入力",
    "zh-CN": "请输入商品条码编号"
  },
  "synth.gtin14_label": {
    "en-US": "GTIN-14 (AI 01) [Sunrise 2027]",
    "hi-IN": "जीटीआईएन-14 (एआई 01) [सनराइज 2027]",
    "es-ES": "GTIN-14 (AI 01) [Sunrise 2027]",
    "de-DE": "GTIN-14 (AI 01) [Sunrise 2027]",
    "fr-FR": "GTIN-14 (AI 01) [Sunrise 2027]",
    "ja-JP": "GTIN-14 (AI 01) [Sunrise 2027]",
    "zh-CN": "GTIN-14 (AI 01) [日出计划 2027]"
  },
  "synth.gtin14_sync_hint": {
    "en-US": "Synchronized with 1D Payload",
    "hi-IN": "1डी पेलोड के साथ सिंक्रनाइज़",
    "es-ES": "Sincronizado con Carga 1D",
    "de-DE": "Mit 1D-Nutzlast synchronisiert",
    "fr-FR": "Synchronisé avec les Données 1D",
    "ja-JP": "1Dバーコードと完全連動",
    "zh-CN": "已与一维条码数据自动保持同步"
  },
  "synth.domain_label": {
    "en-US": "Brand Resolver Domain",
    "hi-IN": "ब्रांड रिज़ॉल्वर डोमेन",
    "es-ES": "Dominio Resolutor de Marca",
    "de-DE": "Marken-Resolver-Domain",
    "fr-FR": "Domaine Résolveur de la Marque",
    "ja-JP": "ブランドリゾルバ・ドメイン",
    "zh-CN": "品牌域名解析服务器 (Brand Resolver)"
  },
  "synth.lot_label": {
    "en-US": "Batch / Lot (AI 10)",
    "hi-IN": "बैच / लॉट संख्या (एआई 10)",
    "es-ES": "Lote / Batch (AI 10)",
    "de-DE": "Charge / Los (AI 10)",
    "fr-FR": "Lot / Batch (AI 10)",
    "ja-JP": "製造ロット / バッチ (AI 10)",
    "zh-CN": "生产批次号 / Lot (AI 10)"
  },
  "synth.serial_label": {
    "en-US": "Serial (AI 21)",
    "hi-IN": "क्रम संख्या (एआई 21)",
    "es-ES": "Número de Serie (AI 21)",
    "de-DE": "Seriennummer (AI 21)",
    "fr-FR": "Numéro de Série (AI 21)",
    "ja-JP": "シリアル番号 (AI 21)",
    "zh-CN": "单件序列号 / Serial (AI 21)"
  },
  "synth.exp_label": {
    "en-US": "Exp (AI 17) [YYMMDD]",
    "hi-IN": "समाप्ति तिथि (एआई 17) [YYMMDD]",
    "es-ES": "Caducidad (AI 17) [AAMMDD]",
    "de-DE": "Ablaufdatum (AI 17) [JJMMTT]",
    "fr-FR": "Date Limite (AI 17) [AAMMJJ]",
    "ja-JP": "有効期限 (AI 17) [YYMMDD]",
    "zh-CN": "保质期至 (AI 17) [YYMMDD]"
  },
  "synth.calendar_label": {
    "en-US": "Calendar Date",
    "hi-IN": "कैलेंडर तिथि",
    "es-ES": "Fecha del Calendario",
    "de-DE": "Kalenderdatum",
    "fr-FR": "Date Calendrier",
    "ja-JP": "カレンダー日付",
    "zh-CN": "标准公历日期"
  },
  "synth.extended_ais_btn": {
    "en-US": "Advanced Supply Chain & Logistics AIs (Weight, Price, PO, Origin)",
    "hi-IN": "उन्नत आपूर्ति श्रृंखला एवं लॉजिस्टिक्स एआई (वजन, मूल्य, पीओ, मूल)",
    "es-ES": "AIs Avanzados de Cadena de Suministro (Peso, Precio, OC, Origen)",
    "de-DE": "Erweiterte Lieferketten-AIs (Gewicht, Preis, Bestellung, Herkunft)",
    "fr-FR": "AIs Avancés de la Chaîne Logistique (Poids, Prix, BC, Origine)",
    "ja-JP": "拡張サプライチェーンAI (重量・価格・発注番号・原産国)",
    "zh-CN": "扩展供应链与物流应用标识符 (净重、单价、采购订单、原产国)"
  },
  "synth.weight_label": {
    "en-US": "Weight kg (AI 3102)",
    "hi-IN": "वजन किग्रा (एआई 3102)",
    "es-ES": "Peso kg (AI 3102)",
    "de-DE": "Gewicht kg (AI 3102)",
    "fr-FR": "Poids kg (AI 3102)",
    "ja-JP": "正味重量 kg (AI 3102)",
    "zh-CN": "净重 公斤 (AI 3102)"
  },
  "synth.price_label": {
    "en-US": "Price (AI 3922)",
    "hi-IN": "मूल्य (एआई 3922)",
    "es-ES": "Precio (AI 3922)",
    "de-DE": "Preis (AI 3922)",
    "fr-FR": "Prix (AI 3922)",
    "ja-JP": "金額 (AI 3922)",
    "zh-CN": "应付金额 (AI 3922)"
  },
  "synth.po_label": {
    "en-US": "PO # (AI 400)",
    "hi-IN": "खरीद आदेश # (एआई 400)",
    "es-ES": "N.º Pedido Compra (AI 400)",
    "de-DE": "Bestellnummer (AI 400)",
    "fr-FR": "N° Bon Commande (AI 400)",
    "ja-JP": "購買発注番号 (AI 400)",
    "zh-CN": "采购订单号 PO (AI 400)"
  },
  "synth.origin_label": {
    "en-US": "Origin (AI 422)",
    "hi-IN": "मूल देश (एआई 422)",
    "es-ES": "País de Origen (AI 422)",
    "de-DE": "Herkunftsland (AI 422)",
    "fr-FR": "Pays d'Origine (AI 422)",
    "ja-JP": "原産国コード (AI 422)",
    "zh-CN": "原产国代码 (AI 422)"
  },
  "synth.digital_link_uri_label": {
    "en-US": "GS1 Digital Link URI",
    "hi-IN": "जीएस1 डिजिटल लिंक यूआरआई",
    "es-ES": "URI de GS1 Digital Link",
    "de-DE": "GS1 Digital Link URI",
    "fr-FR": "URI GS1 Digital Link",
    "ja-JP": "GS1デジタルリンクURI",
    "zh-CN": "GS1数字链接 URI 预览"
  },
  "synth.gepir_title": {
    "en-US": "GS1 Prefix & Registry Validator",
    "hi-IN": "जीएस1 उपसर्ग एवं रजिस्ट्री सत्यापनकर्ता",
    "es-ES": "Validador de Prefijos y Registro GS1",
    "de-DE": "GS1-Präfix- & Registerprüfer",
    "fr-FR": "Validateur de Préfixe & Registre GS1",
    "ja-JP": "GS1国コード接頭辞＆登録事業者検証",
    "zh-CN": "GS1厂商识别代码前缀与校验码核验"
  },
  "synth.gepir_btn_verify": {
    "en-US": "🔍 Verify",
    "hi-IN": "🔍 सत्यापित करें",
    "es-ES": "🔍 Verificar",
    "de-DE": "🔍 Prüfen",
    "fr-FR": "🔍 Vérifier",
    "ja-JP": "🔍 検証",
    "zh-CN": "🔍 立即核验"
  },
  "synth.gepir_input_placeholder": {
    "en-US": "Enter GTIN-12/13/14",
    "hi-IN": "जीटीआईएन-12/13/14 दर्ज करें",
    "es-ES": "Ingrese GTIN-12/13/14",
    "de-DE": "GTIN-12/13/14 eingeben",
    "fr-FR": "Saisir GTIN-12/13/14",
    "ja-JP": "GTIN-12/13/14を入力",
    "zh-CN": "输入 GTIN-12/13/14 编码"
  },

  // TAB 2: CLEARANCE
  "clearance.title": {
    "en-US": "50mm Physical Clearance Die-Line Inspector",
    "hi-IN": "50मिमी भौतिक सुरक्षित दूरी डाई-लाइन निरीक्षक",
    "es-ES": "Inspector de Distancia de Seguridad Troquelada de 50 mm",
    "de-DE": "50mm Stanzlinien-Sicherheitsabstandsprüfer",
    "fr-FR": "Inspecteur d'Espacement Ligne de Découpe 50 mm",
    "ja-JP": "50mm抜き型安全クリアランス検査",
    "zh-CN": "50毫米刀模物理安全间距检查器"
  },
  "clearance.badge_auditor": {
    "en-US": "SUNRISE 2027 AUDITOR",
    "hi-IN": "सनराइज 2027 ऑडिटर",
    "es-ES": "AUDITOR SUNRISE 2027",
    "de-DE": "SUNRISE 2027 PRÜFER",
    "fr-FR": "AUDITEUR SUNRISE 2027",
    "ja-JP": "SUNRISE 2027 監査員",
    "zh-CN": "日出计划 2027 间距审计"
  },
  "clearance.preset_snack": {
    "en-US": "Snack Bar (150 x 55 mm)",
    "hi-IN": "स्नैक बार (150 x 55 मिमी)",
    "es-ES": "Barra de Snack (150 x 55 mm)",
    "de-DE": "Müsliriegel (150 x 55 mm)",
    "fr-FR": "Barre En-cas (150 x 55 mm)",
    "ja-JP": "スナックバー包装 (150 x 55 mm)",
    "zh-CN": "能量棒软包装 (150 x 55 毫米)"
  },
  "clearance.preset_blister": {
    "en-US": "Blister Pack (110 x 75 mm)",
    "hi-IN": "ब्लिस्टर पैक (110 x 75 मिमी)",
    "es-ES": "Envase Blíster (110 x 75 mm)",
    "de-DE": "Blisterpackung (110 x 75 mm)",
    "fr-FR": "Emballage Blister (110 x 75 mm)",
    "ja-JP": "ブリスターパック (110 x 75 mm)",
    "zh-CN": "药用泡罩包装 (110 x 75 毫米)"
  },
  "clearance.preset_bottle": {
    "en-US": "Bottle Label (180 x 85 mm)",
    "hi-IN": "बोतल लेबल (180 x 85 मिमी)",
    "es-ES": "Etiqueta de Botella (180 x 85 mm)",
    "de-DE": "Flaschenetikett (180 x 85 mm)",
    "fr-FR": "Étiquette Bouteille (180 x 85 mm)",
    "ja-JP": "ボトルラベル (180 x 85 mm)",
    "zh-CN": "圆瓶标签环包 (180 x 85 毫米)"
  },
  "clearance.preset_pharma": {
    "en-US": "Pharma Carton (90 x 50 mm)",
    "hi-IN": "फार्मा कार्टन (90 x 50 मिमी)",
    "es-ES": "Caja Farmacéutica (90 x 50 mm)",
    "de-DE": "Pharma-Faltschachtel (90 x 50 mm)",
    "fr-FR": "Étui Pharmacie (90 x 50 mm)",
    "ja-JP": "医薬品小箱 (90 x 50 mm)",
    "zh-CN": "医药小折盒 (90 x 50 毫米)"
  },
  "clearance.preset_retail_box": {
    "en-US": "Folding Carton (220 x 160 mm)",
    "hi-IN": "फोल्डिंग कार्टन (220 x 160 मिमी)",
    "es-ES": "Caja Plegable (220 x 160 mm)",
    "de-DE": "Faltschachtel (220 x 160 mm)",
    "fr-FR": "Carton Pliant (220 x 160 mm)",
    "ja-JP": "折りたたみ外箱 (220 x 160 mm)",
    "zh-CN": "折叠彩色纸盒 (220 x 160 毫米)"
  },
  "clearance.btn_snap": {
    "en-US": "⚡ Snap 50mm",
    "hi-IN": "⚡ 50मिमी स्नैप",
    "es-ES": "⚡ Ajustar 50mm",
    "de-DE": "⚡ Einrasten 50mm",
    "fr-FR": "⚡ Aligner 50mm",
    "ja-JP": "⚡ 50mm吸着",
    "zh-CN": "⚡ 自动对齐50毫米"
  },
  "clearance.surface_label": {
    "en-US": "SURFACE:",
    "hi-IN": "सतह:",
    "es-ES": "SUPERFICIE:",
    "de-DE": "OBERFLÄCHE:",
    "fr-FR": "SURFACE :",
    "ja-JP": "包装表面:",
    "zh-CN": "包装表面曲率:"
  },
  "clearance.geom_flat": {
    "en-US": "📄 Flat Carton",
    "hi-IN": "📄 समतल कार्टन",
    "es-ES": "📄 Caja Plana",
    "de-DE": "📄 Flacher Karton",
    "fr-FR": "📄 Carton Plat",
    "ja-JP": "📄 平面折箱",
    "zh-CN": "📄 平面卡盒"
  },
  "clearance.geom_cyl": {
    "en-US": "🥫 3D Cylinder / Can",
    "hi-IN": "🥫 3डी बेलन / कैन",
    "es-ES": "🥫 Cilindro 3D / Lata",
    "de-DE": "🥫 3D-Zylinder / Dose",
    "fr-FR": "🥫 Cylindre 3D / Canette",
    "ja-JP": "🥫 3D円柱・缶体",
    "zh-CN": "🥫 3D柱面瓶体/易拉罐"
  },
  "clearance.diameter_label": {
    "en-US": "Diameter:",
    "hi-IN": "व्यास:",
    "es-ES": "Diámetro:",
    "de-DE": "Durchmesser:",
    "fr-FR": "Diamètre :",
    "ja-JP": "直径:",
    "zh-CN": "圆柱直径:"
  },
  "clearance.status_compliant_head": {
    "en-US": "COMPLIANT (≥ 50.0 mm)",
    "hi-IN": "अनुपालन प्रमाणित (≥ 50.0 मिमी)",
    "es-ES": "CONFORME (≥ 50.0 mm)",
    "de-DE": "KONFORM (≥ 50.0 mm)",
    "fr-FR": "CONFORME (≥ 50.0 mm)",
    "ja-JP": "適合合格 (≥ 50.0 mm)",
    "zh-CN": "合规达标 (≥ 50.0 毫米)"
  },
  "clearance.status_compliant_sub": {
    "en-US": "Edge-to-edge optical clearance satisfies Sunrise 2027 pass rate.",
    "hi-IN": "किनारे-से-किनारे ऑप्टिकल दूरी सनराइज 2027 मानक को संतुष्ट करती है।",
    "es-ES": "El espacio óptico borde a borde cumple con los requisitos de Sunrise 2027.",
    "de-DE": "Kanten-zu-Kanten-Abstand erfüllt Sunrise 2027 Anforderungen vollständig.",
    "fr-FR": "L'espacement optique bord à bord respecte la cadence Sunrise 2027.",
    "ja-JP": "バーコード間の物理離隔がSunrise 2027基準を完全に満たしています。",
    "zh-CN": "双码边缘物理间距符合日出计划2027收银扫描免干扰标准。"
  },
  "clearance.status_violation_head": {
    "en-US": "VIOLATION (< 50.0 mm)",
    "hi-IN": "उल्लंघन (< 50.0 मिमी)",
    "es-ES": "VIOLACIÓN (< 50.0 mm)",
    "de-DE": "ABSTANDSVERLETZUNG (< 50.0 mm)",
    "fr-FR": "VIOLATION (< 50.0 mm)",
    "ja-JP": "間隔違反 (< 50.0 mm)",
    "zh-CN": "间距不达标 (< 50.0 毫米)"
  },
  "clearance.status_violation_sub": {
    "en-US": "Codes violate the 50mm minimum separation threshold.",
    "hi-IN": "कोड 50मिमी न्यूनतम अलगाव सीमा का उल्लंघन करते हैं।",
    "es-ES": "Los códigos violan el umbral mínimo de separación de 50 mm.",
    "de-DE": "Barcodes verletzen den Mindestsicherheitsabstand von 50 mm.",
    "fr-FR": "Les codes ne respectent pas la distance minimale de 50 mm.",
    "ja-JP": "2つのコード間隔が安全基準の50mmを下回っています。",
    "zh-CN": "双码间距低于50毫米阈值，易引发收银枪交叉误扫。"
  },
  "clearance.threshold_label": {
    "en-US": "Threshold: 50.0 mm",
    "hi-IN": "सीमा: 50.0 मिमी",
    "es-ES": "Umbral: 50.0 mm",
    "de-DE": "Schwellenwert: 50.0 mm",
    "fr-FR": "Seuil : 50.0 mm",
    "ja-JP": "基準しきい値: 50.0 mm",
    "zh-CN": "合规阈值: 50.0 毫米"
  },
  "clearance.iso_station_title": {
    "en-US": "ISO/IEC 15416 & 15415 Optical Grading Station",
    "hi-IN": "आईएसओ/आईईसी 15416 एवं 15415 ऑप्टिकल ग्रेडिंग स्टेशन",
    "es-ES": "Estación de Calificación Óptica ISO/IEC 15416 y 15415",
    "de-DE": "ISO/IEC 15416 & 15415 Optische Qualitätsprüfstation",
    "fr-FR": "Station de Notation Optique ISO/IEC 15416 et 15415",
    "ja-JP": "ISO/IEC 15416＆15415 光学グレード検証ステーション",
    "zh-CN": "ISO/IEC 15416 & 15415 光学印刷质量检测与等级评定"
  },
  "clearance.iso_calibrated_badge": {
    "en-US": "CALIBRATED VERIFIER (ISO/IEC 15426)",
    "hi-IN": "अंशांकित सत्यापनकर्ता (आईएसओ/आईईसी 15426)",
    "es-ES": "VERIFICADOR CALIBRADO (ISO/IEC 15426)",
    "de-DE": "KALIBRIERTER PRÜFER (ISO/IEC 15426)",
    "fr-FR": "VÉRIFICATEUR CALIBRÉ (ISO/IEC 15426)",
    "ja-JP": "校正済み検証機 (ISO/IEC 15426)",
    "zh-CN": "校准级检测仪 (ISO/IEC 15426)"
  },
  "clearance.btn_run_iso": {
    "en-US": "🔍 Run ISO Grade",
    "hi-IN": "🔍 आईएसओ ग्रेड जांचें",
    "es-ES": "🔍 Calificar ISO",
    "de-DE": "🔍 ISO-Prüfung starten",
    "fr-FR": "🔍 Lancer l'Évaluation ISO",
    "ja-JP": "🔍 ISOグレード測定",
    "zh-CN": "🔍 启动ISO检测评级"
  },
  "clearance.btn_nist": {
    "en-US": "⚖️ NIST Check",
    "hi-IN": "⚖️ एनआईएसटी जांच",
    "es-ES": "⚖️ Control NIST",
    "de-DE": "⚖️ NIST-Prüfung",
    "fr-FR": "⚖️ Contrôle NIST",
    "ja-JP": "⚖️ NIST校正チェック",
    "zh-CN": "⚖️ NIST基准核查"
  },
  "clearance.btn_iso_cert_pdf": {
    "en-US": "📄 PDF Cert",
    "hi-IN": "📄 पीडीएफ प्रमाणपत्र",
    "es-ES": "📄 Certificado PDF",
    "de-DE": "📄 PDF-Zertifikat",
    "fr-FR": "📄 Certificat PDF",
    "ja-JP": "📄 PDF証明書",
    "zh-CN": "📄 导出质检PDF证书"
  },
  "clearance.iso_report_title": {
    "en-US": "ISO/IEC Optical Grade Report",
    "hi-IN": "आईएसओ/आईईसी ऑप्टिकल ग्रेड रिपोर्ट",
    "es-ES": "Informe de Calificación Óptica ISO/IEC",
    "de-DE": "ISO/IEC Optischer Qualitätsbericht",
    "fr-FR": "Rapport de Note Optique ISO/IEC",
    "ja-JP": "ISO/IEC 光学検証レポート",
    "zh-CN": "ISO/IEC 光学质量等级检验报告"
  },

  // TAB 3: RESOLVER
  "resolver.title": {
    "en-US": "Zero-SaaS Dynamic Link Resolver",
    "hi-IN": "गतिशील जीएस1 डिजिटल लिंक रिज़ॉल्वर",
    "es-ES": "Resolutor Dinámico de Enlaces Zero-SaaS",
    "de-DE": "Zero-SaaS Dynamischer Link-Resolver",
    "fr-FR": "Résolveur Dynamique de Liens Zero-SaaS",
    "ja-JP": "ゼロSaaS ダイナミックリンク・リゾルバ",
    "zh-CN": "零依赖动态数字链接解析引擎 (Zero-SaaS)"
  },
  "resolver.badge_edge": {
    "en-US": "STANDALONE EDGE ROUTING",
    "hi-IN": "स्टैंडअलोन एज रूटिंग",
    "es-ES": "ENRUTAMIENTO EDGE INDEPENDIENTE",
    "de-DE": "AUTONOMES EDGE-ROUTING",
    "fr-FR": "ROUTAGE EDGE AUTONOME",
    "ja-JP": "スタンドアロン・エッジルーティング",
    "zh-CN": "边缘节点离线动态分流"
  },
  "resolver.th_sku": {
    "en-US": "Item / SKU",
    "hi-IN": "वस्तु / एसकेयू",
    "es-ES": "Artículo / SKU",
    "de-DE": "Artikel / SKU",
    "fr-FR": "Article / SKU",
    "ja-JP": "品目 / SKU",
    "zh-CN": "商品单品 / SKU"
  },
  "resolver.th_gtin": {
    "en-US": "GTIN-14",
    "hi-IN": "जीटीआईएन-14",
    "es-ES": "GTIN-14",
    "de-DE": "GTIN-14",
    "fr-FR": "GTIN-14",
    "ja-JP": "GTIN-14",
    "zh-CN": "GTIN-14代码"
  },
  "resolver.th_lot": {
    "en-US": "Batch / Lot",
    "hi-IN": "बैच / लॉट",
    "es-ES": "Lote / Batch",
    "de-DE": "Charge / Los",
    "fr-FR": "Lot / Batch",
    "ja-JP": "ロット / バッチ",
    "zh-CN": "生产批号"
  },
  "resolver.th_recall": {
    "en-US": "Recall Kill-Switch",
    "hi-IN": "रिकॉल स्विच",
    "es-ES": "Interruptor de Retirada",
    "de-DE": "Rückruf-Notaus",
    "fr-FR": "Arrêt d'Urgence Rappel",
    "ja-JP": "リコール即時遮断",
    "zh-CN": "产品召回紧急熔断"
  },
  "resolver.th_geo": {
    "en-US": "Geo-Rules",
    "hi-IN": "भू-नियम",
    "es-ES": "Reglas Geográficas",
    "de-DE": "Geo-Regeln",
    "fr-FR": "Règles Géographiques",
    "ja-JP": "地域ルーティング",
    "zh-CN": "地理区域路由规则"
  },
  "resolver.th_action": {
    "en-US": "Action",
    "hi-IN": "कार्रवाई",
    "es-ES": "Acción",
    "de-DE": "Aktion",
    "fr-FR": "Action",
    "ja-JP": "操作",
    "zh-CN": "管理操作"
  },
  "resolver.test_gtin_placeholder": {
    "en-US": "Test GTIN",
    "hi-IN": "परीक्षण जीटीआईएन",
    "es-ES": "GTIN de Prueba",
    "de-DE": "Test-GTIN",
    "fr-FR": "GTIN de Test",
    "ja-JP": "テスト用GTIN",
    "zh-CN": "输入测试 GTIN"
  },
  "resolver.btn_resolve": {
    "en-US": "⚡ Resolve",
    "hi-IN": "⚡ रिज़ॉल्व करें",
    "es-ES": "⚡ Resolver",
    "de-DE": "⚡ Auflösen",
    "fr-FR": "⚡ Résoudre",
    "ja-JP": "⚡ 解決実行",
    "zh-CN": "⚡ 模拟解析"
  },
  "resolver.btn_add_route": {
    "en-US": "➕ Add Route",
    "hi-IN": "➕ नया मार्ग जोड़ें",
    "es-ES": "➕ Añadir Ruta",
    "de-DE": "➕ Route hinzufügen",
    "fr-FR": "➕ Ajouter une Route",
    "ja-JP": "➕ ルート追加",
    "zh-CN": "➕ 新增分流路由"
  },
  "resolver.btn_sqlite": {
    "en-US": "🗄️ SQLite (.sql)",
    "hi-IN": "🗄️ एसक्यूलाइट (.sql)",
    "es-ES": "🗄️ SQLite (.sql)",
    "de-DE": "🗄️ SQLite (.sql)",
    "fr-FR": "🗄️ SQLite (.sql)",
    "ja-JP": "🗄️ SQLite (.sql)",
    "zh-CN": "🗄️ SQLite 规则 (.sql)"
  },
  "resolver.btn_json": {
    "en-US": "📄 JSON Rules",
    "hi-IN": "📄 जेएसओएन नियम",
    "es-ES": "📄 Reglas JSON",
    "de-DE": "📄 JSON-Regeln",
    "fr-FR": "📄 Règles JSON",
    "ja-JP": "📄 JSONルール",
    "zh-CN": "📄 JSON 路由规则"
  },
  "resolver.btn_cloudflare": {
    "en-US": "⚡ Cloudflare",
    "hi-IN": "⚡ क्लाउडफ्लेयर",
    "es-ES": "⚡ Cloudflare",
    "de-DE": "⚡ Cloudflare",
    "fr-FR": "⚡ Cloudflare",
    "ja-JP": "⚡ Cloudflare",
    "zh-CN": "⚡ Cloudflare Worker"
  },
  "resolver.btn_nginx": {
    "en-US": "🌐 Nginx",
    "hi-IN": "🌐 एनजीआईएनएक्स",
    "es-ES": "🌐 Nginx",
    "de-DE": "🌐 Nginx",
    "fr-FR": "🌐 Nginx",
    "ja-JP": "🌐 Nginx",
    "zh-CN": "🌐 Nginx 配置文件"
  },
  "resolver.btn_linkset": {
    "en-US": "🔗 GS1 Linkset",
    "hi-IN": "🔗 जीएस1 लिंकसेट",
    "es-ES": "🔗 Conjunto GS1",
    "de-DE": "🔗 GS1-Linkset",
    "fr-FR": "🔗 GS1 Linkset",
    "ja-JP": "🔗 GS1リンクセット",
    "zh-CN": "🔗 GS1 Linkset 集合"
  },

  // TAB 4: SCANNER
  "scanner.title": {
    "en-US": "Dual Optical Camera Decoder",
    "hi-IN": "ड्यूल ऑप्टिकल कैमरा डिकोडर",
    "es-ES": "Decodificador Óptico de Cámara Dual",
    "de-DE": "Dualer Optischer Kameradekoder",
    "fr-FR": "Décodeur Caméra Optique Double",
    "ja-JP": "デュアル光学カメラスキャナ",
    "zh-CN": "双路光学摄像头图像解码器"
  },
  "scanner.badge_offline": {
    "en-US": "CAMERA OFFLINE",
    "hi-IN": "कैमरा ऑफलाइन",
    "es-ES": "CÁMARA FUERA DE LÍNEA",
    "de-DE": "KAMERA OFFLINE",
    "fr-FR": "CAMÉRA HORS LIGNE",
    "ja-JP": "カメラ待機中",
    "zh-CN": "摄像头未启动"
  },
  "scanner.btn_start": {
    "en-US": "📷 Start Camera",
    "hi-IN": "📷 कैमरा शुरू करें",
    "es-ES": "📷 Iniciar Cámara",
    "de-DE": "📷 Kamera Starten",
    "fr-FR": "📷 Activer Caméra",
    "ja-JP": "📷 カメラ起動",
    "zh-CN": "📷 开启摄像头"
  },
  "scanner.btn_stop": {
    "en-US": "🛑 Stop",
    "hi-IN": "🛑 रोकें",
    "es-ES": "🛑 Detener",
    "de-DE": "🛑 Anhalten",
    "fr-FR": "🛑 Arrêter",
    "ja-JP": "🛑 停止",
    "zh-CN": "🛑 关闭摄像头"
  },
  "scanner.btn_torch": {
    "en-US": "🔦 Light",
    "hi-IN": "🔦 लाइट",
    "es-ES": "🔦 Luz",
    "de-DE": "🔦 Blitzlicht",
    "fr-FR": "🔦 Lampe",
    "ja-JP": "🔦 照明",
    "zh-CN": "🔦 补光灯"
  },
  "scanner.btn_calibrate": {
    "en-US": "📐 Calibrate",
    "hi-IN": "📐 अंशांकित करें",
    "es-ES": "📐 Calibrar",
    "de-DE": "📐 Kalibrieren",
    "fr-FR": "📐 Calibrer",
    "ja-JP": "📐 尺度校正",
    "zh-CN": "📐 标定比例尺"
  },
  "scanner.btn_upload": {
    "en-US": "📁 Upload",
    "hi-IN": "📁 अपलोड",
    "es-ES": "📁 Subir",
    "de-DE": "📁 Hochladen",
    "fr-FR": "📁 Importer",
    "ja-JP": "📁 画像読込",
    "zh-CN": "📁 本地图片"
  },
  "scanner.continuous_label": {
    "en-US": "Continuous 50mm Tracking",
    "hi-IN": "निरंतर 50मिमी ट्रैकिंग",
    "es-ES": "Seguimiento Continuo de 50 mm",
    "de-DE": "Kontinuierliche 50mm-Verfolgung",
    "fr-FR": "Suivi Continu 50 mm",
    "ja-JP": "連続50mmトラッキング",
    "zh-CN": "连续50毫米动态间距追踪"
  },
  "scanner.decoded_title": {
    "en-US": "Decoded Payload",
    "hi-IN": "डिकोड किया गया पेलोड",
    "es-ES": "Carga Decodificada",
    "de-DE": "Dekodierte Nutzlast",
    "fr-FR": "Données Décodées",
    "ja-JP": "デコード結果ペイロード",
    "zh-CN": "条码解码载荷内容"
  },
  "scanner.awaiting_scan": {
    "en-US": "Awaiting optical acquisition...",
    "hi-IN": "ऑप्टिकल अधिग्रहण की प्रतीक्षा की जा रही है...",
    "es-ES": "Esperando adquisición óptica...",
    "de-DE": "Warten auf optische Erfassung...",
    "fr-FR": "En attente d'acquisition optique...",
    "ja-JP": "光学読み取り待機中...",
    "zh-CN": "等待对准光学条码图像..."
  },
  "scanner.quick_cte_title": {
    "en-US": "⚡ 1-TAP FSMA 204 TRACEABILITY",
    "hi-IN": "⚡ 1-टैप एफएसएमए 204 ट्रेसिबिलिटी",
    "es-ES": "⚡ TRAZABILIDAD FSMA 204 EN 1-TOQUE",
    "de-DE": "⚡ 1-TAP FSMA 204 RÜCKVERFOLGBARKEIT",
    "fr-FR": "⚡ TRAÇABILITÉ FSMA 204 EN 1 CLIC",
    "ja-JP": "⚡ 1タップ FSMA 204トレーサビリティ",
    "zh-CN": "⚡ 一键快捷登记 FSMA 204 溯源"
  },
  "scanner.parsed_badge": {
    "en-US": "PARSED METADATA",
    "hi-IN": "पार्स किया गया मेटाडेटा",
    "es-ES": "METADATOS ANALIZADOS",
    "de-DE": "GEPARSTE METADATEN",
    "fr-FR": "MÉTADONNÉES ANALYSÉES",
    "ja-JP": "解析済みメタデータ",
    "zh-CN": "已解析结构化数据"
  },
  "scanner.btn_quick_log": {
    "en-US": "⚡ Log to FSMA Chain (1-Tap)",
    "hi-IN": "⚡ एफएसएमए श्रृंखला में लॉग करें",
    "es-ES": "⚡ Registrar en Cadena FSMA",
    "de-DE": "⚡ In FSMA-Kette erfassen",
    "fr-FR": "⚡ Enregistrer sur Chaîne FSMA",
    "ja-JP": "⚡ FSMAチェーンへ即時記録",
    "zh-CN": "⚡ 一键记入FSMA区块链账本"
  },
  "scanner.btn_view_fsma": {
    "en-US": "View in FSMA",
    "hi-IN": "एफएसएमए में देखें",
    "es-ES": "Ver en FSMA",
    "de-DE": "In FSMA anzeigen",
    "fr-FR": "Voir dans FSMA",
    "ja-JP": "FSMA台帳を表示",
    "zh-CN": "前往FSMA模块查看"
  },
  "scanner.surface_studio_title": {
    "en-US": "Surface & Geometry Corrector",
    "hi-IN": "सतह एवं ज्यामिति संशोधक",
    "es-ES": "Corrector de Superficie y Geometría",
    "de-DE": "Oberflächen- & Geometriekorrektur",
    "fr-FR": "Correcteur de Surface & Géométrie",
    "ja-JP": "表面歪み・幾何補正スタジオ",
    "zh-CN": "包装表面几何畸变与透视矫正"
  },
  "scanner.surface_studio_badge": {
    "en-US": "DEWARP & UNROLLER",
    "hi-IN": "डीवार्प एवं अनरोलर",
    "es-ES": "DESENROLLADOR Y CORRECCIÓN",
    "de-DE": "ENTWERRUNG & ABROLLUNG",
    "fr-FR": "DÉROULEMENT & APLATISSEMENT",
    "ja-JP": "歪み展開・平面化",
    "zh-CN": "单据平整与圆柱展平"
  },
  "scanner.seg_doc": {
    "en-US": "📄 Document Flatten",
    "hi-IN": "📄 दस्तावेज़ समतल करें",
    "es-ES": "📄 Aplanar Documento",
    "de-DE": "📄 Dokument Glätten",
    "fr-FR": "📄 Aplatir le Document",
    "ja-JP": "📄 伝票・文書の平面化",
    "zh-CN": "📄 提单/票据平整矫正"
  },
  "scanner.seg_cyl": {
    "en-US": "🥫 Cylindrical Unroller",
    "hi-IN": "🥫 बेलनाकार खोलें",
    "es-ES": "🥫 Desenrollador Cilíndrico",
    "de-DE": "🥫 Zylinder-Entrollung",
    "fr-FR": "🥫 Dérouleur Cylindrique",
    "ja-JP": "🥫 円柱面展開ツール",
    "zh-CN": "🥫 圆柱曲面正交展开"
  },
  "scanner.btn_load_photo": {
    "en-US": "📁 Load Photo",
    "hi-IN": "📁 फोटो लोड करें",
    "es-ES": "📁 Cargar Foto",
    "de-DE": "📁 Foto Laden",
    "fr-FR": "📁 Charger Photo",
    "ja-JP": "📁 写真読み込み",
    "zh-CN": "📁 选择照片"
  },
  "scanner.btn_autodetect": {
    "en-US": "🎯 Auto-Detect Corners",
    "hi-IN": "🎯 कोने स्वतः पहचानें",
    "es-ES": "🎯 Detectar Esquinas",
    "de-DE": "🎯 Ecken Automatisch Erkennen",
    "fr-FR": "🎯 Détecter les Coins",
    "ja-JP": "🎯 四隅の自動認識",
    "zh-CN": "🎯 自动识别四角边缘"
  },
  "scanner.btn_flatten": {
    "en-US": "⚡ Flatten & Binarize",
    "hi-IN": "⚡ समतल एवं बाइनराइज़ करें",
    "es-ES": "⚡ Aplanar y Binarizar",
    "de-DE": "⚡ Glätten & Binarisieren",
    "fr-FR": "⚡ Aplatir et Binariser",
    "ja-JP": "⚡ 透視補正＆二値化",
    "zh-CN": "⚡ 透视平整与高反差二值化"
  },
  "scanner.radius_label": {
    "en-US": "Radius:",
    "hi-IN": "त्रिज्या:",
    "es-ES": "Radio:",
    "de-DE": "Radius:",
    "fr-FR": "Rayon :",
    "ja-JP": "曲率半径:",
    "zh-CN": "柱体半径:"
  },
  "scanner.radius_hint": {
    "en-US": "(12oz Can)",
    "hi-IN": "(12oz कैन)",
    "es-ES": "(Lata 12oz)",
    "de-DE": "(12oz Dose)",
    "fr-FR": "(Canette 33cl)",
    "ja-JP": "(350ml缶)",
    "zh-CN": "(355ml标准易拉罐)"
  },
  "scanner.btn_unroll": {
    "en-US": "🔄 Unroll",
    "hi-IN": "🔄 सतह खोलें",
    "es-ES": "🔄 Desenrollar",
    "de-DE": "🔄 Abrollen",
    "fr-FR": "🔄 Dérouler",
    "ja-JP": "🔄 円柱展開",
    "zh-CN": "🔄 曲面投影展开"
  },
  "scanner.unroll_success": {
    "en-US": "✓ Cylindrical curvature flattened into orthogonal plane.",
    "hi-IN": "✓ बेलनाकार सतह को समतल ऑर्थोगोनल तल में खोल दिया गया है।",
    "es-ES": "✓ Curvatura cilíndrica aplanada en el plano ortogonal.",
    "de-DE": "✓ Zylindrische Krümmung in orthogonale Ebene entrollt.",
    "fr-FR": "✓ Courbure cylindrique aplatie dans le plan orthogonal.",
    "ja-JP": "✓ 円柱曲面が直交平面に正常展開されました。",
    "zh-CN": "✓ 圆柱曲面已成功映射展平至正交平视平面。"
  },

  // TAB 5: FSMA 204
  "fsma.title": {
    "en-US": "FDA FSMA Rule 204 Critical Tracking Events (CTEs)",
    "hi-IN": "एफडीए एफएसएमए नियम 204 महत्वपूर्ण ट्रैकिंग घटनाएं (CTEs)",
    "es-ES": "Regla FSMA 204 de la FDA - Eventos Críticos de Seguimiento (CTE)",
    "de-DE": "FDA FSMA Vorschrift 204 Kritische Verfolgungsereignisse (CTEs)",
    "fr-FR": "Règle 204 de la FDA FSMA - Événements de Suivi Critique (CTE)",
    "ja-JP": "米国FDA FSMA規則204 重要追跡イベント (CTE)",
    "zh-CN": "美国FDA FSMA法规204 关键追踪事件 (CTE)"
  },
  "fsma.badge_cfr": {
    "en-US": "21 CFR PART 1 SUBPART S",
    "hi-IN": "21 सीएफआर भाग 1 उपभाग एस",
    "es-ES": "21 CFR PARTE 1 SUBPARTE S",
    "de-DE": "21 CFR TEIL 1 UNTERTEIL S",
    "fr-FR": "21 CFR PARTIE 1 SOUS-PARTIE S",
    "ja-JP": "21 CFR PART 1 SUBPART S",
    "zh-CN": "21 CFR 第1部分 S子部分"
  },
  "fsma.form_title": {
    "en-US": "+ Record Critical Tracking Event (CTE)",
    "hi-IN": "+ महत्वपूर्ण ट्रैकिंग घटना (सीटीई) दर्ज करें",
    "es-ES": "+ Registrar Evento Crítico de Seguimiento (CTE)",
    "de-DE": "+ Kritisches Verfolgungsereignis (CTE) erfassen",
    "fr-FR": "+ Enregistrer Événement Critique de Suivi (CTE)",
    "ja-JP": "+ 重要追跡イベント (CTE) の新規登録",
    "zh-CN": "+ 录入关键追踪事件记录 (CTE)"
  },
  "fsma.event_type_label": {
    "en-US": "CTE Event Type",
    "hi-IN": "सीटीई घटना का प्रकार",
    "es-ES": "Tipo de Evento CTE",
    "de-DE": "CTE-Ereignistyp",
    "fr-FR": "Type d'Événement CTE",
    "ja-JP": "CTEイベント種別",
    "zh-CN": "CTE 追踪事件类型"
  },
  "fsma.opt_receiving": {
    "en-US": "Receiving CTE (Received from Prior Facility)",
    "hi-IN": "आवक सीटीई (पूर्व सुविधा से प्राप्त)",
    "es-ES": "Recepción CTE (Recibido de Instalación Previa)",
    "de-DE": "Eingangs-CTE (Von Vorbetrieb Empfangen)",
    "fr-FR": "Réception CTE (Reçu d'un Établissement Précédent)",
    "ja-JP": "入荷受入 CTE (前工程施設からの受領)",
    "zh-CN": "收货事件 Receiving CTE (自上一设施接收)"
  },
  "fsma.opt_transformation": {
    "en-US": "Transformation CTE (Manufacturing / Repackaging)",
    "hi-IN": "परिवर्तन सीटीई (विनिर्माण / पुनः पैकेजिंग)",
    "es-ES": "Transformación CTE (Fabricación / Reenvasado)",
    "de-DE": "Transformations-CTE (Herstellung / Umverpackung)",
    "fr-FR": "Transformation CTE (Fabrication / Reconditionnement)",
    "ja-JP": "加工・変換 CTE (製造・小分け再包装)",
    "zh-CN": "加工转换事件 Transformation CTE (制造/重新包装)"
  },
  "fsma.opt_shipping": {
    "en-US": "Shipping CTE (Dispatched to Retail / Distribution)",
    "hi-IN": "शिपिंग सीटीई (खुदरा / वितरण के लिए भेजा गया)",
    "es-ES": "Envío CTE (Despachado a Venta / Distribución)",
    "de-DE": "Versand-CTE (An Handel / Vertrieb versendet)",
    "fr-FR": "Expédition CTE (Expédié vers Distribution)",
    "ja-JP": "出荷配送 CTE (小売・流通先への発送)",
    "zh-CN": "发货运输事件 Shipping CTE (发往零售/配送中心)"
  },
  "fsma.opt_initial_packing": {
    "en-US": "Initial Packing CTE (First packing of raw farm produce)",
    "hi-IN": "प्रारंभिक पैकिंग सीटीई (कच्ची कृषि उपज की पहली पैकिंग)",
    "es-ES": "Envasado Inicial CTE (Primer empaque agrícola)",
    "de-DE": "Erstverpackungs-CTE (Erste Rohwarenverpackung)",
    "fr-FR": "Conditionnement Initial CTE (Premier emballage agricole)",
    "ja-JP": "初回集荷梱包 CTE (農場生鮮品の一次包装)",
    "zh-CN": "初次装箱事件 Initial Packing CTE (初级农产品首次打包)"
  },
  "fsma.tlc_label": {
    "en-US": "Traceability Lot Code (TLC)",
    "hi-IN": "ट्रेसिबिलिटी लॉट कोड (टीएलसी)",
    "es-ES": "Código de Lote de Trazabilidad (TLC)",
    "de-DE": "Rückverfolgbarkeits-Chargencode (TLC)",
    "fr-FR": "Code de Lot de Traçabilité (TLC)",
    "ja-JP": "トレーサビリティ・ロットコード (TLC)",
    "zh-CN": "溯源批次代码 Traceability Lot Code (TLC)"
  },
  "fsma.parent_tlc_label": {
    "en-US": "Parent TLC (Genealogy)",
    "hi-IN": "मूल टीएलसी (वंशावली)",
    "es-ES": "TLC Padre (Genealogía)",
    "de-DE": "Übergeordneter TLC (Genealogie)",
    "fr-FR": "TLC Parent (Généalogie)",
    "ja-JP": "親TLC (原料ロット系譜)",
    "zh-CN": "母批次 TLC 代码 (物料谱系溯源)"
  },
  "fsma.parent_tlc_placeholder": {
    "en-US": "Parent Lot Code",
    "hi-IN": "मूल लॉट कोड दर्ज करें",
    "es-ES": "Código de Lote Padre",
    "de-DE": "Übergeordneter Chargencode",
    "fr-FR": "Code de Lot Parent",
    "ja-JP": "親ロットコードを入力",
    "zh-CN": "输入原料母批次号"
  },
  "fsma.gtin_label": {
    "en-US": "GTIN-14",
    "hi-IN": "जीटीआईएन-14",
    "es-ES": "GTIN-14",
    "de-DE": "GTIN-14",
    "fr-FR": "GTIN-14",
    "ja-JP": "GTIN-14",
    "zh-CN": "GTIN-14 全球贸易项目代码"
  },
  "fsma.commodity_label": {
    "en-US": "FTL Commodity",
    "hi-IN": "खाद्य ट्रेसिबिलिटी सूची (एफटीएल) वस्तु",
    "es-ES": "Producto FTL (Lista de Trazabilidad)",
    "de-DE": "FTL-Ware (Lebensmittelverfolgungsliste)",
    "fr-FR": "Denrée FTL (Liste de Traçabilité)",
    "ja-JP": "FTL規制対象品目 (食品トレーサビリティリスト)",
    "zh-CN": "FTL 重点食品溯源清单品类 (Food Traceability List)"
  },
  "fsma.ftl_nut_butters": {
    "en-US": "Nut Butters (almond/peanut/cashew)",
    "hi-IN": "नट बटर (बादाम/मूंगफली/काजू)",
    "es-ES": "Mantecas de Frutos Secos (almendra/cacahuete)",
    "de-DE": "Nussbutter (Mandel/Erdnuss/Cashew)",
    "fr-FR": "Beurres de Noix (amande/cacahuète)",
    "ja-JP": "ナッツバター (アーモンド/ピーナッツ/カシュー)",
    "zh-CN": "坚果酱类 (杏仁酱/花生酱/腰果酱)"
  },
  "fsma.ftl_cheeses": {
    "en-US": "Soft / Semi-Soft Cheeses",
    "hi-IN": "नरम / अर्ध-नरम चीज",
    "es-ES": "Quesos Blandos y Semiblandos",
    "de-DE": "Weich- & Halbfestkäse",
    "fr-FR": "Fromages à Pâte Molle / Demi-ferme",
    "ja-JP": "軟質・半軟質チーズ",
    "zh-CN": "软质与半软质干酪"
  },
  "fsma.ftl_eggs": {
    "en-US": "Shell Eggs",
    "hi-IN": "अंडे (शेल एग्स)",
    "es-ES": "Huevos con Cáscara",
    "de-DE": "Schaleneier",
    "fr-FR": "Œufs en Coquille",
    "ja-JP": "殻付き鶏卵",
    "zh-CN": "带壳鲜禽蛋"
  },
  "fsma.ftl_greens": {
    "en-US": "Leafy Greens (spinach/romaine)",
    "hi-IN": "पत्तेदार सब्जियां (पालक/रोमेन)",
    "es-ES": "Verduras de Hoja (espinaca/romana)",
    "de-DE": "Blattgemüse (Spinat/Romana)",
    "fr-FR": "Légumes-Feuilles (épinard/romaine)",
    "ja-JP": "葉物野菜 (ほうれん草/ロメインレタス)",
    "zh-CN": "绿叶蔬菜 (菠菜/罗马生菜/羽衣甘蓝)"
  },
  "fsma.ftl_finfish": {
    "en-US": "Finfish (fresh/frozen)",
    "hi-IN": "मछली (ताज़ा/फ्रोजन)",
    "es-ES": "Pescado con Aletas (fresco/congelado)",
    "de-DE": "Fische (frisch/gefroren)",
    "fr-FR": "Poissons (frais/surgelés)",
    "ja-JP": "魚類 (鮮魚/冷凍魚)",
    "zh-CN": "有鳍鱼类 (冰鲜/冷冻三文鱼、金枪鱼等)"
  },
  "fsma.ftl_cucumbers": {
    "en-US": "Cucumbers",
    "hi-IN": "खीरा (ताज़ा)",
    "es-ES": "Pepinos",
    "de-DE": "Gurken",
    "fr-FR": "Concombres",
    "ja-JP": "きゅうり",
    "zh-CN": "鲜黄瓜"
  },
  "fsma.ftl_herbs": {
    "en-US": "Fresh Herbs",
    "hi-IN": "ताज़ी जड़ी-बूटियाँ",
    "es-ES": "Hierbas Frescas",
    "de-DE": "Frische Kräuter",
    "fr-FR": "Herbes Fraîches",
    "ja-JP": "生鮮ハーブ類",
    "zh-CN": "新鲜香草 (罗勒/薄荷/香菜等)"
  },
  "fsma.ftl_tomatoes": {
    "en-US": "Tomatoes",
    "hi-IN": "टमाटर",
    "es-ES": "Tomates",
    "de-DE": "Tomaten",
    "fr-FR": "Tomates",
    "ja-JP": "トマト",
    "zh-CN": "鲜番茄"
  },
  "fsma.ftl_deli_salads": {
    "en-US": "Ready-to-Eat Deli Salads",
    "hi-IN": "खाने के लिए तैयार डेली सलाद",
    "es-ES": "Ensaladas Listas para Comer",
    "de-DE": "Verzehrfertige Feinkostsalate",
    "fr-FR": "Salades Traiteur Prêtes à Consommer",
    "ja-JP": "惣菜サラダ (即食)",
    "zh-CN": "即食预制冷盘沙拉"
  },
  "fsma.quantity_label": {
    "en-US": "Quantity & Unit",
    "hi-IN": "मात्रा एवं इकाई",
    "es-ES": "Cantidad y Unidad",
    "de-DE": "Menge & Einheit",
    "fr-FR": "Quantité & Unité",
    "ja-JP": "数量・計量単位",
    "zh-CN": "数量与计量单位"
  },
  "fsma.gln_label": {
    "en-US": "Facility GLN",
    "hi-IN": "सुविधा जीएलएन",
    "es-ES": "GLN de la Instalación",
    "de-DE": "Betriebs-GLN",
    "fr-FR": "GLN de l'Établissement",
    "ja-JP": "施設GLN (グローバル位置番号)",
    "zh-CN": "生产设施位置编码 GLN"
  },
  "fsma.btn_gps": {
    "en-US": "📍 GPS",
    "hi-IN": "📍 जीपीएस",
    "es-ES": "📍 GPS",
    "de-DE": "📍 GPS",
    "fr-FR": "📍 GPS",
    "ja-JP": "📍 GPS",
    "zh-CN": "📍 定位 GPS"
  },
  "fsma.btn_commit": {
    "en-US": "⚡ Commit CTE Record & Chain Hash",
    "hi-IN": "⚡ सीटीई रिकॉर्ड एवं हैश कमिट करें",
    "es-ES": "⚡ Confirmar Registro CTE y Hash en Cadena",
    "de-DE": "⚡ CTE-Eintrag & Ketten-Hash Festschreiben",
    "fr-FR": "⚡ Valider l'Enregistrement CTE & Hash",
    "ja-JP": "⚡ CTE記録を確定＆SHA-256ハッシュ連鎖",
    "zh-CN": "⚡ 确认提交 CTE 记录与区块链哈希存证"
  },
  "fsma.dossier_title": {
    "en-US": "Compliance Dossier Suite",
    "hi-IN": "अनुपालन डोजियर सुइट",
    "es-ES": "Suite de Expedientes de Cumplimiento",
    "de-DE": "Compliance-Dossier-Suite",
    "fr-FR": "Suite de Dossiers de Conformité",
    "ja-JP": "コンプライアンス監査調書スイート",
    "zh-CN": "合规审计全套案卷套件"
  },
  "fsma.dossier_sub": {
    "en-US": "SHA-256 Chain-of-Custody Cryptographic Ledger",
    "hi-IN": "एसएचए-256 कस्टडी श्रृंखला क्रिप्टोग्राफिक बहीखाता",
    "es-ES": "Libro Criptográfico de Cadena de Custodia SHA-256",
    "de-DE": "Kryptografisches SHA-256 Verwahrungsketten-Hauptbuch",
    "fr-FR": "Registre Cryptographique Chaîne de Traçabilité SHA-256",
    "ja-JP": "SHA-256 管理保管連鎖・暗号化監査台帳",
    "zh-CN": "基于SHA-256防篡改加密监管链溯源总账"
  },
  "fsma.btn_part11": {
    "en-US": "✍️ 21 CFR Part 11 Sign",
    "hi-IN": "✍️ 21 सीएफआर पार्ट 11 हस्ताक्षर",
    "es-ES": "✍️ Firmar 21 CFR Parte 11",
    "de-DE": "✍️ 21 CFR Part 11 Signieren",
    "fr-FR": "✍️ Signer 21 CFR Partie 11",
    "ja-JP": "✍️ 21 CFR Part 11 電子署名",
    "zh-CN": "✍️ 21 CFR Part 11 电子签名"
  },
  "fsma.btn_csv": {
    "en-US": "📊 FDA CSV",
    "hi-IN": "📊 एफडीए सीएसवी",
    "es-ES": "📊 CSV de la FDA",
    "de-DE": "📊 FDA CSV",
    "fr-FR": "📊 CSV FDA",
    "ja-JP": "📊 FDA CSV出力",
    "zh-CN": "📊 FDA标准电子表格 (CSV)"
  },
  "fsma.btn_jsonld": {
    "en-US": "🔗 EPCIS JSON-LD",
    "hi-IN": "🔗 ईपीसीआईएस जेएसओएन-एलडी",
    "es-ES": "🔗 EPCIS JSON-LD",
    "de-DE": "🔗 EPCIS JSON-LD",
    "fr-FR": "🔗 EPCIS JSON-LD",
    "ja-JP": "🔗 EPCIS JSON-LD",
    "zh-CN": "🔗 EPCIS 2.0 JSON-LD"
  },
  "fsma.btn_xml": {
    "en-US": "📄 EPCIS XML",
    "hi-IN": "📄 ईपीसीआईएस एक्सएमएल",
    "es-ES": "📄 EPCIS XML",
    "de-DE": "📄 EPCIS XML",
    "fr-FR": "📄 EPCIS XML",
    "ja-JP": "📄 EPCIS XML",
    "zh-CN": "📄 EPCIS 2.0 XML"
  },
  "fsma.btn_share": {
    "en-US": "📤 Share Dossier",
    "hi-IN": "📤 डोजियर साझा करें",
    "es-ES": "📤 Compartir Expediente",
    "de-DE": "📤 Dossier Teilen",
    "fr-FR": "📤 Partager Dossier",
    "ja-JP": "📤 監査調書を共有",
    "zh-CN": "📤 共享完整案卷"
  },
  "fsma.ledger_title": {
    "en-US": "Archived Chain-of-Custody Records",
    "hi-IN": "अभिलेखागार कस्टडी श्रृंखला रिकॉर्ड",
    "es-ES": "Registros Archivados de Cadena de Custodia",
    "de-DE": "Archivierte Verwahrungsketten-Datensätze",
    "fr-FR": "Enregistrements Archivés de la Chaîne de Traçabilité",
    "ja-JP": "保管記録・管理連鎖アーカイブ台帳",
    "zh-CN": "归档监管链防篡改历史事件记录"
  },
  "fsma.th_id": {
    "en-US": "Event ID",
    "hi-IN": "घटना आईडी",
    "es-ES": "ID de Evento",
    "de-DE": "Ereignis-ID",
    "fr-FR": "ID Événement",
    "ja-JP": "イベントID",
    "zh-CN": "事件编号"
  },
  "fsma.th_type": {
    "en-US": "Type",
    "hi-IN": "प्रकार",
    "es-ES": "Tipo",
    "de-DE": "Typ",
    "fr-FR": "Type",
    "ja-JP": "種別",
    "zh-CN": "事件类型"
  },
  "fsma.th_tlc": {
    "en-US": "TLC Lot",
    "hi-IN": "टीएलसी लॉट",
    "es-ES": "Lote TLC",
    "de-DE": "TLC-Charge",
    "fr-FR": "Lot TLC",
    "ja-JP": "TLCロット",
    "zh-CN": "TLC批号"
  },
  "fsma.th_parent_tlc": {
    "en-US": "Parent TLC",
    "hi-IN": "मूल टीएलसी",
    "es-ES": "TLC Padre",
    "de-DE": "Eltern-TLC",
    "fr-FR": "TLC Parent",
    "ja-JP": "親TLC",
    "zh-CN": "母批次TLC"
  },
  "fsma.th_gtin": {
    "en-US": "GTIN",
    "hi-IN": "जीटीआईएन",
    "es-ES": "GTIN",
    "de-DE": "GTIN",
    "fr-FR": "GTIN",
    "ja-JP": "GTIN",
    "zh-CN": "GTIN代码"
  },
  "fsma.th_timestamp": {
    "en-US": "Recorded Timestamp",
    "hi-IN": "दर्ज समय",
    "es-ES": "Marca de Tiempo",
    "de-DE": "Zeitstempel",
    "fr-FR": "Horodatage",
    "ja-JP": "記録日時",
    "zh-CN": "记录时间戳"
  },
  "fsma.th_hash": {
    "en-US": "SHA-256 Hash",
    "hi-IN": "एसएचए-256 हैश",
    "es-ES": "Hash SHA-256",
    "de-DE": "SHA-256 Hash",
    "fr-FR": "Hash SHA-256",
    "ja-JP": "SHA-256ハッシュ",
    "zh-CN": "SHA-256哈希"
  },
  "fsma.th_sig": {
    "en-US": "Part 11 Sig",
    "hi-IN": "पार्ट 11 हस्ताक्षर",
    "es-ES": "Firma Parte 11",
    "de-DE": "Part 11 Signatur",
    "fr-FR": "Signature Partie 11",
    "ja-JP": "Part 11署名",
    "zh-CN": "Part 11签名"
  },
  "fsma.th_actions": {
    "en-US": "Actions",
    "hi-IN": "कार्रवाई",
    "es-ES": "Acciones",
    "de-DE": "Aktionen",
    "fr-FR": "Actions",
    "ja-JP": "操作",
    "zh-CN": "操作"
  },

  // TAB 6: EXPORTS
  "exports.title": {
    "en-US": "Prepress Packaging Export Station",
    "hi-IN": "औद्योगिक प्रीप्रेस एवं उत्पादन निर्यात",
    "es-ES": "Estación de Exportación de Preimpresión de Empaques",
    "de-DE": "Druckvorstufen-Verpackungsexportstation",
    "fr-FR": "Station d'Exportation Prépresse pour Emballages",
    "ja-JP": "パッケージ製版出力＆産業印刷ステーション",
    "zh-CN": "印前包装工业级制版输出中心"
  },
  "exports.badge_airgap": {
    "en-US": "AIR-GAPPED WORKSTATION",
    "hi-IN": "एयर-गैप्ड कार्यक्षेत्र",
    "es-ES": "ESTACIÓN AISLADA OFFLINE",
    "de-DE": "AIR-GAPPED ARBEITSPLATZ",
    "fr-FR": "POSTE HORS-LIGNE SÉCURISÉ",
    "ja-JP": "完全オフライン隔離環境",
    "zh-CN": "离线物理隔离安全工作站"
  },
  "exports.bundle_headline": {
    "en-US": "1-TAP MASTER PACKAGING BUNDLE",
    "hi-IN": "1-टैप मास्टर पैकेजिंग बंडल",
    "es-ES": "PAQUETE MAESTRO DE EMPAQUE EN 1-TOQUE",
    "de-DE": "1-KLICK MASTER-VERPACKUNGSPAKET",
    "fr-FR": "LOT MAÎTRE D'EMBALLAGE EN 1 CLIC",
    "ja-JP": "1タップ マスターパッケージ一括出力",
    "zh-CN": "一键输出全套制版与生产档案总包"
  },
  "exports.bundle_sub": {
    "en-US": "Generates PDF/X-4 Plate, Die-Line SVG & Verified Proof Sheet simultaneously",
    "hi-IN": "एक साथ पीडीएफ/एक्स-4 प्लेट, डाई-लाइन एसवीजी और सत्यापित प्रूफ शीट तैयार करता है",
    "es-ES": "Genera plancha PDF/X-4, SVG de troquel y hoja de prueba verificada a la vez",
    "de-DE": "Erstellt PDF/X-4 Druckplatte, Stanzlinien-SVG & Prüfbogen gleichzeitig",
    "fr-FR": "Génère simultanément plaque PDF/X-4, SVG de découpe et épreuve vérifiée",
    "ja-JP": "PDF/X-4製版版面・抜き型SVG・校正証明書を同時に自動生成",
    "zh-CN": "同步生成 PDF/X-4 标准印版、刀模图 SVG 与印刷打样签样单"
  },
  "exports.btn_master_bundle": {
    "en-US": "📦 1-Click Master Prepress Bundle",
    "hi-IN": "📦 1-क्लिक मास्टर प्रीप्रेस बंडल",
    "es-ES": "📦 Paquete Maestro de Preimpresión en 1-Clic",
    "de-DE": "📦 1-Klick Master-Druckvorstufenpaket",
    "fr-FR": "📦 Lot Prépresse Maître en 1 Clic",
    "ja-JP": "📦 1クリック 製版マスターZIP出力",
    "zh-CN": "📦 一键打包输出制版母文件 (ZIP)"
  },
  "exports.seg_prepress": {
    "en-US": "🏆 Prepress Plates",
    "hi-IN": "🏆 प्रीप्रेस प्लेट्स",
    "es-ES": "🏆 Planchas de Preimpresión",
    "de-DE": "🏆 Druckvorstufenplatten",
    "fr-FR": "🏆 Plaques Prépresse",
    "ja-JP": "🏆 製版刷版プレート",
    "zh-CN": "🏆 矢量印刷印版"
  },
  "exports.seg_zebra": {
    "en-US": "🖨️ Zebra Thermal",
    "hi-IN": "🖨️ ज़ेबरा थर्मल",
    "es-ES": "🖨️ Zebra Térmica",
    "de-DE": "🖨️ Zebra Thermodruck",
    "fr-FR": "🖨️ Thermique Zebra",
    "ja-JP": "🖨️ Zebraサーマル印刷",
    "zh-CN": "🖨️ 斑马热敏打印机"
  },
  "exports.seg_batch": {
    "en-US": "📦 Batch CSV",
    "hi-IN": "📦 बैच सीएसवी",
    "es-ES": "📦 Lote CSV",
    "de-DE": "📦 Stapel-CSV",
    "fr-FR": "📦 Lot CSV",
    "ja-JP": "📦 一括バッチCSV",
    "zh-CN": "📦 批量导入 CSV"
  },
  "exports.bwr_title": {
    "en-US": "Prepress Vector Plates & BWR Compensation",
    "hi-IN": "प्रीप्रेस वेक्टर प्लेट्स एवं बीडब्ल्यूआर मुआवजा",
    "es-ES": "Planchas Vectoriales y Compensación BWR",
    "de-DE": "Vektordruckplatten & BWR-Kompensation",
    "fr-FR": "Plaques Vectorielles & Compensation BWR",
    "ja-JP": "製版ベクタープレート＆BWR線幅補正",
    "zh-CN": "矢量印刷印版与BWR条宽缩减补偿"
  },
  "exports.btn_pdf_x4": {
    "en-US": "🏆 PDF/X-4 Master",
    "hi-IN": "🏆 पीडीएफ/एक्स-4 मास्टर",
    "es-ES": "🏆 Maestro PDF/X-4",
    "de-DE": "🏆 PDF/X-4 Master",
    "fr-FR": "🏆 PDF/X-4 Maître",
    "ja-JP": "🏆 PDF/X-4 出力",
    "zh-CN": "🏆 PDF/X-4 印刷母版"
  },
  "exports.btn_cmyk_eps": {
    "en-US": "📄 CMYK EPS",
    "hi-IN": "📄 सीएमवाईके ईपीएस",
    "es-ES": "📄 CMYK EPS",
    "de-DE": "📄 CMYK EPS",
    "fr-FR": "📄 EPS CMJN",
    "ja-JP": "📄 CMYK EPS",
    "zh-CN": "📄 CMYK 矢量 EPS"
  },
  "exports.btn_pantone": {
    "en-US": "🎨 Pantone Spot",
    "hi-IN": "🎨 पैनटोन स्पॉट",
    "es-ES": "🎨 Color Directo Pantone",
    "de-DE": "🎨 Pantone Sonderfarbe",
    "fr-FR": "🎨 Ton Direct Pantone",
    "ja-JP": "🎨 パントン特色版",
    "zh-CN": "🎨 潘通专色分离版"
  },
  "exports.btn_layered_pdf": {
    "en-US": "📑 Layered PDF",
    "hi-IN": "📑 लेयर्ड पीडीएफ",
    "es-ES": "📑 PDF por Capas",
    "de-DE": "📑 Ebenen-PDF",
    "fr-FR": "📑 PDF Multicouche",
    "ja-JP": "📑 レイヤー構造PDF",
    "zh-CN": "📑 分层技术 PDF"
  },
  "exports.btn_pdf_600": {
    "en-US": "📐 600 DPI",
    "hi-IN": "📐 600 डीपीआई",
    "es-ES": "📐 600 DPI",
    "de-DE": "📐 600 DPI",
    "fr-FR": "📐 600 DPI",
    "ja-JP": "📐 600 DPI",
    "zh-CN": "📐 600 DPI 高精"
  },
  "exports.btn_pdf_1200": {
    "en-US": "📐 1200 DPI",
    "hi-IN": "📐 1200 डीपीआई",
    "es-ES": "📐 1200 DPI",
    "de-DE": "📐 1200 DPI",
    "fr-FR": "📐 1200 DPI",
    "ja-JP": "📐 1200 DPI",
    "zh-CN": "📐 1200 DPI 照排"
  },
  "exports.btn_dieline_svg": {
    "en-US": "📐 Die-Line SVG",
    "hi-IN": "📐 डाई-लाइन एसवीजी",
    "es-ES": "📐 SVG de Troquel",
    "de-DE": "📐 Stanzkontur-SVG",
    "fr-FR": "📐 Ligne Découpe SVG",
    "ja-JP": "📐 抜き型SVG",
    "zh-CN": "📐 刀模轮廓 SVG"
  },
  "exports.btn_proof_sheet": {
    "en-US": "🖨️ Proof Sheet",
    "hi-IN": "🖨️ प्रूफ शीट",
    "es-ES": "🖨️ Hoja de Prueba",
    "de-DE": "🖨️ Korrekturbogen",
    "fr-FR": "🖨️ Feuille d'Épreuve",
    "ja-JP": "🖨️ 校正プルーフ",
    "zh-CN": "🖨️ 打印打样单"
  },
  "exports.zebra_card_title": {
    "en-US": "Zebra ZPL II Thermal Printer & Socket Spooler",
    "hi-IN": "ज़ेबरा जेडपीएल II थर्मल प्रिंटर एवं सॉकेट स्पूलर",
    "es-ES": "Impresora Térmica Zebra ZPL II y Spooler de Socket",
    "de-DE": "Zebra ZPL II Thermodrucker & Socket-Spooler",
    "fr-FR": "Imprimante Thermique Zebra ZPL II & Spooler Réseau",
    "ja-JP": "Zebra ZPL II サーマルプリンター＆ソケットスプーラー",
    "zh-CN": "斑马 Zebra ZPL II 热敏打印机与网络套接字缓冲器"
  },
  "exports.zebra_status_ready": {
    "en-US": "STATUS: READY",
    "hi-IN": "स्थिति: तैयार",
    "es-ES": "ESTADO: LISTO",
    "de-DE": "STATUS: BEREIT",
    "fr-FR": "STATUT : PRÊT",
    "ja-JP": "ステータス: 準備完了",
    "zh-CN": "状态: 就绪待命"
  },
  "exports.dpi_203": {
    "en-US": "203 DPI (8 dots/mm — Shipping)",
    "hi-IN": "203 डीपीआई (8 डॉट्स/मिमी — शिपिंग)",
    "es-ES": "203 DPI (8 puntos/mm — Envío)",
    "de-DE": "203 DPI (8 Punkte/mm — Versand)",
    "fr-FR": "203 DPI (8 points/mm — Expédition)",
    "ja-JP": "203 DPI (8ドット/mm — 物流・配送)",
    "zh-CN": "203 DPI (8点/毫米 — 物流外箱)"
  },
  "exports.dpi_300": {
    "en-US": "300 DPI (12 dots/mm — Packaging)",
    "hi-IN": "300 डीपीआई (12 डॉट्स/मिमी — पैकेजिंग)",
    "es-ES": "300 DPI (12 puntos/mm — Empaque)",
    "de-DE": "300 DPI (12 Punkte/mm — Verpackung)",
    "fr-FR": "300 DPI (12 points/mm — Emballage)",
    "ja-JP": "300 DPI (12ドット/mm — 一般包装)",
    "zh-CN": "300 DPI (12点/毫米 — 标准包装标签)"
  },
  "exports.dpi_600": {
    "en-US": "600 DPI (24 dots/mm — Pharma)",
    "hi-IN": "600 डीपीआई (24 डॉट्स/मिमी — फार्मा)",
    "es-ES": "600 DPI (24 puntos/mm — Farma)",
    "de-DE": "600 DPI (24 Punkte/mm — Pharma)",
    "fr-FR": "600 DPI (24 points/mm — Pharma)",
    "ja-JP": "600 DPI (24ドット/mm — 医薬品・高精細)",
    "zh-CN": "600 DPI (24点/毫米 — 医药精细标刻)"
  },
  "exports.btn_generate_zpl": {
    "en-US": "⚡ Generate ZPL",
    "hi-IN": "⚡ जेडपीएल जनरेट करें",
    "es-ES": "⚡ Generar ZPL",
    "de-DE": "⚡ ZPL Generieren",
    "fr-FR": "⚡ Générer ZPL",
    "ja-JP": "⚡ ZPLコード生成",
    "zh-CN": "⚡ 生成 ZPL 代码"
  },
  "exports.zpl_placeholder": {
    "en-US": "Click \"Generate ZPL\" to synthesize printer code...",
    "hi-IN": "प्रिंटर कोड संश्लेषित करने के लिए \"जेडपीएल जनरेट करें\" पर क्लिक करें...",
    "es-ES": "Haga clic en \"Generar ZPL\" para sintetizar el código de impresora...",
    "de-DE": "Klicken Sie auf \"ZPL Generieren\", um Druckercode zu erstellen...",
    "fr-FR": "Cliquez sur \"Générer ZPL\" pour synthétiser le code d'impression...",
    "ja-JP": "「ZPLコード生成」をクリックしてプリンターコマンドを作成...",
    "zh-CN": "点击“生成 ZPL”以构建斑马打印机指令流..."
  },
  "exports.btn_copy_zpl": {
    "en-US": "📋 Copy ZPL",
    "hi-IN": "📋 जेडपीएल कॉपी करें",
    "es-ES": "📋 Copiar ZPL",
    "de-DE": "📋 ZPL Kopieren",
    "fr-FR": "📋 Copier ZPL",
    "ja-JP": "📋 ZPLコピー",
    "zh-CN": "📋 复制指令"
  },
  "exports.btn_save_zpl": {
    "en-US": "💾 Save .zpl",
    "hi-IN": "💾 .zpl सहेजें",
    "es-ES": "💾 Guardar .zpl",
    "de-DE": "💾 .zpl Speichern",
    "fr-FR": "💾 Sauvegarder .zpl",
    "ja-JP": "💾 .zpl保存",
    "zh-CN": "💾 保存为 .zpl 文件"
  },
  "exports.tcp_ip_placeholder": {
    "en-US": "Printer IP",
    "hi-IN": "प्रिंटर आईपी",
    "es-ES": "IP de Impresora",
    "de-DE": "Drucker-IP",
    "fr-FR": "IP Imprimante",
    "ja-JP": "プリンターIP",
    "zh-CN": "打印机网络IP地址"
  },
  "exports.btn_send_tcp": {
    "en-US": "🖨️ Send TCP",
    "hi-IN": "🖨️ टीसीपी भेजें",
    "es-ES": "🖨️ Enviar TCP",
    "de-DE": "🖨️ TCP Senden",
    "fr-FR": "🖨️ Envoyer TCP",
    "ja-JP": "🖨️ TCP送信",
    "zh-CN": "🖨️ TCP直连打印"
  },
  "exports.btn_poll_hs": {
    "en-US": "📊 Poll ~HS",
    "hi-IN": "📊 स्थिति जांचें (~HS)",
    "es-ES": "📊 Consultar ~HS",
    "de-DE": "📊 Status ~HS Abfragen",
    "fr-FR": "📊 État ~HS",
    "ja-JP": "📊 ~HS状態確認",
    "zh-CN": "📊 查询机头状态 (~HS)"
  },
  "exports.bt_mac_placeholder": {
    "en-US": "Bluetooth MAC (e.g. Zebra ZQ)",
    "hi-IN": "ब्लूटूथ मैक (उदा. ज़ेबरा ZQ)",
    "es-ES": "MAC de Bluetooth (ej. Zebra ZQ)",
    "de-DE": "Bluetooth-MAC (z.B. Zebra ZQ)",
    "fr-FR": "MAC Bluetooth (ex. Zebra ZQ)",
    "ja-JP": "Bluetooth MACアドレス (例: Zebra ZQ)",
    "zh-CN": "蓝牙MAC地址 (如 Zebra ZQ 便携打印机)"
  },
  "exports.btn_send_spp": {
    "en-US": "📱 Send BT SPP",
    "hi-IN": "📱 बीटी एसपीपी भेजें",
    "es-ES": "📱 Enviar BT SPP",
    "de-DE": "📱 BT SPP Senden",
    "fr-FR": "📱 Envoyer BT SPP",
    "ja-JP": "📱 BT SPP送信",
    "zh-CN": "📱 蓝牙串口发送 (SPP)"
  },
  "exports.btn_scan_ble": {
    "en-US": "🔍 Scan BLE",
    "hi-IN": "🔍 बीएलई खोजें",
    "es-ES": "🔍 Buscar BLE",
    "de-DE": "🔍 BLE Suchen",
    "fr-FR": "🔍 Scan BLE",
    "ja-JP": "🔍 BLEスキャン",
    "zh-CN": "🔍 扫描低功耗蓝牙 (BLE)"
  },
  "exports.batch_title": {
    "en-US": "Batch CSV Multi-SKU Synthesis",
    "hi-IN": "बैच सीएसवी मल्टी-एसकेयू संश्लेषण",
    "es-ES": "Síntesis de Lote CSV Multi-SKU",
    "de-DE": "Stapel-CSV Multi-SKU Synthese",
    "fr-FR": "Synthèse par Lot CSV Multi-SKU",
    "ja-JP": "CSV一括バッチ生成 (複数SKU)",
    "zh-CN": "多单品批量 CSV 自动化制版流水线"
  },
  "exports.batch_badge_zip": {
    "en-US": "ZIP ARCHIVE",
    "hi-IN": "ज़िप संग्रह",
    "es-ES": "ARCHIVO ZIP",
    "de-DE": "ZIP-ARCHIV",
    "fr-FR": "ARCHIVE ZIP",
    "ja-JP": "ZIPアーカイブ",
    "zh-CN": "ZIP 归档压缩包"
  },
  "exports.btn_batch_zip": {
    "en-US": "📦 Generate ZIP",
    "hi-IN": "📦 ज़िप जनरेट करें",
    "es-ES": "📦 Generar ZIP",
    "de-DE": "📦 ZIP Erstellen",
    "fr-FR": "📦 Générer ZIP",
    "ja-JP": "📦 ZIP一括生成",
    "zh-CN": "📦 生成批量归档 (ZIP)"
  },
  "exports.btn_batch_proof": {
    "en-US": "📑 Proof Sheet",
    "hi-IN": "📑 प्रूफ शीट",
    "es-ES": "📑 Hoja de Prueba",
    "de-DE": "📑 Prüfbogen",
    "fr-FR": "📑 Feuille d'Épreuve",
    "ja-JP": "📑 照合校正票",
    "zh-CN": "📑 批量签样单"
  },
  "exports.btn_batch_routing": {
    "en-US": "🗄️ Routing Bundle",
    "hi-IN": "🗄️ रूटिंग बंडल",
    "es-ES": "🗄️ Paquete de Enrutamiento",
    "de-DE": "🗄️ Routing-Paket",
    "fr-FR": "🗄️ Lot de Routage",
    "ja-JP": "🗄️ ルーティング設定一括",
    "zh-CN": "🗄️ 路由配置文件包"
  },

  // MODALS
  // Camera Rationale Modal
  "modal_camera.badge": {
    "en-US": "HARDWARE SENSOR ACCESS",
    "hi-IN": "हार्डवेयर सेंसर पहुंच",
    "es-ES": "ACCESO A SENSOR DE HARDWARE",
    "de-DE": "HARDWARE-SENSOR-ZUGRIFF",
    "fr-FR": "ACCÈS CAPTEUR MATÉRIEL",
    "ja-JP": "ハードウェアセンサーへのアクセス",
    "zh-CN": "硬件传感器权限访问"
  },
  "modal_camera.title": {
    "en-US": "Camera Permission Rationale",
    "hi-IN": "कैमरा अनुमति का कारण",
    "es-ES": "Motivo del Permiso de Cámara",
    "de-DE": "Begründung für Kamerazugriff",
    "fr-FR": "Raison de la Permission Caméra",
    "ja-JP": "カメラ権限リクエストの目的",
    "zh-CN": "相机使用权限说明"
  },
  "modal_camera.desc": {
    "en-US": "DualMark Studio requests access to your device camera strictly for real-time optical barcode scanning and perspective dewarping of packaging bills of lading.",
    "hi-IN": "ड्यूलमार्क स्टूडियो आपके डिवाइस कैमरे तक पहुंच का अनुरोध केवल वास्तविक समय बारकोड स्कैनिंग और पैकेजिंग दस्तावेज़ों के समतलीकरण के लिए करता है।",
    "es-ES": "DualMark Studio solicita acceso a su cámara estrictamente para escaneo óptico en tiempo real y corrección de perspectiva de albaranes de empaque.",
    "de-DE": "DualMark Studio fordert Kamerazugriff ausschließlich für das optische Echtzeit-Barcodescannen und das Entzerren von Frachtbriefen an.",
    "fr-FR": "DualMark Studio demande l'accès à votre caméra uniquement pour la lecture optique en temps réel et la correction de perspective des bordereaux.",
    "ja-JP": "DualMark Studioは、バーコードのリアルタイム光学スキャンおよび出荷伝票の透視補正の目的でのみカメラへのアクセスを要求します。",
    "zh-CN": "双码制版工作室仅在您进行实时条码光学识别及包装单据透视校正时请求使用摄像头。"
  },
  "modal_camera.zero_data": {
    "en-US": "🔒 Zero Data Collection Policy: Camera video frames are analyzed entirely in volatile RAM on-device and are never recorded, saved, uploaded, or transmitted across any network.",
    "hi-IN": "🔒 शून्य डेटा संग्रह नीति: कैमरा वीडियो फ्रेम का विश्लेषण पूरी तरह से ऑन-डिवाइस रैम में होता है और इन्हें कभी रिकॉर्ड, अपलोड या प्रेषित नहीं किया जाता है।",
    "es-ES": "🔒 Política de Cero Recopilación de Datos: Los fotogramas se analizan únicamente en la memoria RAM del dispositivo y nunca se guardan ni transmiten.",
    "de-DE": "🔒 Null-Datenerfassungsrichtlinie: Videobilder werden rein im RAM auf dem Gerät analysiert und niemals aufgezeichnet, gespeichert oder übertragen.",
    "fr-FR": "🔒 Zéro Collecte de Données : Les images sont analysées uniquement en mémoire vive sur l'appareil et ne sont jamais enregistrées ni téléversées.",
    "ja-JP": "🔒 データ完全非収集ポリシー: カメラフレームは端末の一時メモリ上でのみ解析され、保存・録画・外部送信されることは一切ありません。",
    "zh-CN": "🔒 零数据留存承诺：相机视频帧仅在设备本地内存中实时运算，绝不录制、绝不存储、绝不通过网络上传或对外传输。"
  },
  "modal_camera.btn_grant": {
    "en-US": "Grant Camera Permission",
    "hi-IN": "कैमरा अनुमति प्रदान करें",
    "es-ES": "Conceder Permiso de Cámara",
    "de-DE": "Kamerazugriff Erlauben",
    "fr-FR": "Autoriser la Caméra",
    "ja-JP": "カメラアクセスを許可",
    "zh-CN": "授权开启摄像头"
  },
  "modal_camera.btn_fallback": {
    "en-US": "Import Image File Instead (Offline Fallback)",
    "hi-IN": "इसके बजाय छवि फ़ाइल आयात करें (ऑफलाइन विकल्प)",
    "es-ES": "Importar Archivo de Imagen (Alternativa Offline)",
    "de-DE": "Stattdessen Bilddatei Importieren (Offline-Fallback)",
    "fr-FR": "Importer une Image à la Place (Secours Hors-ligne)",
    "ja-JP": "代わりに画像ファイルをインポート (オフライン)",
    "zh-CN": "改用导入本地图片文件 (离线替代)"
  },
  "modal_camera.btn_cancel": {
    "en-US": "Cancel",
    "hi-IN": "रद्द करें",
    "es-ES": "Cancelar",
    "de-DE": "Abbrechen",
    "fr-FR": "Annuler",
    "ja-JP": "キャンセル",
    "zh-CN": "取消"
  },

  // Legal Modal
  "modal_legal.badge": {
    "en-US": "STANDARDS & REGULATORY NOTICE",
    "hi-IN": "मानक एवं विनियामक सूचना",
    "es-ES": "AVISO DE NORMAS Y REGULACIONES",
    "de-DE": "STANDARDS & REGULATORISCHER HINWEIS",
    "fr-FR": "AVIS NORMES & RÉGLEMENTATIONS",
    "ja-JP": "標準規格・法規制に関する告知",
    "zh-CN": "行业标准与法规声明"
  },
  "modal_legal.title": {
    "en-US": "Legal & Compliance Disclaimers",
    "hi-IN": "कानूनी एवं अनुपालन अस्वीकरण",
    "es-ES": "Descargos Legales y de Cumplimiento",
    "de-DE": "Rechtliche & Compliance-Hinweise",
    "fr-FR": "Mentions Légales & Conformité",
    "ja-JP": "法的免責事項およびコンプライアンス",
    "zh-CN": "法律法规与合规性免责声明"
  },
  "modal_legal.item1_title": {
    "en-US": "1. GS1 Trademark & Standard Non-Affiliation",
    "hi-IN": "1. जीएस1 ट्रेडमार्क एवं गैर-संबद्धता",
    "es-ES": "1. Marca Registrada GS1 y No Afiliación",
    "de-DE": "1. GS1-Marken & Unabhängigkeit",
    "fr-FR": "1. Marques GS1 et Non-Affiliation",
    "ja-JP": "1. GS1商標および非提携関係の明示",
    "zh-CN": "1. GS1 商标与非官方附属声明"
  },
  "modal_legal.item1_body": {
    "en-US": "GS1, UPC, EAN, GS1 Digital Link, and DataBar are registered trademarks of GS1 AISBL. DualMark Studio is an independent prepress engineering tool and is not endorsed by, sponsored by, or affiliated with GS1 AISBL.",
    "hi-IN": "जीएस1, यूपीसी, ईएएन, जीएस1 डिजिटल लिंक, और डेटाबार जीएस1 एआईएसबीएल के पंजीकृत ट्रेडमार्क हैं। ड्यूलमार्क स्टूडियो एक स्वतंत्र प्रीप्रेस इंजीनियरिंग उपकरण है।",
    "es-ES": "GS1, UPC, EAN, GS1 Digital Link y DataBar son marcas registradas de GS1 AISBL. DualMark Studio es una herramienta independiente y no está patrocinada ni afiliada a GS1 AISBL.",
    "de-DE": "GS1, UPC, EAN, GS1 Digital Link und DataBar sind eingetragene Marken von GS1 AISBL. DualMark Studio ist ein unabhängiges Werkzeug und steht in keiner Verbindung zu GS1 AISBL.",
    "fr-FR": "GS1, UPC, EAN, GS1 Digital Link et DataBar sont des marques de GS1 AISBL. DualMark Studio est un outil indépendant et n'est ni affilié ni approuvé par GS1 AISBL.",
    "ja-JP": "GS1、UPC、EAN、GS1 Digital Link、DataBarはGS1 AISBLの登録商標です。DualMark Studioは独立した製版支援ツールであり、GS1 AISBLによる承認や提携関係はありません。",
    "zh-CN": "GS1、UPC、EAN、GS1 Digital Link 及 DataBar 均为 GS1 AISBL 的注册商标。双码制版工作室为独立工程技术预检工具，与 GS1 AISBL 无官方赞助、认可或附属关系。"
  },
  "modal_legal.item2_title": {
    "en-US": "2. FDA 21 CFR Part 11 Electronic Records Disclosure",
    "hi-IN": "2. एफडीए 21 सीएफआर पार्ट 11 इलेक्ट्रॉनिक रिकॉर्ड प्रकटीकरण",
    "es-ES": "2. Declaración de Registros Electrónicos FDA 21 CFR Parte 11",
    "de-DE": "2. FDA 21 CFR Part 11 Erklärung zu elektronischen Aufzeichnungen",
    "fr-FR": "2. Déclaration sur les Dossiers Électroniques FDA 21 CFR Part 11",
    "ja-JP": "2. 米国FDA 21 CFR Part 11 電子記録に関する告知",
    "zh-CN": "2. 美国FDA 21 CFR Part 11 电子记录合规须知"
  },
  "modal_legal.item2_body": {
    "en-US": "DualMark Studio provides client-side SHA-256 cryptographic audit trails for FSMA Rule 204 CTE/KDE event records. Users remain solely responsible for facility-level validation and operational controls required under 21 CFR Part 11.",
    "hi-IN": "ड्यूलमार्क स्टूडियो एफएसएमए नियम 204 रिकॉर्ड्स के लिए क्लाइंट-साइड एसएचए-256 ऑडिट ट्रेल्स प्रदान करता है। 21 सीएफआर पार्ट 11 के तहत परिचालन नियंत्रण के लिए उपयोगकर्ता पूरी तरह जिम्मेदार हैं।",
    "es-ES": "DualMark Studio proporciona pistas de auditoría criptográficas SHA-256 locales. Los usuarios son responsables de los controles operativos requeridos según 21 CFR Parte 11.",
    "de-DE": "DualMark Studio bietet clientseitige SHA-256 Audit-Trails. Die Verantwortung für betriebliche Kontrollen nach 21 CFR Part 11 verbleibt beim Betreiber.",
    "fr-FR": "DualMark Studio fournit des pistes d'audit SHA-256 locales. Les utilisateurs demeurent responsables des contrôles requis par le 21 CFR Part 11.",
    "ja-JP": "本アプリは端末内SHA-256暗号化監査証跡を提供しますが、21 CFR Part 11に基づく運用管理基準の遵守責任は各事業者に帰属します。",
    "zh-CN": "双码制版工作室提供客户端本地生成的 SHA-256 防篡改证据链。用户及企业对落实 21 CFR Part 11 所需的设施级验证与操作控制制度承担最终主体责任。"
  },
  "modal_legal.item3_title": {
    "en-US": "3. Optical Verification Limitation Notice",
    "hi-IN": "3. ऑप्टिकल सत्यापन सीमा सूचना",
    "es-ES": "3. Aviso de Limitación de Verificación Óptica",
    "de-DE": "3. Hinweis zu optischen Prüfbegrenzungen",
    "fr-FR": "3. Limites de la Vérification Optique",
    "ja-JP": "3. 光学検証ツールの利用上の注意事項",
    "zh-CN": "3. 物理间距预检工具使用限制说明"
  },
  "modal_legal.item3_body": {
    "en-US": "The 50mm Die-Line clearance inspector is a prepress design layout aid. It does not replace ISO/IEC 15416 (1D) or ISO/IEC 15415 (2D) calibrated optical barcode verifiers.",
    "hi-IN": "50मिमी डाई-लाइन निरीक्षक एक डिजाइन सहायता उपकरण है। यह आईएसओ/आईईसी कैलिब्रेटेड ऑप्टिकल बारकोड सत्यापनकर्ताओं की जगह नहीं लेता है।",
    "es-ES": "El inspector de troquel de 50 mm es una ayuda de diseño y no reemplaza a los verificadores ópticos calibrados ISO/IEC 15416 o 15415.",
    "de-DE": "Der 50mm-Stanzlinienprüfer ist eine Entwurfshilfe und ersetzt keine kalibrierten ISO/IEC-Prüfgeräte.",
    "fr-FR": "L'inspecteur 50 mm est une aide à la conception et ne remplace pas les vérificateurs optiques étalonnés ISO/IEC.",
    "ja-JP": "50mm抜き型検査機能は製版デザイン補助ツールであり、ISO/IEC 15416 / 15415準拠の校正済み専用バーコード検証機を代替するものではありません。",
    "zh-CN": "50毫米刀模间距检查器为印前版面排版辅助工具，不能完全取代经计量校准的 ISO/IEC 15416 (1D) 或 15415 (2D) 专用硬件级条码检测仪。"
  },
  "modal_legal.btn_privacy": {
    "en-US": "Privacy Policy",
    "hi-IN": "गोपनीयता नीति",
    "es-ES": "Política de Privacidad",
    "de-DE": "Datenschutzrichtlinie",
    "fr-FR": "Politique de Confidentialité",
    "ja-JP": "プライバシーポリシー",
    "zh-CN": "隐私政策"
  },
  "modal_legal.btn_terms": {
    "en-US": "Terms of Service",
    "hi-IN": "सेवा की शर्तें",
    "es-ES": "Términos del Servicio",
    "de-DE": "Nutzungsbedingungen",
    "fr-FR": "Conditions d'Utilisation",
    "ja-JP": "利用規約",
    "zh-CN": "服务条款"
  },
  "modal_legal.btn_deletion": {
    "en-US": "Data Deletion",
    "hi-IN": "डेटा विलोपन",
    "es-ES": "Eliminación de Datos",
    "de-DE": "Datenlöschung",
    "fr-FR": "Suppression des Données",
    "ja-JP": "データ削除要請",
    "zh-CN": "数据清除说明"
  },
  "modal_legal.btn_confirm": {
    "en-US": "Acknowledge",
    "hi-IN": "स्वीकार करें",
    "es-ES": "Entendido",
    "de-DE": "Bestätigen",
    "fr-FR": "Compris",
    "ja-JP": "確認・同意",
    "zh-CN": "已知悉并确认"
  },

  // Export Confirmation Modal
  "modal_export.title": {
    "en-US": "Export Preview & Confirmation",
    "hi-IN": "फ़ाइल निर्यात की पुष्टि करें",
    "es-ES": "Vista Previa y Confirmación de Exportación",
    "de-DE": "Exportvorschau & Bestätigung",
    "fr-FR": "Aperçu & Confirmation d'Exportation",
    "ja-JP": "出力プレビューと保存確認",
    "zh-CN": "文件导出预览与保存确认"
  },
  "modal_export.desc": {
    "en-US": "Review the generated file before saving to your device storage.",
    "hi-IN": "डिवाइस स्टोरेज में सहेजने से पहले आउटपुट फ़ाइल का पूर्वावलोकन करें:",
    "es-ES": "Revise el archivo generado antes de guardarlo en el almacenamiento de su dispositivo.",
    "de-DE": "Überprüfen Sie die generierte Datei, bevor Sie sie auf Ihrem Gerät speichern.",
    "fr-FR": "Vérifiez le fichier généré avant de l'enregistrer sur votre appareil.",
    "ja-JP": "端末ストレージへ保存する前に、生成されたファイル内容を確認してください。",
    "zh-CN": "在保存到设备存储之前，请预览检查生成的文件内容与技术规格。"
  },
  "modal_export.file_label": {
    "en-US": "File Name:",
    "hi-IN": "लक्ष्य फ़ाइल:",
    "es-ES": "Nombre del Archivo:",
    "de-DE": "Dateiname:",
    "fr-FR": "Nom du Fichier :",
    "ja-JP": "ファイル名:",
    "zh-CN": "文件名称:"
  },
  "modal_export.size_label": {
    "en-US": "Estimated Size",
    "hi-IN": "अनुमानित आकार",
    "es-ES": "Tamaño Estimado",
    "de-DE": "Geschätzte Größe",
    "fr-FR": "Taille Estimée",
    "ja-JP": "推定サイズ",
    "zh-CN": "预估体积"
  },
  "modal_export.type_label": {
    "en-US": "Document Type:",
    "hi-IN": "दस्तावेज़ प्रकार:",
    "es-ES": "Tipo de Documento:",
    "de-DE": "Dokumenttyp:",
    "fr-FR": "Type de Document :",
    "ja-JP": "文書形式:",
    "zh-CN": "文档类型:"
  },
  "modal_export.preview_label": {
    "en-US": "Content / Vector Preview:",
    "hi-IN": "दृश्य / सिंटैक्स पूर्वावलोकन:",
    "es-ES": "Vista Previa de Contenido / Vector:",
    "de-DE": "Inhalt / Vektor-Vorschau:",
    "fr-FR": "Aperçu Contenu / Vectoriel :",
    "ja-JP": "内容・ベクタープレビュー:",
    "zh-CN": "内容/矢量预览:"
  },
  "modal_export.confirm_btn": {
    "en-US": "✓ Confirm & Save",
    "hi-IN": "✓ पुष्टि करें और सहेजें",
    "es-ES": "✓ Confirmar y Guardar",
    "de-DE": "✓ Bestätigen & Speichern",
    "fr-FR": "✓ Confirmer & Enregistrer",
    "ja-JP": "✓ 保存を確定する",
    "zh-CN": "✓ 确认并保存到设备"
  },
  "modal_export.cancel_btn": {
    "en-US": "✕ Cancel",
    "hi-IN": "✕ रद्द करें",
    "es-ES": "✕ Cancelar",
    "de-DE": "✕ Abbrechen",
    "fr-FR": "✕ Annuler",
    "ja-JP": "✕ キャンセル",
    "zh-CN": "✕ 取消"
  },
  "modal_export.toast_saved": {
    "en-US": "✓ File saved successfully: ",
    "hi-IN": "✓ फ़ाइल सफलतापूर्वक सहेजी गई: ",
    "es-ES": "✓ Archivo guardado con éxito: ",
    "de-DE": "✓ Datei erfolgreich gespeichert: ",
    "fr-FR": "✓ Fichier enregistré avec succès : ",
    "ja-JP": "✓ ファイルを正常に保存しました: ",
    "zh-CN": "✓ 文件已成功保存: "
  },
  "modal_export.toast_canceled": {
    "en-US": "Export canceled. No files were written.",
    "hi-IN": "निर्यात रद्द किया गया। डिवाइस स्टोरेज का उपयोग नहीं हुआ।",
    "es-ES": "Exportación cancelada. No se escribieron archivos.",
    "de-DE": "Export abgebrochen. Keine Dateien geschrieben.",
    "fr-FR": "Exportation annulée. Aucun fichier n'a été écrit.",
    "ja-JP": "出力をキャンセルしました。保存は行われませんでした。",
    "zh-CN": "导出已取消，未向设备写入任何文件。"
  },

  // Licensing Modal
  "licensing.header_badge": {
    "en-US": "COMMERCIAL LICENSING & EDITIONS",
    "hi-IN": "व्यावसायिक लाइसेंसिंग एवं संस्करण",
    "es-ES": "LICENCIAS COMERCIALES Y EDICIONES",
    "de-DE": "KOMMERZIELLE LIZENZIERUNG & EDITIONEN",
    "fr-FR": "LICENCES COMMERCIALES ET ÉDITIONS",
    "ja-JP": "商用ライセンス＆エディション",
    "zh-CN": "商业授权许可与版本管理"
  },
  "licensing.header_title": {
    "en-US": "DualMark Studio Editions",
    "hi-IN": "ड्यूलमार्क स्टूडियो संस्करण",
    "es-ES": "Ediciones de DualMark Studio",
    "de-DE": "DualMark Studio Editionen",
    "fr-FR": "Éditions DualMark Studio",
    "ja-JP": "DualMark Studio エディション一覧",
    "zh-CN": "双码制版工作室版本体系"
  },
  "licensing.tier_free_title": {
    "en-US": "Free Evaluator",
    "hi-IN": "निःशुल्क मूल्यांकनकर्ता",
    "es-ES": "Evaluador Gratuito",
    "de-DE": "Kostenloser Bewerter",
    "fr-FR": "Évaluateur Gratuit",
    "ja-JP": "無料評価版",
    "zh-CN": "免费评估版"
  },
  "licensing.tier_free_desc": {
    "en-US": "Evaluation & Single Labels",
    "hi-IN": "मूल्यांकन एवं एकल लेबल",
    "es-ES": "Evaluación y Etiquetas Individuales",
    "de-DE": "Evaluierung & Einzeletiketten",
    "fr-FR": "Évaluation & Étiquettes Individuelles",
    "ja-JP": "評価利用・単一ラベル作成",
    "zh-CN": "体验评估与单张标签制作"
  },
  "licensing.tier_free_feat1": {
    "en-US": "1D Barcode synthesis (UPC-A, EAN-13)",
    "hi-IN": "1डी बारकोड संश्लेषण (यूपीसी-ए, ईएएन-13)",
    "es-ES": "Síntesis de código 1D (UPC-A, EAN-13)",
    "de-DE": "1D-Barcode-Generierung (UPC-A, EAN-13)",
    "fr-FR": "Synthèse de code-barres 1D (UPC-A, EAN-13)",
    "ja-JP": "1Dバーコード生成 (UPC-A, EAN-13)",
    "zh-CN": "一维条码生成 (UPC-A, EAN-13)"
  },
  "licensing.tier_free_feat2": {
    "en-US": "Basic 2D QR Code generator",
    "hi-IN": "बुनियादी 2डी क्यूआर कोड जनरेटर",
    "es-ES": "Generador básico de código QR 2D",
    "de-DE": "Standard 2D QR-Code Generator",
    "fr-FR": "Générateur de code QR 2D basique",
    "ja-JP": "標準2D QRコード生成機能",
    "zh-CN": "基础二维 QR 码生成器"
  },
  "licensing.tier_free_feat3": {
    "en-US": "Single-label 50mm die-line inspector preview",
    "hi-IN": "एकल-लेबल 50मिमी डाई-लाइन निरीक्षक पूर्वावलोकन",
    "es-ES": "Vista previa de zona de troquel de 50 mm",
    "de-DE": "50mm Stanzlinienprüfer für Einzeletikett",
    "fr-FR": "Aperçu de ligne de découpe 50 mm",
    "ja-JP": "単一ラベル 50mm安全間隔検査プレビュー",
    "zh-CN": "单标签 50毫米刀模安全间距预览"
  },
  "licensing.tier_free_feat4": {
    "en-US": "Standard PNG / SVG download",
    "hi-IN": "मानक पीएनजी / एसवीजी डाउनलोड",
    "es-ES": "Descarga estándar de PNG / SVG",
    "de-DE": "Standard PNG / SVG Download",
    "fr-FR": "Téléchargement standard PNG / SVG",
    "ja-JP": "標準PNG / SVG画像の保存",
    "zh-CN": "标准清晰度 PNG / SVG 图片下载"
  },
  "licensing.tier_free_feat5": {
    "en-US": "Air-gapped offline operation",
    "hi-IN": "एयर-गैप्ड ऑफलाइन संचालन",
    "es-ES": "Operación offline segura y aislada",
    "de-DE": "Vollständig autarker Offline-Betrieb",
    "fr-FR": "Fonctionnement 100% hors-ligne",
    "ja-JP": "完全オフライン環境での動作",
    "zh-CN": "离线物理隔离安全单机运行"
  },
  "licensing.tier_free_btn_active": {
    "en-US": "✓ Active Tier",
    "hi-IN": "✓ सक्रिय स्तर",
    "es-ES": "✓ Nivel Activo",
    "de-DE": "✓ Aktive Stufe",
    "fr-FR": "✓ Niveau Actif",
    "ja-JP": "✓ 現在のプラン",
    "zh-CN": "✓ 当前生效版本"
  },
  "licensing.tier_free_btn_switch": {
    "en-US": "Switch to Free",
    "hi-IN": "निःशुल्क स्तर पर जाएं",
    "es-ES": "Cambiar a Gratuito",
    "de-DE": "Zu Gratis wechseln",
    "fr-FR": "Passer au Gratuit",
    "ja-JP": "無料版へ切り替え",
    "zh-CN": "切换至免费版"
  },
  "licensing.tier_pro_popular": {
    "en-US": "POPULAR",
    "hi-IN": "लोकप्रिय",
    "es-ES": "POPULAR",
    "de-DE": "BELIEBT",
    "fr-FR": "POPULAIRE",
    "ja-JP": "一番人気",
    "zh-CN": "最受欢迎"
  },
  "licensing.tier_pro_title": {
    "en-US": "Commercial Pro",
    "hi-IN": "कमर्शियल प्रो",
    "es-ES": "Comercial Pro",
    "de-DE": "Commercial Pro",
    "fr-FR": "Commercial Pro",
    "ja-JP": "コマーシャル Pro",
    "zh-CN": "商业专业版 (Pro)"
  },
  "licensing.tier_pro_desc": {
    "en-US": "Packaging & FDA FSMA Production",
    "hi-IN": "पैकेजिंग एवं एफडीए एफएसएमए उत्पादन",
    "es-ES": "Producción de Empaque y FDA FSMA",
    "de-DE": "Verpackung & FDA FSMA Produktion",
    "fr-FR": "Production Emballage & FDA FSMA",
    "ja-JP": "包装量産＆FDA FSMAコンプライアンス",
    "zh-CN": "包装打样与FDA FSMA法规生产"
  },
  "licensing.tier_pro_feat1": {
    "en-US": "Everything in Free Tier",
    "hi-IN": "निःशुल्क स्तर की सभी सुविधाएं",
    "es-ES": "Todo lo incluido en el Nivel Gratuito",
    "de-DE": "Alles aus der kostenlosen Version",
    "fr-FR": "Tout le contenu du niveau Gratuit",
    "ja-JP": "無料版の全機能を含む",
    "zh-CN": "包含免费评估版全部功能"
  },
  "licensing.tier_pro_feat2": {
    "en-US": "GS1 Digital Link v1.2 Standard Syntax Parser",
    "hi-IN": "जीएस1 डिजिटल लिंक v1.2 मानक सिंटैक्स पार्सर",
    "es-ES": "Analizador de sintaxis GS1 Digital Link v1.2",
    "de-DE": "GS1 Digital Link v1.2 Standardsyntax-Parser",
    "fr-FR": "Analyseur syntaxique officiel GS1 Digital Link v1.2",
    "ja-JP": "GS1デジタルリンク v1.2 準拠構文パーサー",
    "zh-CN": "GS1 Digital Link v1.2 标准语法全功能解析器"
  },
  "licensing.tier_pro_feat3": {
    "en-US": "FDA FSMA Rule 204 CTE/KDE Logger with SHA-256 audit trail",
    "hi-IN": "एसएचए-256 ऑडिट ट्रेल के साथ एफएसएमए 204 लॉगर",
    "es-ES": "Registro CTE/KDE FSMA 204 con auditoría SHA-256",
    "de-DE": "FDA FSMA 204 CTE-Logger mit SHA-256 Prüfpfad",
    "fr-FR": "Journal CTE/KDE FSMA 204 avec piste SHA-256",
    "ja-JP": "SHA-256監査ログ付き FDA FSMA 204 CTE記録台帳",
    "zh-CN": "集成SHA-256证据链的 FDA FSMA 204 CTE/KDE 溯源台账"
  },
  "licensing.tier_pro_feat4": {
    "en-US": "Batch CSV packaging label synthesis",
    "hi-IN": "बैच सीएसवी पैकेजिंग लेबल संश्लेषण",
    "es-ES": "Síntesis masiva de etiquetas mediante CSV",
    "de-DE": "Stapel-CSV-Verpackungsetikettensynthese",
    "fr-FR": "Synthèse par lot d'étiquettes via CSV",
    "ja-JP": "CSV一括取り込みによる複数ラベル自動製版",
    "zh-CN": "多SKU批量导入 CSV 自动化制版流水线"
  },
  "licensing.tier_pro_feat5": {
    "en-US": "Offline SQLite dynamic redirect routing compiler",
    "hi-IN": "ऑफलाइन एसक्यूलाइट गतिशील पुनर्निर्देशन कंपाइलर",
    "es-ES": "Compilador SQLite offline de rutas dinámicas",
    "de-DE": "Offline SQLite Compiler für dynamische Weiterleitungen",
    "fr-FR": "Compilateur de redirection dynamique SQLite hors-ligne",
    "ja-JP": "オフラインSQLite ダイナミック転送ルールコンパイラ",
    "zh-CN": "离线 SQLite 动态重定向与防伪分流编译导出"
  },
  "licensing.tier_pro_feat6": {
    "en-US": "Barcode Width Reduction (BWR) flexo ink-gain compensation",
    "hi-IN": "बीडब्ल्यूआर फ्लेक्सो इंक-गेन मुआवजा",
    "es-ES": "Compensación BWR de ganancia de tinta flexográfica",
    "de-DE": "BWR-Kompensation für Flexodruck-Tonwertzunahme",
    "fr-FR": "Compensation BWR d'engraissement d'encre flexo",
    "ja-JP": "フレキソ印刷太り補正 (BWR線幅微調整機能)",
    "zh-CN": "柔印油墨扩张补偿 (BWR 条宽缩减校正)"
  },
  "licensing.tier_pro_feat7": {
    "en-US": "Commercial packaging prepress production license",
    "hi-IN": "व्यावसायिक पैकेजिंग प्रीप्रेस उत्पादन लाइसेंस",
    "es-ES": "Licencia comercial de producción en preimpresión",
    "de-DE": "Gewerbliche Lizenz für Verpackungsdruckvorstufe",
    "fr-FR": "Licence commerciale pour la production prépresse",
    "ja-JP": "商用パッケージ製版・印刷本番利用ライセンス",
    "zh-CN": "商业包装印前量产商业商用许可"
  },
  "licensing.tier_pro_btn_active": {
    "en-US": "✓ Active Pro License",
    "hi-IN": "✓ सक्रिय प्रो लाइसेंस",
    "es-ES": "✓ Licencia Pro Activa",
    "de-DE": "✓ Aktive Pro-Lizenz",
    "fr-FR": "✓ Licence Pro Active",
    "ja-JP": "✓ Proライセンス有効",
    "zh-CN": "✓ 专业版许可已激活"
  },
  "licensing.tier_pro_btn_upgrade": {
    "en-US": "Upgrade to Pro ($29.99)",
    "hi-IN": "प्रो में अपग्रेड करें ($29.99)",
    "es-ES": "Actualizar a Pro ($29.99)",
    "de-DE": "Auf Pro upgraden (29,99 $)",
    "fr-FR": "Passer à Pro (29,99 $)",
    "ja-JP": "Proにアップグレード ($29.99)",
    "zh-CN": "升级至专业版 ($29.99/月)"
  },
  "licensing.tier_ent_title": {
    "en-US": "Enterprise Perpetual",
    "hi-IN": "एंटरप्राइज सतत (Perpetual)",
    "es-ES": "Enterprise Perpetuo",
    "de-DE": "Enterprise Unbefristet",
    "fr-FR": "Enterprise Perpétuel",
    "ja-JP": "エンタープライズ無期限版",
    "zh-CN": "企业终身买断版 (Perpetual)"
  },
  "licensing.tier_ent_desc": {
    "en-US": "Prepress CMYK & Rugged Scanners",
    "hi-IN": "प्रीप्रेस सीएमवाईके एवं रग्ड स्कैनर",
    "es-ES": "Preimpresión CMYK y Escáneres Robustos",
    "de-DE": "Druckvorstufe CMYK & Industrie-Scanner",
    "fr-FR": "Prépresse CMJN & Scanners Durcis",
    "ja-JP": "CMYK刷版出力＆堅牢ハンディターミナル",
    "zh-CN": "CMYK分色照排与工业三防扫码枪"
  },
  "licensing.tier_ent_feat1": {
    "en-US": "Everything in Commercial Pro Tier",
    "hi-IN": "कमर्शियल प्रो की सभी सुविधाएं",
    "es-ES": "Todo lo incluido en Comercial Pro",
    "de-DE": "Alles aus der Commercial Pro Version",
    "fr-FR": "Tout le contenu de Commercial Pro",
    "ja-JP": "Commercial Proの全機能を含む",
    "zh-CN": "包含商业专业版全部功能"
  },
  "licensing.tier_ent_feat2": {
    "en-US": "Industrial Vector CMYK EPS & 600/1200 DPI PDF Prepress Export",
    "hi-IN": "सीएमवाईके ईपीएस एवं 600/1200 डीपीआई पीडीएफ निर्यात",
    "es-ES": "CMYK EPS Vectorial y PDF 600/1200 DPI de Alta Resolución",
    "de-DE": "Industrie-Vektor CMYK EPS & 600/1200 DPI PDF-Export",
    "fr-FR": "EPS CMJN Vectoriel & PDF 600/1200 DPI Haute Définition",
    "ja-JP": "高精細CMYK EPS＆600/1200 DPI製版用PDF出力",
    "zh-CN": "工业级矢量 CMYK EPS 与 600/1200 DPI 照排级 PDF 导出"
  },
  "licensing.tier_ent_feat3": {
    "en-US": "Edge Resolver Compilation (Cloudflare Workers, Nginx, AWS Lambda)",
    "hi-IN": "एज रिज़ॉल्वर संकलन (क्लाउडफ्लेयर, एनजीआईएनएक्स)",
    "es-ES": "Compilación Edge Resolver (Cloudflare, Nginx, Lambda)",
    "de-DE": "Edge-Resolver-Kompilierung (Cloudflare, Nginx, AWS)",
    "fr-FR": "Compilation Edge Resolver (Cloudflare, Nginx, Lambda)",
    "ja-JP": "エッジリゾルバ自動生成 (Cloudflare Workers, Nginx, Lambda)",
    "zh-CN": "边缘计算一键部署包 (Cloudflare Workers, Nginx, AWS Lambda)"
  },
  "licensing.tier_ent_feat4": {
    "en-US": "Rugged Barcode Handheld Scanner Wedge (Zebra, Honeywell, Datalogic)",
    "hi-IN": "रग्ड बारकोड स्कैनर वेज (ज़ेबरा, हनीवेल, डेटा लॉजिक)",
    "es-ES": "Integración con Escáneres Robustos (Zebra, Honeywell)",
    "de-DE": "Industrie-Handscanner-Wedge (Zebra, Honeywell, Datalogic)",
    "fr-FR": "Connexion Scanners Durcis (Zebra, Honeywell, Datalogic)",
    "ja-JP": "工業用ハンディスキャナ連携 (Zebra, Honeywell, Datalogic)",
    "zh-CN": "工业手持扫码枪硬件接口 (Zebra, Honeywell, Datalogic)"
  },
  "licensing.tier_ent_feat5": {
    "en-US": "GS1 GEPIR live company prefix validation",
    "hi-IN": "जीएस1 जीईपीआईआर कंपनी उपसर्ग सत्यापन",
    "es-ES": "Validación de prefijo de empresa GS1 GEPIR en vivo",
    "de-DE": "GS1 GEPIR Live-Prüfung von Unternehmenspräfixen",
    "fr-FR": "Validation en direct du préfixe d'entreprise GS1 GEPIR",
    "ja-JP": "GS1 GEPIR 企業プレフィックス公式レジストリ照会",
    "zh-CN": "GS1 GEPIR 全球官方厂商代码在线合规查验"
  },
  "licensing.tier_ent_feat6": {
    "en-US": "Priority SLA & custom die-line packaging templates",
    "hi-IN": "प्राथमिकता एसएलए एवं कस्टम डाई-लाइन टेम्प्लेट",
    "es-ES": "SLA prioritario y plantillas de troquel personalizadas",
    "de-DE": "Prioritäts-SLA & maßgeschneiderte Stanzvorlagen",
    "fr-FR": "SLA prioritaire et modèles de découpe personnalisés",
    "ja-JP": "最優先技術サポートSLA＆特注抜き型テンプレート",
    "zh-CN": "企业专属服务响应与定制刀模结构库"
  },
  "licensing.tier_ent_btn_active": {
    "en-US": "✓ Active Enterprise",
    "hi-IN": "✓ सक्रिय एंटरप्राइज",
    "es-ES": "✓ Enterprise Activo",
    "de-DE": "✓ Aktive Enterprise-Lizenz",
    "fr-FR": "✓ Entreprise Actif",
    "ja-JP": "✓ Enterprise有効",
    "zh-CN": "✓ 企业终身授权已生效"
  },
  "licensing.tier_ent_btn_upgrade": {
    "en-US": "Unlock Enterprise ($899)",
    "hi-IN": "एंटरप्राइज अनलॉक करें ($899)",
    "es-ES": "Desbloquear Enterprise ($899)",
    "de-DE": "Enterprise Freischalten (899 $)",
    "fr-FR": "Débloquer Entreprise (899 $)",
    "ja-JP": "Enterpriseを購入 ($899)",
    "zh-CN": "解锁企业终身版 ($899)"
  },
  "licensing.footer_note": {
    "en-US": "100% Offline-Friendly • Google Play In-App Billing Compatible",
    "hi-IN": "100% ऑफ़लाइन-अनुकूल • गूगल प्ले बिलिंग संगत",
    "es-ES": "100% Offline • Compatible con Google Play In-App Billing",
    "de-DE": "100% Offline-fähig • Google Play In-App Billing kompatibel",
    "fr-FR": "100% Hors-Ligne • Compatible Facturation Google Play",
    "ja-JP": "100%完全オフライン対応 • Google Playアプリ内課金連携",
    "zh-CN": "100% 支持离线闭环使用 • 支持 Google Play 官方应用内结算"
  },
  "licensing.btn_restore": {
    "en-US": "Restore Purchases",
    "hi-IN": "खरीदारी पुनर्स्थापित करें",
    "es-ES": "Restaurar Compras",
    "de-DE": "Käufe Wiederherstellen",
    "fr-FR": "Restaurer les Achats",
    "ja-JP": "購入履歴の復元",
    "zh-CN": "恢复历史购买记录"
  },

  // Onboarding Guided Tour
  "tour.btn_back": {
    "en-US": "Back",
    "hi-IN": "पीछे",
    "es-ES": "Atrás",
    "de-DE": "Zurück",
    "fr-FR": "Retour",
    "ja-JP": "戻る",
    "zh-CN": "上一步"
  },
  "tour.btn_next": {
    "en-US": "Next →",
    "hi-IN": "आगे →",
    "es-ES": "Siguiente →",
    "de-DE": "Weiter →",
    "fr-FR": "Suivant →",
    "ja-JP": "次へ →",
    "zh-CN": "下一步 →"
  },
  "tour.btn_finish": {
    "en-US": "Finish ✓",
    "hi-IN": "समाप्त ✓",
    "es-ES": "Finalizar ✓",
    "de-DE": "Fertigstellen ✓",
    "fr-FR": "Terminer ✓",
    "ja-JP": "完了 ✓",
    "zh-CN": "完成导览 ✓"
  },
  "tour.step1_title": {
    "en-US": "1. Dual-Code Barcode Synthesis",
    "hi-IN": "1. ड्यूल-कोड बारकोड संश्लेषण",
    "es-ES": "1. Síntesis de Código de Barras Dual",
    "de-DE": "1. Dual-Code Barcode-Synthese",
    "fr-FR": "1. Synthèse de Code-barres Double",
    "ja-JP": "1. デュアルコード自動製版",
    "zh-CN": "1. 传统与数字双码并存制版"
  },
  "tour.step1_content": {
    "en-US": "During the GS1 Sunrise 2027 transition, consumer packaging requires both a 1D UPC/EAN for legacy checkout scanners and a 2D GS1 Digital Link QR or DataMatrix code for smart supply chain data.",
    "hi-IN": "जीएस1 सनराइज 2027 संक्रमण के दौरान, उपभोक्ता पैकेजिंग में पुराने चेकआउट स्कैनर के लिए 1डी यूपीसी/ईएएन और स्मार्ट डेटा के लिए 2डी जीएस1 डिजिटल लिंक दोनों की आवश्यकता होती है।",
    "es-ES": "Durante la transición de GS1 Sunrise 2027, el empaque requiere tanto un código 1D UPC/EAN para cajas registradoras tradicionales como un código 2D GS1 Digital Link.",
    "de-DE": "Während des GS1 Sunrise 2027 Übergangs erfordert jede Verpackung sowohl 1D UPC/EAN für herkömmliche Kassen als auch 2D GS1 Digital Link für smarte Daten.",
    "fr-FR": "Pendant la transition GS1 Sunrise 2027, l'emballage exige à la fois un UPC/EAN 1D pour les caisses traditionnelles et un QR/DataMatrix GS1 Digital Link 2D.",
    "ja-JP": "GS1 Sunrise 2027の移行期においては、従来のレジ用1Dバーコードと、最新サプライチェーン対応の2D GS1デジタルリンクの双方が1つの包装に不可欠です。",
    "zh-CN": "在 GS1 日出计划 2027 过渡期内，快消品包装需同时印制供传统POS扫码的1D条码以及承载溯源数字链接的2D二维码。"
  },
  "tour.step2_title": {
    "en-US": "2. 1D Barcode & Auto Check Digit",
    "hi-IN": "2. 1डी बारकोड एवं स्वतः चेक अंक",
    "es-ES": "2. Código 1D y Dígito de Control Automático",
    "de-DE": "2. 1D-Barcode & Automatische Prüfziffer",
    "fr-FR": "2. Code 1D & Chiffre de Contrôle Automatique",
    "ja-JP": "2. 1Dバーコード＆自動チェックデジット",
    "zh-CN": "2. 一维条码与自动校验位运算"
  },
  "tour.step2_content": {
    "en-US": "Select UPC-A, EAN-13, Code-128, or ITF-14. As you type, the Modulo-10 check digit validates and corrects automatically with live GS1 country prefix lookup.",
    "hi-IN": "यूपीसी-ए, ईएएन-13, कोड-128, या आईटीएफ-14 चुनें। जैसे ही आप टाइप करते हैं, मोड्यूलो-10 चेक अंक लाइव जीएस1 देश उपसर्ग लुकअप के साथ स्वचालित रूप से सत्यापित हो जाता है।",
    "es-ES": "Seleccione UPC-A, EAN-13, Code-128 o ITF-14. A medida que escribe, el dígito de control Módulo-10 se valida automáticamente con búsqueda de prefijo de país GS1.",
    "de-DE": "Wählen Sie UPC-A, EAN-13, Code-128 oder ITF-14. Während der Eingabe prüft und korrigiert die Modulo-10-Prüfzifferberechnung automatisch inklusive GS1-Länderzuordnung.",
    "fr-FR": "Sélectionnez UPC-A, EAN-13, Code-128 ou ITF-14. Le chiffre de contrôle Modulo-10 est calculé en temps réel avec identification du pays GS1.",
    "ja-JP": "UPC-A、EAN-13、Code-128、ITF-14を選択できます。入力中にモジュロ10チェックディジットが自動計算・補正され、GS1国識別情報も即時反映されます。",
    "zh-CN": "支持 UPC-A、EAN-13、Code 128 及 ITF-14。输入时系统实时根据 Modulo-10 算法计算并核准末位校验码，并智能识别GS1所属国家与地区。"
  },
  "tour.step3_title": {
    "en-US": "3. Calendar Date Picker & Smart AIs",
    "hi-IN": "3. कैलेंडर तिथि पिकर एवं स्मार्ट एआई",
    "es-ES": "3. Selector de Fecha y AIs Inteligentes",
    "de-DE": "3. Kalenderdatum-Auswahl & Intelligente AIs",
    "fr-FR": "3. Sélecteur de Date & IA Intelligents",
    "ja-JP": "3. カレンダー日付選択＆GS1応用識別子",
    "zh-CN": "3. 日历选期与智能应用标识符 (AI)"
  },
  "tour.step3_content": {
    "en-US": "Use standard calendar dates—they auto-convert into GS1 AI (17) YYMMDD format. Add net weight (AI 3102), price payable (AI 3922), and country origin with smart input masks.",
    "hi-IN": "मानक कैलेंडर तिथियों का उपयोग करें—वे स्वचालित रूप से जीएस1 एआई (17) YYMMDD प्रारूप में परिवर्तित हो जाती हैं। स्मार्ट इनपुट मास्क के साथ वजन, मूल्य और मूल देश जोड़ें।",
    "es-ES": "Use fechas estándar que se convierten al formato GS1 AI (17) AAMMDD. Incorpore peso neto (AI 3102), precio (AI 3922) y país de origen con máscaras inteligentes.",
    "de-DE": "Standarddaten wählen — diese wandeln sich automatisch in das GS1 AI (17) JJMMTT-Format um. Ergänzen Sie Gewicht (AI 3102), Preis (AI 3922) und Herkunftsland komfortabel.",
    "fr-FR": "Sélectionnez des dates qui se convertissent au format GS1 AI (17) AAMMJJ. Ajoutez poids net (AI 3102), prix (AI 3922) et origine grâce à des masques intelligents.",
    "ja-JP": "通常のカレンダーで日付を選ぶだけでGS1 AI (17) YYMMDD形式に自動変換。正味重量(3102)・販売価格(3922)・原産国(422)も簡単に入力できます。",
    "zh-CN": "使用公历日历选取日期，自动转化为 GS1 AI (17) YYMMDD 标准格式。通过智能输入掩码轻松追加净重 (AI 3102)、价格 (AI 3922) 及原产国 (AI 422)。"
  },
  "tour.step4_title": {
    "en-US": "4. 50mm Die-Line Clearance Inspector",
    "hi-IN": "4. 50मिमी डाई-लाइन निकासी निरीक्षक",
    "es-ES": "4. Inspector de Separación de Troquel de 50 mm",
    "de-DE": "4. 50mm Stanzlinien-Sicherheitsabstandsprüfer",
    "fr-FR": "4. Inspecteur d'Espacement Ligne de Découpe 50 mm",
    "ja-JP": "4. 50mm抜き型安全クリアランス検査",
    "zh-CN": "4. 50毫米刀模物理安全间距审计"
  },
  "tour.step4_content": {
    "en-US": "Retail checkout lasers sweep at 40-70 items/minute. If 1D and 2D codes are closer than 50 mm, scanners trigger optical cross-talk. Drag codes or use 'Snap to 50mm' to ensure 100% retail pass rates.",
    "hi-IN": "खुदरा चेकआउट लेजर 40-70 आइटम/मिनट की गति से स्कैन करते हैं। यदि 1डी और 2डी कोड 50 मिमी से कम दूरी पर हैं, तो स्कैनर विफल हो सकते हैं। 100% पास दर सुनिश्चित करने के लिए '50मिमी स्नैप' का उपयोग करें।",
    "es-ES": "Los escáneres de caja leen a gran velocidad. Si los códigos 1D y 2D están a menos de 50 mm, causan interferencia. Arrastre los códigos o use 'Ajustar 50mm' para garantizar el éxito.",
    "de-DE": "Kassenscanner arbeiten im Sekundentakt. Liegen 1D- und 2D-Codes näher als 50 mm beieinander, kommt es zu Fehlscans. Nutzen Sie 'Einrasten 50mm' für 100% Erfolgsquote.",
    "fr-FR": "Les lecteurs de caisse scannent à grande vitesse. Si 1D et 2D sont à moins de 50 mm, des interférences surviennent. Utilisez 'Aligner 50mm' pour garantir 100% de réussite.",
    "ja-JP": "高速レジスキャナは毎分40〜70個を読み取ります。1Dと2Dの間隔が50mm未満だと光学的クロストークが生じます。「50mm吸着」で誤読を完全防止できます。",
    "zh-CN": "收银机全向激光每分钟扫描数十件商品。若一维与二维码间距小于50毫米将引发光学串扰误读。使用“自动对齐50毫米”确保零售收银100%一次过检率。"
  },
  "tour.step5_title": {
    "en-US": "5. Prepress Bar Width Reduction (BWR)",
    "hi-IN": "5. प्रीप्रेस बार चौड़ाई में कमी (BWR)",
    "es-ES": "5. Reducción de Ancho de Barra (BWR) de Preimpresión",
    "de-DE": "5. Druckvorstufen-Balkenbreitenreduktion (BWR)",
    "fr-FR": "5. Réduction de Largeur de Barre (BWR) Prépresse",
    "ja-JP": "5. 製版バー幅縮小補正 (BWR)",
    "zh-CN": "5. 印刷制版条宽缩减补偿 (BWR)"
  },
  "tour.step5_content": {
    "en-US": "Flexographic plates cause liquid ink spread on porous corrugated paper. Use the BWR slider (-40µm to -75µm) to shave bar widths proportionally and guarantee grade-A scans on press.",
    "hi-IN": "फ्लेक्सोग्राफिक प्लेट्स स्याही के फैलाव का कारण बनती हैं। बार की चौड़ाई को आनुपातिक रूप से कम करने और ग्रेड-ए स्कैन की गारंटी देने के लिए बीडब्ल्यूआर स्लाइडर का उपयोग करें।",
    "es-ES": "Las planchas flexográficas expanden la tinta líquida. Use el control deslizante de BWR para reducir el ancho de barra y asegurar calificaciones Grado A.",
    "de-DE": "Flexodruck führt zu Tonwertzunahme auf porösem Karton. Nutzen Sie den BWR-Schieberegler (-40µm bis -75µm), um Stegbreiten anzupassen und Grad-A-Scans zu sichern.",
    "fr-FR": "L'impression flexographique entraîne un étalement de l'encre. Ajustez le curseur BWR pour réduire la largeur des barres et garantir un résultat Grade A.",
    "ja-JP": "フレキソ印刷では液体インクが段ボール等の紙繊維に染み込み太ります。BWRスライダーでバー幅を事前に縮小補正し、印刷後のISOグレードAを保証します。",
    "zh-CN": "柔版印刷油墨在瓦楞纸上扩散会导致条线变宽。通过 BWR 滑块 (-40µm 至 -75µm) 对条形码线条预先做反向等比缩窄，确保上机印品达 ISO Grade A 级。"
  },
  "tour.step6_title": {
    "en-US": "6. FDA FSMA Rule 204 Traceability",
    "hi-IN": "6. एफडीए एफएसएमए नियम 204 ट्रेसिबिलिटी",
    "es-ES": "6. Trazabilidad FDA FSMA Regla 204",
    "de-DE": "6. FDA FSMA Vorschrift 204 Rückverfolgbarkeit",
    "fr-FR": "6. Traçabilité FDA FSMA Règle 204",
    "ja-JP": "6. 米国FDA FSMA規則204 トレーサビリティ",
    "zh-CN": "6. 美国FDA FSMA法规204 全流程合规追溯"
  },
  "tour.step6_content": {
    "en-US": "Log Critical Tracking Events (Receiving, Transformation, Shipping) for Food Traceability List items. Export 24-hour FDA sortable spreadsheets, EPCIS 2.0 JSON-LD/XML, and signed PDF dossiers.",
    "hi-IN": "खाद्य वस्तुओं के लिए महत्वपूर्ण ट्रैकिंग घटनाओं को रिकॉर्ड करें। 24 घंटे के भीतर एफडीए क्रमबद्ध करने योग्य स्प्रेडशीट, ईपीसीआईएस 2.0 और हस्ताक्षरित पीडीएफ डोजियर निर्यात करें।",
    "es-ES": "Registre eventos críticos (Recepción, Transformación, Envío). Exporte hojas de cálculo requeridas por la FDA en 24h, EPCIS 2.0 JSON-LD/XML y expedientes PDF firmados.",
    "de-DE": "Erfassen Sie kritische Ereignisse (Empfang, Umwandlung, Versand). Exportieren Sie 24-Stunden-FDA-Tabellen, EPCIS 2.0 JSON-LD/XML und signierte PDF-Dossiers.",
    "fr-FR": "Enregistrez les événements critiques (Réception, Transformation, Expédition). Exportez les rapports FDA en 24h, EPCIS 2.0 JSON-LD/XML et dossiers PDF signés.",
    "ja-JP": "食品追跡リスト品目の重要追跡イベント（入荷・加工・出荷）を記録。FDAが要求する24時間以内提出用CSV・EPCIS 2.0・電子署名付きPDF調書を出力します。",
    "zh-CN": "针对追溯清单食品记录关键追踪事件 (收货/加工/发货)。一键导出FDA要求的24小时内可检索电子表格、EPCIS 2.0 数据及经 Part 11 签名的完整案卷。"
  },
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
},
  "toast.language_updated": {
    "en-US": "Language updated: {lang}",
    "hi-IN": "भाषा अपडेट की गई: {lang}",
    "es-ES": "Idioma actualizado: {lang}",
    "de-DE": "Sprache aktualisiert: {lang}",
    "fr-FR": "Langue mise à jour : {lang}",
    "ja-JP": "言語が更新されました: {lang}",
    "zh-CN": "语言已更新: {lang}"
},
  "toast.tour_completed": {
    "en-US": "Tour completed! Click ? anytime to review.",
    "hi-IN": "टूर पूरा हुआ! समीक्षा के लिए कभी भी ? पर क्लिक करें।",
    "es-ES": "¡Tour completado! Haga clic en ? para revisar.",
    "de-DE": "Tour abgeschlossen! Klicken Sie jederzeit auf ?, um sie erneut anzusehen.",
    "fr-FR": "Visite terminée ! Cliquez sur ? pour revoir.",
    "ja-JP": "ツアー完了！確認したいときはいつでも ? をクリックしてください。",
    "zh-CN": "导览已完成！可随时点击 ? 再次查看。"
},
  "toast.legal_ack": {
    "en-US": "Legal & Regulatory Disclaimers Acknowledged",
    "hi-IN": "कानूनी एवं विनियामक अस्वीकरण स्वीकार किए गए",
    "es-ES": "Avisos legales y regulatorios reconocidos",
    "de-DE": "Rechtliche und regulatorische Hinweise bestätigt",
    "fr-FR": "Mentions légales et réglementaires acceptées",
    "ja-JP": "法的および規制に関する免責事項を確認しました",
    "zh-CN": "法律与监管合规声明已确认"
},
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
},
};

// Check parity
console.log("Checking key parity across locales...");
const allKeys = Object.keys(D);
console.log(`Total Keys: ${allKeys.length}`);

LOCALES.forEach(loc => {
  let missing = [];
  allKeys.forEach(k => {
    if (!D[k][loc]) missing.push(k);
  });
  if (missing.length > 0) {
    console.error(`Locale ${loc} missing keys:`, missing);
  } else {
    console.log(`✓ Locale ${loc} has all ${allKeys.length} keys!`);
  }
});

// Build TRANSLATIONS structure
const TRANSLATIONS = {};
LOCALES.forEach(loc => {
  TRANSLATIONS[loc] = {};
  allKeys.forEach(k => {
    TRANSLATIONS[loc][k] = D[k][loc];
  });
});

// Build replacement i18n.js
const fullI18nCode = `/**
 * DualMark Studio — Dynamic Multi-Lingual Localization Engine (i18n)
 * Comprehensive translations for all 7 target locales:
 * en-US (English), hi-IN (Hindi), es-ES (Spanish), de-DE (German),
 * fr-FR (French), ja-JP (Japanese), zh-CN (Chinese).
 *
 * Runs 100% client-side and offline with automatic system locale detection and persistent storage.
 */

(function(root, factory) {
  if (typeof define === "function" && define.amd) {
    define([], factory);
  } else if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.DualMarkI18n = factory();
  }
})(typeof self !== "undefined" ? self : this, function() {
  "use strict";

  var SUPPORTED_LOCALES = ["en-US", "hi-IN", "es-ES", "de-DE", "fr-FR", "ja-JP", "zh-CN"];
  var DEFAULT_LOCALE = "en-US";

  var TRANSLATIONS = ${JSON.stringify(TRANSLATIONS, null, 2)};

  var currentLocale = DEFAULT_LOCALE;

  function detectSystemLocale() {
    try {
      if (typeof localStorage !== "undefined") {
        var stored = localStorage.getItem("dualmark_locale");
        if (stored && SUPPORTED_LOCALES.indexOf(stored) !== -1) {
          return stored;
        }
      }
      if (typeof navigator !== "undefined") {
        var navLangs = navigator.languages || [navigator.language || navigator.userLanguage];
        for (var i = 0; i < navLangs.length; i++) {
          var lang = navLangs[i];
          if (!lang) continue;
          if (SUPPORTED_LOCALES.indexOf(lang) !== -1) {
            return lang;
          }
          var prefix = lang.split("-")[0];
          for (var j = 0; j < SUPPORTED_LOCALES.length; j++) {
            if (SUPPORTED_LOCALES[j].indexOf(prefix) === 0) {
              return SUPPORTED_LOCALES[j];
            }
          }
        }
      }
    } catch (e) {}
    return DEFAULT_LOCALE;
  }

  function setLanguage(locale) {
    if (!locale) return currentLocale;
    if (SUPPORTED_LOCALES.indexOf(locale) !== -1) {
      currentLocale = locale;
    } else {
      var match = null;
      for (var i = 0; i < SUPPORTED_LOCALES.length; i++) {
        if (SUPPORTED_LOCALES[i].indexOf(locale) === 0) {
          match = SUPPORTED_LOCALES[i];
          break;
        }
      }
      currentLocale = match || DEFAULT_LOCALE;
    }

    if (typeof localStorage !== "undefined") {
      try {
        localStorage.setItem("dualmark_locale", currentLocale);
      } catch (e) {}
    }

    if (typeof document !== "undefined") {
      document.documentElement.lang = currentLocale;
      translateDom();
    }

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("dualmark:locale_changed", {
        detail: { locale: currentLocale }
      }));
    }

    return currentLocale;
  }

  function getLanguage() {
    return currentLocale;
  }

  function getSupportedLanguages() {
    return SUPPORTED_LOCALES.slice();
  }

  function t(key, params) {
    params = params || {};
    var dict = TRANSLATIONS[currentLocale] || TRANSLATIONS[DEFAULT_LOCALE];
    var text = dict[key] || (TRANSLATIONS[DEFAULT_LOCALE] && TRANSLATIONS[DEFAULT_LOCALE][key]) || key;
    for (var k in params) {
      text = text.replace(new RegExp("\\\\{" + k + "\\\\}", "g"), params[k]);
    }
    return text;
  }

  function translateDom(rootElement) {
    if (typeof document === "undefined") return;
    var root = rootElement || document;

    var elements = root.querySelectorAll("[data-i18n]");
    for (var i = 0; i < elements.length; i++) {
      var el = elements[i];
      var key = el.getAttribute("data-i18n");
      if (key) {
        var val = t(key);
        // Only skip if key unmapped and element already has human text
        if (val === key && el.textContent.trim().length > 0 && !el.textContent.trim().startsWith("btn.")) {
          continue;
        }
        if (el.tagName === "INPUT" && (el.type === "button" || el.type === "submit")) {
          el.value = val;
        } else {
          el.textContent = val;
        }
      }
    }

    var placeholders = root.querySelectorAll("[data-i18n-placeholder]");
    for (var p = 0; p < placeholders.length; p++) {
      var pEl = placeholders[p];
      var pKey = pEl.getAttribute("data-i18n-placeholder");
      if (pKey) {
        pEl.placeholder = t(pKey);
      }
    }

    var titles = root.querySelectorAll("[data-i18n-title]");
    for (var ti = 0; ti < titles.length; ti++) {
      var tEl = titles[ti];
      var tKey = tEl.getAttribute("data-i18n-title");
      if (tKey) {
        tEl.title = t(tKey);
      }
    }

    var ariaLabels = root.querySelectorAll("[data-i18n-aria-label]");
    for (var ai = 0; ai < ariaLabels.length; ai++) {
      var aEl = ariaLabels[ai];
      var aKey = aEl.getAttribute("data-i18n-aria-label");
      if (aKey) {
        aEl.setAttribute("aria-label", t(aKey));
      }
    }
  }

  function init() {
    var detected = detectSystemLocale();
    setLanguage(detected);
  }

  return {
    init: init,
    setLanguage: setLanguage,
    getLanguage: getLanguage,
    getSupportedLanguages: getSupportedLanguages,
    t: t,
    translateDom: translateDom,
    TRANSLATIONS: TRANSLATIONS
  };
});
`;

fs.writeFileSync('web_app/js/i18n.js', fullI18nCode, 'utf8');
console.log("Successfully wrote updated web_app/js/i18n.js with full 7-locale translations!");
