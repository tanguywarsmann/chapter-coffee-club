
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "@/components/ui/image";
import { toast } from "sonner";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Compte créé avec succès. Vous pouvez maintenant vous connecter.");
      }
    } catch (error) {
      toast.error("Une erreur est survenue lors de la création du compte.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Connexion réussie!");
        navigate("/home");
      }
    } catch (error) {
      toast.error("Une erreur est survenue lors de la connexion.");
    } finally {
      setIsLoading(false);
    }
  };

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
            Remets-toi à la lecture, challenge après challenge
          </p>
        </div>
        
        <Card className="border-coffee-medium">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Bienvenue sur READ</CardTitle>
            <CardDescription className="text-center">
              Connectez-vous à votre compte pour continuer votre voyage littéraire
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-coffee-medium"
                required
                disabled={isLoading}
              />
              
              <Input
                type="password"
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-coffee-medium"
                required
                disabled={isLoading}
              />
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col gap-4">
            <Button
              onClick={handleLogin}
              className="w-full bg-coffee-dark hover:bg-coffee-darker"
              disabled={isLoading}
            >
              {isLoading ? "Connexion..." : "Se connecter"}
            </Button>
            
            <Button
              onClick={handleSignup}
              variant="outline"
              className="w-full border-coffee-medium"
              disabled={isLoading}
            >
              {isLoading ? "Création..." : "Créer un compte"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
