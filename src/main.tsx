
import { toast } from 'sonner'

// Performance measurement
performance.mark("read-app-start");

// Nettoyage conditionnel et sécurisé
const isFirstVisit = !localStorage.getItem("read_app_initialized");
if (isFirstVisit) {
  // Seulement au premier lancement
  localStorage.removeItem("read_app_books_cache");
  localStorage.setItem("read_app_initialized", "true");
}

// Reset path seulement si invalide
const currentPath = window.location.pathname;
const allowedPaths = ["/", "/auth", "/home", "/books", "/profile", "/achievements", "/discover"];
const isValidPath = allowedPaths.some(path => 
  currentPath === path || currentPath.startsWith(path + "/")
);

if (!isValidPath) {
  console.log("[PWA] Redirecting invalid path:", currentPath);
  history.replaceState(null, "", "/");
}

// Service Worker optimisé pour iOS
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { 
      scope: '/',
      updateViaCache: 'none'
    })
      .then((registration) => {
        console.log('[PWA] Service Worker registered successfully');
        
        // Vérification des mises à jour moins fréquente
        const checkForUpdates = () => {
          registration.update();
        };
        
        // Vérifier les mises à jour toutes les 5 minutes (au lieu de 1)
        setInterval(checkForUpdates, 5 * 60 * 1000);
        
        // Écouter les messages du service worker
        navigator.serviceWorker.addEventListener('message', (event) => {
          if (event.data?.type === 'SW_UPDATED') {
            console.log('[PWA] New service worker version active');
            toast.success('Application mise à jour', {
              duration: 3000,
              description: 'Redémarrage automatique dans 3 secondes...'
            });
            
            setTimeout(() => {
              window.location.reload();
            }, 3000);
          }
        });
        
        // Gestion des mises à jour
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            console.log('[PWA] New service worker found');
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // Mise à jour disponible
                newWorker.postMessage({ type: 'SKIP_WAITING' });
              }
            });
          }
        });
      })
      .catch((error) => {
        console.error('[PWA] Service Worker registration failed:', error);
      });
  });
  
  // Gestion réseau améliorée pour iOS
  let isOnline = navigator.onLine;
  
  window.addEventListener('online', () => {
    if (!isOnline) {
      isOnline = true;
      toast.success('Connexion rétablie', {
        duration: 3000
      });
      
      // Vérifier les mises à jour quand on revient en ligne
      navigator.serviceWorker.ready.then((registration) => {
        registration.update();
      });
    }
  });
  
  window.addEventListener('offline', () => {
    if (isOnline) {
      isOnline = false;
      toast.warning('Mode hors ligne', {
        duration: 4000,
        description: 'Fonctionnalités limitées'
      });
    }
  });
}

// Performance monitoring optimisé
window.addEventListener("load", () => {
  performance.measure("startup", "read-app-start");
  const measurement = performance.getEntriesByName("startup")[0];
  
  if (measurement && measurement.duration > 3000) {
    console.warn('[PERF] Startup time is slow:', measurement.duration + 'ms');
  }
});

// Chargement React optimisé
import("@/bootstrap");
