import { Suspense, lazy } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/query";
import { AppFooter } from "@/components/layout/AppFooter";
import { HelmetProvider } from "react-helmet-async";

// Lazy load toast components for better code splitting
const Toaster = lazy(() => 
  import("@/components/ui/toaster").then(mod => ({
    default: mod.Toaster
  }))
);
const Sonner = lazy(() => 
  import("@/components/ui/sonner").then(mod => ({
    default: mod.Toaster
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
    default: mod.AppRouter
  }))
);

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <AuthProvider>
          <TooltipProvider>
            <Suspense fallback={null}>
              <Toaster />
            </Suspense>
            <Suspense fallback={null}>
              <Sonner />
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
            
            <AppFooter />
          </TooltipProvider>
        </AuthProvider>
      </HelmetProvider>
    </QueryClientProvider>
  );
};

export default App;
