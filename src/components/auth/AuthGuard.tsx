
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { user, isLoading, isInitialized } = useAuth();
  const navigate = useNavigate();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  // Set a timeout to show a more detailed loading message if auth takes too long
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading) {
        setLoadingTimeout(true);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [isLoading]);

  // Handle auth state changes and navigate accordingly
  useEffect(() => {
    // Initialization is complete and user is not authenticated
    if (isInitialized && !isLoading && !user && !isRedirecting) {
      setIsRedirecting(true);
      
      // A short delay to prevent flash of content
      const timer = setTimeout(() => {
        navigate("/auth");
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [user, isLoading, isInitialized, navigate, isRedirecting]);

  // Show loading state while checking auth
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
            <p className="text-sm text-muted-foreground mt-2 max-w-md">
              Si cela persiste, essayez de rafraîchir la page ou vérifiez votre connexion internet.
            </p>
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
