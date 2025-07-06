
/// <reference lib="webworker" />
declare const self: ServiceWorkerGlobalScope;

// Service Worker personnalisé pour READ avec détection automatique des mises à jour
// Version forcée pour invalidation du cache PWA
const CACHE_VERSION = 'read-cache-v3-' + Date.now();
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const API_CACHE = `${CACHE_VERSION}-api`;

// Fonction pour vérifier les nouvelles versions
const checkForUpdates = async () => {
  try {
    const response = await fetch('/version.json?' + Date.now(), { 
      cache: 'no-cache',
      headers: {
        'Cache-Control': 'no-cache'
      }
    });
    
    if (response.ok) {
      const versionData = await response.json();
      const currentVersion = await caches.open('version-cache').then(cache => 
        cache.match('/current-version').then(response => 
          response ? response.json() : { version: null }
        )
      );
      
      if (currentVersion.version && currentVersion.version !== versionData.version) {
        console.log('[SW] New version detected:', versionData.version);
        // Forcer la mise à jour
        await caches.keys().then(names => Promise.all(names.map(name => caches.delete(name))));
        self.skipWaiting();
        return true;
      }
      
      // Stocker la version actuelle
      const versionCache = await caches.open('version-cache');
      await versionCache.put('/current-version', new Response(JSON.stringify(versionData)));
    }
  } catch (error) {
    console.warn('[SW] Could not check for updates:', error);
  }
  return false;
};

self.addEventListener("install", (event) => {
  console.log('[SW] Installing new service worker version:', CACHE_VERSION);
  // Force l'activation immédiate sans attendre
  self.skipWaiting();
  
  // Pré-cache les ressources critiques (exclut admin)
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then((cache) => {
        return cache.addAll([
          '/',
          '/offline.html',
          '/manifest.json'
        ]);
      }),
      checkForUpdates()
    ])
  );
});

self.addEventListener("activate", (event) => {
  console.log('[SW] Activating new service worker version:', CACHE_VERSION);
  
  event.waitUntil(
    Promise.all([
      // Prendre le contrôle immédiatement
      self.clients.claim(),
      
      // Nettoyer tous les anciens caches sauf version-cache
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (!cacheName.startsWith(CACHE_VERSION) && cacheName !== 'version-cache') {
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
  // Ne pas cacher les routes d'administration
  if (event.request.url.includes('/admin/')) {
    return; // Laisser passer sans mise en cache
  }

  // Vérifier les mises à jour périodiquement sur les requêtes HTML
  if (event.request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          // Vérifier s'il y a une nouvelle version
          const hasUpdate = await checkForUpdates();
          if (hasUpdate) {
            // Si mise à jour détectée, recharger la page avec la nouvelle version
            return fetch(event.request);
          }
          
          // Stratégie Network First pour les pages HTML
          const response = await fetch(event.request);
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(STATIC_CACHE).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        } catch (error) {
          // Fallback vers le cache en cas d'échec réseau
          return caches.match(event.request) || caches.match('/offline.html');
        }
      })()
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
  
  if (event.data && event.data.type === 'CHECK_UPDATES') {
    checkForUpdates().then(hasUpdate => {
      event.ports[0].postMessage({ hasUpdate });
    });
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

// Vérifier les mises à jour périodiquement (toutes les 30 secondes)
setInterval(() => {
  checkForUpdates().then(hasUpdate => {
    if (hasUpdate) {
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: 'FORCE_RELOAD',
            message: 'Nouvelle version détectée'
          });
        });
      });
    }
  });
}, 30000);
