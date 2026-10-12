import fs from 'fs';

// Check existing i18n file
console.log("Reading existing i18n.js...");
const content = fs.readFileSync('web_app/js/i18n.js', 'utf8');
console.log("Length:", content.length);
