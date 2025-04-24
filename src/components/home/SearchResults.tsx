
import { useNavigate } from "react-router-dom";
import { Book } from "@/types/book";
import { toast } from "sonner";

interface SearchResultsProps {
  searchResults: Book[] | null;
  onReset: () => void;
}

export function SearchResults({ searchResults, onReset }: SearchResultsProps) {
  const navigate = useNavigate();

  if (!searchResults) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-serif font-medium text-coffee-darker">Résultats de recherche</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {searchResults.map(book => (
          <div 
            key={book.id} 
            className="book-card group cursor-pointer"
            onClick={() => navigate(`/books/${book.id}`)}
          >
            <div className="book-cover bg-coffee-medium">
              {book.coverImage ? (
                <img 
                  src={book.coverImage} 
                  alt={book.title} 
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder.svg';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-chocolate-medium">
                  <span className="text-white font-serif italic text-xl">{book.title.substring(0, 1)}</span>
                </div>
              )}
            </div>
            <div className="p-3">
              <h3 className="font-medium text-coffee-darker line-clamp-1">{book.title}</h3>
              <p className="text-sm text-muted-foreground">{book.author}</p>
            </div>
          </div>
        ))}
      </div>
      <button 
        className="text-coffee-dark hover:text-coffee-darker font-medium"
        onClick={onReset}
      >
        Retour à l'accueil
      </button>
    </div>
  );
}
