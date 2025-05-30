
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { user, isLoading, isInitialized } = useAuth();
  const navigate = useNavigate();

  console.info("[AUTH GUARD] Checking auth:", { hasUser: !!user, isLoading, isInitialized });

  // Redirection vers /auth si pas d'utilisateur connecté (uniquement quand l'auth est initialisée)
  useEffect(() => {
    if (isInitialized && !isLoading && !user) {
      console.info("[AUTH GUARD] No user found, redirecting to /auth");
      navigate("/auth", { replace: true });
    }
  }, [user, isLoading, isInitialized, navigate]);

  // Affichage du loader pendant l'initialisation
  if (isLoading || !isInitialized) {
    console.info("[AUTH GUARD] Auth not ready, showing loader");
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-coffee-dark mx-auto mb-4" />
          <p className="text-muted-foreground">Vérification de l'authentification...</p>
        </div>
      </div>
    );
  }

  // Si pas d'utilisateur, on affiche aussi un loader (la redirection va se faire)
  if (!user) {
    console.info("[AUTH GUARD] No user, showing loader while redirecting");
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-coffee-dark mx-auto mb-4" />
          <p className="text-muted-foreground">Redirection vers la connexion...</p>
        </div>
      </div>
    );
  }

  // Utilisateur connecté, on affiche le contenu
  console.info("[AUTH GUARD] User authenticated, rendering children");
  return <>{children}</>;
}
