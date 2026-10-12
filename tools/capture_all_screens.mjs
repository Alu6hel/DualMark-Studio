import { execSync } from 'child_process';
import fs from 'fs';

async function getWsUrl() {
  const res = await fetch('http://127.0.0.1:9222/json/list');
  const pages = await res.json();
  return pages[0].webSocketDebuggerUrl;
}

class CdpClient {
  constructor(url) {
    this.url = url;
    this.id = 1;
    this.callbacks = new Map();
  }
  async connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.url);
      this.ws.onopen = () => resolve();
      this.ws.onerror = (err) => reject(err);
      this.ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.id && this.callbacks.has(msg.id)) {
          const cb = this.callbacks.get(msg.id);
          this.callbacks.delete(msg.id);
          if (msg.error) cb.reject(msg.error);
          else cb.resolve(msg.result);
        }
      };
    });
  }
  async send(method, params = {}) {
    const id = this.id++;
    return new Promise((resolve, reject) => {
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }
  async eval(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true
    });
    return res.result ? res.result.value : undefined;
  }
  close() {
    if (this.ws) this.ws.close();
  }
}

async function run() {
  const wsUrl = await getWsUrl();
  const client = new CdpClient(wsUrl);
  await client.connect();

  const artifactDir = '/home/davidalujones/.gemini/antigravity/brain/ad10b363-78f4-4078-a0a4-223860c4a6f2';
  
  // 1. Synth Tab in English
  await client.eval('window.DualMarkI18n.setLanguage("en-US"); document.querySelector("[data-tab=\\"tab-synth\\"]")?.click();');
  await new Promise(r => setTimeout(r, 600));
  execSync(`adb -s arc:5555 exec-out screencap -p > ${artifactDir}/screen_synth_en.png`);
  console.log('Captured screen_synth_en.png');

  // 2. Synth Tab in Hindi (hi-IN)
  await client.eval('window.DualMarkI18n.setLanguage("hi-IN");');
  await new Promise(r => setTimeout(r, 600));
  execSync(`adb -s arc:5555 exec-out screencap -p > ${artifactDir}/screen_synth_hi.png`);
  console.log('Captured screen_synth_hi.png');

  // 3. Synth Tab in German (de-DE)
  await client.eval('window.DualMarkI18n.setLanguage("de-DE");');
  await new Promise(r => setTimeout(r, 600));
  execSync(`adb -s arc:5555 exec-out screencap -p > ${artifactDir}/screen_synth_de.png`);
  console.log('Captured screen_synth_de.png');

  // 4. Tab 2 Clearance in Japanese (ja-JP)
  await client.eval('window.DualMarkI18n.setLanguage("ja-JP"); document.querySelector("[data-tab=\\"tab-clearance\\"]")?.click();');
  await new Promise(r => setTimeout(r, 600));
  execSync(`adb -s arc:5555 exec-out screencap -p > ${artifactDir}/screen_clearance_ja.png`);
  console.log('Captured screen_clearance_ja.png');

  // 5. Tab 5 FSMA 204 in French (fr-FR)
  await client.eval('window.DualMarkI18n.setLanguage("fr-FR"); document.querySelector("[data-tab=\\"tab-fsma\\"]")?.click();');
  await new Promise(r => setTimeout(r, 600));
  execSync(`adb -s arc:5555 exec-out screencap -p > ${artifactDir}/screen_fsma_fr.png`);
  console.log('Captured screen_fsma_fr.png');

  // 6. Tab 6 Exports in Chinese (zh-CN)
  await client.eval('window.DualMarkI18n.setLanguage("zh-CN"); document.querySelector("[data-tab=\\"tab-exports\\"]")?.click();');
  await new Promise(r => setTimeout(r, 600));
  execSync(`adb -s arc:5555 exec-out screencap -p > ${artifactDir}/screen_exports_zh.png`);
  console.log('Captured screen_exports_zh.png');

  // 7. Settings Drawer in Spanish (es-ES)
  await client.eval('window.DualMarkI18n.setLanguage("es-ES"); document.getElementById("btn-quick-settings")?.click();');
  await new Promise(r => setTimeout(r, 600));
  execSync(`adb -s arc:5555 exec-out screencap -p > ${artifactDir}/screen_settings_es.png`);
  console.log('Captured screen_settings_es.png');

  // Close settings, open Licensing modal in German
  await client.eval('document.getElementById("btn-close-settings")?.click(); window.DualMarkI18n.setLanguage("de-DE"); window.DualMarkLicensing.showPaywallModal();');
  await new Promise(r => setTimeout(r, 600));
  execSync(`adb -s arc:5555 exec-out screencap -p > ${artifactDir}/screen_licensing_de.png`);
  console.log('Captured screen_licensing_de.png');

  // Close licensing modal, open tour in Japanese
  await client.eval('document.getElementById("btn-close-licensing")?.click(); window.DualMarkI18n.setLanguage("ja-JP"); window.DualMarkTour.start();');
  await new Promise(r => setTimeout(r, 600));
  execSync(`adb -s arc:5555 exec-out screencap -p > ${artifactDir}/screen_tour_ja.png`);
  console.log('Captured screen_tour_ja.png');

  // Reset back to English
  await client.eval('document.getElementById("btn-tour-close")?.click(); window.DualMarkI18n.setLanguage("en-US"); document.querySelector("[data-tab=\\"tab-synth\\"]")?.click();');

  client.close();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
