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

  // Dismiss any lingering modals
  await evalJs(`
    document.querySelectorAll('.modal-overlay').forEach(m => m.style.display = 'none');
    const lic = document.getElementById('modal-licensing');
    if (lic) lic.remove();
  `);

  // Switch to landscape via CDP Emulation
  console.log("Setting Landscape Device Emulation (852x515)...");
  await sendCommand("Emulation.setDeviceMetricsOverride", {
    width: 852,
    height: 515,
    deviceScaleFactor: 2,
    mobile: true,
    screenOrientation: { angle: 90, type: "landscapePrimary" }
  });
  await new Promise(r => setTimeout(r, 600));

  // Test Tab 1 in landscape
  console.log("Testing Tab 1 in Landscape...");
  await evalJs("window.switchTab('tab-synth')");
  await new Promise(r => setTimeout(r, 600));
  const snap1 = await sendCommand("Page.captureScreenshot", { format: "png" });
  fs.writeFileSync(`${ARTIFACT_DIR}/tab1_synth_landscape.png`, Buffer.from(snap1.data, 'base64'));
  console.log("📸 Saved tab1_synth_landscape.png");

  // Test Tab 2 (Clearance) in landscape
  console.log("Testing Tab 2 in Landscape...");
  await evalJs("window.switchTab('tab-clearance')");
  await new Promise(r => setTimeout(r, 600));
  const snap2 = await sendCommand("Page.captureScreenshot", { format: "png" });
  fs.writeFileSync(`${ARTIFACT_DIR}/tab2_clearance_landscape.png`, Buffer.from(snap2.data, 'base64'));
  console.log("📸 Saved tab2_clearance_landscape.png");

  // Test Tab 6 (Exports) in landscape
  console.log("Testing Tab 6 in Landscape...");
  await evalJs("window.switchTab('tab-exports')");
  await new Promise(r => setTimeout(r, 600));
  const snap6 = await sendCommand("Page.captureScreenshot", { format: "png" });
  fs.writeFileSync(`${ARTIFACT_DIR}/tab6_exports_landscape.png`, Buffer.from(snap6.data, 'base64'));
  console.log("📸 Saved tab6_exports_landscape.png");

  // Reset emulation back to portrait
  await sendCommand("Emulation.clearDeviceMetricsOverride");
  await evalJs("window.switchTab('tab-synth')");

  console.log("\n✓ Landscape verification complete!");
  ws.close();
}

run().catch(console.error);
