
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import LogoVreadPng from "@/components/brand/LogoVreadPng";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Eye, EyeOff } from "lucide-react";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { user, error, setError } = useAuth();

  // Rediriger si déjà connecté
  useEffect(() => {
    if (user) {
      navigate("/home");
    }
  }, [user, navigate]);

  // Affichage de l'erreur globale (depuis le contexte)
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const validateForm = () => {
    if (!email.trim()) {
      toast.error("L'email est requis");
      return false;
    }
    if (!password.trim()) {
      toast.error("Le mot de passe est requis");
      return false;
    }
    if (password.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caractères");
      return false;
    }
    // Validation d'email simple
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Format d'email invalide");
      return false;
    }
    return true;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;
    
    try {
      setIsLoading(true);
      setError(null); // reset erreur précédente
      const { error } = await supabase.auth.signUp({ email, password });

      if (error) {
        setError(error.message);
      } else {
        toast.success("Compte créé avec succès. Tu peux maintenant te connecter.");
      }
    } catch (err) {
      setError("Erreur lors de la création du compte.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!validateForm()) return;
    
    try {
      setIsLoading(true);
      setError(null); // reset erreur précédente
      const { error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        setError(error.message);
      } else {
        toast.success("Connexion réussie !");
        navigate("/home");
      }
    } catch (err) {
      setError("Erreur lors de la connexion.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-logo-background p-4 sm:p-6 transition-all duration-300">
      <div className="w-full max-w-none mx-auto">
        <header className="mb-8 text-center">
          <div className="mx-auto mb-4 flex justify-center">
            <div className="p-8 rounded-3xl shadow-2xl border-4 border-[#EEDCC8] bg-transparent">
              <LogoVreadPng size={96} className="h-24 w-24" />
            </div>
          </div>
          <p className="text-logo-text text-lg mb-6 max-w-sm mx-auto">
            Reprends goût à la lecture, page après page
          </p>
        </header>

        <main>
          <Card className="border-coffee-medium shadow-md transition-all duration-300">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-center text-foreground">
                Bienvenue sur VREAD
              </CardTitle>
              <CardDescription className="text-center text-foreground/80">
                Connecte-toi à ton compte pour continuer ton voyage littéraire
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
                <fieldset disabled={isLoading} className="space-y-3">
                  <legend className="sr-only">Formulaire de connexion</legend>
                  <div className="relative">
                    <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
                      Email
                    </label>
                    <Input
                      id="email"
                      data-testid="email-input"
                      type="email"
                      placeholder="votre@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="border-coffee-medium focus:border-coffee-dark text-foreground bg-background"
                      required
                      disabled={isLoading}
                      aria-label="Adresse email"
                      aria-required="true"
                      aria-describedby="email-help"
                      autoComplete="email"
                      onKeyPress={handleKeyPress}
                    />
                    <p id="email-help" className="sr-only">
                      Saisissez votre adresse email pour vous connecter
                    </p>
                  </div>
                  <div className="relative">
                    <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1">
                      Mot de passe
                    </label>
                    <div className="relative">
                      <Input
                        id="password"
                        data-testid="password-input"
                        type={showPassword ? "text" : "password"}
                        placeholder="Votre mot de passe"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="border-coffee-medium focus:border-coffee-dark pr-10 text-foreground bg-background"
                        required
                        disabled={isLoading}
                        aria-label="Mot de passe"
                        aria-required="true"
                        aria-describedby="password-help"
                        autoComplete="current-password"
                        onKeyPress={handleKeyPress}
                      />
                      <button 
                        type="button" 
                        onClick={togglePasswordVisibility}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/60 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-coffee-dark focus:ring-offset-2 rounded p-1"
                        aria-label={showPassword ? "Cacher le mot de passe" : "Afficher le mot de passe"}
                        aria-pressed={showPassword}
                      >
                        {showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
                      </button>
                    </div>
                    <p id="password-help" className="text-xs text-foreground/70 mt-1">
                      Minimum 6 caractères
                    </p>
                  </div>
                </fieldset>
              </form>
            </CardContent>

            <CardFooter className="flex flex-col gap-3">
              <Button
                data-testid="login-button"
                onClick={handleLogin}
                className="w-full bg-coffee-dark hover:bg-coffee-darker text-white transition-colors duration-300 focus:ring-2 focus:ring-coffee-dark focus:ring-offset-2"
                disabled={isLoading}
                aria-label="Se connecter à votre compte"
                type="submit"
              >
                {isLoading ? "Connexion..." : "Se connecter"}
              </Button>
              <Button
                onClick={handleSignup}
                variant="outline"
                className="w-full border-coffee-medium hover:bg-coffee-light/30 text-foreground transition-colors duration-300 focus:ring-2 focus:ring-coffee-medium focus:ring-offset-2"
                disabled={isLoading}
                aria-label="Créer un nouveau compte"
              >
                {isLoading ? "Création..." : "Créer un compte"}
              </Button>
            </CardFooter>
          </Card>
        </main>
      </div>
    </div>
  );
}
