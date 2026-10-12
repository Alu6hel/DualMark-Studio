import fs from 'fs';

const TOAST_KEYS = {
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
  }
};

let buildScript = fs.readFileSync('tools/build_all_translations.mjs', 'utf8');
const targetStr = '};\n\n// Check parity';
const insertPoint = buildScript.indexOf(targetStr);
if (insertPoint !== -1) {
  let entries = '';
  for (const [key, obj] of Object.entries(TOAST_KEYS)) {
    entries += `  ${JSON.stringify(key)}: ${JSON.stringify(obj, null, 4)},\n`;
  }
  buildScript = buildScript.slice(0, insertPoint) + entries + buildScript.slice(insertPoint);
  fs.writeFileSync('tools/build_all_translations.mjs', buildScript, 'utf8');
  console.log('Appended toast keys to build_all_translations.mjs!');
} else {
  console.error('Could not find insert point!');
}
