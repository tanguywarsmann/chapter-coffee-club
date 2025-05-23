
import { useEffect } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import Image from "@/components/ui/image";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function Login() {
  const { error, setError } = useAuth();
  
  // Afficher une notification si une erreur d'authentification est détectée depuis le contexte
  useEffect(() => {
    const authError = localStorage.getItem("auth_error");
    if (authError) {
      toast.error("Erreur d'authentification. Veuillez réessayer.");
      setError(null);
      localStorage.removeItem("auth_error");
    }
  }, [setError]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-logo-background p-4 animate-fade-in">
      <div className="w-full max-w-md mx-auto">
        <div className="mb-8 text-center">
          <Image 
            src="/lovable-uploads/c14c3df9-c069-478b-a304-1b78f5abf7b0.png" 
            alt="READ Logo" 
            className="mx-auto mb-4 w-40 h-auto transition-transform duration-300 hover:scale-105"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/placeholder.svg";
              target.alt = "Logo placeholder";
            }}
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
