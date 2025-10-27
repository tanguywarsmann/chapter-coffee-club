import { Suspense, lazy } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/query";
import { BrowserRouter, useLocation } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { ServiceWorkerUpdater } from "@/components/ServiceWorkerUpdater";
import { Capacitor } from "@capacitor/core";

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

import AppRouter from "./components/navigation/AppRouter";
import { CanonicalManager } from "@/components/seo/CanonicalManager";
import { OGUrlManager } from "@/components/seo/OGUrlManager";
import { ConfettiTester } from "@/components/debug/ConfettiTester";

const AppContent = () => {
  const location = useLocation();
  const isLanding = location.pathname === '/landing';
  const { user, isInitialized } = useAuth();
  const isCapacitor = Capacitor.isNativePlatform();

  return (
    <>
      {/* Global JSON-LD in body for visibility */}<Suspense fallback={null}>
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
      
      {/* PWA Service Worker - disabled in native Capacitor */}
      {!isCapacitor && <ServiceWorkerUpdater />}
      
      <CanonicalManager />
      <OGUrlManager />
      <AppRouter />
      
      {/* Debug confetti tester in dev mode */}
      {import.meta.env.DEV && <ConfettiTester />}
    </>
  );
};

const App = () => {
  console.info("[APP] App component rendering");
  
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <BrowserRouter>
              <AppContent />
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
};

export default App;
