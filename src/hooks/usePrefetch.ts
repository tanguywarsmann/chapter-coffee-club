
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Hook de prefetch complètement désactivé pour diagnostic
export function usePrefetch() {
  const location = useLocation();

  useEffect(() => {
    // Prefetch complètement désactivé
    console.log("[PREFETCH] Disabled for diagnostic purposes");
  }, [location.pathname]);
}
