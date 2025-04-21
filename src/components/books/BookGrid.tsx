import { BookCard } from "./BookCard";
import { Book } from "@/types/book";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

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
  onAction
}: BookGridProps) {
  const navigate = useNavigate();

  const handleAddBook = async (bookId: string) => {
    toast.success("Livre ajouté à ta liste !");
    if (localStorage.getItem("onboardingDone") !== "true") {
      setTimeout(() => {
        navigate(`/books/${bookId}`);
      }, 400);
    }
  };

  if (!books.length) {
    return (
      <div className="text-center p-8 border border-dashed border-coffee-light rounded-lg bg-muted/50">
        <h3 className="text-lg font-medium text-coffee-darker mb-2">Aucun livre trouvé</h3>
        <p className="text-muted-foreground">Essayez une autre recherche ou explorez notre catalogue</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {title && (
        <div className="mb-4">
          <h2 className="text-xl font-serif font-medium text-coffee-darker">{title}</h2>
          {description && <p className="text-muted-foreground text-sm mt-1">{description}</p>}
        </div>
      )}
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
        {books.map((book) => (
          <BookCard 
            key={book.id} 
            book={book}
            showProgress={showProgress}
            showDate={showDate}
            showAddButton={showAddButton}
            showDeleteButton={showDeleteButton}
            actionLabel={actionLabel}
            onAction={() => onAction?.(book.id)}
          />
        ))}
      </div>
    </div>
  );
}
