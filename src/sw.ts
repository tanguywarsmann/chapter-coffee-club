
/// <reference lib="webworker" />
declare const self: ServiceWorkerGlobalScope;

// Service Worker personnalisé pour READ
// Gère l'installation, l'activation et les requêtes offline

self.addEventListener("install", () => {
  console.info("[SW] Installed – skipWaiting triggered");
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.info("[SW] Activated – clientsClaim triggered");
  self.clients.claim();
});

// Handle fetch events for offline support
self.addEventListener("fetch", (event) => {
  // Only handle navigation requests (page loads)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        // If fetch fails (offline), serve the offline page
        return caches.match('/offline.html') || fetch('/offline.html');
      })
    );
  }
  
  // Handle other requests with cache-first strategy for static assets
  else if (event.request.destination === 'script' || 
           event.request.destination === 'style' || 
           event.request.destination === 'image') {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      })
    );
  }
});

// Handle messages from the main app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'WARM_CACHE') {
    // Warm cache for critical resources
    const urlsToCache = [
      '/',
      '/offline.html',
      '/manifest.json'
    ];
    
    caches.open('read-cache-v1').then((cache) => {
      cache.addAll(urlsToCache);
    });
  }
});

// Log pour confirmer que le SW personnalisé est chargé
console.info("[SW] Custom service worker with offline support loaded");
