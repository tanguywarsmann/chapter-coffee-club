
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { HelmetProvider } from "react-helmet-async"
import './index.css'

console.info("[BOOTSTRAP] Loading React app");

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </React.StrictMode>,
);
