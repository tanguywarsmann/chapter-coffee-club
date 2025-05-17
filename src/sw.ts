
import { precacheAndRoute } from 'workbox-precaching';

// Cette ligne est nécessaire pour permettre à Workbox d'injecter la liste des ressources à mettre en cache
precacheAndRoute(self.__WB_MANIFEST);

// Conservons le comportement personnalisé du service worker existant
self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  self.clients.claim();
});

// Stratégie de cache adaptée de public/sw.js
const CACHE_NAME = "read-pwa-v3";
const STATIC_ASSETS = [
  "/",
  "/home",
  "/index.html",
  "/icons/icon-192.png",
  "/icons/icon-384.png",
  "/icons/icon-512.png"
];

// Détection du contexte iframe
const isInIframe = () => {
  try {
    return self.window !== self.parent;
  } catch (e) {
    return true;
  }
};

// Mises en cache personnalisées pour les ressources statiques
self.addEventListener("fetch", (event) => {
  // Ne pas intercepter les requêtes dans Lovable iframe
  if (isInIframe()) {
    return;
  }
  
  const url = new URL(event.request.url);
  
  // Ignorer les requêtes non-GET et les extensions navigateur
  if (event.request.method !== 'GET' || 
      !url.protocol.startsWith('http') ||
      url.pathname.includes('/live-reload/')) {
    return;
  }
  
  // Stratégie pour les ressources statiques - cache first
  if (url.pathname.match(/\.(js|css|woff2?|ttf|png|jpg|jpeg|svg|ico)$/)) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        return cachedResponse || fetch(event.request).then(response => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
          
          return response;
        });
      })
    );
  }
});

// Gestion des messages pour le préchauffage du cache
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'WARM_CACHE') {
    // Précharger les ressources de la page d'accueil
    const PRELOAD_ROUTES = ["/home"];
    caches.open(CACHE_NAME).then((cache) => {
      PRELOAD_ROUTES.forEach(route => {
        fetch(route)
          .then(response => cache.put(route, response))
          .catch(error => console.error('Prewarming failed for', route, error));
      });
    });
  }
});
