
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'

console.info("[BOOTSTRAP] Loading React app");

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

const root = ReactDOM.createRoot(rootElement);

try {
  root.render(
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>
  );
  console.info("[BOOTSTRAP] React app rendered successfully");
} catch (error) {
  console.error("[BOOTSTRAP] Failed to render app:", error);
  
  // Fallback d'urgence
  rootElement.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; flex-direction: column; font-family: system-ui;">
      <h1 style="color: #B05F2C;">Erreur de rendu</h1>
      <p>Impossible de démarrer l'application READ.</p>
      <button onclick="window.location.reload()">Relancer</button>
    </div>
  `;
}
