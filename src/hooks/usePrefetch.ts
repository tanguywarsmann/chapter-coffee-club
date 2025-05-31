
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

interface PrefetchRule {
  from: string;
  to: string[];
  condition?: () => boolean;
}

const prefetchRules: PrefetchRule[] = [
  {
    from: "/home",
    to: ["/explore", "/reading-list", "/profile"],
  },
  {
    from: "/explore", 
    to: ["/home", "/reading-list"],
  },
  {
    from: "/reading-list",
    to: ["/home", "/explore"],
  },
  {
    from: "/",
    to: ["/auth", "/home"],
  }
];

export function usePrefetch() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const currentPath = location.pathname;
    const matchingRule = prefetchRules.find(rule => 
      currentPath.startsWith(rule.from)
    );

    if (!matchingRule) return;

    // Prefetch après un délai pour éviter d'impacter la page actuelle
    const timeoutId = setTimeout(() => {
      matchingRule.to.forEach(path => {
        if (matchingRule.condition && !matchingRule.condition()) {
          return;
        }

        // Prefetch en créant un lien invisible
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = path;
        document.head.appendChild(link);

        // Nettoyer après 30 secondes
        setTimeout(() => {
          if (document.head.contains(link)) {
            document.head.removeChild(link);
          }
        }, 30000);
      });
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [location.pathname]);
}
