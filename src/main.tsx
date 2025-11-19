import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Keyboard } from '@capacitor/keyboard';
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { HelmetProvider } from "react-helmet-async"
import { ConfettiProvider } from "@/components/confetti/ConfettiProvider"
import './index.css'
import { JOKER_MIN_SEGMENTS_ENABLED, JOKER_MIN_SEGMENTS } from "@/utils/jokerConstraints";
import { initRevenueCat } from '@/lib/revenuecat';

console.info("[BOOTSTRAP] Loading React app");

console.info("[JOKER FLAGS] front", {
  enabled: JOKER_MIN_SEGMENTS_ENABLED,
  min: JOKER_MIN_SEGMENTS,
});

// AUDIT: Expose audit helpers in development
if (import.meta.env.DEV) {
  import("@/debug/finalValidation");
}

/** Bootstrap: init platform services, then render */
(async () => {
  try {
    const platform = Capacitor.getPlatform();
    
    if (platform === 'ios') {
      await StatusBar.setOverlaysWebView({ overlay: false });
      await StatusBar.setStyle({ style: Style.Dark });
      await Keyboard.setAccessoryBarVisible({ isVisible: false });

      const body = document.body;
      Keyboard.addListener('keyboardWillShow', (info) => {
        body.classList.add('keyboard-open');
        if (info?.keyboardHeight) {
          body.style.setProperty('--keyboard-height', `${info.keyboardHeight}px`);
        }
      });
      Keyboard.addListener('keyboardWillHide', () => {
        body.classList.remove('keyboard-open');
        body.style.removeProperty('--keyboard-height');
      });
      
      console.log('[BOOTSTRAP] Initializing RevenueCat for iOS...');
      const { appleIAPService } = await import('@/services/iap/appleIAPService');
      await appleIAPService.initialize();
      console.log('[BOOTSTRAP] RevenueCat iOS initialized successfully');
    }
    
    if (platform === 'android') {
      console.log('[BOOTSTRAP] Initializing RevenueCat for Android...');
      await initRevenueCat();
      console.log('[BOOTSTRAP] RevenueCat Android initialized successfully');
    }
  } catch (e) {
    console.error('[BOOTSTRAP] Fatal initialization error:', e);
    throw e;
  }
  
  // Only render after platform init completes
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <HelmetProvider>
        <ConfettiProvider>
          <App />
        </ConfettiProvider>
      </HelmetProvider>
    </React.StrictMode>,
  );
})();

// Register PWA after React is mounted
import('./pwa').then(({ registerPWA }) => registerPWA());
