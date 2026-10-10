/**
 * DualMark Studio — Air-Gapped High-Performance Service Worker
 * Provides 100% offline cache-first execution for factory cleanrooms and remote packaging lines.
 */

const CACHE_NAME = 'dualmark-v1.0.0-airgap';

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './css/style.css',
  './logos/dualmark_logo_512.png',
  './logos/dualmark_logo_192.png',
  './logos/dualmark_logo.svg',
  './logos/apple-touch-icon.png',

  // Core Functionality Engines
  './js/core/math_symbologies.js',
  './js/core/cv_geometry.js',
  './js/core/crypto_standards.js',
  './js/core/truetype_cidfont.js',

  // Symbologies & Prepress Systems
  './js/storage_db.js',
  './js/audio.js',
  './js/qrcode_embedded.js',
  './js/barcode1d.js',
  './js/gs1_digitallink.js',
  './js/datamatrix.js',
  './js/dotcode.js',
  './js/zip_packager.js',
  './js/onboarding_tour.js',
  './js/clearance_inspector.js',
  './js/dynamic_resolver.js',
  './js/scanner_dewarp.js',
  './js/fsma_logger.js',
  './js/licensing.js',
  './js/vector_prepress.js',
  './js/gepir_validator.js',
  './js/zpl_generator.js',
  './js/iso_verifier.js',

  // Presentation & Gestures Layer
  './js/features/touch_gestures.js',
  './js/features/ui_layout.js',
  './js/features/preset_loaders.js',
  './js/i18n.js',
  './js/rive_integration.js',
  './js/app.js',

  // Legal Disclosures
  './legal/privacy_policy.html',
  './legal/terms_of_service.html',
  './legal/data_deletion.html'
];

// Install: Pre-cache all air-gapped workstation assets immediately
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.info('[DualMark SW] Pre-caching all air-gapped workstation assets...');
      return cache.addAll(ASSETS_TO_CACHE);
    }).catch((err) => {
      console.warn('[DualMark SW] Asset pre-cache warning:', err);
    })
  );
});

// Activate: Clean up any obsolete cache versions and take control immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            console.info('[DualMark SW] Removing outdated cache:', name);
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Pure Cache-First with Network Fallback
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Handle local application assets
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      // If not in cache, fetch from network and dynamically cache valid local responses
      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }

        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      }).catch(() => {
        // Fallback for navigation requests (HTML pages)
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});

// Handle custom message commands (e.g. force skip waiting)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
