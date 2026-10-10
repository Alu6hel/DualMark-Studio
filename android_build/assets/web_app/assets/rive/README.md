# DualMark Studio — Rive Vector Assets

This directory houses compiled `.riv` binary assets exported from [Rive Studio](https://rive.app/) for DualMark Studio's hardware-accelerated state machine runtime.

## Asset Roles & Canvas Mappings

| Asset Name | Target Canvas | Description | Inputs |
| :--- | :--- | :--- | :--- |
| `marky_mascot.riv` | `#canvas-rive-mascot` | Marky AI packaging assistant in app header | `isScanning` (bool), `status` (number), `tap` (trigger) |
| `clearance_dial.riv` | `#canvas-rive-clearance` | Virtual 50mm clearance gauge on Tab 2 | `clearanceMm` (number), `isSafe` (bool), `isOccluded` (bool) |
| `scanner_hud.riv` | `#canvas-rive-scanner` | Optical reticle and dewarp corners on Tab 4 | `isTracking` (bool), `cornerFound` (bool), `capture` (trigger) |
| `zebra_printer.riv` | `#canvas-rive-printer` | Zebra ZPL direct thermal printing simulation on Tab 6 | `isPrinting` (bool), `isError` (bool), `headOpen` (bool) |
| `crypto_seal.riv` | `#canvas-rive-seal` | FDA 21 CFR Part 11 cryptographic seal on Tab 5 | `isSigned` (bool), `isMerkleValid` (bool) |

## Loading Custom Assets
Users and technical animators can load their own custom `.riv` binary files live at runtime without recompiling via the **Workstation Settings** drawer dropzone in DualMark Studio.
