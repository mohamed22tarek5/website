// ===============================
//  Service Worker - sw.js
//  Author: Mohamed Tarek
//  Version: v1.0.1
// ===============================

const VERSION = 'v1.0.1';
const STATIC_CACHE = `static-${VERSION}`;
const HTML_CACHE = `html-${VERSION}`;
const OFFLINE_URL = 'offline.html';

// ===============================
//  STATIC ASSETS TO PRE-CACHE
// ===============================
const STATIC_ASSETS = [
  './',
  './index.html',
  './offline.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './common.css',
  './common.js'
  // Add more pages for offline:
  // './electrical-calculation.html',
  // './resistor-calculator.html',
  // './to-do-list.html',
];

// ===============================
//  INSTALL EVENT
// ===============================
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// ===============================
//  ACTIVATE EVENT
// ===============================
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => ![STATIC_CACHE, HTML_CACHE].includes(k))
          .map(k => caches.delete(k))
      )
    )
  );

  self.clients.claim();
});

// ===============================
//  FETCH EVENT
// ===============================
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const acceptHeader = req.headers.get('accept') || '';

  // HTML pages → Network First Strategy
  if (req.mode === 'navigate' || acceptHeader.includes('text/html')) {
    event.respondWith(networkFirst(req));
    return;
  }

  // Static Files (CSS/JS/Images) → Cache First Strategy
  event.respondWith(cacheFirst(req));
});

// ===============================
//  NETWORK-FIRST STRATEGY
// ===============================
async function networkFirst(req) {
  const cache = await caches.open(HTML_CACHE);

  try {
    // Try to get a fresh copy from the network
    const fresh = await fetch(req, { cache: 'no-store' });
    cache.put(req, fresh.clone());
    return fresh;
  } catch (err) {
    // If offline → return cached HTML or offline page
    const cached = await cache.match(req);
    return cached || caches.match(OFFLINE_URL);
  }
}

// ===============================
//  CACHE-FIRST STRATEGY
// ===============================
async function cacheFirst(req) {
  // If already cached → return it
  const cached = await caches.match(req);
  if (cached) return cached;

  // Else fetch from network and cache it
  try {
    const fresh = await fetch(req);
    const cache = await caches.open(STATIC_CACHE);
    cache.put(req, fresh.clone());
    return fresh;
  } catch (err) {
    // If the request fails (icons, images)
    return new Response('', { status: 504, statusText: 'Gateway Timeout' });
  }
}
