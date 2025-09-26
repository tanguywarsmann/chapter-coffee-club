import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Neutraliser le SW en mode natif (Capacitor)
if ((window as any).__VREAD_NATIVE__ && 'serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations?.().then(rs => rs.forEach(r => r.unregister()));
}

const container = document.getElementById('root');
if (!container) {
  const msg = '[BOOT] #root introuvable — ajoute <div id="root"></div> dans index.html';
  console.error(msg);
  const pre = document.createElement('pre'); pre.textContent = msg; document.body.appendChild(pre);
  throw new Error(msg);
}

createRoot(container).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);