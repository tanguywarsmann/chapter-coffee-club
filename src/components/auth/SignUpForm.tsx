
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useForm } from "react-hook-form";

interface SignUpFormInputs {
  email: string;
  password: string;
  passwordConfirm: string;
}

export function SignUpForm() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  const { register, handleSubmit, watch, formState: { errors } } = useForm<SignUpFormInputs>({
    mode: "onBlur",
    defaultValues: {
      email: "",
      password: "",
      passwordConfirm: ""
    }
  });

  const password = watch("password");
  
  const onSubmit = async (data: SignUpFormInputs) => {
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      });

      if (error) {
        throw error;
      }

      toast.success("Compte créé avec succès ! Vous pouvez maintenant vous connecter.", {
        duration: 4000
      });
      
      // Attendre explicitement la récupération de la session
      const { data: sessionData } = await supabase.auth.getSession();
      
      console.log("Session récupérée après inscription:", sessionData.session?.user?.id);
      
      if (sessionData.session?.user) {
        // Si la session est bien récupérée, rediriger
        navigate("/home");
      }
    } catch (error: any) {
      let message = "Une erreur est survenue";
      let description = "";
      
      if (error.message.includes("email already registered")) {
        message = "Cet email est déjà utilisé";
        description = "Veuillez utiliser une autre adresse email ou essayer de vous connecter";
      } else if (error.message.includes("password")) {
        message = "Le mot de passe doit contenir au moins 6 caractères";
      } else if (error.message.includes("network")) {
        message = "Problème de connexion";
        description = "Vérifiez votre connexion internet";
      }
      
      toast.error(message, {
        description,
        duration: 5000
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Effet pour masquer le clavier mobile après soumission du formulaire
  useEffect(() => {
    if (isLoading) {
      // Technique pour masquer le clavier sur mobile
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    }
  }, [isLoading]);

  return (
    <Card className="w-full max-w-md mx-auto border-coffee-medium transition-all duration-300 hover:shadow-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">Créer un compte</CardTitle>
        <CardDescription className="text-center">
          Inscrivez-vous pour commencer votre voyage littéraire
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="signup-email" className={errors.email ? "text-destructive" : ""}>
                Email
              </Label>
              <Input
                id="signup-email"
                type="email"
                placeholder="exemple@mail.com"
                className={`border-coffee-medium transition-colors duration-200 ${errors.email ? "border-destructive" : ""}`}
                disabled={isLoading}
                {...register("email", { 
                  required: "L'email est requis",
                  pattern: {
                    value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                    message: "Format d'email invalide"
                  }
                })}
              />
              {errors.email && (
                <p className="text-xs text-destructive mt-1">{errors.email.message}</p>
              )}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="signup-password" className={errors.password ? "text-destructive" : ""}>
                Mot de passe
              </Label>
              <Input
                id="signup-password"
                type="password"
                className={`border-coffee-medium transition-colors duration-200 ${errors.password ? "border-destructive" : ""}`}
                disabled={isLoading}
                {...register("password", { 
                  required: "Le mot de passe est requis",
                  minLength: {
                    value: 6,
                    message: "Le mot de passe doit contenir au moins 6 caractères"
                  }
                })}
              />
              {errors.password && (
                <p className="text-xs text-destructive mt-1">{errors.password.message}</p>
              )}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="signup-password-confirm" className={errors.passwordConfirm ? "text-destructive" : ""}>
                Confirmer le mot de passe
              </Label>
              <Input
                id="signup-password-confirm"
                type="password"
                className={`border-coffee-medium transition-colors duration-200 ${errors.passwordConfirm ? "border-destructive" : ""}`}
                disabled={isLoading}
                {...register("passwordConfirm", { 
                  required: "Veuillez confirmer votre mot de passe",
                  validate: value => value === password || "Les mots de passe ne correspondent pas"
                })}
              />
              {errors.passwordConfirm && (
                <p className="text-xs text-destructive mt-1">{errors.passwordConfirm.message}</p>
              )}
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-coffee-dark hover:bg-coffee-darker transition-colors duration-300" 
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
