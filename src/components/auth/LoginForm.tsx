
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Image from "@/components/ui/image";
import { SignUpForm } from "./SignUpForm";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [showSignUp, setShowSignUp] = useState(false);
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
        <div className="text-sm text-center">
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
    <Card className="w-full max-w-md mx-auto border-coffee-medium">
      <CardHeader className="space-y-1 flex flex-col items-center">
        <div className="w-40 h-40 rounded-full overflow-hidden mb-2">
          <Image 
            src="/lovable-uploads/f8f10dfb-9602-4b38-b705-d6e6f42cce5d.png" 
            alt="READ Logo" 
            className="w-full h-full object-cover"
          />
        </div>
        <CardTitle className="text-2xl text-center">Bienvenue sur READ</CardTitle>
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
        <div className="text-sm text-center text-muted-foreground">
          <a href="#" className="underline text-coffee-dark hover:text-coffee-darker">
            Mot de passe oublié?
          </a>
        </div>
        <div className="text-sm text-center">
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
  );
}
