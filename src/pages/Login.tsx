
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LoginForm } from "@/components/auth/LoginForm";
import { BookOpen } from "lucide-react";

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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-coffee-light to-chocolate-light p-4">
      <div className="w-full max-w-md mx-auto">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center p-2 bg-coffee-dark rounded-full mb-4">
            <BookOpen className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-serif font-bold text-coffee-darker mb-2">READ</h1>
          <p className="text-coffee-darker">Remets-toi à la lecture, challenge après challenge</p>
        </div>
        
        <LoginForm />
        
        <p className="mt-8 text-center text-sm text-muted-foreground">
          READ est une application pensée pour réconcilier les actifs avec la lecture,
          en s'inspirant des mécanismes de motivation utilisés dans le sport connecté.
        </p>
      </div>
    </div>
  );
}
