# DualMark Studio

> An air-gapped, cross-platform (PWA / Web / APK / CLI) packaging workstation for 1D UPC generation, dynamic 2D GS1 Digital Link routing, 50mm clearance validation, and FSMA-compliant scan-to-PDF chain-of-custody documentation.

[![CI & Build Verification](https://github.com/Alu6hel/DualMark-Studio/actions/workflows/ci.yml/badge.svg)](https://github.com/Alu6hel/DualMark-Studio/actions/workflows/ci.yml)
[![GitHub Pages Deployment](https://github.com/Alu6hel/DualMark-Studio/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/Alu6hel/DualMark-Studio/actions/workflows/deploy-pages.yml)
[![Offline Air-Gap Ready](https://img.shields.io/badge/PWA-100%25%20Air--Gapped-00F0FF)](https://github.com/Alu6hel/DualMark-Studio)
[![Standards](https://img.shields.io/badge/ISO-15415%20%7C%2015416%20%7C%2015930--7-emerald)](https://github.com/Alu6hel/DualMark-Studio)

---

## Overview

Global retail is undergoing its largest structural transition since the first pack of chewing gum was scanned in 1974. Under the global **Sunrise 2027** mandate, point-of-sale (POS) systems across major enterprise retailers (Target, Walmart, Costco) are migrating from 1D laser barcode readers to camera-based 2D optical imagers.

This transition creates three massive bottlenecks for brands and suppliers:
1. **The Dual-Code Packaging Problem:** Until 2027 POS infrastructure reaches 100% saturation, consumer packaged goods (CPG) must carry *both* a legacy 1D UPC-A barcode and a 2D GS1 Digital Link code placed strictly within **50 mm** of each other without crowding small-format labels (lip balms, blister packs, snack bars).
2. **The Dynamic Infrastructure Gap:** A 2D barcode is not just an image; it is a dynamic URL resolver. Brands selling internationally require country-specific redirection, batch/lot-level serialization, and recall alerts without paying perpetual per-link SaaS fees.
3. **Regulatory Food Safety Traceability:** The FDA's Food Safety Modernization Act (FSMA) Traceability Rule demands auditable Critical Tracking Events (CTEs) across the supply chain to prevent outbreak delays (such as multi-state agricultural and infant formula recalls).

**DualMark Studio** solves all three in a single zero-telemetry, local-first engine packaged for Progressive Web Apps (PWA), Android mobile inspection (`.apk` / `.aab`), and Headless CI/CD prepress pipelines (`cli/dualmark-cli.mjs`).

---

## Retail POS & Optical Standards Matrix

| Standard | Optical Mechanism | Data Density | Target POS Speed | Lifecycle Status |
| :--- | :--- | :--- | :--- | :--- |
| **1D UPC-A / EAN-13** | Single-line laser reflection | 12–13 digits (SKU only) | 40–70 items/min | Sunset phase; required alongside 2D until POS phase-in completes |
| **2D GS1 Digital Link (QR)** | Camera/CMOS Area Imager | Multi-kilobyte dynamic URI | 40–70 items/min | Sunrise 2027 primary retail target standard |
| **2D GS1 DataMatrix** | Camera/CMOS Area Imager | Dense binary alphanumeric | Variable (Healthcare/DPM) | Regulated medical, pharmaceutical, and aerospace supply chains |
| **2D DotCode** | Ultra-high-speed industrial inkjet | Variable matrix ratio | 1,000+ items/min | High-throughput packaging lines & tobacco/pharma serialization |

---

## Core Architectural Modules

### 1. Dual-Code Generator & Layout Pre-Flight
* **1D Barcode Synth:** Native generation of UPC-A, EAN-13, Code 128, and ITF-14 vectors with automatic check-digit calculation and GS1 company prefix validation.
* **GS1 Digital Link URI Builder:** Synthesizes standard-compliant URIs encoding GTIN (01), Lot (10), Serial (21), Expiry (17).
* **3D Curvilinear Surface Clearance:** Virtual die-line inspector calculating geodesic arc length $s = R \cdot \Delta\theta$, line-of-sight occlusion, and optical foreshortening across curved cylinders and bottles.

### 2. Prepress RIP & 2D Bar Width Reduction (BWR)
* **2D Module Perimeter Erosion:** Exact micrometer-level inward erosion across both rectangular matrix modules (QR, DataMatrix) and circular dots (DotCode) to counteract press gain across Flexo and Gravure printing.
* **ISO 15930-7 (PDF/X-4:2010):** Native generation of print-ready PDF/X-4 documents with embedded CIDFont/Type0 OCR-B typography and ICC output intents (FOGRA51 / GRACoL).

### 3. Zebra ZPL II Direct Thermal Engine
* **Native DotCode `^BD` & DataMatrix `^BX`:** Dynamic millimeter-to-dot coordinate translation across 203, 300, and 600 DPI industrial printers.
* **Host Status Parser (`~HS`):** Bi-directional parser for printhead temperature, ribbon-out, and buffer telemetry.

### 4. High-Throughput Scan-to-PDF & FDA FSMA 204 Logger
* **Perspective Dewarping:** Canny edge detection, contour analysis, and bilinear quad rectification.
* **Cryptographic 21 CFR §11.100 PKI:** Persistent WebCrypto ECDSA P-256 key management with SHA-256 Merkle chaining and EPCIS 2.0 / CBV 2.0 TransformationEvent export.

### 5. Rive Vector Animation Engine
* **Dual-Mode Execution:** Official `@rive-app/canvas` WebAssembly runtime support paired with zero-latency HTML5 2D canvas procedural fallback.
* **Custom `.riv` Dropzone:** Interactive drag-and-drop loader in Workstation Settings for technical animators.

---

## Headless CLI Prepress Pipeline

DualMark Studio includes a unified, standalone CLI tool for automated packaging pipelines and CI/CD workflows:

```bash
# Generate Zebra ZPL label stream with native DotCode at 300 DPI
node cli/dualmark-cli.mjs --gtin 00812345678901 --format zpl --type DotCode --dpi 300

# Generate CMYK EPS with -50µm inward 2D Bar Width Reduction (BWR)
node cli/dualmark-cli.mjs --gtin 00812345678901 --format cmyk-eps --bwr -50 --output proof.eps

# Generate ISO 15930-7 compliant PDF/X-4 print proof
node cli/dualmark-cli.mjs --gtin 00812345678901 --format pdf-x4 --output proof.pdf

# Generate cryptographically signed JSON packaging manifest with SHA-256 Merkle root
node cli/dualmark-cli.mjs --gtin 00812345678901 --format json --sign
```

---

## 100% Offline Air-Gapped PWA

DualMark Studio operates with zero internet access required:
* **Service Worker (`sw.js`):** Cache-first strategy pre-caches all mathematical engines, stylesheets, and assets upon first load.
* **Web App Manifest (`manifest.json`):** Full standalone display support for iOS, Android, macOS, and Windows.

---

## Edge Gateway Integration

DualMark Studio pairs with the autonomous zero-cost Cloudflare Edge Worker gateway hosted on [Alumungandr](https://alumungandr.com/dualmark):
* Direct URI routing: `https://alumungandr.com/01/{gtin}...`
* RFC 9264 Content Negotiation (`pip`, `epcis`, `sds`, `all`)
* Instant emergency recall kill-switch routing
* FDA FSMA 204 CTE notarization and Merkle receipt issuance

---

## Mobile Android Compilation

Release APK and AAB binaries are pre-compiled and signed:
* `android_build/DualMark_Studio.apk` (Signed Release APK)
* `android_build/DualMark_Studio.aab` (Signed Release Android App Bundle)

To rebuild from source:
```bash
cd android_build
./build_apk.sh
./build_aab.sh
```

---

## License

DualMark Studio is licensed under the Apache 2.0 License. DualMark is an independent prepress engineering system and is not affiliated with GS1 AISBL.
