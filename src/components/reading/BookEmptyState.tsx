
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface BookEmptyStateProps {
  hasError: boolean;
  title?: string;
  description?: string;
}

export function BookEmptyState({ 
  hasError, 
  title = "Aucune lecture trouvée",
  description
}: BookEmptyStateProps) {
  const navigate = useNavigate();
  
  return (
    <Card className="border-coffee-light">
      <CardHeader>
        <CardTitle className="text-xl font-serif text-coffee-darker">{title}</CardTitle>
        <CardDescription>
          {hasError 
            ? "Une erreur est survenue lors du chargement de vos livres." 
            : description || "Vous n'avez pas encore de livres dans votre liste de lecture."}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center py-8">
        <Button 
          className="bg-coffee-dark hover:bg-coffee-darker" 
          onClick={() => navigate("/explore")}
        >
          <Plus className="mr-2 h-4 w-4" />
          Découvrir des livres
        </Button>
      </CardContent>
    </Card>
  );
}
