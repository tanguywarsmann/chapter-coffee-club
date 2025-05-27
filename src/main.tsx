
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
console.info("[MAIN] Application starting - deferring React load");

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
    const resources = performance.getEntriesByType("resource") as PerformanceResourceTiming[];
    const initialJs = resources
      .filter(r => r.initiatorType === "script" || r.name.endsWith(".js"))
      .reduce((sum, r) => sum + r.transferSize, 0);
      
    console.info(
      `[PERF] Initial JS ≈ ${(initialJs / 1024).toFixed(1)} KB (${resources.length} files)`
    );
    console.info(`[PERF] Current route: ${window.location.pathname}`);
  }
});

// Defer React app loading
import("@/bootstrap");
