
import { toast } from 'sonner'

// Performance measurement
performance.mark("read-app-start");

// Nettoyage conditionnel et sécurisé
const isFirstVisit = !localStorage.getItem("read_app_initialized");
if (isFirstVisit) {
  localStorage.removeItem("read_app_books_cache");
  localStorage.setItem("read_app_initialized", "true");
}

// Reset path seulement si invalide
const currentPath = window.location.pathname;
const allowedPaths = ["/", "/auth", "/home", "/books", "/profile", "/achievements", "/discover", "/admin"];
const isValidPath = allowedPaths.some(path => 
  currentPath === path || currentPath.startsWith(path + "/")
);

if (!isValidPath) {
  console.log("[PWA] Redirecting invalid path:", currentPath);
  history.replaceState(null, "", "/");
}

// Service Worker optimisé pour iOS et Android
if ('serviceWorker' in navigator) {
  let swRegistration: ServiceWorkerRegistration | null = null;
  let isUpdateAvailable = false;
  
  window.addEventListener('load', async () => {
    try {
      // Enregistrer le Service Worker
      swRegistration = await navigator.serviceWorker.register('/sw.js', { 
        scope: '/',
        updateViaCache: 'none'
      });
      
      console.log('[PWA] Service Worker registered successfully');
      
      // Écouter les mises à jour du SW
      swRegistration.addEventListener('updatefound', () => {
        const newWorker = swRegistration?.installing;
        if (newWorker) {
          console.log('[PWA] New service worker found');
          
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              isUpdateAvailable = true;
              console.log('[PWA] Update available');
              
              // Afficher une notification de mise à jour
              toast.info('Mise à jour disponible', {
                duration: 10000,
                description: 'Une nouvelle version est prête. Appuyez pour actualiser.',
                action: {
                  label: 'Actualiser',
                  onClick: () => {
                    newWorker.postMessage({ type: 'SKIP_WAITING' });
                  }
                }
              });
            }
          });
        }
      });
      
      // Vérifier les mises à jour périodiquement (toutes les 5 minutes)
      const checkForUpdates = () => {
        if (swRegistration && !isUpdateAvailable) {
          swRegistration.update().catch(error => {
            console.warn('[PWA] Update check failed:', error);
          });
        }
      };
      
      setInterval(checkForUpdates, 5 * 60 * 1000);
      
      // Vérification initiale après 30 secondes
      setTimeout(checkForUpdates, 30000);
      
    } catch (error) {
      console.error('[PWA] Service Worker registration failed:', error);
    }
  });
  
  // Écouter les messages du service worker
  navigator.serviceWorker.addEventListener('message', (event) => {
    const { type, version } = event.data || {};
    
    switch (type) {
      case 'SW_ACTIVATED':
        console.log('[PWA] Service Worker activated, version:', version);
        // Rafraîchir la page si une nouvelle version est active
        if (isUpdateAvailable) {
          window.location.reload();
        }
        break;
        
      case 'SW_UPDATED':
        console.log('[PWA] Service Worker updated');
        toast.success('Application mise à jour', {
          duration: 3000,
          description: 'Redémarrage automatique...'
        });
        setTimeout(() => window.location.reload(), 1000);
        break;
    }
  });
  
  // Gestion réseau optimisée pour mobile
  let isOnline = navigator.onLine;
  let offlineNotificationShown = false;
  
  const handleOnline = () => {
    if (!isOnline) {
      isOnline = true;
      offlineNotificationShown = false;
      
      toast.success('Connexion rétablie', {
        duration: 3000,
        description: 'Synchronisation en cours...'
      });
      
      // Vérifier les mises à jour quand on revient en ligne
      if (swRegistration) {
        swRegistration.update().catch(console.warn);
      }
    }
  };
  
  const handleOffline = () => {
    if (isOnline && !offlineNotificationShown) {
      isOnline = false;
      offlineNotificationShown = true;
      
      toast.warning('Mode hors ligne', {
        duration: 5000,
        description: 'Certaines fonctionnalités sont limitées'
      });
    }
  };
  
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  
  // Détection de connexion plus robuste pour mobile
  const checkConnectivity = async () => {
    try {
      const response = await fetch('/manifest.json', { 
        method: 'HEAD',
        cache: 'no-cache',
        signal: AbortSignal.timeout(3000)
      });
      
      if (response.ok && !isOnline) {
        handleOnline();
      }
    } catch {
      if (isOnline) {
        handleOffline();
      }
    }
  };
  
  // Vérifier la connectivité toutes les 30 secondes
  setInterval(checkConnectivity, 30000);
}

// Performance monitoring optimisé
window.addEventListener("load", () => {
  performance.measure("startup", "read-app-start");
  const measurement = performance.getEntriesByName("startup")[0];
  
  if (measurement && measurement.duration > 3000) {
    console.warn('[PERF] Startup time is slow:', measurement.duration + 'ms');
  }
  
  // Masquer le splash screen iOS
  const splash = document.getElementById('loading-splash');
  if (splash) {
    setTimeout(() => {
      splash.style.opacity = '0';
      setTimeout(() => splash.remove(), 500);
    }, 1000);
  }
});

// Support PWA installation
let deferredPrompt: any;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  console.log('[PWA] Install prompt available');
});

window.addEventListener('appinstalled', () => {
  console.log('[PWA] App installed successfully');
  toast.success('Application installée', {
    description: 'READ est maintenant disponible sur votre écran d\'accueil'
  });
  deferredPrompt = null;
});

// Chargement React optimisé
import("@/bootstrap");
