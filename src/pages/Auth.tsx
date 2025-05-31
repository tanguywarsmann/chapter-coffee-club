
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
import Image from "@/components/ui/image";
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
      <div className="w-full max-w-md mx-auto">
        <div className="mb-8 text-center">
          <Image
            src="/lovable-uploads/c14c3df9-c069-478b-a304-1b78f5abf7b0.png"
            alt="READ Logo"
            className="mx-auto mb-4 w-40 h-auto transition-transform duration-300 hover:scale-105 focus:scale-105 focus:outline-offset-2"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/placeholder.svg";
              target.alt = "Logo placeholder";
            }}
          />
          <p className="text-logo-text text-lg mb-6 max-w-sm mx-auto">
            Reprends goût à la lecture, page après page
          </p>
        </div>

        <Card className="border-coffee-medium shadow-md transition-all duration-300">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Bienvenue sur READ</CardTitle>
            <CardDescription className="text-center">
              Connecte-toi à ton compte pour continuer ton voyage littéraire
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="relative">
                <label htmlFor="email" className="sr-only">Email</label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-coffee-medium focus:border-coffee-dark"
                  required
                  disabled={isLoading}
                  aria-label="Email"
                  aria-required="true"
                  autoComplete="email"
                  onKeyPress={handleKeyPress}
                />
              </div>
              <div className="relative">
                <label htmlFor="password" className="sr-only">Mot de passe</label>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-coffee-medium focus:border-coffee-dark pr-10"
                  required
                  disabled={isLoading}
                  aria-label="Mot de passe"
                  aria-required="true"
                  autoComplete="current-password"
                  onKeyPress={handleKeyPress}
                />
                <button 
                  type="button" 
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  aria-label={showPassword ? "Cacher le mot de passe" : "Afficher le mot de passe"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-3">
            <Button
              onClick={handleLogin}
              className="w-full bg-coffee-dark hover:bg-coffee-darker transition-colors duration-300 focus:ring-2 focus:ring-coffee-dark focus:ring-offset-2"
              disabled={isLoading}
              aria-label="Se connecter"
            >
              {isLoading ? "Connexion..." : "Se connecter"}
            </Button>
            <Button
              onClick={handleSignup}
              variant="outline"
              className="w-full border-coffee-medium hover:bg-coffee-light/30 transition-colors duration-300 focus:ring-2 focus:ring-coffee-medium focus:ring-offset-2"
              disabled={isLoading}
              aria-label="Créer un compte"
            >
              {isLoading ? "Création..." : "Créer un compte"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
