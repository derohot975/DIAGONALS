// BEGIN DIAGONALE APP SHELL - Enhanced Service Worker
// Service Worker per DIAGONALE PWA con App Shell support
const CACHE_VERSION = 'v11'; // Incrementato per nuove funzionalità
const CACHE_NAME = `diagonale-${CACHE_VERSION}`;
const ICON_CACHE = `diagonale-icons-${CACHE_VERSION}`;
const STATIC_CACHE = `diagonale-static-${CACHE_VERSION}`;

// Cache delle icone PWA
const ICON_URLS = [
  '/apple-touch-icon.png',
  '/icon-96x96.png?v=10',
  '/icon-144x144.png?v=10',
  '/icon-192x192.png?v=10',
  '/icon-512x512.png?v=10',
  '/manifest.json?v=10'
];

// Risorse critiche per App Shell (precache)
const STATIC_URLS = [
  '/',
  '/diagologo.png'
  // Nota: CSS e JS vengono gestiti dinamicamente da Vite
];

// TTL per cache (in millisecondi)
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 ore
// END DIAGONALE APP SHELL

// BEGIN DIAGONALE APP SHELL - Enhanced install with static resources
// Installa service worker e pre-carica risorse critiche
self.addEventListener('install', (event) => {
  console.log('🚀 SW: Installazione iniziata');
  event.waitUntil(
    Promise.all([
      // Cache icone PWA
      caches.open(ICON_CACHE)
        .then(cache => cache.addAll(ICON_URLS))
        .then(() => console.log('✅ SW: Icone PWA cached')),
      // Cache risorse statiche per App Shell
      caches.open(STATIC_CACHE)
        .then(cache => cache.addAll(STATIC_URLS))
        .then(() => console.log('✅ SW: Risorse statiche cached'))
        .catch(err => console.warn('⚠️ SW: Errore cache statiche (non bloccante)', err))
    ])
    .then(() => {
      console.log('✅ SW: Installazione completata');
      self.skipWaiting();
    })
    .catch(err => {
      console.error('❌ SW: Errore installazione', err);
      // Non bloccare l'installazione per errori non critici
      self.skipWaiting();
    })
  );
});
// END DIAGONALE APP SHELL

// BEGIN DIAGONALE APP SHELL - Enhanced activate with cleanup
// Attiva e pulisce cache vecchie
self.addEventListener('activate', (event) => {
  console.log('🔄 SW: Attivazione iniziata');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      const validCaches = [CACHE_NAME, ICON_CACHE, STATIC_CACHE];
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!validCaches.includes(cacheName)) {
            console.log('🗑️ SW: Eliminazione cache obsoleta:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
    .then(() => {
      console.log('✅ SW: Attivazione completata, controllo client');
      return self.clients.claim();
    })
    .then(() => {
      console.log('✅ SW: Client sotto controllo');
    })
  );
});
// END DIAGONALE APP SHELL

// BEGIN DIAGONALE APP SHELL - Enhanced fetch strategies
// Fetch strategy: Cache first per icone, stale-while-revalidate per statiche, network first per API
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  const { pathname } = url;
  
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Cache first per icone PWA
  if (pathname.includes('icon-') || pathname.includes('apple-touch-icon') || pathname.includes('manifest.json')) {
    event.respondWith(
      caches.open(ICON_CACHE)
        .then(cache => cache.match(event.request))
        .then(response => response || fetch(event.request))
    );
    return;
  }

  // Stale-while-revalidate per risorse statiche (HTML, CSS, JS, immagini)
  if (pathname === '/' || pathname.endsWith('.css') || pathname.endsWith('.js') || pathname.endsWith('.png') || pathname.endsWith('.jpg')) {
    event.respondWith(
      staleWhileRevalidate(event.request, STATIC_CACHE)
    );
    return;
  }

  // Network first per API (nessuna cache per mantenere dati freschi)
  if (pathname.startsWith('/api/')) {
    // Lascia che le API vadano sempre in rete per dati aggiornati
    return;
  }
});

/**
 * Strategia Stale-While-Revalidate
 * Serve dalla cache se disponibile, aggiorna in background
 */
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  // Fetch in background per aggiornare cache
  const fetchPromise = fetch(request).then(response => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(err => {
    console.warn('🌐 SW: Errore fetch (usando cache)', err);
    return cachedResponse;
  });

  // Ritorna cache se disponibile, altrimenti aspetta fetch
  return cachedResponse || fetchPromise;
}
// END DIAGONALE APP SHELL