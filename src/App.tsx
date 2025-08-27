
import { Suspense, lazy } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/query";
import { Helmet } from "react-helmet-async";
import { BrowserRouter, useLocation } from "react-router-dom";
import { ServiceWorkerUpdater } from "@/components/ServiceWorkerUpdater";

console.info("[APP] App component loading");

// Lazy load toast components for better code splitting
const Toaster = lazy(() => 
  import("@/components/ui/toaster").then(mod => ({
    default: mod.Toaster
  }))
);
const Sonner = lazy(() => 
  import("@/components/ui/sonner").then(mod => ({
    default: mod.Sonner
  }))
);

// Lazy load non-critical components
const UserOnboarding = lazy(() => 
  import("./components/onboarding/UserOnboarding").then(mod => ({
    default: mod.UserOnboarding
  }))
);
import AppRouter from "./components/navigation/AppRouter";
import { CanonicalManager } from "@/components/seo/CanonicalManager";

const AppContent = () => {
  const location = useLocation();
  const isLanding = location.pathname === '/landing';

  return (
    <>
      {/* Global JSON-LD in body for visibility */}
      <Helmet>
        <style>{`script[type="application/ld+json"]{display:block !important;min-height:1px;width:1px;margin:0;padding:0;border:0}`}</style>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "VREAD",
              "alternateName": ["Vread","V Read"],
              "url": "https://www.vread.fr/",
              "logo": "https://www.vread.fr/branding/vread-logo-512.png"
            })
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "url": "https://www.vread.fr/",
              "name": "VREAD",
              "alternateName": ["Vread","V Read"],
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://www.vread.fr/search?q={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
      </Helmet>
      
      <Suspense fallback={null}>
        <Toaster />
      </Suspense>
      <Suspense fallback={null}>
        <Sonner
          richColors={false}
          position="top-right"
          visibleToasts={isLanding ? 0 : undefined}
          className="toaster w-full max-w-sm sm:max-w-sm"
        />
      </Suspense>
      
      <Suspense fallback={null}>
        <UserOnboarding />
      </Suspense>
      
      <ServiceWorkerUpdater />
      
      <CanonicalManager />
      <AppRouter />
    </>
  );
};

const App = () => {
  console.info("[APP] App component rendering");
  
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
