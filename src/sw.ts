
/// <reference no-default-lib="true"/>
/// <reference lib="ES2020" />
/// <reference lib="WebWorker" />

import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';

declare const self: ServiceWorkerGlobalScope;

// Clean up outdated caches
cleanupOutdatedCaches();

// Precache files
precacheAndRoute(self.__WB_MANIFEST);

// Cache strategy for blog posts and images
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Don't intercept requests from search engine bots
  const userAgent = event.request.headers.get('user-agent') || '';
  const isBotRequest = /bot|crawler|spider|crawling/i.test(userAgent);
  
  if (isBotRequest) {
    return;
  }
  
  // Handle sitemap.xml requests
  if (url.pathname === '/sitemap.xml') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (response.ok) {
            const headers = new Headers(response.headers);
            headers.set('Content-Type', 'application/xml; charset=UTF-8');
            return new Response(response.body, {
              status: response.status,
              statusText: response.statusText,
              headers: headers
            });
          }
          return response;
        })
        .catch(() => {
          // Fallback sitemap if network fails
          const fallbackSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://vread.fr/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;
          return new Response(fallbackSitemap, {
            headers: { 'Content-Type': 'application/xml; charset=UTF-8' }
          });
        })
    );
    return;
  }

  // Cache blog images
  if (url.pathname.includes('/blog-images/')) {
    event.respondWith(
      caches.open('blog-images-v1').then(cache => {
        return cache.match(event.request).then(response => {
          if (response) {
            return response;
          }
          return fetch(event.request).then(networkResponse => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        });
      })
    );
    return;
  }

  // Network-first strategy for API calls and dynamic content
  if (url.pathname.includes('/api/') || url.pathname.includes('/blog/') || url.pathname.includes('/books/')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (response.ok) {
            const responseClone = response.clone();
            caches.open('dynamic-v1').then(cache => {
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
});

// Handle robots.txt to ensure proper SEO
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  if (url.pathname === '/robots.txt') {
    event.respondWith(
      new Response(`User-agent: *
Allow: /

Sitemap: https://vread.fr/sitemap.xml`, {
        headers: { 'Content-Type': 'text/plain' }
      })
    );
  }
});

// Skip waiting and claim clients immediately
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});
