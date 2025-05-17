
import * as React from "react"
import { isMobile as checkIsMobile } from "@/utils/environment"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    try {
      if (typeof window === "undefined") return;
      
      // Initial check
      setIsMobile(checkIsMobile())
      
      // Set up listener for screen size changes
      const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
      const onChange = () => {
        setIsMobile(checkIsMobile())
      }
      
      // Use modern event listener API
      mql.addEventListener("change", onChange)
      
      return () => mql.removeEventListener("change", onChange)
    } catch (e) {
      console.error("Error in useIsMobile hook:", e);
      setIsMobile(false); // Default value in case of error
    }
  }, [])

  // Return false during SSR, boolean once determined
  return isMobile === undefined ? false : isMobile
}
