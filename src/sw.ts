
/// <reference lib="webworker" />
declare const self: ServiceWorkerGlobalScope;

// Service Worker personnalisé pour READ
// Version forcée pour invalidation du cache PWA
const CACHE_VERSION = 'read-cache-v2-' + Date.now();
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const API_CACHE = `${CACHE_VERSION}-api`;

self.addEventListener("install", (event) => {
  console.log('[SW] Installing new service worker version:', CACHE_VERSION);
  // Force l'activation immédiate sans attendre
  self.skipWaiting();
  
  // Pré-cache les ressources critiques
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll([
        '/',
        '/offline.html',
        '/manifest.json'
      ]);
    })
  );
});

self.addEventListener("activate", (event) => {
  console.log('[SW] Activating new service worker version:', CACHE_VERSION);
  
  event.waitUntil(
    Promise.all([
      // Prendre le contrôle immédiatement
      self.clients.claim(),
      
      // Nettoyer tous les anciens caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (!cacheName.startsWith(CACHE_VERSION)) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
    ])
  );
  
  // Notifier tous les clients de la mise à jour
  self.clients.matchAll().then((clients) => {
    clients.forEach((client) => {
      client.postMessage({
        type: 'SW_UPDATED',
        version: CACHE_VERSION
      });
    });
  });
});

// Handle fetch events for offline support
self.addEventListener("fetch", (event) => {
  // Stratégie Network First pour les pages HTML pour forcer le rechargement des styles
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache la nouvelle version
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(STATIC_CACHE).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Fallback vers le cache en cas d'échec réseau
          return caches.match(event.request) || caches.match('/offline.html');
        })
    );
  }
  
  // Stratégie Network First pour les CSS et JS pour forcer le rechargement
  else if (event.request.destination === 'script' || 
           event.request.destination === 'style') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(STATIC_CACHE).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(event.request);
        })
    );
  }
  
  // Cache First pour les images et autres ressources statiques
  else if (event.request.destination === 'image') {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request).then((fetchResponse) => {
          if (fetchResponse.ok) {
            const responseClone = fetchResponse.clone();
            caches.open(STATIC_CACHE).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return fetchResponse;
        });
      })
    );
  }
});

// Handle messages from the main app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[SW] Force update requested');
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'WARM_CACHE') {
    // Warm cache for critical resources
    const urlsToCache = [
      '/',
      '/offline.html',
      '/manifest.json'
    ];
    
    caches.open(STATIC_CACHE).then((cache) => {
      cache.addAll(urlsToCache);
    });
  }
});
