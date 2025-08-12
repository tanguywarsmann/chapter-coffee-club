
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import LogoVreadPng from "@/components/brand/LogoVreadPng";
import { SignUpForm } from "./SignUpForm";
import { ForgotPasswordModal } from "./ForgotPasswordModal";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [showSignUp, setShowSignUp] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    if (!email || !password) {
      toast.error("Veuillez remplir tous les champs");
      setIsLoading(false);
      return;
    }
    
    try {
      // Tentative de connexion avec Supabase
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        throw error;
      }
      
      // Afficher un message de succès
      toast.success("Connecté avec succès!");
      
      // Attendre explicitement la récupération de la session
      const { data: sessionData } = await supabase.auth.getSession();
      
      console.log("Session récupérée après connexion:", sessionData.session?.user?.id);
      
      if (sessionData.session?.user) {
        // Si la session est bien récupérée, rediriger
        navigate("/home");
      } else {
        // Si après la tentative de récupération, on n'a toujours pas de session
        console.error("Session non disponible après connexion");
        toast.error("Erreur de session. Veuillez réessayer.");
      }
    } catch (error: any) {
      console.error("Erreur de connexion:", error);
      let message = "Erreur de connexion";
      
      if (error.message.includes("Invalid login credentials")) {
        message = "Email ou mot de passe incorrect";
      }
      
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (showSignUp) {
    return (
      <div className="space-y-6">
        <SignUpForm />
        <div className="text-body-sm text-center">
          Déjà un compte?{" "}
          <button 
            onClick={() => setShowSignUp(false)}
            className="text-coffee-dark hover:text-coffee-darker font-semibold"
          >
            Se connecter
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Card className="w-full max-w-md mx-auto border-coffee-medium">
        <CardHeader className="space-y-1 flex flex-col items-center">
          <div className="mb-2 flex justify-center">
            <div className="p-8 rounded-3xl shadow-2xl border-4 border-[#EEDCC8] bg-transparent">
              <LogoVreadPng size={96} className="h-24 w-24" />
            </div>
          </div>
          <CardTitle className="text-h2 font-serif text-center">Bienvenue sur VREAD</CardTitle>
          <CardDescription className="text-center">
            Connectez-vous à votre compte pour continuer votre voyage littéraire
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="exemple@mail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-coffee-medium"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-coffee-medium"
                />
              </div>
              <Button type="submit" className="w-full bg-coffee-dark hover:bg-coffee-darker" disabled={isLoading}>
                {isLoading ? "Connexion..." : "Se connecter"}
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <div className="text-body-sm text-center text-muted-foreground">
            <button 
              onClick={() => setShowForgotPassword(true)}
              className="underline text-coffee-dark hover:text-coffee-darker"
            >
              Mot de passe oublié?
            </button>
          </div>
          <div className="text-body-sm text-center">
            Pas encore de compte?{" "}
            <button 
              onClick={() => setShowSignUp(true)}
              className="text-coffee-dark hover:text-coffee-darker font-semibold"
            >
              Créer un compte
            </button>
          </div>
        </CardFooter>
      </Card>

      <ForgotPasswordModal 
        open={showForgotPassword} 
        onOpenChange={setShowForgotPassword} 
      />
    </>
  );
}
