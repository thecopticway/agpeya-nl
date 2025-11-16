// Service Worker voor Agpeya App
const CACHE_NAME = 'agpeya-v1';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/icon.svg'
];

// Installatie - cache belangrijke bestanden
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache geopend');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// Activatie - verwijder oude caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Oude cache verwijderd:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch - probeer eerst netwerk, dan cache (Network First strategie)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone de response omdat het maar één keer gebruikt kan worden
        const responseToCache = response.clone();
        
        caches.open(CACHE_NAME)
          .then((cache) => {
            cache.put(event.request, responseToCache);
          });
        
        return response;
      })
      .catch(() => {
        // Als netwerk faalt, probeer cache
        return caches.match(event.request)
          .then((response) => {
            if (response) {
              return response;
            }
            // Fallback voor niet-gecachte requests
            return new Response('Offline - content niet beschikbaar', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({
                'Content-Type': 'text/plain'
              })
            });
          });
      })
  );
});