// ===============================
//  Service Worker - sw.js
//  Author: Mohamed Tarek
//  Version: v1.0.2
// ===============================

const VERSION = 'v1.0.2';
const STATIC_CACHE = `static-${VERSION}`;
const HTML_CACHE = `html-${VERSION}`;
const OFFLINE_URL = './offline.html';

// ===============================
//  STATIC ASSETS TO PRE-CACHE
// ===============================
const STATIC_ASSETS = [
  // Main Pages
  './',
  './index.html',
  './offline.html',
  
  // Portfolio Pages (commented out)
  // './Mohamed - CV.html',
  // './Mohamed - Certificates.html',
  // './Mohamed - Project.html',
  // './Mohamed - Services.html',
  // './Mohamed - social-media.html',
  // './Mohamed - my-sites.html',
  // './Mohamed - Personal Information.html',
  
  // Utility Sites (commented out)
  // './3d-car-game.html',
  // './ai-sites-list.html',
  // './capacitor-calculator.html',
  // './dino-game.html',
  // './electrical-calculation.html',
  // './Indactance-calculator.html',
  // './Length-Converter.html',
  // './Mastering Linux Commands.html',
  // './Medication-Reminder.html',
  // './Power-Factor-Calculator.html',
  // './Race-Game.html',
  // './resistor-calculator.html',
  // './resistor-for-led.html',
  // './to-do-list.html',
  // './Wire-Gauge-Calculator.html',
  
  // Assets and Resources
  // './manifest.webmanifest',
  // './icon-192.png',
  // './icon-512.png',
  // './common.css',
  // './common.js',
  // './responsive.css',
  // './robots.txt',
  
  // External Dependencies
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
    const offlineResponse = await caches.match(OFFLINE_URL);
    if (offlineResponse) {
      return offlineResponse;
    }
    
    // If no offline page, create a blue-themed fallback
    return new Response(
      `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="theme-color" content="#0d6efd">
        <title>Offline - Mohamed Tarek</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Poppins', sans-serif;
            background: linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%);
            color: white;
            height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            padding: 20px;
          }
          .offline-container {
            max-width: 500px;
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            padding: 40px;
            border-radius: 20px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
          }
          h1 {
            font-size: 2.5rem;
            margin-bottom: 20px;
            color: white;
          }
          p {
            font-size: 1.1rem;
            margin-bottom: 30px;
            opacity: 0.9;
          }
          .icon {
            font-size: 4rem;
            margin-bottom: 20px;
            color: white;
          }
          button {
            background: white;
            color: #0d6efd;
            border: none;
            padding: 12px 30px;
            font-size: 1rem;
            border-radius: 50px;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.3s ease;
            margin-top: 20px;
          }
          button:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
          }
        </style>
      </head>
      <body>
        <div class="offline-container">
          <div class="icon">📶</div>
          <h1>You're Offline</h1>
          <p>Please check your internet connection and try again.</p>
          <p>The app will work automatically when you're back online.</p>
          <button onclick="window.location.reload()">Try Again</button>
        </div>
      </body>
      </html>`,
      { 
        headers: { 
          'Content-Type': 'text/html',
          'Cache-Control': 'no-cache'
        } 
      }
    );
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
    
    // For images, return a blue-themed placeholder
    if (req.headers.get('accept')?.includes('image')) {
      return new Response(
        `<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="#0d6efd"/>
          <text x="50%" y="50%" 
                dominant-baseline="middle" 
                text-anchor="middle" 
                font-family="Arial, sans-serif" 
                font-size="16" 
                fill="#ffffff">
            Image not available offline
          </text>
          <circle cx="200" cy="120" r="50" fill="#ffffff" opacity="0.2"/>
          <circle cx="200" cy="180" r="30" fill="#ffffff" opacity="0.3"/>
        </svg>`,
        { headers: { 'Content-Type': 'image/svg+xml' } }
      );
    }
    
    // For CSS files, inject blue theme
    if (req.url.endsWith('.css')) {
      return new Response(
        `/* Injected by Service Worker - Original CSS unavailable */
        body, html {
          background-color: #f0f8ff !important;
          color: #333333 !important;
        }
        
        @media (prefers-color-scheme: dark) {
          body, html {
            background-color: #f0f8ff !important;
            color: #333333 !important;
          }
        }`,
        { headers: { 'Content-Type': 'text/css' } }
      );
    }
    
    return new Response('Network error', { 
      status: 408, 
      statusText: 'Network Request Failed',
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

// ===============================
//  MESSAGE HANDLER
// ===============================
self.addEventListener('message', (event) => {
  if (event.data && event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
  
  // ADD: Handle theme change messages
  if (event.data && event.data.action === 'updateTheme') {
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          action: 'applyBlueTheme',
          themeColor: '#0d6efd'
        });
      });
    });
  }
});

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
  return Promise.resolve();
}