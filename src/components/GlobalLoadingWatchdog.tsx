import { useEffect, useRef } from "react";
import { useIsFetching } from "@tanstack/react-query";

/**
 * Watchdog qui détecte les queries React Query bloquées en loading
 * Ne déclenche plus l'alerte que si l'app est réellement hors-ligne pendant un fetch prolongé
 */
export function GlobalLoadingWatchdog() {
  const isFetching = useIsFetching();
  const timeoutRef = useRef<number | null>(null);
  const hasDispatched = useRef(false);
  const STALL_MS = 20000; // 20 secondes pour réduire les faux positifs

  useEffect(() => {
    if (isFetching > 0) {
      // Queries en cours, démarrer le timer si pas déjà fait
      if (timeoutRef.current === null) {
        timeoutRef.current = window.setTimeout(() => {
          // Au bout de STALL_MS, si toujours en fetching et hors-ligne
          const isOffline = typeof navigator !== "undefined" && navigator.onLine === false;
          if (isFetching > 0 && !hasDispatched.current && isOffline) {
            if (import.meta.env.DEV) {
              console.warn("[WATCHDOG] Offline during fetch >20s, dispatching auth-expired");
            }

            hasDispatched.current = true;
            window.dispatchEvent(new Event("auth-expired"));
          }
        }, STALL_MS);
      }
    } else {
      // Plus de queries en cours, annuler le timer
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
        hasDispatched.current = false;
      }
    }

    // Cleanup
    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [isFetching]);

  return null;
}
