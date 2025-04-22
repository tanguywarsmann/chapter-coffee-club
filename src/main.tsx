
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById("root")!).render(<App />);

// Enregistrement du service worker pour le mode PWA si supporté
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js")
      .then(reg => {
        console.log("Service worker PWA enregistré", reg);
      })
      .catch(err => {
        console.error("Erreur Service Worker PWA", err);
      });
  });
}
