# DualMark Studio

> An air-gapped, cross-platform (EXE / APK) workstation for 1D UPC generation, dynamic 2D GS1 Digital Link routing, packaging pre-flight inspection, and FSMA-compliant scan-to-PDF chain-of-custody documentation.

---

## Overview

Global retail is undergoing its largest structural transition since the first pack of chewing gum was scanned in 1974. Under the global **Sunrise 2027** mandate, point-of-sale (POS) systems across major enterprise retailers (Target, Walmart, Costco) are migrating from 1D laser barcode readers to camera-based 2D optical imagers.

This transition creates three massive bottlenecks for brands and suppliers:
1. **The Dual-Code Packaging Problem:** Until 2027 POS infrastructure reaches 100% saturation, consumer packaged goods (CPG) must carry *both* a legacy 1D UPC-A barcode and a 2D GS1 Digital Link code placed strictly within **50 mm** of each other without crowding small-format labels (lip balms, blister packs, snack bars).
2. **The Dynamic Infrastructure Gap:** A 2D barcode is not just an image; it is a dynamic URL resolver. Brands selling internationally require country-specific redirection, batch/lot-level serialization, and recall alerts without paying perpetual per-link SaaS fees.
3. **Regulatory Food Safety Traceability:** The FDA's Food Safety Modernization Act (FSMA) Traceability Rule demands auditable Critical Tracking Events (CTEs) across the supply chain to prevent outbreak delays (such as multi-state agricultural and infant formula recalls).

**DualMark Studio** solves all three in a single zero-telemetry, local-first engine packaged for Windows desktop (`.exe`) and Android mobile inspection (`.apk`).

---

## Retail POS & Optical Standards Matrix

| Standard | Optical Mechanism | Data Density | Target POS Speed | Lifecycle Status |
| :--- | :--- | :--- | :--- | :--- |
| **1D UPC-A / EAN-13** | Single-line laser reflection | 12–13 digits (SKU only) | 40–70 items/min | Sunset phase; required alongside 2D until POS phase-in completes |
| **2D GS1 Digital Link (QR)** | Camera/CMOS Area Imager | Multi-kilobyte dynamic URI | 40–70 items/min | Sunrise 2027 primary retail target standard |
| **2D GS1 DataMatrix** | Camera/CMOS Area Imager | Dense binary alphanumeric | Variable (Healthcare/DPM) | Regulated medical, pharmaceutical, and aerospace supply chains |

---

## Core Modules

### 1. Dual-Code Generator & Layout Pre-Flight
* **1D Barcode Synth:** Native generation of UPC-A, EAN-13, Code 128, and ITF-14 vectors with automatic check-digit calculation and GS1 company prefix validation.
* **GS1 Digital Link URI Builder:** Synthesizes standard-compliant URIs encoding:
  * Global Trade Item Number (`GTIN`)
  * Lot / Batch Number (AI `10`)
  * Serial Number (AI `21`)
  * Expiration / Best-Before Date (AI `17` / `15`)
* **50mm Clearance Validator:** Virtual die-line inspector that audits spacing between 1D and 2D codes to ensure retail cashiers achieve 40–70 items/minute pass-rates without laser-grid interference.

### 2. Self-Hosted Dynamic Link Resolver
* **Zero-SaaS Architecture:** Compiles a standalone SQLite routing database that can be deployed to any static host (Cloudflare Workers, Netlify, Nginx, or local edge server).
* **Geo-Targeted Content Switching:** Resolves the exact same physical QR code to distinct multi-lingual nutritional labels, regulatory warnings, or recycling rules based on client IP/country header.
* **Instant Recall Kill-Switch:** Real-time rerouting of specific serial or lot ranges to immediate safety notices in the event of contamination or withdrawal protocols.

### 3. High-Throughput Scan-to-PDF & FSMA Recordkeeper
* **Dual Camera Capture:** Mobile APK reads both 1D and 2D symbologies concurrently in sub-second passes using embedded edge-vision models.
* **Document Scanner & Dewarping:** Hardware-accelerated perspective correction, binarization, and automated OCR for physical bills of lading, farm origin certs, and packaging run sheets.
* **PDF/A-1b Archival Dossier:** Binds scanned physical paperwork, decoded 2D traceability metadata, GPS coordinates, and timestamped digital signatures into tamper-evident PDF reports matching FSMA critical tracking record requirements.

---

## System Architecture

```text
[Desktop EXE / Packaging Pre-Flight]
    ├── Vector Generator (UPC-A + GS1 Digital Link)
    ├── Spacing Engine (Enforces 50mm spacing & print contrast)
    └── Edge Routing Compiler (Exports static SQLite / JSON tables)
            │
            ▼
[Production Line / Retail Shelf]
            │
            ▼
[Mobile APK / Auditor & Field Scanner]
    ├── Dual Optical Decoder (Laser-simulated Camera Pipeline)
    ├── Local CTE Traceability Logger (Offline Cache)
    └── Scan-to-PDF Pipeline (Flattening, OCR, PDF/A Signing)
