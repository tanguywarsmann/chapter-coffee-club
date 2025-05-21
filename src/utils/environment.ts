
/**
 * Vérifie si l'application est en mode "preview" (Lovable)
 */
export function isPreview(): boolean {
  try {
    return window.location.hostname.includes("lovable.dev") || window.location.hostname === "localhost";
  } catch (e) {
    console.warn("Erreur lors de la vérification du mode preview:", e);
    return false;
  }
}

/**
 * Vérifie si l'application est en cours d'exécution dans une iframe
 * avec des vérifications supplémentaires pour éviter les erreurs en PWA
 */
export function isInIframe(): boolean {
  try {
    // Ne pas utiliser window.top qui peut provoquer des erreurs en PWA
    // et dans certains contextes de sécurité
    return window !== window.parent;
  } catch (e) {
    // Une erreur signifie généralement que nous sommes dans une iframe
    // avec une origine différente
    return true;
  }
}

/**
 * Vérifie si l'appareil est mobile en se basant sur la largeur d'écran
 * plutôt que sur l'user-agent pour plus de fiabilité
 */
export function isMobile(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(max-width: 768px)").matches;
}
