
/// <reference lib="webworker" />
declare const self: ServiceWorkerGlobalScope;

// IMPORTANT: Cette ligne est requise par Workbox pour l'injection du manifest
self.__WB_MANIFEST;

// Service Worker optimisé pour iOS et Android
const CACHE_VERSION = 'read-cache-v5';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const API_CACHE = `${CACHE_VERSION}-api`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;

// Ressources critiques à mettre en cache
const CRITICAL_RESOURCES = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

// Configuration optimisée pour mobile
const CACHE_CONFIG = {
  maxEntries: 50,
  maxAgeSeconds: 30 * 24 * 60 * 60, // 30 jours
  purgeOnQuotaError: true
};

self.addEventListener("install", (event) => {
  console.log('[SW] Installing service worker version:', CACHE_VERSION);
  
  event.waitUntil(
    Promise.all([
      // Cache des ressources critiques
      caches.open(STATIC_CACHE).then((cache) => {
        return cache.addAll(CRITICAL_RESOURCES).catch(error => {
          console.warn('[SW] Failed to cache some critical resources:', error);
        });
      }),
      self.skipWaiting()
    ])
  );
});

self.addEventListener("activate", (event) => {
  console.log('[SW] Activating service worker version:', CACHE_VERSION);
  
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      
      // Nettoyer les anciens caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter(cacheName => !cacheName.startsWith(CACHE_VERSION))
            .map(cacheName => {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      }),
      
      // Notifier les clients de l'activation
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: 'SW_ACTIVATED',
            version: CACHE_VERSION
          });
        });
      })
    ])
  );
});

// Stratégie de cache simplifiée
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Ignorer les requêtes non-GET
  if (request.method !== 'GET' || url.protocol === 'chrome-extension:') {
    return;
  }
  
  // Navigation (pages HTML) - Network First
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response: Response) => {
          if (response && response.ok) {
            const responseClone = response.clone();
            caches.open(STATIC_CACHE).then(cache => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(request).then(cachedResponse => {
            return cachedResponse || caches.match('/offline.html').then(offlineResponse => {
              return offlineResponse || new Response('Offline', { 
                status: 503, 
                statusText: 'Service Unavailable' 
              });
            });
          });
        })
    );
  }
  // Ressources statiques - Cache First
  else if (
    request.destination === 'script' || 
    request.destination === 'style' ||
    request.destination === 'image' ||
    url.pathname.includes('/icons/')
  ) {
    event.respondWith(
      caches.match(request).then(response => {
        if (response) {
          return response;
        }
        return fetch(request).then((fetchResponse: Response) => {
          if (fetchResponse && fetchResponse.ok) {
            const responseClone = fetchResponse.clone();
            caches.open(STATIC_CACHE).then(cache => {
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
  
  switch (type) {
    case 'SKIP_WAITING':
      console.log('[SW] Force update requested');
      self.skipWaiting();
      break;
      
    case 'GET_VERSION':
      event.ports[0]?.postMessage({ version: CACHE_VERSION });
      break;
      
    default:
      console.log('[SW] Unknown message type:', type);
  }
});

// Gestion des erreurs
self.addEventListener('error', (event) => {
  console.error('[SW] Service Worker error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('[SW] Unhandled promise rejection:', event.reason);
});
