// Stub de l'API "classique"
export const registerSW = (_opts?: any) => ({
  update() {},
  needRefresh: false,
  offlineReady: false,
});

// Stub du hook React
export const useRegisterSW = (_opts?: any) => ({
  needRefresh: { value: false },
  offlineReady: { value: false },
  updateServiceWorker: (_?: any) => {},
});

// Default no-op (pour les imports par défaut)
export default registerSW;

