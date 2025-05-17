
// Service worker with advanced caching strategy for READ PWA
const CACHE_NAME = "read-pwa-v3";
const STATIC_ASSETS = [
  "/",
  "/home",
  "/index.html",
  "/icons/icon-192.png",
  "/icons/icon-384.png",
  "/icons/icon-512.png"
];

// Only preload the home page assets
const PRELOAD_ROUTES = [
  "/home"
];

// Detect iframe context
const isInIframe = () => {
  try {
    return window.self !== window.top;
  } catch (e) {
    return true;
  }
};

// Check if running in Lovable iframe specifically
const isInLovableIframe = () => {
  try {
    return window.self !== window.top && 
           (window.location.ancestorOrigins[0]?.includes('lovable.dev') || 
            document.referrer.includes('lovable.dev'));
  } catch (e) {
    return false;
  }
};

// Skip service worker inside iframes
if (isInIframe()) {
  self.skipWaiting();
} else {
  // Installation event - cache core files
  self.addEventListener("install", (event) => {
    event.waitUntil(
      caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
    );
    self.skipWaiting();
  });

  // Activation event - clean old caches and claim clients
  self.addEventListener("activate", (event) => {
    event.waitUntil(
      Promise.all([
        // Remove old cache versions
        caches.keys().then((keyList) =>
          Promise.all(
            keyList.map((key) => key !== CACHE_NAME && caches.delete(key))
          )
        ),
        // Claim existing clients so the SW controls them
        self.clients.claim()
      ])
    );
  });

  // Fetch strategy with network-first for API/dynamic content and cache-first for static assets
  self.addEventListener("fetch", (event) => {
    // Don't intercept requests in Lovable iframe
    if (isInLovableIframe()) {
      return;
    }
    
    const url = new URL(event.request.url);
    
    // Skip non-GET requests and browser extensions
    if (event.request.method !== 'GET' || 
        !url.protocol.startsWith('http') ||
        url.pathname.includes('/live-reload/')) {
      return;
    }
    
    // Static assets strategy - cache first
    if (url.pathname.match(/\.(js|css|woff2?|ttf|png|jpg|jpeg|svg|ico)$/)) {
      event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
          // Return cached response if available
          if (cachedResponse) {
            // Clone the response to return and cache a fresh version in the background
            const responseToCache = cachedResponse.clone();
            
            // Update cache in background
            fetch(event.request)
              .then(response => {
                if (response.ok) {
                  caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, response);
                  });
                }
              })
              .catch(() => {});
              
            return cachedResponse;
          }
          
          // If not in cache, fetch from network and cache
          return fetch(event.request).then(response => {
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
    // HTML route handling - network first for fresh content
    else if (url.pathname === '/' || 
             url.pathname === '/home' || 
             url.pathname === '/index.html') {
      event.respondWith(
        fetch(event.request)
          .then(response => {
            // Clone the response to return and cache
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseToCache);
            });
            return response;
          })
          .catch(() => {
            // Fallback to cache if network fails
            return caches.match(event.request).then(cachedResponse => {
              return cachedResponse || caches.match('/index.html');
            });
          })
      );
    }
    // Default strategy - network first, cache as fallback
    else {
      event.respondWith(
        fetch(event.request)
          .then(response => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200) {
              return response;
            }
            
            // Clone and cache successful responses
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseToCache);
            });
            
            return response;
          })
          .catch(() => {
            // Fallback to cache if network fails
            return caches.match(event.request);
          })
      );
    }
  });

  // Handle preloading the home page
  self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'WARM_CACHE') {
      // Preload home page assets
      caches.open(CACHE_NAME).then((cache) => {
        PRELOAD_ROUTES.forEach(route => {
          fetch(route)
            .then(response => cache.put(route, response))
            .catch(error => console.error('Prewarming failed for', route, error));
        });
      });
    }
  });
}
