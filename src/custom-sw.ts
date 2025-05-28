
/// <reference lib="webworker" />
declare const self: ServiceWorkerGlobalScope;

// IMPORTANT: Cette ligne est requise par Workbox pour l'injection du manifest
self.__WB_MANIFEST;

// Service Worker minimal pour READ
const CACHE_NAME = 'read-cache-v1';
const CRITICAL_RESOURCES = [
  '/',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker');
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(CRITICAL_RESOURCES).catch(error => {
        console.warn('[SW] Failed to cache some resources:', error);
      });
    }).then(() => {
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker');
  
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      
      // Nettoyer les anciens caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter(cacheName => cacheName !== CACHE_NAME)
            .map(cacheName => {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
    ])
  );
});

// Stratégie de cache simple
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // Ignorer les requêtes non-GET
  if (request.method !== 'GET') {
    return;
  }
  
  // Navigation - Network First avec fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => {
        return caches.match('/') || new Response('Offline', { 
          status: 503, 
          statusText: 'Service Unavailable' 
        });
      })
    );
  }
  // Ressources statiques - Cache First
  else if (
    request.destination === 'script' || 
    request.destination === 'style' ||
    request.destination === 'image'
  ) {
    event.respondWith(
      caches.match(request).then(response => {
        return response || fetch(request).then((fetchResponse) => {
          if (fetchResponse && fetchResponse.ok) {
            const responseClone = fetchResponse.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(request, responseClone);
            });
          }
          return fetchResponse;
        });
      })
    );
  }
});

// Gestion des messages
self.addEventListener('message', (event) => {
  const { type } = event.data || {};
  
  if (type === 'SKIP_WAITING') {
    console.log('[SW] Force update requested');
    self.skipWaiting();
  }
});
