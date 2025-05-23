
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import { toast } from 'sonner'

// Performance measurement - start marking time
performance.mark("read-app-start");

// Clean up potentially corrupted data
localStorage.removeItem("read_app_books_cache");

// Reset path if not on allowed routes
const allowedStart = ["/", "/auth", "/home"];
if (!allowedStart.includes(window.location.pathname)) {
  console.info("[MAIN] Redirecting from invalid path:", window.location.pathname);
  history.replaceState(null, "", "/");
}

// Clear any saved navigation state
localStorage.removeItem("lastVisitedPath");

// Log application startup for debugging
console.info("[MAIN] Application starting - initializing React root");

// Only load React Query Devtools in development mode and only when needed
const ReactQueryDevtools = React.lazy(() => 
  process.env.NODE_ENV === 'development' 
    ? import('@tanstack/react-query-devtools').then(module => ({ default: module.ReactQueryDevtools }))
    : Promise.resolve({ default: () => null })
);

// Set development flag
const isDev = process.env.NODE_ENV === 'development';

// Register service worker (PWA support)
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    console.info('[PWA] Registering service worker from load event handler');
    navigator.serviceWorker.register('/sw.js', { scope: '/' })
      .then((registration) => {
        console.info('[PWA] Service Worker registered with scope:', registration.scope);
        
        // Notify on update
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                toast.info('Une mise à jour est disponible! Redémarrez l\'application.', {
                  duration: 8000,
                  action: {
                    label: 'Rafraîchir',
                    onClick: () => window.location.reload()
                  }
                });
              }
            });
          }
        });
      })
      .catch((error) => {
        console.error('[PWA] Service Worker registration failed:', error);
      });
  });
  
  // Handle offline status
  window.addEventListener('online', () => {
    toast.success('Connexion internet rétablie');
  });
  
  window.addEventListener('offline', () => {
    toast.warning('Vous êtes actuellement hors ligne');
  });
}

// Add performance measurement completion
window.addEventListener("load", () => {
  performance.measure("startup", "read-app-start");
  const m = performance.getEntriesByName("startup")[0];
  console.info(`[PERF] Startup ${m.duration.toFixed(0)} ms`);

  // Get initial JS size (approximate)
  if (window.performance && window.performance.getEntriesByType) {
    const resources = window.performance.getEntriesByType("resource");
    const jsResources = resources.filter(r => r.name.endsWith('.js'));
    const totalJsSize = jsResources.reduce((total, r) => total + (r.transferSize || 0), 0);
    console.info(`[PERF] Initial JS bundle size: ${(totalJsSize / 1024).toFixed(1)} KB`);
    console.info(`[PERF] Current route: ${window.location.pathname}`);
  }
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
    {isDev && (
      <React.Suspense fallback={null}>
        <ReactQueryDevtools initialIsOpen={false} />
      </React.Suspense>
    )}
  </React.StrictMode>,
);
