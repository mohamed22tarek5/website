/**
 * Service Worker — Mohamed Tarek Abdelhady Portfolio & Engineering Suite
 * Version: v2.0.0
 * Comprehensive offline support, intelligent caching, Android & iOS optimization
 */

const VERSION = 'v2.0.0';
const STATIC_CACHE = `mta-static-${VERSION}`;
const HTML_CACHE = `mta-html-${VERSION}`;
const TOOLS_CACHE = `mta-tools-${VERSION}`;

// Core static assets precached immediately on install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/about.html',
  '/projects.html',
  '/cv.html',
  '/tools.html',
  '/services.html',
  '/certificates.html',
  '/social-media.html',
  '/offline.html',
  '/common.css',
  '/common.js',
  '/pwa.js',
  '/manifest.webmanifest',
  '/favicon.ico',
  '/favicon.svg',
  '/icon.png',
  '/icon-48.png',
  '/icon-72.png',
  '/icon-96.png',
  '/icon-128.png',
  '/icon-144.png',
  '/icon-152.png',
  '/icon-180.png',
  '/icon-192.png',
  '/icon-384.png',
  '/icon-512.png',
  '/icon-maskable-192.png',
  '/icon-maskable-512.png',
  '/apple-touch-icon.png',
  '/apple-touch-icon-180x180.png',
  '/apple-touch-icon-167x167.png',
  '/apple-touch-icon-152x152.png',
  '/apple-touch-icon-120x120.png',
  '/browserconfig.xml',
  '/mstile-150x150.png',
  '/mstile-310x310.png',
  '/photo-480.webp',
  '/photo.jpg',
  '/screenshots/mobile-preview.png',
  '/screenshots/desktop-preview.png',
  // Top Engineering Tools precached for offline field use
  '/sites/mta-chrome.css',
  '/sites/mta-chrome.js',
  '/sites/manifest.webmanifest',
  '/sites/ohms-law-calculator.html',
  '/sites/resistor-calculator.html',
  '/sites/resistor-for-led.html',
  '/sites/capacitor-calculator.html',
  '/sites/inductance-calculator.html',
  '/sites/buck-boost-calculator.html',
  '/sites/battery-capacity-runtime-calculator.html',
  '/sites/battery-solar-calculator.html',
  '/sites/voltage-divider-calculator.html',
  '/sites/wire-gauge-calculator.html',
  '/sites/mastering-linux-commands.html',
  '/sites/555-timer-calculator.html',
  '/sites/to-do-list.html',
  '/sites/medication-reminder.html'
];

// Install Event: Precache core assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(async (cache) => {
      // Use individual caching so one failing asset does not abort the entire precache
      await Promise.allSettled(
        PRECACHE_ASSETS.map(async (url) => {
          try {
            const response = await fetch(url, { cache: 'reload' });
            if (response.ok) {
              await cache.put(url, response);
            }
          } catch (err) {
            // Silently continue if an asset isn't immediately reachable
          }
        })
      );
    })
  );
  // Optional immediate skip waiting or controlled by client
  self.skipWaiting();
});

// Activate Event: Clean up outdated caches & claim clients
self.addEventListener('activate', (event) => {
  const currentCaches = [STATIC_CACHE, HTML_CACHE, TOOLS_CACHE];
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((k) => !currentCaches.includes(k))
          .map((k) => caches.delete(k))
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Fetch Event: Intelligent routing
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Bypass non-GET, browser extensions, and PDF downloads
  if (req.method !== 'GET' || url.protocol === 'chrome-extension:' || url.protocol === 'moz-extension:') {
    return;
  }
  if (url.pathname.toLowerCase().endsWith('.pdf')) {
    return;
  }

  // 1. HTML / Navigation: Network-first with cache fallback, then offline.html
  if (req.mode === 'navigate' || req.headers.get('accept')?.includes('text/html')) {
    event.respondWith(networkFirstNavigation(req));
    return;
  }

  // 2. Google Fonts & CDNs: Stale-While-Revalidate
  const isCdn = url.hostname.includes('fonts.googleapis.com') ||
                url.hostname.includes('fonts.gstatic.com') ||
                url.hostname.includes('cdn.jsdelivr.net') ||
                url.hostname.includes('cdnjs.cloudflare.com');
  if (isCdn) {
    event.respondWith(staleWhileRevalidate(req, STATIC_CACHE));
    return;
  }

  // 3. Same-origin Static Assets (CSS, JS, Images, Icons, Manifest): Cache-First
  if (url.origin === self.location.origin) {
    event.respondWith(cacheFirstAsset(req));
    return;
  }

  // 4. Fallback default
  event.respondWith(
    caches.match(req).then((cached) => cached || fetch(req).catch(() => caches.match('/offline.html')))
  );
});

// Navigation Strategy: Network-first with Cache fallback & Offline Page
async function networkFirstNavigation(req) {
  const cache = await caches.open(HTML_CACHE);
  try {
    const networkResponse = await fetch(req);
    if (networkResponse && networkResponse.status === 200) {
      cache.put(req, networkResponse.clone());
    }
    return networkResponse;
  } catch (err) {
    // Try matching specific URL in HTML cache or static cache
    const cachedResponse = await cache.match(req);
    if (cachedResponse) return cachedResponse;

    const staticCached = await caches.match(req);
    if (staticCached) return staticCached;

    // Try matching root /
    const rootCached = await caches.match('/');
    if (rootCached && (req.url.endsWith('/') || req.url.endsWith('/index.html'))) {
      return rootCached;
    }

    // Fall back to offline page
    const offlinePage = await caches.match('/offline.html');
    if (offlinePage) return offlinePage;

    return new Response(
      `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Offline</title><style>body{background:#0a0e1a;color:#f1f5f9;font-family:sans-serif;text-align:center;padding:50px}</style></head><body><h1>You are currently offline</h1><p>Please check your connection and refresh.</p><button onclick="location.reload()" style="background:#3b82f6;color:white;border:none;padding:12px 24px;border-radius:24px;cursor:pointer">Retry</button></body></html>`,
      { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }
}

// Static Asset Strategy: Cache-first with background revalidation
async function cacheFirstAsset(req) {
  const cached = await caches.match(req);
  if (cached) {
    // Revalidate in background if network is active (stale-while-revalidate for local assets)
    fetch(req).then(async (fresh) => {
      if (fresh && fresh.status === 200) {
        const cache = await caches.open(STATIC_CACHE);
        cache.put(req, fresh.clone());
      }
    }).catch(() => {});
    return cached;
  }

  try {
    const fresh = await fetch(req);
    if (fresh && fresh.status === 200) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(req, fresh.clone());
    }
    return fresh;
  } catch (err) {
    // If image fails offline, return placeholder SVG
    if (req.headers.get('accept')?.includes('image')) {
      return new Response(
        '<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#161b2e"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Inter,sans-serif" fill="#64748b" font-size="14">Offline Image</text></svg>',
        { headers: { 'Content-Type': 'image/svg+xml' } }
      );
    }
    return new Response('Asset unavailable offline', { status: 503, statusText: 'Service Unavailable' });
  }
}

// Stale-While-Revalidate Strategy for CDNs
async function staleWhileRevalidate(req, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(req);

  const fetchPromise = fetch(req).then((fresh) => {
    if (fresh && fresh.status === 200) {
      cache.put(req, fresh.clone());
    }
    return fresh;
  }).catch(() => cached);

  return cached || fetchPromise;
}

// Client messaging for PWA updates & control
self.addEventListener('message', (event) => {
  if (!event.data) return;
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
  if (event.data.action === 'getVersion') {
    event.ports[0]?.postMessage({ version: VERSION });
  }
});
