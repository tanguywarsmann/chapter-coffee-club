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
