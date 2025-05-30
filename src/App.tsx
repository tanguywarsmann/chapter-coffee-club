
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/query";
import { AppFooter } from "@/components/layout/AppFooter";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { UserOnboarding } from "./components/onboarding/UserOnboarding";
import { AppRouter } from "./components/navigation/AppRouter";

const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-coffee-dark mx-auto"></div>
      <p className="mt-2 text-coffee-dark">Chargement de READ...</p>
    </div>
  </div>
);

const App = () => {
  console.info("[APP] App component mounting");
  
  try {
    console.info("[APP] Rendering App component");
    return (
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <UserOnboarding />
            <AppRouter />
            <AppFooter />
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    );
  } catch (error) {
    console.error("[APP] Error rendering App component:", error);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Erreur de l'application</h1>
          <p className="text-gray-600 mb-4">Une erreur est survenue lors du chargement de READ.</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-coffee-dark text-white px-4 py-2 rounded hover:bg-coffee-darker"
          >
            Recharger
          </button>
        </div>
      </div>
    );
  }
};

export default App;
