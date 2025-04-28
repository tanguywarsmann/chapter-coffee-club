
import React, { useMemo } from 'react';
import { Book } from '@/types/book';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface BookListSectionProps {
  title: string;
  description?: string;
  books: Book[];
  actionLabel?: string;
  onAction?: (bookId: string) => void;
  showProgress?: boolean;
  showDate?: boolean;
  hideUnavailableBooks?: boolean;
}

export function BookListSection({
  title,
  description,
  books,
  actionLabel,
  onAction,
  showProgress = false,
  showDate = false,
  hideUnavailableBooks = false
}: BookListSectionProps) {
  // Filtrer les livres à afficher selon le paramètre hideUnavailableBooks
  const displayBooks = useMemo(() => {
    const validBooks = Array.isArray(books) ? books : [];
    return hideUnavailableBooks 
      ? validBooks.filter(book => !book.isUnavailable)
      : validBooks;
  }, [books, hideUnavailableBooks]);

  console.log(`[DIAGNOSTIQUE] Rendering BookListSection "${title}" with ${displayBooks.length} books`);
  
  if (displayBooks.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-serif font-medium text-coffee-darker">{title}</h2>
          {description && <p className="text-muted-foreground">{description}</p>}
        </div>
        <div className="text-center p-6 border border-dashed rounded-lg">
          <p className="text-muted-foreground">Aucun livre dans cette catégorie</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-serif font-medium text-coffee-darker">{title}</h2>
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>
      
      <div className="space-y-6">
        {displayBooks.map((book) => {
          // Calculate progress percentage safely
          const chaptersRead = book.chaptersRead || 0;
          const totalChapters = book.totalChapters || 1;
          const progressPercentage = (chaptersRead / totalChapters) * 100;
            
          return (
            <div key={book.id} className="flex gap-6 p-4 bg-background rounded-lg border border-border">
              {/* Book cover */}
              <div className="book-cover w-20 h-28 overflow-hidden flex-shrink-0 relative">
                {book.coverImage ? (
                  <img 
                    src={book.coverImage} 
                    alt={book.title || "Couverture"} 
                    className="w-full h-full object-cover" 
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = '/placeholder.svg';
                    }}
                  />
                ) : (
                  <div className={`w-full h-full flex items-center justify-center ${book.isUnavailable ? "bg-gray-300" : "bg-chocolate-medium"}`}>
                    <span className={`font-serif text-xl italic ${book.isUnavailable ? "text-gray-500" : "text-white"}`}>
                      {(book.title || "?").substring(0, 1)}
                    </span>
                  </div>
                )}
                {/* Add unavailable badge for fallback books */}
                {book.isUnavailable && (
                  <div className="absolute top-0 right-0 bg-amber-500 p-0.5 rounded-bl">
                    <AlertTriangle className="h-3 w-3 text-white" />
                  </div>
                )}
              </div>
              
              {/* Book details */}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className={`font-semibold ${book.isUnavailable ? "text-gray-500" : "text-coffee-darker"}`}>
                    {book.title || "Livre sans titre"}
                  </h3>
                  {book.isUnavailable && (
                    <Badge variant="outline" className="text-xs border-amber-500 text-amber-600">
                      Indisponible
                    </Badge>
                  )}
                </div>
                
                <p className="text-sm text-muted-foreground mb-2">{book.author || "Auteur inconnu"}</p>
                
                {/* Book progress */}
                {showProgress && (
                  <div className="mt-4 mb-2 space-y-1">
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${book.isUnavailable ? "bg-gray-400" : "bg-coffee-dark"}`}
                        style={{ width: `${Math.max(0, Math.min(100, progressPercentage))}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{Math.round(progressPercentage)}% terminé</span>
                      <span>{chaptersRead}/{totalChapters} chapitres</span>
                    </div>
                  </div>
                )}
                
                {/* Date information */}
                {showDate && (
                  <div className="text-sm text-muted-foreground mb-2">
                    Terminé le: {new Date().toLocaleDateString('fr-FR')}
                  </div>
                )}
                
                {/* Action button */}
                {actionLabel && onAction && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => onAction(book.id)}
                    className="mt-2"
                    disabled={book.isUnavailable}
                  >
                    {actionLabel}
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
