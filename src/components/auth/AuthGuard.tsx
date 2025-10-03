
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const navigate = useNavigate();
  const { user, isLoading, isInitialized } = useAuth();

  // Redirect immediately if not authenticated
  useEffect(() => {
    if (isInitialized && !isLoading && !user) {
      navigate('/auth', { replace: true });
    }
  }, [isInitialized, isLoading, user, navigate]);

  // Block all rendering until fully initialized AND user is confirmed
  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-coffee-dark mx-auto mb-4" />
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  // If initialized but no user, show nothing while redirecting
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-coffee-dark mx-auto mb-4" />
          <p className="text-muted-foreground">Redirection...</p>
        </div>
      </div>
    );
  }

  // Only render children when we have a confirmed authenticated user
  return <>{children}</>;
}
