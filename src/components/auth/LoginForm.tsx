
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { BookOpen } from "lucide-react";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // In a real app, you'd authenticate with a backend
    // This is a mock implementation
    setTimeout(() => {
      setIsLoading(false);
      if (email && password) {
        // Store user in local storage as a simple mock
        localStorage.setItem("user", JSON.stringify({ email }));
        toast.success("Connecté avec succès!");
        navigate("/home");
      } else {
        toast.error("Veuillez remplir tous les champs");
      }
    }, 1000);
  };

  return (
    <Card className="w-full max-w-md mx-auto border-coffee-medium">
      <CardHeader className="space-y-1 flex flex-col items-center">
        <div className="w-12 h-12 bg-coffee-dark rounded-full flex items-center justify-center mb-2">
          <BookOpen className="text-white w-6 h-6" />
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
          <a 
            href="#" 
            onClick={(e) => {
              e.preventDefault();
              toast.info("La création de compte sera disponible prochainement!");
            }}
            className="text-coffee-dark hover:text-coffee-darker font-semibold"
          >
            Créer un compte
          </a>
        </div>
      </CardFooter>
    </Card>
  );
}
