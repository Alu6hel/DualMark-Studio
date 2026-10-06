# DualMark Studio — Google Play Data Safety Declaration

**Application Package:** `com.dualmark.studio`  
**Version:** 1.0.0  
**Effective Date:** October 6, 2026  
**Developer:** Alumungandr  

---

## 1. Summary of Data Collection & Sharing

| Data Type | Collected? | Shared with Third Parties? | Processed Ephemerally? | Purpose |
| :--- | :---: | :---: | :---: | :--- |
| **Personal Information (Name, Email, Phone)** | **NO** | **NO** | N/A | None collected |
| **Financial / Payment Information** | **NO** | **NO** | N/A | None collected (Handled securely via Google Play Billing) |
| **Photos and Videos** | **NO** | **NO** | **YES** | Real-time optical barcode scanning & perspective dewarping |
| **Location (GPS)** | **NO** | **NO** | **YES** | Embedded strictly into local FSMA Rule 204 PDF compliance dossiers |
| **Device or other IDs** | **NO** | **NO** | N/A | None collected |
| **App Activity / Analytics / Crash Logs** | **NO** | **NO** | N/A | Zero analytics or tracking SDKs included |

---

## 2. Detailed Permissions Breakdown

### A. Camera (`android.permission.CAMERA`)
- **Usage**: Invoked only when the user opens the "Optical Scanner & Dewarp" tab to read 1D barcodes and 2D GS1 Digital Link QR codes, or to dewarp physical bills of lading.
- **Ephemeral Processing**: Video frames from the camera feed are processed strictly in device volatile memory (RAM) using client-side image processing. No photographs, video streams, or image frames are ever written to disk or sent to any remote server.
- **Fallback Available**: Users may decline the camera permission and utilize the standard file chooser to import saved images manually.

### B. Location (`android.permission.ACCESS_FINE_LOCATION`, `android.permission.ACCESS_COARSE_LOCATION`)
- **Usage**: Accessed only on explicit user click ("Acquire GPS") in the FDA FSMA Rule 204 Critical Tracking Event (CTE) logger.
- **Scope**: The coordinates are stored locally in the case record and stamped into the exported PDF compliance dossier to verify point-of-harvest or warehouse location. Location coordinates are never transmitted off-device.

### C. Network (`android.permission.INTERNET`)
- **Usage**: Used strictly if the user initiates an optional external GS1 GEPIR lookup or accesses hosted documentation. The core application functions 100% offline in air-gapped industrial clean-room environments.

---

## 3. Security Practices
- **Data Encryption in Transit**: Not applicable (no user data is transmitted).
- **Data Deletion**: Users can delete all stored CTE records and dynamic routing rules locally at any time via the in-app storage reset buttons.
- **Target Audience & Families Policy**: Built for industrial and commercial logistics professionals.
