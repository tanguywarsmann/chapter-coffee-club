
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LoginForm } from "@/components/auth/LoginForm";
import Image from "@/components/ui/image";

export default function Login() {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if user is already logged in
    const user = localStorage.getItem("user");
    if (user) {
      navigate("/home");
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-logo-background p-4">
      <div className="w-full max-w-md mx-auto">
        <div className="mb-8 text-center">
          <Image 
            src="/lovable-uploads/f8f10dfb-9602-4b38-b705-d6e6f42cce5d.png" 
            alt="READ Logo" 
            className="mx-auto mb-4 w-40 h-40"
          />
          
          <p className="text-logo-text text-lg mb-6 max-w-sm mx-auto">
            Remets-toi à la lecture, challenge après challenge
          </p>
        </div>
        
        <LoginForm />
        
        <p className="mt-8 text-center text-sm text-logo-text/80">
          READ est une application pensée pour réconcilier les actifs avec la lecture,
          en s'inspirant des mécanismes de motivation utilisés dans le sport connecté.
        </p>
      </div>
    </div>
  );
}
