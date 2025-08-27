import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const HOME = "https://www.vread.fr/";

export function CanonicalManager() {
  const { pathname } = useLocation();
  useEffect(() => {
    const staticCanonical = document.head.querySelector(
      'link[rel="canonical"]:not([data-rh])'
    ) as HTMLLinkElement | null;
    if (!staticCanonical) return;
    if (pathname === "/" || pathname === "/index.html") {
      if (staticCanonical.href !== HOME) staticCanonical.href = HOME;
    } else {
      staticCanonical.parentElement?.removeChild(staticCanonical);
    }
  }, [pathname]);
  return null;
}