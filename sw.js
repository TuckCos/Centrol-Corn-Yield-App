const CACHE = 'centrol-yield-v5';

const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './centrol-logo.png',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => cacheName !== CACHE)
            .map(cacheName => caches.delete(cacheName))
        );
      })
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request)
        .then(networkResponse => {
          const responseCopy = networkResponse.clone();

          caches.open(CACHE).then(cache => {
            cache.put(event.request, responseCopy);
          });

          return networkResponse;
        })
        .catch(() => {
          return caches.match('./index.html');
        });
    })
  );
});
