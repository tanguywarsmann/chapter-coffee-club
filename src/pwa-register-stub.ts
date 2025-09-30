// src/pwa-register-stub.ts

// Stub de l'API "classique"
export const registerSW = (_opts?: any) => {
  // renvoie un objet "compatible" si quelqu'un l'utilise
  return {
    update() {},            // no-op
    needRefresh: false,     // pas d'update nécessaire
    offlineReady: false,    // évite d'afficher des toasts "prêt hors-ligne"
  };
};

// Stub de l'API React (hook)
export const useRegisterSW = (_opts?: any) => ({
  needRefresh: { value: false },
  offlineReady: { value: false },
  updateServiceWorker: (_?: any) => {},
});

// Par sécurité, on exporte aussi par défaut quelque chose d'appelable
export default registerSW;
