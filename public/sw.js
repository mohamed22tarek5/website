/**
 * Service Worker — Mohamed Tarek Abdelhady Portfolio
 * Version: v1.1.0
 */

const VERSION = 'v1.1.0';
const STATIC_CACHE = `static-${VERSION}`;
const HTML_CACHE = `html-${VERSION}`;

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/cv.html',
  '/tools.html',
  '/projects.html',
  '/about.html',
  '/services.html',
  '/certificates.html',
  '/social-media.html',
  '/offline.html',
  '/common.css',
  '/common.js',
  '/manifest.webmanifest',
  '/favicon.ico',
  '/icon.png',
  '/icon-192.png',
  '/icon-512.png',
  '/apple-touch-icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {});
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => ![STATIC_CACHE, HTML_CACHE].includes(k))
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const acceptHeader = req.headers.get('accept') || '';
  const url = new URL(req.url);

  // Bypass non-GET, extensions, and PDF downloads
  if (req.method !== 'GET' || url.protocol === 'chrome-extension:') return;
  if (url.pathname.toLowerCase().endsWith('.pdf')) return;

  // HTML / Navigation: Network-first with cache fallback, then offline.html
  if (req.mode === 'navigate' || acceptHeader.includes('text/html')) {
    event.respondWith(networkFirst(req));
    return;
  }

  // Static assets: Cache-first
  event.respondWith(cacheFirst(req));
});

async function networkFirst(req) {
  const cache = await caches.open(HTML_CACHE);
  try {
    const fresh = await fetch(req);
    if (fresh && fresh.status === 200) {
      cache.put(req, fresh.clone());
    }
    return fresh;
  } catch (err) {
    const cached = await cache.match(req);
    if (cached) return cached;
    const fallback = await caches.match(req);
    if (fallback) return fallback;
    const offlinePage = await caches.match('/offline.html');
    if (offlinePage) return offlinePage;
    return new Response('Network error', { status: 408, statusText: 'Network Request Failed' });
  }
}

async function cacheFirst(req) {
  const cached = await caches.match(req);
  if (cached) return cached;
  try {
    const fresh = await fetch(req);
    if (fresh && fresh.status === 200 && fresh.url.startsWith(self.location.origin)) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(req, fresh.clone());
    }
    return fresh;
  } catch (err) {
    if (req.headers.get('accept')?.includes('image')) {
      return new Response(
        '<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#161b2e"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Inter,sans-serif" fill="#64748b" font-size="14">Image offline</text></svg>',
        { headers: { 'Content-Type': 'image/svg+xml' } }
      );
    }
    return new Response('Network error', { status: 408, statusText: 'Network Request Failed' });
  }
}

self.addEventListener('message', (event) => {
  if (event.data && event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});
