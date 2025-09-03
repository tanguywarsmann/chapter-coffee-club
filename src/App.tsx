
import { Suspense, lazy } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/query";
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
import { OGUrlManager } from "@/components/seo/OGUrlManager";

const AppContent = () => {
  const location = useLocation();
  const isLanding = location.pathname === '/landing';
  const { user, isInitialized } = useAuth();

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
      
      {/* Only show onboarding if user is not authenticated and auth is initialized */}
      {isInitialized && !user && (
        <Suspense fallback={null}>
          <UserOnboarding />
        </Suspense>
      )}
      
      <ServiceWorkerUpdater />
      
      <CanonicalManager />
      <OGUrlManager />
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
