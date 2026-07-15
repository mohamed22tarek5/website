// ===============================
//  Service Worker - sw.js
//  Author: Mohamed Tarek
//  Version: v1.0.3
// ===============================

const VERSION = 'v1.0.4';
const STATIC_CACHE = `static-${VERSION}`;
const HTML_CACHE = `html-${VERSION}`;
const OFFLINE_URL = './offline.html';

// ===============================
//  STATIC ASSETS TO PRE-CACHE
// ===============================
const STATIC_ASSETS = [
  './',
  './index.html',
  './Mohamed%20-%20CV.html',
  './Mohamed%20-%20my-sites.html',
  './Mohamed%20-%20Project.html',
  './Mohamed%20-%20Personal%20Information.html',
  './Mohamed%20-%20Services.html',
  './Mohamed%20-%20Certificates.html',
  './Mohamed%20-%20social-media.html',
  './offline.html',
  './manifest.webmanifest',
  './pwa.js',
  './icon.png',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap'
];

// ===============================
//  INSTALL EVENT
// ===============================
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => {
      console.log('Service Worker: Caching static assets');
      return cache.addAll(STATIC_ASSETS).catch(error => {
        console.log('Cache addAll error:', error);
      });
    })
  );
  self.skipWaiting();
});

// ===============================
//  ACTIVATE EVENT
// ===============================
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activated');
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => ![STATIC_CACHE, HTML_CACHE].includes(k))
          .map(k => {
            console.log('Service Worker: Removing old cache', k);
            return caches.delete(k);
          })
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
  const url = new URL(req.url);

  if (req.method !== 'GET' || url.protocol === 'chrome-extension:') return;

  if (req.mode === 'navigate' || acceptHeader.includes('text/html')) {
    event.respondWith(networkFirst(req));
    return;
  }

  event.respondWith(cacheFirst(req));
});

// ===============================
//  NETWORK-FIRST STRATEGY
// ===============================
async function networkFirst(req) {
  const cache = await caches.open(HTML_CACHE);
  try {
    const fresh = await fetch(req);
    if (fresh.status === 200) {
      cache.put(req, fresh.clone());
    }
    return fresh;
  } catch (err) {
    const cached = await cache.match(req);
    if (cached) return cached;
    return caches.match(OFFLINE_URL);
  }
}

// ===============================
//  CACHE-FIRST STRATEGY
// ===============================
async function cacheFirst(req) {
  const cached = await caches.match(req);
  if (cached) return cached;

  try {
    const fresh = await fetch(req);
    if (fresh.status === 200 && fresh.url.startsWith(self.location.origin)) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(req, fresh.clone());
    }
    return fresh;
  } catch (err) {
    if (req.headers.get('accept')?.includes('image')) {
      return new Response(
        '<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#161b2e"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Inter,sans-serif" fill="#64748b" font-size="14">Image not available offline</text></svg>',
        { headers: { 'Content-Type': 'image/svg+xml' } }
      );
    }
    return new Response('Network error', { status: 408, statusText: 'Network Request Failed' });
  }
}

// ===============================
//  MESSAGE HANDLER
// ===============================
self.addEventListener('message', (event) => {
  if (event.data && event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});

// ===============================
//  BACKGROUND SYNC
// ===============================
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(Promise.resolve());
  }
});