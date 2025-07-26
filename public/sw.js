// Service Worker per DIAGONALE PWA
const CACHE_NAME = 'diagonale-v7';
const ICON_CACHE = 'diagonale-icons-v7';

// Cache delle icone PWA
const ICON_URLS = [
  '/pwa-icon-1753570005.png',
  '/manifest.json?v=7'
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