// Service Worker per DIAGONALE PWA
const CACHE_NAME = 'diagonale-v4';
const ICON_CACHE = 'diagonale-icons-v4';

// Cache delle icone PWA
const ICON_URLS = [
  '/icon-96x96.png?v=4',
  '/icon-144x144.png?v=4', 
  '/icon-192x192.png?v=4',
  '/icon-512x512.png?v=4',
  '/apple-touch-icon.png?v=4',
  '/manifest.json'
];

// Installa service worker e pre-carica icone
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(ICON_CACHE)
      .then(cache => cache.addAll(ICON_URLS))
      .then(() => self.skipWaiting())
  );
});

// Attiva e pulisce cache vecchie
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME && cacheName !== ICON_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch strategy: Cache first per icone, network first per il resto
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Cache first per icone PWA
  if (url.pathname.includes('icon-') || url.pathname.includes('apple-touch-icon') || url.pathname.includes('manifest.json')) {
    event.respondWith(
      caches.open(ICON_CACHE)
        .then(cache => cache.match(event.request))
        .then(response => response || fetch(event.request))
    );
  }
});