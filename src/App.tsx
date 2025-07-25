
import { Suspense, lazy } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/query";
import { HelmetProvider } from "react-helmet-async";
import { BrowserRouter, useLocation } from "react-router-dom";

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
const AppRouter = lazy(() => 
  import("./components/navigation/AppRouter").then(mod => ({
    default: mod.default
  }))
);

const AppContent = () => {
  const location = useLocation();
  const isLanding = location.pathname === '/landing';

  return (
    <>
      <Suspense fallback={null}>
        <Toaster />
      </Suspense>
      <Suspense fallback={null}>
        <Sonner
          richColors
          position="top-right"
          visibleToasts={isLanding ? 0 : undefined}
          className="w-full max-w-sm sm:max-w-sm"
        />
      </Suspense>
      
      <Suspense fallback={null}>
        <UserOnboarding />
      </Suspense>
      
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-coffee-dark mx-auto"></div>
            <p className="mt-2 text-coffee-dark">Chargement de READ...</p>
          </div>
        </div>
      }>
        <AppRouter />
      </Suspense>
    </>
  );
};

const App = () => {
  console.info("[APP] App component rendering");
  
  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <AuthProvider>
          <TooltipProvider>
            <BrowserRouter>
              <AppContent />
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </HelmetProvider>
    </QueryClientProvider>
  );
};

export default App;
