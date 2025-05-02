
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, ShieldAlert } from "lucide-react";

interface AdminGuardProps {
  children: React.ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
  const { isAdmin, isLoading, isInitialized, user } = useAuth();
  const navigate = useNavigate();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [bypassAuth, setBypassAuth] = useState(true); // Temporarily bypass admin check

  // Debug logs
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log("AdminGuard: user=", user?.email, "isAdmin=", isAdmin, "isLoading=", isLoading, "isInitialized=", isInitialized, "bypassAuth=", bypassAuth);
    }
  }, [isAdmin, isLoading, isInitialized, user, bypassAuth]);
  
  // Handle admin state changes and navigate accordingly
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log("AdminGuard: isAdmin=", isAdmin, "isLoading=", isLoading, "isInitialized=", isInitialized);
    }
    
    // Bypass auth check during testing
    if (bypassAuth) {
      return;
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
  }, [isAdmin, isLoading, isInitialized, navigate, isRedirecting, bypassAuth]);

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

  // User is not admin, but we're bypassing for testing
  if (!isAdmin && bypassAuth) {
    return (
      <>
        <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-4">
          <div className="flex items-center">
            <ShieldAlert className="h-6 w-6 text-yellow-500 mr-2" />
            <p className="text-sm text-yellow-700">
              <span className="font-bold">Mode test :</span> Vérification admin désactivée temporairement
            </p>
          </div>
        </div>
        {children}
      </>
    );
  }

  // User is not admin, redirecting (this shouldn't happen with bypass on)
  if (!isAdmin && !bypassAuth) {
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

  // User is admin or bypassed, render children
  return <>{children}</>;
}
