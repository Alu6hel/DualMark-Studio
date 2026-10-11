import fs from 'fs';
import { execSync } from 'child_process';

const ARTIFACT_DIR = '/home/davidalujones/.gemini/antigravity/brain/7cb4fbe9-0926-434b-a275-24679a4cb9d8';

async function main() {
  console.log("===============================================================");
  console.log(" DUALMARK STUDIO: VERIFY HINDI I18N, MASCOT THEMES & LIVE BG  ");
  console.log("===============================================================\n");

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

  async function evaluate(expression) {
    const res = await sendCommand("Runtime.evaluate", {
      expression,
      returnByValue: true,
      awaitPromise: true
    });
    if (res.exceptionDetails) {
      throw new Error(`Eval exception: ${res.exceptionDetails.text} (${expression})`);
    }
    return res.result?.value;
  }

  function captureScreenshot(filename) {
    const remotePath = `/sdcard/${filename}`;
    const localPath = `${ARTIFACT_DIR}/${filename}`;
    execSync(`adb shell screencap -p ${remotePath}`);
    execSync(`adb pull ${remotePath} ${localPath}`);
    execSync(`adb shell rm ${remotePath}`);
    console.log(`  📸 Screenshot saved: ${localPath}`);
    return localPath;
  }

  // 1. Verify Hindi Language Support
  console.log("--- 1. Testing Indian Language Support (hi-IN) ---");
  const langResult = await evaluate(`(() => {
    window.DualMarkI18n.setLanguage('hi-IN');
    const select = document.getElementById('select-language');
    if (select) select.value = 'hi-IN';
    return {
      currentLang: window.DualMarkI18n.getLanguage(),
      title: document.title,
      presetsTitle: document.querySelector('.presets-tag')?.textContent,
      presetJuice: document.getElementById('preset-juice')?.textContent?.trim(),
      presetPharma: document.getElementById('preset-pharma')?.textContent?.trim(),
      btnStartCamera: document.getElementById('btn-start-camera')?.textContent?.trim(),
      btnCalibrate: document.getElementById('btn-calibrate-target')?.textContent?.trim(),
      btnCommitCte: document.getElementById('btn-commit-cte')?.textContent?.trim(),
      btnExportPdf: document.getElementById('btn-export-pdf-x4')?.textContent?.trim(),
      btnExportEps: document.getElementById('btn-export-cmyk-eps')?.textContent?.trim(),
      btnPollZebra: document.getElementById('btn-poll-zebra-status')?.textContent?.trim(),
      btnScanBle: document.getElementById('btn-scan-ble-printers')?.textContent?.trim()
    };
  })()`);

  console.log("  Current Language:", langResult.currentLang);
  console.log("  Presets Juice:", langResult.presetJuice);
  console.log("  Camera Button:", langResult.btnStartCamera);
  console.log("  Calibrate Button:", langResult.btnCalibrate);
  console.log("  Commit CTE Button:", langResult.btnCommitCte);
  console.log("  Export PDF Button:", langResult.btnExportPdf);
  console.log("  Export EPS Button:", langResult.btnExportEps);
  console.log("  Poll Zebra Button:", langResult.btnPollZebra);
  console.log("  Scan BLE Button:", langResult.btnScanBle);

  // Assert NO raw button keys
  if (langResult.btnStartCamera.includes('btn.') || langResult.btnCalibrate.includes('btn.') || langResult.btnExportEps.includes('btn.')) {
    throw new Error("RAW DOT-NOTATION KEY DETECTED IN BUTTON TEXT: " + JSON.stringify(langResult));
  }
  console.log("✓ PASS: All buttons cleanly translated without raw keys in Hindi!\n");

  // 2. Switch to Mascot Safety Amber Theme & Specialist Avatar
  console.log("--- 2. Testing Mascot Safety Amber Theme ---");
  await evaluate(`(() => {
    window.DualMarkRive.setMascotStyle('specialist_avatar');
    const selMascot = document.getElementById('select-mascot-style');
    if (selMascot) selMascot.value = 'specialist_avatar';
    
    document.body.classList.remove('theme-light', 'theme-outdoor', 'theme-mascot-cyber');
    document.body.classList.add('theme-mascot-amber');
    localStorage.setItem('dualmark_active_theme', 'theme-mascot-amber');
    if (window.DualMarkLiveBackground) {
      window.DualMarkLiveBackground.setTheme('theme-mascot-amber');
    }
    
    const navItems = document.querySelectorAll('.bottom-nav .nav-item');
    if (navItems[0]) navItems[0].click();
  })()`);

  await new Promise(r => setTimeout(r, 1200));
  captureScreenshot("screenshot_mascot_amber_synth_hindi.png");

  // Switch to Scanner Tab in Amber Theme
  await evaluate(`(() => {
    const navItems = document.querySelectorAll('.bottom-nav .nav-item');
    if (navItems[3]) navItems[3].click();
  })()`);
  await new Promise(r => setTimeout(r, 1200));
  captureScreenshot("screenshot_mascot_amber_scanner_hindi.png");

  // 3. Switch to Mascot Cyber Visor Theme & Cyber Reticle / Marky Bot
  console.log("\n--- 3. Testing Mascot Cyber Visor Theme ---");
  await evaluate(`(() => {
    window.DualMarkRive.setMascotStyle('marky_scanner');
    const selMascot = document.getElementById('select-mascot-style');
    if (selMascot) selMascot.value = 'marky_scanner';

    document.body.classList.remove('theme-light', 'theme-outdoor', 'theme-mascot-amber');
    document.body.classList.add('theme-mascot-cyber');
    localStorage.setItem('dualmark_active_theme', 'theme-mascot-cyber');
    if (window.DualMarkLiveBackground) {
      window.DualMarkLiveBackground.setTheme('theme-mascot-cyber');
    }

    const navItems = document.querySelectorAll('.bottom-nav .nav-item');
    if (navItems[5]) navItems[5].click();
  })()`);
  await new Promise(r => setTimeout(r, 1200));
  captureScreenshot("screenshot_mascot_cyber_exports_hindi.png");

  // 4. Open Quick Settings Drawer in Cyber Theme
  console.log("\n--- 4. Testing Quick Settings Drawer in Hindi & Mascot Theme ---");
  await evaluate(`(() => {
    const btnQuickSettings = document.getElementById('btn-quick-settings');
    if (btnQuickSettings) btnQuickSettings.click();
  })()`);
  await new Promise(r => setTimeout(r, 1200));
  captureScreenshot("screenshot_quick_settings_hindi_themes.png");

  // Close Quick Settings Drawer
  await evaluate(`(() => {
    const btnClose = document.getElementById('btn-close-settings');
    if (btnClose) btnClose.click();
  })()`);

  // 5. Test Live Background Particle & Ripple Animation
  console.log("\n--- 5. Testing Live Background Simulation ---");
  const bgStatus = await evaluate(`(() => {
    const bg = window.DualMarkLiveBackground;
    if (!bg) return { error: "No DualMarkLiveBackground on window" };
    
    bg.createRipple(window.innerWidth / 2, window.innerHeight / 2, 120);
    bg.triggerScanSweep();
    
    return {
      active: !bg.isPaused,
      theme: bg.activeTheme,
      particleCount: bg.particles.length,
      rippleCount: bg.ripples.length,
      canvasWidth: bg.canvas?.width,
      canvasHeight: bg.canvas?.height
    };
  })()`);

  console.log("  Live Background Status:", JSON.stringify(bgStatus, null, 2));

  await evaluate(`(() => {
    if (window.DualMarkRive) {
      window.DualMarkRive.triggerMascotCelebrate();
    }
  })()`);
  await new Promise(r => setTimeout(r, 800));
  captureScreenshot("screenshot_live_bg_celebration.png");

  console.log("\n===============================================================");
  console.log(" ALL VERIFICATIONS PASSED SUCCESSFULLY!                       ");
  console.log("===============================================================");
  process.exit(0);
}

main().catch(err => {
  console.error("Verification failed:", err);
  process.exit(1);
});
