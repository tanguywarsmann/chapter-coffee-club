
import React from 'react'
import ReactDOM from 'react-dom/client'

// Performance measurement
performance.mark("read-app-start");

// Simple path validation
const currentPath = window.location.pathname;
const allowedPaths = ["/", "/home", "/explore", "/profile", "/reading-list", "/books", "/diagnostic"];
const isValidPath = allowedPaths.some(path => 
  currentPath === path || currentPath.startsWith(path + "/")
);

if (!isValidPath) {
  console.log("[APP] Redirecting invalid path:", currentPath);
  history.replaceState(null, "", "/");
}

// Global error handling
window.addEventListener('error', function(event) {
  console.error('[APP] Global error:', event.error);
});

window.addEventListener('unhandledrejection', function(event) {
  console.error('[APP] Unhandled promise rejection:', event.reason);
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

// Bootstrap React avec fallback d'erreur
try {
  import("./bootstrap").catch(error => {
    console.error('[APP] Failed to load bootstrap:', error);
    
    // Fallback simple en cas d'erreur
    const rootElement = document.getElementById('root');
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; flex-direction: column; font-family: system-ui; padding: 20px; text-align: center;">
          <h1 style="color: #B05F2C; margin-bottom: 16px;">Erreur de chargement</h1>
          <p style="margin-bottom: 20px; color: #666;">Impossible de charger l'application READ. Veuillez actualiser la page.</p>
          <button onclick="window.location.reload()" style="background: #B05F2C; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer;">
            Actualiser
          </button>
        </div>
      `;
    }
  });
} catch (error) {
  console.error('[APP] Critical bootstrap error:', error);
}
