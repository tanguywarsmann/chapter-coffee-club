import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Image from "@/components/ui/image";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSessionReady, setIsSessionReady] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Écouter l'événement PASSWORD_RECOVERY
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[ResetPassword] Auth event:', event, 'Session:', !!session);
      
      if (event === "PASSWORD_RECOVERY") {
        setIsSessionReady(true);
      }
    });

    // Vérifier s'il y a déjà une session active
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsSessionReady(true);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 8) {
      return "Le mot de passe doit contenir au moins 8 caractères";
    }
    
    const hasUpperCase = /[A-Z]/.test(pwd);
    const hasLowerCase = /[a-z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    
    if (!hasUpperCase || !hasLowerCase || !hasNumber) {
      return "Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre";
    }
    
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!password || !confirmPassword) {
      setError("Veuillez remplir tous les champs");
      return;
    }

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    const validationError = validatePassword(password);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      });

      if (updateError) {
        // Détecter les erreurs spécifiques
        if (updateError.message.includes("expired") || updateError.message.includes("invalid")) {
          throw new Error("Le lien de réinitialisation a expiré. Veuillez relancer une nouvelle demande.");
        }
        throw updateError;
      }

      setIsSuccess(true);
      toast.success("Mot de passe mis à jour avec succès!");
      
      // Rediriger vers la page de connexion après 2 secondes
      setTimeout(() => {
        navigate("/auth");
      }, 2000);
    } catch (error: any) {
      console.error("Erreur lors de la mise à jour du mot de passe:", error);
      setError(error.message || "Erreur lors de la mise à jour. Veuillez réessayer.");
      toast.error(error.message || "Erreur lors de la mise à jour");
    } finally {
      setIsLoading(false);
    }
  };

  // Vue de succès
  if (isSuccess) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-logo-background p-4">
        <Card className="w-full max-w-md border-coffee-medium">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto" />
              <h2 className="text-2xl font-bold text-green-600">Mot de passe mis à jour !</h2>
              <p className="text-gray-600">
                Votre mot de passe a été mis à jour avec succès. Vous allez être redirigé vers la page de connexion.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Vue de lien invalide/expiré
  if (!isSessionReady) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-logo-background p-4">
        <Card className="w-full max-w-md border-coffee-medium">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <AlertCircle className="w-16 h-16 text-red-600 mx-auto" />
              <h2 className="text-2xl font-bold text-red-600">Lien invalide ou expiré</h2>
              <p className="text-gray-600">
                Le lien de réinitialisation est invalide ou a expiré. Veuillez relancer une nouvelle demande de réinitialisation.
              </p>
              <Button 
                onClick={() => navigate("/auth")} 
                className="bg-coffee-dark hover:bg-coffee-darker"
              >
                Retour à la connexion
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Formulaire de réinitialisation
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-logo-background p-4">
      <div className="w-full max-w-md mx-auto">
        <div className="mb-8 text-center">
          <Image 
            src="/branding/vread-logo.svg" 
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
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="password">Nouveau mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-coffee-medium"
                  placeholder="Minimum 8 caractères"
                  minLength={8}
                  required
                />
                <p className="text-xs text-gray-500">
                  Au moins 8 caractères avec une majuscule, une minuscule et un chiffre
                </p>
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
                  minLength={8}
                  required
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-coffee-dark hover:bg-coffee-darker" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Mise à jour en cours...
                  </>
                ) : (
                  "Mettre à jour le mot de passe"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
