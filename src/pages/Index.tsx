
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const navigate = useNavigate();
  const { user, isLoading, isInitialized } = useAuth();

  useEffect(() => {
    // Rediriger une fois que l'auth est initialisée
    if (isInitialized && !isLoading) {
      if (user) {
        navigate("/home", { replace: true });
      } else {
        navigate("/auth", { replace: true });
      }
    }
  }, [user, isLoading, isInitialized, navigate]);

  // Timeout de secours après 10 secondes
  useEffect(() => {
    const fallbackTimer = setTimeout(() => {
      if (!user && isInitialized) {
        navigate("/auth", { replace: true });
      } else if (user) {
        navigate("/home", { replace: true });
      }
    }, 10000);

    return () => clearTimeout(fallbackTimer);
  }, [user, isInitialized, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-coffee-dark mx-auto"></div>
        <p className="mt-2 text-coffee-dark">Chargement de READ...</p>
      </div>
    </div>
  );
};

export default Index;
