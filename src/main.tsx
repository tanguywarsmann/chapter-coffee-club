
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

// UX AUDIT: Importer le système d'audit pour surveillance en développement
if (import.meta.env.DEV) {
  import('./utils/uxAudit').then(({ detectSuspiciousElements }) => {
    // Vérifier les éléments suspects après chargement
    setTimeout(detectSuspiciousElements, 3000);
  });
}

// Register service worker (PWA support) with forced update and cross-domain support
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { 
      scope: '/',
      updateViaCache: 'none' // Force le rechargement du SW
    })
      .then((registration) => {
        console.log('[PWA] Service Worker registered successfully on', window.location.hostname);
        
        // Force la vérification des mises à jour
        registration.update();
        
        // Écouter les messages du service worker
        navigator.serviceWorker.addEventListener('message', (event) => {
          if (event.data && event.data.type === 'SW_UPDATED') {
            console.log('[PWA] New service worker version active:', event.data.version);
            toast.success('Application mise à jour avec succès!', {
              duration: 4000,
              description: 'Les dernières améliorations sont maintenant disponibles'
            });
          }
          
          if (event.data && event.data.type === 'FORCE_RELOAD') {
            console.log('[PWA] Force reload requested:', event.data.message);
            toast.info('Nouvelle version disponible! Redémarrage...', {
              duration: 2000
            });
            setTimeout(() => {
              window.location.reload();
            }, 2000);
          }
        });
        
        // Notify on update
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            console.log('[PWA] New service worker found, installing...');
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  // Forcer la mise à jour immédiate
                  newWorker.postMessage({ type: 'SKIP_WAITING' });
                  toast.info('Mise à jour prête! Redémarrage automatique...', {
                    duration: 3000
                  });
                  
                  // Redémarrer automatiquement après 2 secondes
                  setTimeout(() => {
                    window.location.reload();
                  }, 2000);
                } else {
                  // Premier chargement
                  console.log('[PWA] App ready for offline use on', window.location.hostname);
                }
              }
            });
          }
        });
        
        // Vérifier les mises à jour périodiquement (toutes les minutes)
        setInterval(() => {
          registration.update();
          
          // Vérifier aussi via le service worker
          if (navigator.serviceWorker.controller) {
            const messageChannel = new MessageChannel();
            messageChannel.port1.onmessage = (event) => {
              if (event.data.hasUpdate) {
                console.log('[PWA] Update detected via service worker check');
                window.location.reload();
              }
            };
            
            navigator.serviceWorker.controller.postMessage(
              { type: 'CHECK_UPDATES' },
              [messageChannel.port2]
            );
          }
        }, 60000);
      })
      .catch((error) => {
        console.error('[PWA] Service Worker registration failed on', window.location.hostname, ':', error);
      });
  });
  
  // Handle offline status with improved accessibility
  window.addEventListener('online', () => {
    const toastElement = toast.success('Connexion internet rétablie', {
      duration: 4000
    });
    
    // Force la vérification des mises à jour quand on revient en ligne
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.update();
      });
    }
    
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
