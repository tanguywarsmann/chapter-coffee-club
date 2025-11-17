import { useEffect, useRef } from "react";
import { useIsFetching } from "@tanstack/react-query";

/**
 * Watchdog qui détecte les queries React Query bloquées en loading
 * Dispatch 'auth-expired' si fetching > 10s pour déclencher la bannière
 */
export function GlobalLoadingWatchdog() {
  const isFetching = useIsFetching();
  const timeoutRef = useRef<number | null>(null);
  const hasDispatched = useRef(false);

  useEffect(() => {
    if (isFetching > 0) {
      // Queries en cours, démarrer le timer si pas déjà fait
      if (timeoutRef.current === null) {
        timeoutRef.current = window.setTimeout(() => {
          // Au bout de 10s, si toujours en fetching
          if (isFetching > 0 && !hasDispatched.current) {
            if (import.meta.env.DEV) {
              console.warn("[WATCHDOG] Queries bloquées >10s, dispatching auth-expired");
            }
            
            hasDispatched.current = true;
            window.dispatchEvent(new Event("auth-expired"));
          }
        }, 10000); // 10 secondes
      }
    } else {
      // Plus de queries en cours, annuler le timer
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
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
