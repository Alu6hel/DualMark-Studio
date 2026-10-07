/**
 * DualMark Studio — Asynchronous Offline Storage Engine (IndexedDB + Fallback)
 * Bypasses the 5MB browser localStorage limit to store thousands of supply chain
 * CTE records, cryptographic Merkle chains, Part 11 signatures, and resolver rules.
 */
(function(window) {
  'use strict';

  var DB_NAME = 'dualmark_studio_db';
  var DB_VERSION = 1;

  function DualMarkStorage() {
    this.db = null;
    this.isIndexedDbAvailable = Boolean(window.indexedDB);
    this._initPromise = null;
  }

  DualMarkStorage.prototype = {
    init: function() {
      if (this._initPromise) return this._initPromise;
      var self = this;

      this._initPromise = new Promise(function(resolve, reject) {
        if (!self.isIndexedDbAvailable) {
          console.warn('[DualMarkDB] IndexedDB not available; falling back to localStorage');
          return resolve(null);
        }

        try {
          var req = window.indexedDB.open(DB_NAME, DB_VERSION);

          req.onupgradeneeded = function(e) {
            var db = e.target.result;
            // 1. FSMA 204 CTE Records
            if (!db.objectStoreNames.contains('fsma_records')) {
              var fsmaStore = db.createObjectStore('fsma_records', { keyPath: 'id' });
              fsmaStore.createIndex('gtin', 'gtin', { unique: false });
              fsmaStore.createIndex('recordedAt', 'recordedAt', { unique: false });
            }
            // 2. Dynamic Resolver Rules
            if (!db.objectStoreNames.contains('resolver_rules')) {
              var ruleStore = db.createObjectStore('resolver_rules', { keyPath: 'id' });
              ruleStore.createIndex('gtin', 'gtin', { unique: false });
            }
            // 3. System Settings & Keys
            if (!db.objectStoreNames.contains('system_settings')) {
              db.createObjectStore('system_settings', { keyPath: 'key' });
            }
          };

          req.onsuccess = function(e) {
            self.db = e.target.result;
            resolve(self.db);
          };

          req.onerror = function(err) {
            console.warn('[DualMarkDB] Open error, falling back to localStorage', err);
            resolve(null);
          };
        } catch (ex) {
          console.warn('[DualMarkDB] Exception opening IndexedDB', ex);
          resolve(null);
        }
      });

      return this._initPromise;
    },

    put: function(storeName, item) {
      var self = this;
      return this.init().then(function(db) {
        if (!db) {
          // Fallback to localStorage
          try {
            var all = JSON.parse(localStorage.getItem('dualmark_fallback_' + storeName) || '[]');
            var idx = all.findIndex(function(x) { return x.id === item.id || x.key === item.key; });
            if (idx >= 0) all[idx] = item;
            else all.push(item);
            localStorage.setItem('dualmark_fallback_' + storeName, JSON.stringify(all));
          } catch (e) {}
          return item;
        }

        return new Promise(function(resolve, reject) {
          var tx = db.transaction([storeName], 'readwrite');
          var store = tx.objectStore(storeName);
          var req = store.put(item);
          req.onsuccess = function() { resolve(item); };
          req.onerror = function(e) { reject(e); };
        });
      });
    },

    get: function(storeName, key) {
      var self = this;
      return this.init().then(function(db) {
        if (!db) {
          try {
            var all = JSON.parse(localStorage.getItem('dualmark_fallback_' + storeName) || '[]');
            var found = all.find(function(x) { return x.id === key || x.key === key; });
            return found || null;
          } catch (e) { return null; }
        }

        return new Promise(function(resolve, reject) {
          var tx = db.transaction([storeName], 'readonly');
          var store = tx.objectStore(storeName);
          var req = store.get(key);
          req.onsuccess = function() { resolve(req.result || null); };
          req.onerror = function() { resolve(null); };
        });
      });
    },

    getAll: function(storeName) {
      var self = this;
      return this.init().then(function(db) {
        if (!db) {
          try {
            return JSON.parse(localStorage.getItem('dualmark_fallback_' + storeName) || '[]');
          } catch (e) { return []; }
        }

        return new Promise(function(resolve, reject) {
          var tx = db.transaction([storeName], 'readonly');
          var store = tx.objectStore(storeName);
          var req = store.getAll();
          req.onsuccess = function() { resolve(req.result || []); };
          req.onerror = function() { resolve([]); };
        });
      });
    },

    delete: function(storeName, key) {
      var self = this;
      return this.init().then(function(db) {
        if (!db) {
          try {
            var all = JSON.parse(localStorage.getItem('dualmark_fallback_' + storeName) || '[]');
            all = all.filter(function(x) { return x.id !== key && x.key !== key; });
            localStorage.setItem('dualmark_fallback_' + storeName, JSON.stringify(all));
          } catch (e) {}
          return true;
        }

        return new Promise(function(resolve, reject) {
          var tx = db.transaction([storeName], 'readwrite');
          var store = tx.objectStore(storeName);
          var req = store.delete(key);
          req.onsuccess = function() { resolve(true); };
          req.onerror = function() { resolve(false); };
        });
      });
    },

    clear: function(storeName) {
      var self = this;
      return this.init().then(function(db) {
        if (!db) {
          try {
            localStorage.removeItem('dualmark_fallback_' + storeName);
          } catch (e) {}
          return true;
        }

        return new Promise(function(resolve, reject) {
          var tx = db.transaction([storeName], 'readwrite');
          var store = tx.objectStore(storeName);
          var req = store.clear();
          req.onsuccess = function() { resolve(true); };
          req.onerror = function() { resolve(false); };
        });
      });
    }
  };

  window.DualMarkDB = new DualMarkStorage();
})(window);
