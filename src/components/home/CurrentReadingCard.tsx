
console.log("Import de CurrentReadingCard.tsx OK");

import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Book, BookOpen } from "lucide-react";
import { Book as BookType } from "@/types/book";
import { toast } from "sonner";

interface CurrentReadingCardProps {
  book: BookType;
  currentPage: number;
  onContinueReading: () => void;
}

export function CurrentReadingCard({ book, currentPage, onContinueReading }: CurrentReadingCardProps) {
  console.log("Rendering CurrentReadingCard", { 
    bookId: book?.id || 'book undefined',
    bookTitle: book?.title || 'title undefined', 
    currentPage: currentPage || 0 
  });

  const navigate = useNavigate();
  
  // Vérification complète des props
  if (!book) {
    console.warn("Le livre est undefined dans CurrentReadingCard");
    return null;
  }

  // Check if the book slug or current page is undefined or invalid
  const isReadingInvalid = !book.slug || currentPage === undefined || currentPage < 0;

  // Calculate segment based on current page (with validation)
  const segment = !isReadingInvalid ? Math.floor(currentPage / 8000) : 0;

  const handleContinueReading = () => {
    if (!isReadingInvalid) {
      toast.info("Reprise de la lecture…");
      navigate(`/livre/${book.slug}/segment/${segment}`);
    }
  };

  return (
    <Card className="border-coffee-light shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="flex gap-4 p-4">
        <div className="book-cover w-20 h-30 flex-shrink-0">
          {book.coverImage ? (
            <img 
              src={book.coverImage} 
              alt={book.title} 
              className="w-full h-full object-cover" 
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-chocolate-medium">
              <Book className="h-8 w-8 text-white" />
            </div>
          )}
        </div>

        <div className="flex-1 flex flex-col justify-between">
          <div>
            <h3 className="font-medium text-coffee-darker">{book.title}</h3>
            <p className="text-sm text-muted-foreground">{book.author}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {book.chaptersRead} sur {book.totalChapters} chapitres
            </p>
          </div>

          {!isReadingInvalid ? (
            <Button 
              className="mt-4 bg-coffee-dark text-white hover:bg-coffee-darker gap-2"
              onClick={handleContinueReading}
            >
              <BookOpen className="h-4 w-4" />
              Continuer ma lecture
            </Button>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground italic">
              Aucune lecture en cours
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
