import fs from 'fs';
import path from 'path';

console.log('===============================================================');
console.log('DUALMARK STUDIO: HYBRID RIVE WASM RUNTIME & FALLBACK TEST SUITE');
console.log('===============================================================');

let pass = 0;
let fail = 0;

function assert(cond, msg) {
  if (cond) {
    console.log(`  ✓ PASS: ${msg}`);
    pass++;
  } else {
    console.error(`  ✗ FAIL: ${msg}`);
    fail++;
  }
}

// 1. Static Syntax & Code Inspection
console.log('\n--- 1. Module Structure & Architecture Verification ---');
const riveSrc = fs.readFileSync('web_app/js/rive_integration.js', 'utf8');

assert(riveSrc.includes('function DualMarkRiveRuntime'), 'DualMarkRiveRuntime constructor defined');
assert(riveSrc.includes('loadRiv:'), 'loadRiv method defined on DualMarkRiveRuntime');
assert(riveSrc.includes('setNumber:'), 'setNumber state machine input method defined');
assert(riveSrc.includes('setBoolean:'), 'setBoolean state machine input method defined');
assert(riveSrc.includes('fireTrigger:'), 'fireTrigger state machine input method defined');
assert(riveSrc.includes('isUsingWasm'), 'isUsingWasm query method defined');
assert(riveSrc.includes('isUsingFallback'), 'isUsingFallback query method defined');
assert(riveSrc.includes('loadCustomRiv'), 'loadCustomRiv hot-swap API exposed');
assert(riveSrc.includes('getRuntimeStatus'), 'getRuntimeStatus diagnostic API exposed');
assert(riveSrc.includes('getAllRuntimeStatuses'), 'getAllRuntimeStatuses diagnostic API exposed');

// 2. Functional Headless Evaluation
console.log('\n--- 2. Headless Simulation & Fallback Execution ---');

// Create mock browser context
const mockCanvas = {
  getContext: () => ({
    clearRect: () => {},
    fillRect: () => {},
    beginPath: () => {},
    arc: () => {},
    fill: () => {},
    stroke: () => {},
    save: () => {},
    restore: () => {},
    translate: () => {},
    rotate: () => {},
    rect: () => {},
    roundRect: () => {},
    fillText: () => {},
    createLinearGradient: () => ({ addColorStop: () => {} })
  }),
  getBoundingClientRect: () => ({ width: 200, height: 200, left: 0, top: 0 }),
  width: 200,
  height: 200
};

// Global polyfills for node test environment
globalThis.window = globalThis;
globalThis.requestAnimationFrame = (fn) => setTimeout(fn, 16);
globalThis.cancelAnimationFrame = (id) => clearTimeout(id);
globalThis.CustomEvent = class { constructor(type, opt) { this.type = type; this.detail = opt?.detail; } };
globalThis.dispatchEvent = () => true;

// Evaluate rive_integration module
const factory = new Function('define', 'module', 'exports', riveSrc + '; return (typeof module !== "undefined" && module.exports) ? module.exports : DualMarkRive;');
const RiveEngine = factory(undefined, { exports: {} }, {});

assert(typeof RiveEngine === 'object', 'RiveEngine successfully instantiated');
assert(typeof RiveEngine.DualMarkRiveRuntime === 'function', 'DualMarkRiveRuntime class accessible from engine');

// Test 2.1: Procedural Fallback Instantiation
const testRuntime = new RiveEngine.DualMarkRiveRuntime({
  targetName: 'testWidget',
  canvas: mockCanvas,
  stateMachineName: 'SM_Test',
  initialState: { distanceMm: 50.0, isCompliant: true },
  onFallbackInit: (canvas, state) => {
    return {
      setNumber: (k, v) => { state[k] = v; },
      setBoolean: (k, v) => { state[k] = v; },
      fireTrigger: (k) => { state[k + '_fired'] = true; },
      pause: () => {},
      resume: () => {},
      destroy: () => {}
    };
  }
});

assert(testRuntime.isUsingFallback() === true, 'Defaults to procedural_fallback mode when WASM is not present');
assert(testRuntime.isUsingWasm() === false, 'isUsingWasm() returns false in fallback mode');

// Test 2.2: State Machine Input Dispatching
testRuntime.setNumber('distanceMm', 55.4);
assert(testRuntime.customFallbackState.distanceMm === 55.4, 'setNumber correctly updates target state (55.4 mm)');

testRuntime.setBoolean('isCompliant', true);
assert(testRuntime.customFallbackState.isCompliant === true, 'setBoolean correctly updates boolean state');

testRuntime.fireTrigger('snapPulse');
assert(testRuntime.customFallbackState.snapPulse_fired === true, 'fireTrigger correctly activates trigger event');

// Test 2.3: WASM Simulation with Mock Rive Runtime
console.log('\n--- 3. WebAssembly Rive Runtime Mock Execution ---');
let wasmInputsFired = {};
let wasmInputsValues = {};

globalThis.rive = {
  Rive: class {
    constructor(cfg) {
      this.cfg = cfg;
      setTimeout(() => {
        if (cfg.onLoad) cfg.onLoad();
      }, 10);
    }
    resizeDrawingSurfaceToCanvas() {}
    cleanup() {}
    stateMachineInputs(smName) {
      return [
        {
          name: 'distanceMm',
          type: 'number',
          get value() { return wasmInputsValues['distanceMm']; },
          set value(v) { wasmInputsValues['distanceMm'] = v; }
        },
        {
          name: 'isCompliant',
          type: 'boolean',
          get value() { return wasmInputsValues['isCompliant']; },
          set value(v) { wasmInputsValues['isCompliant'] = v; }
        },
        {
          name: 'snapPulse',
          type: 'trigger',
          fire: () => { wasmInputsFired['snapPulse'] = true; }
        }
      ];
    }
  }
};

const wasmLoadPromise = testRuntime.loadRiv('https://assets.dualmark.studio/mascot.riv', 'SM_Test');

wasmLoadPromise.then((loaded) => {
  assert(loaded === true, 'loadRiv successfully instantiated WASM Rive runtime');
  assert(testRuntime.isUsingWasm() === true, 'Runtime transitioned to wasm mode');
  assert(testRuntime.isUsingFallback() === false, 'isUsingFallback() is now false');

  testRuntime.setNumber('distanceMm', 62.8);
  assert(wasmInputsValues['distanceMm'] === 62.8, 'setNumber delegated to real WASM state machine input');

  testRuntime.setBoolean('isCompliant', true);
  assert(wasmInputsValues['isCompliant'] === true, 'setBoolean delegated to real WASM state machine input');

  testRuntime.fireTrigger('snapPulse');
  assert(wasmInputsFired['snapPulse'] === true, 'fireTrigger successfully fired WASM input trigger');

  // Test 3.1: Diagnostic API
  RiveEngine.init();
  const status = RiveEngine.getRuntimeStatus('clearance');
  assert(status !== null && status.targetName === 'clearance', 'getRuntimeStatus returns valid status object');
  assert(status.mode === 'procedural_fallback', 'Built-in clearance gauge reports procedural_fallback mode');

  console.log('===============================================================');
  console.log(`TOTAL RESULTS: ${pass} PASSED | ${fail} FAILED`);
  console.log('===============================================================');

  if (fail > 0) process.exit(1);
  process.exit(0);
});
