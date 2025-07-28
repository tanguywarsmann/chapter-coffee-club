
import { useNavigate } from "react-router-dom";
import { Book } from "@/types/book";
import { toast } from "sonner";
import { BookGrid } from "@/components/books/BookGrid";

interface SearchResultsProps {
  searchResults: Book[] | null;
  onReset: () => void;
  redirecting?: boolean;
}

export function SearchResults({ searchResults, onReset, redirecting = false }: SearchResultsProps) {
  const navigate = useNavigate();

  // Add detailed logging to identify what triggers redirects
  console.info("[SEARCH RESULTS]", {
    resultsCount: searchResults?.length || 0,
    redirecting,
    firstResult: searchResults?.[0] ? {
      id: searchResults[0].id,
      title: searchResults[0].title
    } : null,
  });

  if (!searchResults) return null;

  return (
    <div className={`space-y-6 ${redirecting ? 'opacity-80 transition-opacity duration-300' : ''}`}>
      <div className="flex items-center justify-between">
        <h2 className="text-h4 font-serif font-medium text-coffee-darker">
          {searchResults.length > 0 
            ? `Résultats de recherche (${searchResults.length})` 
            : "Aucun résultat trouvé"}
        </h2>
        <button 
          className="text-coffee-dark hover:text-coffee-darker font-medium flex items-center"
          onClick={onReset}
          disabled={redirecting}
        >
          Retour à l'accueil
        </button>
      </div>
      
      {searchResults.length > 0 ? (
        <BookGrid books={searchResults} showAddButton />
      ) : (
        <div className="text-center p-8 border border-dashed border-coffee-light rounded-lg bg-muted/50">
          <h3 className="text-h4 font-medium text-coffee-darker mb-2">Aucun livre trouvé</h3>
          <p className="text-muted-foreground">Essayez une autre recherche ou explorez notre catalogue</p>
        </div>
      )}
    </div>
  );
}
