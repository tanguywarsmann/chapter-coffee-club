
import * as React from "react"
import { isMobile as checkIsMobile } from "@/utils/environment"

console.log("Chargement de use-mobile.tsx", {
  isMobile: typeof window !== "undefined" ? checkIsMobile() : null,
});

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    try {
      if (typeof window === "undefined") return;
      
      const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
      const onChange = () => {
        setIsMobile(checkIsMobile())
      }
      mql.addEventListener("change", onChange)
      setIsMobile(checkIsMobile())
      return () => mql.removeEventListener("change", onChange)
    } catch (e) {
      console.error("Erreur dans useIsMobile hook:", e);
      setIsMobile(false); // Valeur par défaut en cas d'erreur
    }
  }, [])

  return !!isMobile
}
