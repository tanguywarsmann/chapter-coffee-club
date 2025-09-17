import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { HelmetProvider } from "react-helmet-async"
import { ConfettiProvider } from "@/components/confetti/ConfettiProvider"
import './index.css'
import { exposeAuditHelpers } from '@/utils/jokerAudit';
import { JOKER_MIN_SEGMENTS_ENABLED, JOKER_MIN_SEGMENTS } from "@/utils/jokerConstraints";

console.info("[BOOTSTRAP] Loading React app");

console.info("[JOKER FLAGS] front", {
  enabled: JOKER_MIN_SEGMENTS_ENABLED,
  min: JOKER_MIN_SEGMENTS,
});

// AUDIT: Expose audit helpers in development
if (import.meta.env.DEV) {
  exposeAuditHelpers();
  import("@/debug/consoleTap");
  import("@/debug/finalValidation");
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HelmetProvider>
      <ConfettiProvider>
        <App />
      </ConfettiProvider>
    </HelmetProvider>
  </React.StrictMode>,
)