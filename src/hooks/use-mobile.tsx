
import * as React from "react";
import { isMobile as checkIsMobile } from "@/utils/environment";

const MOBILE_BREAKPOINT = 768;
let cachedIsMobile: boolean | undefined = undefined;

// This is a global event handler outside of React's lifecycle
// to minimize unnecessary re-renders
if (typeof window !== "undefined") {
  const updateMobileCache = () => {
    cachedIsMobile = checkIsMobile();
  };

  // Set initial value
  updateMobileCache();

  // Watch for resize
  try {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    mql.addEventListener("change", updateMobileCache);
  } catch (e) {
    // Fallback for older browsers
    window.addEventListener("resize", updateMobileCache);
  }
}

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(() => 
    typeof cachedIsMobile !== 'undefined' ? cachedIsMobile : false
  );

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    
    // Update from cache immediately
    setIsMobile(cachedIsMobile || false);
    
    // Set up listener for changes to cached value
    const checkCache = () => {
      if (cachedIsMobile !== isMobile) {
        setIsMobile(cachedIsMobile || false);
      }
    };
    
    // Check periodically but only when document is visible
    let interval: number | null = null;
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        interval = window.setInterval(checkCache, 1000) as unknown as number;
      } else if (interval) {
        clearInterval(interval);
        interval = null;
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    handleVisibilityChange(); // Initial check
    
    return () => {
      if (interval) clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isMobile]);

  return isMobile;
}
