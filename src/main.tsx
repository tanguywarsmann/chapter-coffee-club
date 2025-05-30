import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'

// Performance measurement
performance.mark("read-app-start");
console.info("[MAIN] Starting READ app initialization");

// Simple path validation - FIXED: include /auth as valid path
const currentPath = window.location.pathname;
const allowedPaths = ["/", "/home", "/auth", "/explore", "/profile", "/reading-list", "/books", "/diagnostic"];
const isValidPath = allowedPaths.some(path => 
  currentPath === path || currentPath.startsWith(path + "/")
);

if (!isValidPath) {
  console.log("[MAIN] Redirecting invalid path:", currentPath);
  history.replaceState(null, "", "/auth"); // Redirect to auth instead of /
}

// Global error handling
window.addEventListener('error', function(event) {
  console.error('[MAIN] Global error:', event.error);
});

window.addEventListener('unhandledrejection', function(event) {
  console.error('[MAIN] Unhandled promise rejection:', event.reason);
});

// Performance monitoring
window.addEventListener("load", () => {
  try {
    performance.measure("startup", "read-app-start");
    const measurement = performance.getEntriesByName("startup")[0];
    
    if (measurement && measurement.duration > 3000) {
      console.warn('[PERF] Startup time is slow:', measurement.duration + 'ms');
    }
  } catch (error) {
    console.warn('[PERF] Performance measurement failed:', error);
  }
});

// Direct React bootstrap (no dynamic import)
console.info("[MAIN] Initializing React app");

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

const root = ReactDOM.createRoot(rootElement);

try {
  console.info("[MAIN] Rendering React app...");
  root.render(
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>
  );
  console.info("[MAIN] React app rendered successfully");
} catch (error) {
  console.error("[MAIN] Failed to render app:", error);
  
  // Fallback d'urgence
  rootElement.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; flex-direction: column; font-family: system-ui;">
      <h1 style="color: #B05F2C;">Erreur de rendu</h1>
      <p>Impossible de démarrer l'application READ.</p>
      <button onclick="window.location.reload()">Relancer</button>
    </div>
  `;
}
