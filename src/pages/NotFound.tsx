
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-logo-background text-logo-text" data-testid="not-found">
      <div className="text-center p-8 max-w-none">
        <AlertTriangle className="h-16 w-16 mx-auto mb-4 text-amber-500" />
        <h1 className="text-4xl font-serif font-bold mb-4 text-coffee-darker">404</h1>
        <p className="text-xl text-coffee-dark mb-6">Cette page n'existe pas</p>
        <p className="mb-8 text-muted-foreground">
          La page que vous recherchez n'a pas été trouvée ou n'est pas accessible.
        </p>
        <Button asChild className="bg-coffee-dark hover:bg-coffee-darker text-white">
          <Link to="/home">Retour à l'accueil</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
