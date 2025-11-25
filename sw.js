// ===============================
//  Service Worker - sw.js
//  Author: Mohamed Tarek
//  Version: v1.0.1
// ===============================

const VERSION = 'v1.0.1';
const STATIC_CACHE = `static-${VERSION}`;
const HTML_CACHE = `html-${VERSION}`;
const OFFLINE_URL = './offline.html';

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
  './Mohamed - CV.html',
  './Mohamed - Certificates.html',
  './Mohamed - Project.html',
  './Mohamed - Services.html',
  './Mohamed - social-media.html',
  './Mohamed - my-sites.html',
  './Mohamed - Personal Information.html',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap',
  'https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js'
];

// ===============================
//  INSTALL EVENT
// ===============================
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => {
      console.log('Service Worker: Caching static assets');
      return cache.addAll(STATIC_ASSETS);
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

  // Skip non-GET requests and chrome-extension
  if (req.method !== 'GET' || url.protocol === 'chrome-extension:') {
    return;
  }

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
    const fresh = await fetch(req);
    
    // Only cache successful responses
    if (fresh.status === 200) {
      cache.put(req, fresh.clone());
    }
    
    return fresh;
  } catch (err) {
    console.log('Network failed, serving from cache:', err);
    
    // If offline → return cached HTML or offline page
    const cached = await cache.match(req);
    if (cached) {
      return cached;
    }
    
    // Fallback to offline page
    return caches.match(OFFLINE_URL);
  }
}

// ===============================
//  CACHE-FIRST STRATEGY
// ===============================
async function cacheFirst(req) {
  // If already cached → return it
  const cached = await caches.match(req);
  if (cached) {
    return cached;
  }

  // Else fetch from network and cache it
  try {
    const fresh = await fetch(req);
    
    // Only cache successful responses and same-origin requests
    if (fresh.status === 200 && fresh.url.startsWith(self.location.origin)) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(req, fresh.clone());
    }
    
    return fresh;
  } catch (err) {
    console.log('Cache failed:', err);
    
    // For images, return a placeholder or empty response
    if (req.headers.get('accept')?.includes('image')) {
      return new Response(
        '<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#f0f0f0"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial" fill="#666">Image not available offline</text></svg>',
        { headers: { 'Content-Type': 'image/svg+xml' } }
      );
    }
    
    return new Response('Network error', { 
      status: 408, 
      statusText: 'Network Request Failed' 
    });
  }
}

// ===============================
//  BACKGROUND SYNC
// ===============================
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('Service Worker: Background sync triggered');
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Handle background sync tasks here
  // For example: sync form submissions when back online
  console.log('Performing background sync...');
}