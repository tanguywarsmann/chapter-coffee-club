
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Book, BookOpen } from "lucide-react";
import { Book as BookType } from "@/types/book";

interface CurrentReadingCardProps {
  book: BookType;
  currentPage: number;
  onContinueReading: () => void;
}

export function CurrentReadingCard({ book, currentPage, onContinueReading }: CurrentReadingCardProps) {
  const segment = Math.floor(currentPage / 30) + 1;

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

          <Button 
            className="mt-4 bg-coffee-dark hover:bg-coffee-darker gap-2"
            onClick={onContinueReading}
          >
            <BookOpen className="h-4 w-4" />
            Continuer ma lecture
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
