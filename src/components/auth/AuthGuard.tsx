
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const navigate = useNavigate();
  const { user, isLoading, isInitialized, error } = useAuth();
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  // Redirect to auth page if user is not authenticated after initialization
  useEffect(() => {
    if (isInitialized && !isLoading && !user) {
      navigate('/auth', { replace: true });
    }
  }, [isInitialized, isLoading, user, navigate]);

  // Don't render anything until we're sure the user is authenticated
  if (!isInitialized || isLoading || !user) {
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
            <div className="text-body-sm text-muted-foreground mt-2 max-w-md">
              <p className="mb-2">Si cela persiste, essayez de rafraîchir la page ou vérifiez votre connexion internet.</p>
              {error && <p className="text-red-500">Erreur: {error}</p>}
            </div>
          )}
        </div>
      </div>
    );
  }

  // User is authenticated, render children
  return <>{children}</>;
}
