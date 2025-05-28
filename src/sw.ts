
/// <reference lib="webworker" />
declare const self: ServiceWorkerGlobalScope;

// Service Worker optimisé pour iOS et Android
const CACHE_VERSION = 'read-cache-v4';
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
          // Ne pas faire échouer l'installation pour quelques ressources manquantes
        });
      }),
      // Activer immédiatement pour éviter les blocages
      self.skipWaiting()
    ])
  );
});

self.addEventListener("activate", (event) => {
  console.log('[SW] Activating service worker version:', CACHE_VERSION);
  
  event.waitUntil(
    Promise.all([
      // Prendre le contrôle immédiatement (important pour iOS)
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

// Stratégie de cache optimisée pour mobile
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Ignorer les requêtes non-GET et les extensions de navigateur
  if (request.method !== 'GET' || url.protocol === 'chrome-extension:') {
    return;
  }
  
  // Navigation (pages HTML) - Network First avec timeout
  if (request.mode === 'navigate') {
    event.respondWith(
      Promise.race([
        fetch(request).then((response: Response) => {
          if (response && response.ok) {
            const responseClone = response.clone();
            caches.open(STATIC_CACHE).then(cache => {
              cache.put(request, responseClone);
            });
          }
          return response;
        }),
        // Timeout pour éviter les blocages sur mobile
        new Promise<Response>((_, reject) => 
          setTimeout(() => reject(new Error('Network timeout')), 5000)
        )
      ]).catch(() => {
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
  // Ressources statiques (JS/CSS/Images) - Cache First
  else if (
    request.destination === 'script' || 
    request.destination === 'style' ||
    request.destination === 'image' ||
    url.pathname.includes('/icons/') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.svg')
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
        }).catch(() => {
          // Fallback pour les images
          if (request.destination === 'image') {
            return new Response(
              '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="#f0f0f0"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#999">Image indisponible</text></svg>',
              { headers: { 'Content-Type': 'image/svg+xml' } }
            );
          }
          throw new Error('Resource not available');
        });
      })
    );
  }
  // API Supabase - Network First avec cache de secours
  else if (url.hostname.includes('supabase.co')) {
    event.respondWith(
      fetch(request, { 
        signal: AbortSignal.timeout ? AbortSignal.timeout(8000) : undefined 
      })
        .then((response: Response) => {
          if (response && response.ok && request.method === 'GET') {
            const responseClone = response.clone();
            caches.open(API_CACHE).then(cache => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(async () => {
          // Essayer le cache en cas d'erreur réseau
          const cachedResponse = await caches.match(request);
          if (cachedResponse) {
            return cachedResponse;
          }
          // Retourner une erreur réseau explicite
          return new Response(
            JSON.stringify({ error: 'Network error', offline: true }), 
            { 
              status: 503, 
              headers: { 'Content-Type': 'application/json' }
            }
          );
        })
    );
  }
});

// Gestion des messages pour les mises à jour
self.addEventListener('message', (event) => {
  const { type, data } = event.data || {};
  
  switch (type) {
    case 'SKIP_WAITING':
      console.log('[SW] Force update requested');
      self.skipWaiting();
      break;
      
    case 'GET_VERSION':
      event.ports[0]?.postMessage({ version: CACHE_VERSION });
      break;
      
    case 'CLEAR_CACHE':
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      }).then(() => {
        event.ports[0]?.postMessage({ success: true });
      });
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

// Nettoyage périodique du cache (important pour mobile)
const cleanupCache = async () => {
  try {
    const cacheNames = await caches.keys();
    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName);
      const requests = await cache.keys();
      
      if (requests.length > CACHE_CONFIG.maxEntries) {
        const excessRequests = requests.slice(CACHE_CONFIG.maxEntries);
        await Promise.all(
          excessRequests.map(request => cache.delete(request))
        );
        console.log(`[SW] Cleaned up ${excessRequests.length} entries from ${cacheName}`);
      }
    }
  } catch (error) {
    console.error('[SW] Cache cleanup failed:', error);
  }
};

// Nettoyer le cache toutes les heures
setInterval(cleanupCache, 60 * 60 * 1000);
