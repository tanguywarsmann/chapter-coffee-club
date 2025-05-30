
import { useEffect } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import Image from "@/components/ui/image";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function Login() {
  console.info("[LOGIN] Login component mounting");
  
  const { error, setError } = useAuth();
  
  // Afficher une notification si une erreur d'authentification est détectée depuis le contexte
  useEffect(() => {
    console.info("[LOGIN] Login component mounted, checking for auth errors");
    const authError = localStorage.getItem("auth_error");
    if (authError) {
      toast.error("Erreur d'authentification. Veuillez réessayer.");
      setError(null);
      localStorage.removeItem("auth_error");
    }
  }, [setError]);

  console.info("[LOGIN] Rendering Login component");

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      backgroundColor: '#F5F5DC',
      padding: '16px'
    }}>
      <div style={{ width: '100%', maxWidth: '28rem', margin: '0 auto' }}>
        <div style={{ marginBottom: '32px', textAlign: 'center' }}>
          <Image 
            src="/lovable-uploads/c14c3df9-c069-478b-a304-1b78f5abf7b0.png" 
            alt="READ Logo" 
            style={{ 
              margin: '0 auto 16px auto', 
              width: '160px', 
              height: 'auto',
              display: 'block'
            }}
            onError={(e) => {
              console.error("[LOGIN] Error loading logo image");
              const target = e.target as HTMLImageElement;
              target.src = "/placeholder.svg";
              target.alt = "Logo placeholder";
            }}
          />
          
          <p style={{ 
            color: '#8B4513', 
            fontSize: '18px', 
            marginBottom: '24px', 
            maxWidth: '384px', 
            margin: '0 auto 24px auto'
          }}>
            Reprends goût à la lecture, page après page
          </p>
        </div>
        
        <LoginForm />
        
        <p style={{ 
          marginTop: '32px', 
          textAlign: 'center', 
          fontSize: '14px', 
          color: 'rgba(139, 69, 19, 0.8)'
        }}>
          READ est une application pensée pour te réconcilier avec la lecture,
          en s'inspirant des mécanismes de motivation utilisés dans le sport connecté.
        </p>
      </div>
    </div>
  );
}
