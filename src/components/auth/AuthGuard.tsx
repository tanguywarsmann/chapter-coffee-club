
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { user, isLoading, isInitialized, error } = useAuth();
  const navigate = useNavigate();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const [navigationAttempted, setNavigationAttempted] = useState(false);

  // Set a timeout to show a more detailed loading message if auth takes too long
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading) {
        setLoadingTimeout(true);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [isLoading]);

  // Safety timeout to prevent getting stuck
  useEffect(() => {
    // If we're still loading after 15 seconds, force redirect to auth page
    const safetyTimer = setTimeout(() => {
      if ((isLoading || !isInitialized) && !navigationAttempted) {
        console.warn("AuthGuard safety timer triggered - forcing navigation");
        setNavigationAttempted(true);
        navigate("/auth");
      }
    }, 15000);

    return () => clearTimeout(safetyTimer);
  }, [isLoading, isInitialized, navigationAttempted, navigate]);

  // Handle auth state changes and navigate accordingly
  useEffect(() => {
    // FIX: Log auth state for debugging only in development
    if (process.env.NODE_ENV === 'development') {
      console.log("AuthGuard: user=", user?.id, "isLoading=", isLoading, "isInitialized=", isInitialized);
    }
    
    // Initialization is complete and user is not authenticated
    if (isInitialized && !isLoading && !user && !isRedirecting && !navigationAttempted) {
      setIsRedirecting(true);
      setNavigationAttempted(true);
      
      if (process.env.NODE_ENV === 'development') {
        console.log("AuthGuard: redirecting to /auth due to no user");
      }
      
      // A short delay to prevent flash of content
      const timer = setTimeout(() => {
        navigate("/auth");
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [user, isLoading, isInitialized, navigate, isRedirecting, navigationAttempted]);

  // Show loading state while checking auth - prevent render during loading
  if (isLoading || !isInitialized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-coffee-dark mx-auto mb-4" />
          <p className="text-muted-foreground">
            {loadingTimeout 
              ? "Vérification de l'authentification... Cela prend plus de temps que prévu."
              : "Chargement..."}
          </p>
          {loadingTimeout && (
            <div className="text-sm text-muted-foreground mt-2 max-w-md">
              <p className="mb-2">Si cela persiste, essayez de rafraîchir la page ou vérifiez votre connexion internet.</p>
              {error && <p className="text-red-500">Erreur: {error}</p>}
            </div>
          )}
        </div>
      </div>
    );
  }

  // User is not authenticated, redirecting
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-coffee-dark mx-auto mb-4" />
          <p className="text-muted-foreground">Redirection vers la page de connexion...</p>
        </div>
      </div>
    );
  }

  // User is authenticated, render children
  return <>{children}</>;
}
