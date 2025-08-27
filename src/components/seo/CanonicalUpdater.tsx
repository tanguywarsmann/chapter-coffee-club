import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const BASE = "https://www.vread.fr";

export function CanonicalUpdater() {
  const { pathname } = useLocation();

  useEffect(() => {
    const link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) return;
    const href = pathname === "/" ? `${BASE}/` : `${BASE}${pathname}`;
    link.setAttribute("href", href);
  }, [pathname]);

  return null;
}