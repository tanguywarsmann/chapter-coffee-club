
// Service Worker personnalisé pour READ
// Gère l'installation et l'activation avec skipWaiting et clientsClaim

self.addEventListener("install", () => {
  console.info("[SW] Installed – skipWaiting triggered");
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.info("[SW] Activated – clientsClaim triggered");
  self.clients.claim();
});

// Log pour confirmer que le SW personnalisé est chargé
console.info("[SW] Custom service worker loaded");
