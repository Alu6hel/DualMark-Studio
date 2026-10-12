import http from 'http';

// Helper to get active page WS URL
async function getWsUrl() {
  const res = await fetch('http://127.0.0.1:9222/json/list');
  const pages = await res.json();
  return pages[0].webSocketDebuggerUrl;
}

// Minimal JSON-RPC CDP Client
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
    if (res.exceptionDetails) {
      throw new Error(JSON.stringify(res.exceptionDetails));
    }
    return res.result ? res.result.value : undefined;
  }

  close() {
    if (this.ws) this.ws.close();
  }
}

async function run() {
  const wsUrl = await getWsUrl();
  console.log('Connecting to Webview at:', wsUrl);
  const client = new CdpClient(wsUrl);
  await client.connect();

  console.log('--- Initial State ---');
  const initialLang = await client.eval('window.DualMarkI18n ? window.DualMarkI18n.getLanguage() : "NONE"');
  console.log('Initial Language:', initialLang);

  const supported = await client.eval('window.DualMarkI18n ? window.DualMarkI18n.getSupportedLanguages() : []');
  console.log('Supported Languages:', supported);

  // Test each locale
  const results = {};
  for (const locale of supported) {
    await client.eval(`window.DualMarkI18n.setLanguage("${locale}")`);
    const activeLang = await client.eval('window.DualMarkI18n.getLanguage()');
    const docLang = await client.eval('document.documentElement.lang');
    
    // Sample translated UI elements
    const samples = await client.eval(`({
      title: document.querySelector('.brand-title')?.textContent?.trim(),
      synthProofTitle: document.querySelector('[data-i18n="synth.proof_title"]')?.textContent?.trim(),
      optUpca: document.querySelector('option[data-i18n="synth.1d_opt_upca"]')?.textContent?.trim(),
      optQr: document.querySelector('option[data-i18n="synth.2d_opt_qr"]')?.textContent?.trim(),
      navClearance: document.querySelector('[data-i18n="nav.clearance"]')?.textContent?.trim(),
      navScanner: document.querySelector('[data-i18n="nav.scanner"]')?.textContent?.trim(),
      navFsma: document.querySelector('[data-i18n="nav.fsma"]')?.textContent?.trim(),
      navExports: document.querySelector('[data-i18n="nav.exports"]')?.textContent?.trim(),
      btnSnap: document.querySelector('#btn-snap-50mm')?.textContent?.trim(),
      masterBundle: document.querySelector('#btn-tab1-prepress-bundle')?.textContent?.trim(),
      placeholderInput: document.querySelector('#synth-1d-input')?.placeholder
    })`);

    results[locale] = {
      activeLang,
      docLang,
      samples
    };
  }

  console.log('--- Multi-Lingual Audit Results ---');
  console.log(JSON.stringify(results, null, 2));

  client.close();
}

run().catch(err => {
  console.error('Error running audit:', err);
  process.exit(1);
});
