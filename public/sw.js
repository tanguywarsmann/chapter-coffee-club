
// -- Service worker de cache basique généré pour le mode PWA --
const CACHE_NAME = "read-pwa-v2";
const CACHE_URLS = [
  "/",
  "/home",
  "/explore",
  "/reading-list",
  "/icons/icon-192.png",
  "/icons/icon-384.png",
  "/icons/icon-512.png"
];

// Vérifie si l'on est dans un iframe Lovable
const isInLovableIframe = () => {
  try {
    return window.self !== window.top && 
           (window.location.ancestorOrigins[0].includes('lovable.dev') || 
            document.referrer.includes('lovable.dev'));
  } catch (e) {
    return false;
  }
};

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keyList) =>
      Promise.all(
        keyList.map((key) => key !== CACHE_NAME && caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // Ne pas intercepter les requêtes dans l'environnement Lovable
  if (isInLovableIframe()) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request).then((response) =>
      response || fetch(event.request)
    )
  );
});
