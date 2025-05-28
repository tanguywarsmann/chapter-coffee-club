
/// <reference lib="webworker" />
declare const self: ServiceWorkerGlobalScope;

// Service Worker simplifié et stable pour iOS
const CACHE_VERSION = 'read-cache-v3';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const API_CACHE = `${CACHE_VERSION}-api`;

// Ressources critiques à mettre en cache
const CRITICAL_RESOURCES = [
  '/',
  '/offline.html',
  '/manifest.json'
];

self.addEventListener("install", (event) => {
  console.log('[SW] Installing service worker version:', CACHE_VERSION);
  
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(CRITICAL_RESOURCES);
    }).then(() => {
      // Activer immédiatement sans attendre
      return self.skipWaiting();
    })
  );
});

self.addEventListener("activate", (event) => {
  console.log('[SW] Activating service worker version:', CACHE_VERSION);
  
  event.waitUntil(
    Promise.all([
      // Prendre le contrôle immédiatement
      self.clients.claim(),
      
      // Nettoyer seulement les anciens caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter(cacheName => !cacheName.startsWith(CACHE_VERSION))
            .map(cacheName => {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
    ])
  );
});

// Stratégie de cache simplifiée et stable
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Ignorer les requêtes non-GET
  if (request.method !== 'GET') return;
  
  // Stratégie par type de ressource
  if (request.mode === 'navigate') {
    // Pages HTML - Network First avec fallback
    event.respondWith(
      fetch(request)
        .then((response: Response) => {
          if (response instanceof Response && response.ok) {
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
              return offlineResponse || new Response('Offline', { status: 503 });
            });
          });
        })
    );
  } 
  else if (request.destination === 'script' || 
           request.destination === 'style' ||
           url.pathname.endsWith('.js') ||
           url.pathname.endsWith('.css')) {
    // JS/CSS - Cache First pour stabilité
    event.respondWith(
      caches.match(request).then(response => {
        if (response) {
          return response;
        }
        return fetch(request).then((fetchResponse: Response) => {
          if (fetchResponse instanceof Response && fetchResponse.ok) {
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
  else if (request.destination === 'image') {
    // Images - Cache First
    event.respondWith(
      caches.match(request).then(response => {
        return response || fetch(request).then((fetchResponse: Response) => {
          if (fetchResponse instanceof Response && fetchResponse.ok) {
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
  // API calls - Network First avec timeout
  else if (url.hostname.includes('supabase.co')) {
    event.respondWith(
      Promise.race([
        fetch(request),
        new Promise<Response>((_, reject) => 
          setTimeout(() => reject(new Error('Network timeout')), 10000)
        )
      ]).then((response: Response) => {
        if (response instanceof Response && response.ok && request.method === 'GET') {
          const responseClone = response.clone();
          caches.open(API_CACHE).then(cache => {
            cache.put(request, responseClone);
          });
        }
        return response;
      }).catch(() => {
        return caches.match(request).then(cachedResponse => {
          return cachedResponse || new Response('Network Error', { status: 503 });
        });
      })
    );
  }
});

// Messages simplifiés
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    console.log('[SW] Force update requested');
    self.skipWaiting();
  }
});
