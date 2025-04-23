
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export function SignUpForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      toast.success("Compte créé avec succès ! Vous pouvez maintenant vous connecter.");
      
      // Attendre explicitement la récupération de la session
      const { data: sessionData } = await supabase.auth.getSession();
      
      console.log("Session récupérée après inscription:", sessionData.session?.user?.id);
      
      if (sessionData.session?.user) {
        // Si la session est bien récupérée, rediriger
        navigate("/home");
      }
    } catch (error: any) {
      let message = "Une erreur est survenue";
      if (error.message.includes("email already registered")) {
        message = "Cet email est déjà utilisé";
      } else if (error.message.includes("password")) {
        message = "Le mot de passe doit contenir au moins 6 caractères";
      }
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto border-coffee-medium">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">Créer un compte</CardTitle>
        <CardDescription className="text-center">
          Inscrivez-vous pour commencer votre voyage littéraire
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="signup-email">Email</Label>
              <Input
                id="signup-email"
                type="email"
                placeholder="exemple@mail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-coffee-medium"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="signup-password">Mot de passe</Label>
              <Input
                id="signup-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-coffee-medium"
                required
                minLength={6}
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-coffee-dark hover:bg-coffee-darker" 
              disabled={isLoading}
            >
              {isLoading ? "Création en cours..." : "Créer mon compte"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
