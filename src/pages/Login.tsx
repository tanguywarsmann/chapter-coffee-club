
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LoginForm } from "@/components/auth/LoginForm";
import Image from "@/components/ui/image";
import { useAuth } from "@/contexts/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { user, isInitialized } = useAuth();
  
  useEffect(() => {
    // Rediriger vers la page d'accueil si déjà connecté
    if (isInitialized && user) {
      navigate("/home");
    }
  }, [user, isInitialized, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-logo-background p-4">
      <div className="w-full max-w-md mx-auto">
        <div className="mb-8 text-center">
          <Image 
            src="/lovable-uploads/c14c3df9-c069-478b-a304-1b78f5abf7b0.png" 
            alt="READ Logo" 
            className="mx-auto mb-4 w-40 h-auto"
          />
          
          <p className="text-logo-text text-lg mb-6 max-w-sm mx-auto">
            Reprends goût à la lecture, page après page
          </p>
        </div>
        
        <LoginForm />
        
        <p className="mt-8 text-center text-sm text-logo-text/80">
          READ est une application pensée pour te réconcilier avec la lecture,
          en s'inspirant des mécanismes de motivation utilisés dans le sport connecté.
        </p>
      </div>
    </div>
  );
}
