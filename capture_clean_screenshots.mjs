import fs from 'fs';

const ARTIFACT_DIR = '/home/davidalujones/.gemini/antigravity/brain/9a8f1a6c-5d9f-4eb1-9390-3620279d8138';

async function run() {
  const listRes = await fetch("http://127.0.0.1:9222/json");
  const pages = await listRes.json();
  const page = pages.find(p => p.type === 'page' && p.url.includes('web_app'));
  const ws = new WebSocket(page.webSocketDebuggerUrl);

  let msgId = 1;
  const pending = new Map();

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.id && pending.has(data.id)) {
      const { resolve, reject } = pending.get(data.id);
      pending.delete(data.id);
      if (data.error) reject(data.error);
      else resolve(data.result);
    }
  };

  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
  });

  function sendCommand(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = msgId++;
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async function evalJs(expr) {
    const res = await sendCommand("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true });
    return res.result?.value;
  }

  // Dismiss modals
  await evalJs(`
    document.querySelectorAll('.modal-overlay').forEach(m => m.style.display = 'none');
    const lic = document.getElementById('modal-licensing');
    if (lic) lic.remove();
  `);

  const tabs = [
    { id: 'tab-synth', name: 'tab1_synth_clean.png' },
    { id: 'tab-clearance', name: 'tab2_clearance_clean.png' },
    { id: 'tab-resolver', name: 'tab3_resolver_clean.png' },
    { id: 'tab-scanner', name: 'tab4_scanner_clean.png' },
    { id: 'tab-fsma', name: 'tab5_fsma_clean.png' },
    { id: 'tab-exports', name: 'tab6_exports_clean.png' }
  ];

  for (const t of tabs) {
    console.log(`Capturing ${t.id} -> ${t.name}`);
    await evalJs(`window.switchTab('${t.id}')`);
    await new Promise(r => setTimeout(r, 600));
    const snap = await sendCommand("Page.captureScreenshot", { format: "png" });
    fs.writeFileSync(`${ARTIFACT_DIR}/${t.name}`, Buffer.from(snap.data, 'base64'));
    console.log(`✓ Saved ${t.name}`);
  }

  await evalJs("window.switchTab('tab-synth')");
  console.log("\nAll clean viewport screenshots saved!");
  ws.close();
}

run().catch(console.error);
