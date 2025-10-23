
console.log("Import de BookListSection.tsx OK");

import React, { useMemo } from 'react';
import { Book } from '@/types/book';
import { Button } from '@/components/ui/button';
import { AlertTriangle, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { usePaginatedBooks } from '@/hooks/usePaginatedBooks';
import { LoadMoreButton } from '@/components/ui/load-more-button';
import { useRemoveFromToRead } from '@/hooks/useRemoveFromToRead';

interface BookListSectionProps {
  title: string;
  description?: string;
  books: Book[];
  actionLabel?: string;
  onAction?: (bookId: string) => void;
  showProgress?: boolean;
  showDate?: boolean;
  hideUnavailableBooks?: boolean;
  enablePagination?: boolean;
  initialPageSize?: number;
  showRemoveButton?: boolean; // New prop for to_read items
}

export function BookListSection({
  title,
  description,
  books,
  actionLabel,
  onAction,
  showProgress = false,
  showDate = false,
  hideUnavailableBooks = false,
  enablePagination = false,
  initialPageSize = 8,
  showRemoveButton = false
}: BookListSectionProps) {
  const { handleRemove, removingBookId } = useRemoveFromToRead();
  // Filtrer les livres à afficher selon le paramètre hideUnavailableBooks
  const filteredBooks = useMemo(() => {
    const validBooks = Array.isArray(books) ? books : [];
    console.log(`[DIAGNOSTIQUE] BookListSection "${title}" - Books reçus:`, validBooks.length, 'livres, valides:', validBooks !== null && Array.isArray(validBooks));
    
    if (validBooks.length > 0) {
      console.log(`[DIAGNOSTIQUE] Premier livre dans "${title}":`, validBooks[0]);
    }
    
    return hideUnavailableBooks 
      ? validBooks.filter(book => !book.isUnavailable)
      : validBooks;
  }, [books, hideUnavailableBooks, title]);

  const {
    paginatedBooks,
    hasMore,
    loadMore,
    showingItems,
    totalItems
  } = usePaginatedBooks(filteredBooks, { 
    initialPageSize, 
    pageSize: 6 
  });

  const displayBooks = enablePagination ? paginatedBooks : filteredBooks;

  React.useEffect(() => {
    console.log(`[DIAGNOSTIQUE] Rendering BookListSection "${title}" with ${displayBooks.length} books`);
  }, [title, displayBooks.length]);
  
  if (displayBooks.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center sm:text-left">
          <h2 className="text-xl sm:text-2xl font-serif font-medium text-coffee-darker">{title}</h2>
          {description && <p className="text-muted-foreground text-sm sm:text-base">{description}</p>}
        </div>
        <div className="text-center p-6 border border-dashed rounded-lg">
          <p className="text-muted-foreground">Aucun livre dans cette catégorie</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="text-center sm:text-left">
        <h2 className="text-xl sm:text-2xl font-serif font-medium text-coffee-darker">{title}</h2>
        {description && <p className="text-muted-foreground text-sm sm:text-base">{description}</p>}
      </div>
      
      <div className="space-y-4 sm:space-y-6">
        {displayBooks.map((book) => {
          // Utiliser les données correctes du livre calculées côté service
          const chaptersRead = book.chaptersRead || 0;
          const totalChapters = book.totalChapters || book.expectedSegments || 1;
          const progressPercentage = book.progressPercent || Math.round((chaptersRead / totalChapters) * 100);
            
          // S'assurer qu'on a un identifiant valide
          const bookIdentifier = book.id || book.slug || '';
            
          return (
            <div key={bookIdentifier} className="flex flex-col sm:flex-row gap-4 sm:gap-6 p-4 bg-background rounded-lg border border-border relative group">
              {/* Remove button for to_read items */}
              {showRemoveButton && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleRemove(bookIdentifier, book.title || 'Ce livre');
                  }}
                  disabled={removingBookId === bookIdentifier}
                  className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-background/80 hover:bg-destructive/10 border border-border hover:border-destructive/50 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity duration-200 disabled:opacity-50"
                  aria-label={`Retirer "${book.title}" de « À lire »`}
                >
                  <X className="h-4 w-4 text-muted-foreground hover:text-destructive transition-colors" />
                </button>
              )}
              
              {/* Book cover */}
              <div className="book-cover w-20 h-28 sm:w-20 sm:h-28 mx-auto sm:mx-0 overflow-hidden flex-shrink-0 relative">
                {(() => {
                  const imageSrc = (book as any)?.coverImage || (book as any)?.cover_url || (book as any)?.book_cover;
                  return imageSrc ? (
                    <img 
                      src={imageSrc as string} 
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
                  );
                })()}
                {/* Add unavailable badge for fallback books */}
                {book.isUnavailable && (
                  <div className="absolute top-0 right-0 bg-amber-500 p-0.5 rounded-bl">
                    <AlertTriangle className="h-3 w-3 text-white" />
                  </div>
                )}
              </div>
              
              {/* Book details */}
              <div className="flex-1 text-center sm:text-left space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <h3 className={`font-semibold text-base sm:text-lg ${book.isUnavailable ? "text-gray-500" : "text-coffee-darker"}`}>
                    {book.title || "Livre sans titre"}
                  </h3>
                  {book.isUnavailable && (
                    <Badge variant="outline" className="text-xs border-amber-500 text-amber-600 mx-auto sm:mx-0 w-fit">
                      Indisponible
                    </Badge>
                  )}
                </div>
                
                <p className="text-sm text-muted-foreground">{book.author || "Auteur inconnu"}</p>
                
                {/* Book progress - utiliser les vraies données calculées */}
                {showProgress && (
                  <div className="mt-3 mb-2 space-y-1">
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${book.isUnavailable ? "bg-gray-400" : "bg-coffee-dark"}`}
                        style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{progressPercentage}% terminé</span>
                      <span>{chaptersRead}/{totalChapters} segment{totalChapters > 1 ? "s" : ""}</span>
                    </div>
                  </div>
                )}
                
                {/* Date information */}
                {showDate && book.completed_at && (
                  <div className="text-sm text-muted-foreground mb-2">
                    Terminé le: {new Date(book.completed_at).toLocaleDateString('fr-FR')}
                  </div>
                )}
                
                {/* Action button */}
                {actionLabel && onAction && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => onAction(bookIdentifier)}
                    className="mt-3 w-full sm:w-auto min-h-[44px]"
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

      {/* Load more button for pagination */}
      {enablePagination && (
        <LoadMoreButton
          onLoadMore={loadMore}
          hasMore={hasMore}
          showingCount={showingItems}
          totalCount={totalItems}
          className="mt-6"
        />
      )}
    </div>
  );
}
