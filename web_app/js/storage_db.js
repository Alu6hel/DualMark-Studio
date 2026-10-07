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

    hasNativeSqlite: function() {
      return Boolean(
        typeof window !== 'undefined' &&
        window.DualMarkBridge &&
        typeof window.DualMarkBridge.sqliteInsertRecord === 'function'
      );
    },

    put: function(storeName, item) {
      var self = this;
      if (this.hasNativeSqlite()) {
        try {
          var id = String(item.id || item.key || ('rec_' + Date.now()));
          var ok = window.DualMarkBridge.sqliteInsertRecord(storeName, id, JSON.stringify(item));
          if (ok) return Promise.resolve(item);
        } catch (err) {
          console.warn('[DualMarkDB] Native SQLite insert error, falling back to IDB', err);
        }
      }

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
      if (this.hasNativeSqlite()) {
        try {
          var res = window.DualMarkBridge.sqliteQueryRecords(storeName, String(key), 1, 0);
          var arr = JSON.parse(res || '[]');
          if (arr && arr.length > 0) return Promise.resolve(arr[0]);
        } catch (err) {
          console.warn('[DualMarkDB] Native SQLite get error', err);
        }
      }

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
      if (this.hasNativeSqlite()) {
        try {
          var res = window.DualMarkBridge.sqliteQueryRecords(storeName, '', 100000, 0);
          var arr = JSON.parse(res || '[]');
          if (arr && Array.isArray(arr)) return Promise.resolve(arr);
        } catch (err) {
          console.warn('[DualMarkDB] Native SQLite getAll error', err);
        }
      }

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

    count: function(storeName) {
      var self = this;
      if (this.hasNativeSqlite()) {
        try {
          var c = window.DualMarkBridge.sqliteCountRecords(storeName);
          if (typeof c === 'number') return Promise.resolve(c);
        } catch (e) {}
      }

      return this.getAll(storeName).then(function(records) {
        return records.length;
      });
    },

    delete: function(storeName, key) {
      var self = this;
      if (this.hasNativeSqlite()) {
        try {
          var ok = window.DualMarkBridge.sqliteDeleteRecord(storeName, String(key));
          if (ok) return Promise.resolve(true);
        } catch (err) {
          console.warn('[DualMarkDB] Native SQLite delete error', err);
        }
      }

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
      if (this.hasNativeSqlite()) {
        try {
          var ok = window.DualMarkBridge.sqliteClearTable(storeName);
          if (ok) return Promise.resolve(true);
        } catch (err) {
          console.warn('[DualMarkDB] Native SQLite clear error', err);
        }
      }

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
    },

    saveFsmaRecord: function(rec) {
      return this.put('fsma_records', rec);
    },

    getFsmaRecords: function() {
      return this.getAll('fsma_records');
    },

    saveResolverRule: function(rule) {
      return this.put('resolver_rules', rule);
    },

    getResolverRules: function() {
      return this.getAll('resolver_rules');
    }
  };

  window.DualMarkDB = new DualMarkStorage();
})(window);
