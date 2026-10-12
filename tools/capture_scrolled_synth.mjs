import { execSync } from 'child_process';

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

  // Set to German, click Synth tab, scroll down to the input controls
  await client.eval(`
    window.DualMarkI18n.setLanguage("de-DE");
    document.querySelector("[data-tab=\\"tab-synth\\"]")?.click();
    window.scrollTo({ top: 460, behavior: 'instant' });
  `);
  await new Promise(r => setTimeout(r, 600));
  execSync(`adb -s arc:5555 exec-out screencap -p > ${artifactDir}/screen_synth_de_scrolled.png`);
  console.log('Captured screen_synth_de_scrolled.png');

  // Also test Hindi scrolled
  await client.eval(`
    window.DualMarkI18n.setLanguage("hi-IN");
    window.scrollTo({ top: 460, behavior: 'instant' });
  `);
  await new Promise(r => setTimeout(r, 600));
  execSync(`adb -s arc:5555 exec-out screencap -p > ${artifactDir}/screen_synth_hi_scrolled.png`);
  console.log('Captured screen_synth_hi_scrolled.png');

  client.close();
}

run().catch(console.error);
