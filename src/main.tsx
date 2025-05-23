
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './lib/query.ts'
import { toast } from 'sonner'

// Clean up potentially corrupted data
localStorage.removeItem("read_app_books_cache");

// Log application startup for debugging
console.info("[MAIN] Application starting - initializing React root");

// Only load React Query Devtools in development mode and only when needed
const ReactQueryDevtools = React.lazy(() => 
  process.env.NODE_ENV === 'development' 
    ? import('@tanstack/react-query-devtools').then(module => ({ default: module.ReactQueryDevtools }))
    : Promise.resolve({ default: () => null })
);

// Set development flag
const isDev = process.env.NODE_ENV === 'development';

// Register service worker (PWA support)
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    console.info('[PWA] Registering service worker from load event handler');
    navigator.serviceWorker.register('/sw.js', { scope: '/' })
      .then((registration) => {
        console.info('[PWA] Service Worker registered with scope:', registration.scope);
        
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
  
  // Handle offline status
  window.addEventListener('online', () => {
    toast.success('Connexion internet rétablie');
  });
  
  window.addEventListener('offline', () => {
    toast.warning('Vous êtes actuellement hors ligne');
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
    {isDev && (
      <React.Suspense fallback={null}>
        <ReactQueryDevtools initialIsOpen={false} />
      </React.Suspense>
    )}
  </React.StrictMode>,
);
