import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Supprime toute meta og:url statique (provenant de index.html) après hydratation,
 * pour éviter les doublons avec les <Helmet> des pages (About/Press/Landing).
 * Note : Brand SEO Guard lit le HTML brut AVANT JS, donc ce retrait n'affecte pas le check CI.
 */
export function OGUrlManager() {
  const { pathname } = useLocation();

  useEffect(() => {
    const statics = document.head.querySelectorAll(
      'meta[property="og:url"]:not([data-rh])'
    );
    statics.forEach((el) => el.parentElement?.removeChild(el));
  }, [pathname]);

  return null;
}