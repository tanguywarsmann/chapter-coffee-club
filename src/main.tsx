import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { HelmetProvider } from "react-helmet-async"
import { ConfettiProvider } from "@/components/confetti/ConfettiProvider"
import './index.css'
import { exposeAuditHelpers } from '@/utils/jokerAudit';
import { JOKER_MIN_SEGMENTS_ENABLED, JOKER_MIN_SEGMENTS } from "@/utils/jokerConstraints";
import { initRevenueCat } from '@/lib/revenuecat';

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

/** iOS : ne pas superposer la status bar à la WebView + style lisible */
(async () => {
  try {
    if (Capacitor.getPlatform() === 'ios') {
      await StatusBar.setOverlaysWebView({ overlay: false });
      await StatusBar.setStyle({ style: Style.Dark }); // Style.Light si ton header est sombre
      // Optionnel : couleur de fond si tu as un header coloré
      // await StatusBar.setBackgroundColor({ color: '#FFFFFF' });
      
      // CRITICAL: Initialiser RevenueCat pour iOS
      console.log('[BOOTSTRAP] Initializing RevenueCat for iOS...');
      const { appleIAPService } = await import('@/services/iap/appleIAPService');
      await appleIAPService.initialize();
      console.log('[BOOTSTRAP] RevenueCat iOS initialized successfully');
    }
  } catch (e) {
    console.error('[iOS Setup]', e);
  }
})();

/** Android : Initialiser RevenueCat au démarrage */
(async () => {
  try {
    if (Capacitor.getPlatform() === 'android') {
      console.log('[BOOTSTRAP] Initializing RevenueCat for Android...');
      await initRevenueCat();
    }
  } catch (e) {
    console.warn('[RevenueCat]', e);
  }
})();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HelmetProvider>
      <ConfettiProvider>
        <App />
      </ConfettiProvider>
    </HelmetProvider>
  </React.StrictMode>,
)

// Register PWA after React is mounted
import('./pwa').then(({ registerPWA }) => registerPWA());
