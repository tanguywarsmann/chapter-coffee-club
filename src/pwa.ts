// Register PWA only on the web, not inside Capacitor WebView
// Assumes vite-plugin-pwa is installed and configured
// Do not import anywhere else than in main.tsx
export function registerPWA() {
  const isCapacitor = typeof window !== 'undefined' && (window as any).Capacitor;
  if ('serviceWorker' in navigator && !isCapacitor) {
    // Lazy import to avoid bundling when disabled
    import('virtual:pwa-register').then(({ registerSW }) => {
      registerSW({ immediate: true });
    }).catch(() => {});
  }
}
