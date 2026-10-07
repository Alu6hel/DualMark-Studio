/**
 * DualMark Studio — Preset Loaders & Export Formatters
 * Feature Layer: Presentation layer coordinator for 1-click industry brand presets,
 * multi-SKU CSV parsing, ZIP generation, and clipboard/download formatters.
 */
(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.DualMarkPresetLoaders = factory();
  }
})(typeof self !== 'undefined' ? self : this, function() {
  'use strict';

  // =========================================================================
  // 1. 1-CLICK INDUSTRY BRAND PRESETS
  // =========================================================================

  const INDUSTRY_PRESETS = {
    'juice': {
      id: 'juice',
      name: 'Cold-Pressed Juice (12 oz Bottle)',
      category: 'Food & Beverage',
      symbology1d: 'UPC-A',
      code1d: '081234567890',
      symbology2d: 'qr',
      gtin: '00812345678901',
      lot: 'LOT-JUICE-99',
      expDate: '2028-10-31',
      packageWidthMm: 150,
      packageHeightMm: 55,
      weightGrams: 355
    },
    'pharma': {
      id: 'pharma',
      name: 'Pharmaceutical Unit Carton (DSCSA)',
      category: 'Healthcare & Pharma',
      symbology1d: 'Code 128',
      code1d: '0100812345678901',
      symbology2d: 'datamatrix',
      gtin: '00812345678901',
      lot: 'LOT-PHARMA-2027',
      serial: 'SN-009182',
      expDate: '2029-05-15',
      packageWidthMm: 90,
      packageHeightMm: 50,
      weightGrams: 50
    },
    'shipper': {
      id: 'shipper',
      name: 'Master Corrugate Case Shipper',
      category: 'Logistics & Warehousing',
      symbology1d: 'ITF-14',
      code1d: '10081234567897',
      symbology2d: 'qr',
      gtin: '10081234567897',
      lot: 'CASE-LOT-440',
      expDate: '2030-01-01',
      packageWidthMm: 220,
      packageHeightMm: 160,
      weightGrams: 5000
    },
    'blister': {
      id: 'blister',
      name: 'Cosmetics Blister Pack (Lip Balm / Tin)',
      category: 'Cosmetics & Personal Care',
      symbology1d: 'UPC-A',
      code1d: '081234567890',
      symbology2d: 'datamatrix',
      gtin: '00812345678901',
      lot: 'LOT-COSMETIC-1',
      expDate: '2028-06-30',
      packageWidthMm: 110,
      packageHeightMm: 75,
      weightGrams: 20
    }
  };

  function getPreset(key) {
    if (!key) return null;
    const normalized = String(key).toLowerCase().replace(/[- ]/g, '_');
    const aliasMap = {
      'juice': 'juice',
      'cold_pressed_juice': 'juice',
      'pharma': 'pharma',
      'pharmaceutical': 'pharma',
      'blister': 'blister',
      'blister_pack': 'blister',
      'shipper': 'shipper',
      'master_shipper': 'shipper'
    };
    const resolvedKey = aliasMap[normalized] || normalized;
    return INDUSTRY_PRESETS[resolvedKey] || null;
  }

  function getAllPresets() {
    return Object.values(INDUSTRY_PRESETS);
  }

  // =========================================================================
  // 2. MULTI-SKU CSV TABLE PARSER & BATCH PACKAGER
  // =========================================================================

  /**
   * Robust CSV table parser converting multi-column SKU spreadsheets into structured objects.
   */
  function parseSkuCsv(csvText) {
    if (!csvText || typeof csvText !== 'string') return [];

    const lines = csvText.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length < 2) return [];

    // Parse header
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/['"]/g, ''));

    // Map column aliases
    let gtinIdx = headers.findIndex(h => h.includes('gtin') || h.includes('barcode') || h.includes('upc'));
    const skuIdx = headers.findIndex(h => h.includes('sku') || h.includes('part') || h.includes('item'));
    if (gtinIdx === -1 && skuIdx !== -1) gtinIdx = skuIdx;

    const lotIdx = headers.findIndex(h => h.includes('lot') || h.includes('batch'));
    const serialIdx = headers.findIndex(h => h.includes('serial') || h.includes('sn'));
    const descIdx = headers.findIndex(h => h.includes('desc') || h.includes('name') || h.includes('title') || h.includes('product'));
    const weightIdx = headers.findIndex(h => h.includes('weight') || h.includes('qty'));

    const records = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      // Handle commas inside quotes
      const values = [];
      let inQuote = false;
      let cur = '';

      for (let c = 0; c < line.length; c++) {
        const char = line[c];
        if (char === '"') {
          inQuote = !inQuote;
        } else if (char === ',' && !inQuote) {
          values.push(cur.trim());
          cur = '';
        } else {
          cur += char;
        }
      }
      values.push(cur.trim());

      const gtin = (gtinIdx !== -1 && values[gtinIdx]) ? values[gtinIdx].replace(/\D/g, '') : `00812345678${i.toString().padStart(3, '0')}`;
      const sku = (skuIdx !== -1 && values[skuIdx]) ? values[skuIdx] : `SKU-${i.toString().padStart(3, '0')}`;
      const lot = (lotIdx !== -1 && values[lotIdx]) ? values[lotIdx] : `LOT-BATCH-${i}`;
      const serial = (serialIdx !== -1 && values[serialIdx]) ? values[serialIdx] : `SN-${i.toString().padStart(5, '0')}`;
      const description = (descIdx !== -1 && values[descIdx]) ? values[descIdx] : `SKU Item ${i}`;
      const weight = (weightIdx !== -1 && values[weightIdx]) ? values[weightIdx] : '500g';

      records.push({
        index: i,
        gtin,
        sku,
        lot,
        serial,
        description,
        weight,
        digitalLink: `https://id.dualmark.studio/01/${gtin}/10/${encodeURIComponent(lot)}/21/${encodeURIComponent(serial)}`
      });
    }

    return records;
  }

  // =========================================================================
  // 3. BLOB DOWNLOADERS & CLIPBOARD COPIERS
  // =========================================================================

  /**
   * Unified File Downloader (handles Web Browser and Native Android Bridge)
   */
  function downloadBlob(content, filename, mimeType = 'application/octet-stream') {
    // 1. Android Native Bridge integration
    if (typeof window !== 'undefined' && window.DualMarkBridge) {
      if (typeof window.DualMarkBridge.saveToMediaStore === 'function') {
        const base64 = btoa(unescape(encodeURIComponent(content)));
        if (window.DualMarkBridge.saveToMediaStore(base64, filename, mimeType)) {
          return true;
        }
      }
      if (typeof window.DualMarkBridge.savePdfToStorage === 'function' && filename.endsWith('.pdf')) {
        const base64 = btoa(unescape(encodeURIComponent(content)));
        window.DualMarkBridge.savePdfToStorage(base64, filename);
        return true;
      }
    }

    // 2. Standard Web Browser Blob Download
    if (typeof document !== 'undefined') {
      const blob = (content instanceof Blob) ? content : new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 150);
      return true;
    }
    return false;
  }

  /**
   * Unified Clipboard Copy Helper
   */
  async function copyToClipboard(text) {
    if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (e) {}
    }

    if (typeof document !== 'undefined') {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      try {
        const success = document.execCommand('copy');
        document.body.removeChild(ta);
        return success;
      } catch (e) {
        document.body.removeChild(ta);
      }
    }
    return false;
  }

  return {
    INDUSTRY_PRESETS,
    getPreset,
    getAllPresets,
    parseSkuCsv,
    downloadBlob,
    copyToClipboard
  };
});
