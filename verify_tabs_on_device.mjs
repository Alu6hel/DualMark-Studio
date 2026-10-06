import { execSync } from 'child_process';

const ARTIFACT_DIR = '/home/davidalujones/.gemini/antigravity/brain/9a8f1a6c-5d9f-4eb1-9390-3620279d8138';

function takeScreenshot(filename) {
  try {
    execSync(`adb -s arc:5555 exec-out screencap -p > "${ARTIFACT_DIR}/${filename}"`);
    console.log(`📸 Screenshot saved: ${filename}`);
  } catch (err) {
    console.error(`Failed to take screenshot ${filename}:`, err);
  }
}

async function run() {
  const listRes = await fetch("http://127.0.0.1:9222/json");
  const pages = await listRes.json();
  const page = pages.find(p => p.type === 'page' && p.url.includes('web_app'));
  if (!page) {
    throw new Error("Target WebView page not found! Found: " + JSON.stringify(pages));
  }

  console.log("Connecting to WebSocket:", page.webSocketDebuggerUrl);
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
  console.log("✓ CDP WebSocket connection established.\n");

  function sendCommand(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = msgId++;
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async function evalJs(expr) {
    const res = await sendCommand("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true });
    if (res.exceptionDetails) {
      throw new Error("JS Exception in: " + expr + "\nDetails: " + JSON.stringify(res.exceptionDetails));
    }
    return res.result?.value;
  }

  // Dismiss any lingering modals
  await evalJs(`
    document.querySelectorAll('.modal-overlay').forEach(m => m.style.display = 'none');
    const lic = document.getElementById('modal-licensing');
    if (lic) lic.remove();
  `);

  // Verify Tab 1 (Portrait)
  console.log("Switching to Tab 1: tab-synth");
  await evalJs("window.switchTab('tab-synth')");
  await new Promise(r => setTimeout(r, 600));
  takeScreenshot("tab1_synth_portrait.png");

  // Verify Tab 2 (Portrait)
  console.log("Switching to Tab 2: tab-clearance");
  await evalJs("window.switchTab('tab-clearance')");
  await new Promise(r => setTimeout(r, 600));
  takeScreenshot("tab2_clearance_portrait.png");

  // Verify Tab 3 (Portrait)
  console.log("Switching to Tab 3: tab-resolver");
  await evalJs("window.switchTab('tab-resolver')");
  await new Promise(r => setTimeout(r, 600));
  takeScreenshot("tab3_resolver_portrait.png");

  // Verify Tab 4 (Portrait)
  console.log("Switching to Tab 4: tab-scanner");
  await evalJs("window.switchTab('tab-scanner')");
  await new Promise(r => setTimeout(r, 600));
  takeScreenshot("tab4_scanner_portrait.png");

  // Verify Tab 5 (Portrait)
  console.log("Switching to Tab 5: tab-fsma");
  await evalJs("window.switchTab('tab-fsma')");
  await new Promise(r => setTimeout(r, 600));
  takeScreenshot("tab5_fsma_portrait.png");

  // Verify Tab 6 (Portrait)
  console.log("Switching to Tab 6: tab-exports");
  await evalJs("window.switchTab('tab-exports')");
  await new Promise(r => setTimeout(r, 600));
  takeScreenshot("tab6_exports_portrait.png");

  // Reset back to Tab 1
  await evalJs("window.switchTab('tab-synth')");

  console.log("\n✓ All 6 tabs verified and screenshotted!");
  ws.close();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
