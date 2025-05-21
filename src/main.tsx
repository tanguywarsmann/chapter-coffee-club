
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './lib/query.ts'

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

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
      {isDev && (
        <React.Suspense fallback={null}>
          <ReactQueryDevtools initialIsOpen={false} />
        </React.Suspense>
      )}
    </QueryClientProvider>
  </React.StrictMode>,
)

