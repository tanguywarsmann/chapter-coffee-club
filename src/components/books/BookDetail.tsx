
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Book as BookIcon, Bookmark, Share2, Check, Loader2 } from "lucide-react";
import { Book } from "@/types/book";
import { toast } from "sonner";
import { initializeNewBookReading } from "@/services/reading";

interface BookDetailProps {
  book: Book;
  onChapterComplete?: (bookId: string) => void;
}

export const BookDetail = ({ book, onChapterComplete }: BookDetailProps) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);

  const handleStartReading = async () => {
    const userId = localStorage.getItem("user");
    if (!userId) {
      toast.error("Vous devez être connecté pour commencer une lecture");
      return;
    }

    setIsInitializing(true);
    console.log('Starting reading with userId:', userId, 'bookId:', book.id);

    try {
      const progress = await initializeNewBookReading(userId, book.id);
      if (progress) {
        toast.success("Lecture initialisée avec succès");
        // Refresh the book details to show updated progress
        if (onChapterComplete) {
          onChapterComplete(book.id);
        }
      } else {
        toast.error("Erreur lors de l'initialisation de la lecture. Veuillez réessayer.");
        console.error('Failed to initialize reading. No progress returned.');
      }
    } catch (error) {
      console.error('Error starting book:', error);
      toast.error("Une erreur est survenue lors de l'initialisation de la lecture: " + 
                 (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsInitializing(false);
    }
  };

  return (
    <Card className="border-coffee-light">
      <CardHeader>
        <CardTitle className="text-2xl font-serif text-coffee-darker">{book.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-4">
          <div className="book-cover w-32 h-48 flex-shrink-0">
            {book.coverImage ? (
              <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-chocolate-medium">
                <span className="text-white font-serif italic text-4xl">{book.title.substring(0, 1)}</span>
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <h2 className="text-xl font-medium text-coffee-darker">{book.title}</h2>
            <p className="text-sm text-muted-foreground">{book.author}</p>
            
            <div className="mt-2 flex flex-wrap gap-1">
              {book.categories.map((category, index) => (
                <span key={index} className="px-2 py-1 bg-coffee-light/30 text-coffee-darker rounded-full text-xs">
                  {category}
                </span>
              ))}
            </div>
          </div>
        </div>
        
        <p className="text-coffee-darker">{book.description}</p>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">
            {book.pages} pages • {book.language}
          </span>
          
          <div className="flex gap-2">
            <Button variant="outline" size="icon" className="border-coffee-medium text-coffee-darker hover:bg-coffee-light/20">
              <Bookmark className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="border-coffee-medium text-coffee-darker hover:bg-coffee-light/20">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <Button 
          className="w-full bg-coffee-dark hover:bg-coffee-darker" 
          onClick={handleStartReading} 
          disabled={isInitializing}
        >
          {isInitializing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Initialisation...
            </>
          ) : (
            <>
              <BookIcon className="h-4 w-4 mr-2" />
              Commencer ma lecture
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
