import { BookCard } from "./BookCard";
import { Book } from "@/types/book";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { usePaginatedBooks } from "@/hooks/usePaginatedBooks";
import { LoadMoreButton } from "@/components/ui/load-more-button";
import { BookGridSkeleton } from "@/components/ui/book-grid-skeleton";

interface BookGridProps {
  books: Book[];
  title?: string;
  description?: string;
  showProgress?: boolean;
  showDate?: boolean;
  showAddButton?: boolean;
  showDeleteButton?: boolean;
  actionLabel?: string;
  onAction?: (bookId: string) => void;
  enablePagination?: boolean;
  initialPageSize?: number;
  pageSize?: number;
}

export function BookGrid({ 
  books, 
  title, 
  description, 
  showProgress = false,
  showDate = false,
  showAddButton = false,
  showDeleteButton = false,
  actionLabel,
  onAction,
  enablePagination = false,
  initialPageSize = 12,
  pageSize = 8
}: BookGridProps) {
  const navigate = useNavigate();
  
  const {
    paginatedBooks,
    hasMore,
    loadMore,
    showingItems,
    totalItems
  } = usePaginatedBooks(books, { 
    initialPageSize, 
    pageSize 
  });

  // Use paginated books only if pagination is enabled
  const displayBooks = enablePagination ? paginatedBooks : books;

  const handleAddBook = async (bookId: string) => {
    toast.success("Livre ajouté à ta liste !");
  };

  if (!books.length) {
    return (
      <div className="text-center p-8 border border-dashed border-coffee-light rounded-lg bg-muted/50">
        <h3 className="text-h4 font-medium text-coffee-darker mb-2">Aucun livre trouvé</h3>
        <p className="text-muted-foreground">Essayez une autre recherche ou explorez notre catalogue</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {title && (
        <div className="mb-4">
          <h2 className="text-h4 font-serif text-coffee-darker">{title}</h2>
          {description && <p className="text-muted-foreground text-body-sm mt-1">{description}</p>}
        </div>
      )}
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8 gap-4 md:gap-6">
        {displayBooks.map((book) => {
          // S'assurer qu'on a un identifiant valide
          const bookIdentifier = book.id || book.slug || '';
          
          return (
            <div key={bookIdentifier} className="h-full">
              <BookCard 
                book={book}
                showProgress={showProgress}
                showDate={showDate}
                showAddButton={showAddButton}
                showDeleteButton={showDeleteButton}
                actionLabel={actionLabel}
                onAction={() => onAction?.(bookIdentifier)}
              />
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
          className="mt-8"
        />
      )}
    </div>
  );
}
