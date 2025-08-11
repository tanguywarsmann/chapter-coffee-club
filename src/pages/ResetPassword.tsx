
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Image from "@/components/ui/image";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Vérifier que nous avons les paramètres nécessaires
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    
    if (!accessToken || !refreshToken) {
      toast.error("Lien de réinitialisation invalide");
      navigate("/");
      return;
    }

    // Établir la session avec les tokens fournis
    supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
  }, [searchParams, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password || !confirmPassword) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }

    if (password.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        throw error;
      }

      toast.success("Mot de passe mis à jour avec succès!");
      navigate("/home");
    } catch (error: any) {
      console.error("Erreur lors de la mise à jour du mot de passe:", error);
      toast.error("Erreur lors de la mise à jour. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-logo-background p-4">
      <div className="w-full max-w-none mx-auto">
        <div className="mb-8 text-center">
          <Image 
            src="/branding/vread-logo-1024-q80.webp" 
            alt="VREAD Logo" 
            className="mx-auto mb-4 w-40 h-auto"
          />
          <p className="text-logo-text text-lg mb-6">
            Choisissez un nouveau mot de passe
          </p>
        </div>

        <Card className="border-coffee-medium">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Nouveau mot de passe</CardTitle>
            <CardDescription className="text-center">
              Saisissez votre nouveau mot de passe pour sécuriser votre compte
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Nouveau mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-coffee-medium"
                  placeholder="Au moins 6 caractères"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="border-coffee-medium"
                  placeholder="Répétez le mot de passe"
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-coffee-dark hover:bg-coffee-darker" 
                disabled={isLoading}
              >
                {isLoading ? "Mise à jour..." : "Mettre à jour le mot de passe"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
