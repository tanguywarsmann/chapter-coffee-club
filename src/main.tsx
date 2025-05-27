
import { toast } from 'sonner'

// Performance measurement - start marking time
performance.mark("read-app-start");

// Clean up potentially corrupted data
localStorage.removeItem("read_app_books_cache");

// Reset path if not on allowed routes
const allowedStart = ["/", "/auth", "/home"];
if (!allowedStart.includes(window.location.pathname)) {
  history.replaceState(null, "", "/");
}

// Clear any saved navigation state
localStorage.removeItem("lastVisitedPath");

// Register service worker (PWA support)
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { scope: '/' })
      .then((registration) => {
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
  
  // Handle offline status with improved accessibility
  window.addEventListener('online', () => {
    const toastElement = toast.success('Connexion internet rétablie', {
      duration: 4000
    });
    
    // Add aria-live region for screen readers
    if (toastElement) {
      const toastContainer = document.querySelector('[data-sonner-toaster]');
      if (toastContainer) {
        toastContainer.setAttribute('role', 'status');
        toastContainer.setAttribute('aria-live', 'polite');
      }
    }
  });
  
  window.addEventListener('offline', () => {
    const toastElement = toast.warning('Vous êtes actuellement hors ligne', {
      duration: 6000,
      description: 'Certaines fonctionnalités peuvent être limitées'
    });
    
    // Add aria-live region for screen readers
    if (toastElement) {
      const toastContainer = document.querySelector('[data-sonner-toaster]');
      if (toastContainer) {
        toastContainer.setAttribute('role', 'status');
        toastContainer.setAttribute('aria-live', 'assertive');
      }
    }
  });
}

// Add performance measurement completion
window.addEventListener("load", () => {
  performance.measure("startup", "read-app-start");
  const m = performance.getEntriesByName("startup")[0];
  
  // [PERF] Critical performance monitoring
  if (window.performance && window.performance.getEntriesByType) {
    const resources = performance.getEntriesByType("resource") as PerformanceResourceTiming[];
    const initialJs = resources
      .filter(r => r.initiatorType === "script" || r.name.endsWith(".js"))
      .reduce((sum, r) => sum + r.transferSize, 0);
  }
});

// Defer React app loading
import("@/bootstrap");
