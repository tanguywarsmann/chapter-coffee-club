
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, ShieldAlert } from "lucide-react";

interface AdminGuardProps {
  children: React.ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
  const { isAdmin, isLoading, isInitialized } = useAuth();
  const navigate = useNavigate();
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Handle admin state changes and navigate accordingly
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log("AdminGuard: isAdmin=", isAdmin, "isLoading=", isLoading, "isInitialized=", isInitialized);
    }
    
    // Initialization is complete and user is not admin
    if (isInitialized && !isLoading && !isAdmin && !isRedirecting) {
      setIsRedirecting(true);
      
      if (process.env.NODE_ENV === 'development') {
        console.log("AdminGuard: redirecting to /home due to non-admin access");
      }
      
      // A short delay to prevent flash of content
      const timer = setTimeout(() => {
        navigate("/home");
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [isAdmin, isLoading, isInitialized, navigate, isRedirecting]);

  // Show loading state while checking admin status
  if (isLoading || !isInitialized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-coffee-dark mx-auto mb-4" />
          <p className="text-muted-foreground">
            Vérification des droits d'accès...
          </p>
        </div>
      </div>
    );
  }

  // User is not admin, redirecting
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <ShieldAlert className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-medium mb-2">Accès refusé</h2>
          <p className="text-muted-foreground mb-6">
            Vous n'avez pas les droits d'administration nécessaires pour accéder à cette page.
          </p>
          <button
            onClick={() => navigate("/home")}
            className="px-4 py-2 bg-coffee-dark hover:bg-coffee-darker text-white rounded-md"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  // User is admin, render children
  return <>{children}</>;
}
