
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import ErrorBoundary from './components/error/ErrorBoundary'

// Détection de l'environnement
const isPWA = window.matchMedia('(display-mode: standalone)').matches;
const isInIframe = window.self !== window.top;
const isInLovablePreview = isInIframe && 
                          (window.location.ancestorOrigins?.[0]?.includes('lovable.dev') || 
                           document.referrer.includes('lovable.dev'));

console.log('Application running as PWA:', isPWA);
console.log('Running in iframe:', isInIframe);
console.log('Running in Lovable preview:', isInLovablePreview);
console.log('localStorage available:', typeof localStorage !== 'undefined');
console.log('sessionStorage available:', typeof sessionStorage !== 'undefined');

// Fonction pour initialiser l'application de manière sécurisée
const initApp = () => {
  try {
    const rootElement = document.getElementById("root");
    if (!rootElement) {
      console.error("Root element not found!");
      return;
    }
    
    console.log("Initialisation de l'application READ avec ErrorBoundary");
    createRoot(rootElement).render(
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    );
  } catch (error) {
    console.error("Error initializing application:", error);
  }
};

// Initialiser l'app
initApp();

// Enregistrement du service worker uniquement hors iframe
if ("serviceWorker" in navigator && !isInIframe) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js")
      .then(reg => {
        console.log("Service worker PWA enregistré", reg);
      })
      .catch(err => {
        console.error("Erreur Service Worker PWA", err);
      });
  });
} else if (isInIframe && navigator.serviceWorker) {
  // Désactiver les service workers existants dans la preview
  navigator.serviceWorker.getRegistrations().then(registrations => {
    for (let registration of registrations) {
      registration.unregister();
      console.log("Service worker unregistered in iframe");
    }
  });
}
