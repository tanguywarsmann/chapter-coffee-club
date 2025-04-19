import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BookOpen, ChevronRight, Loader2 } from "lucide-react";
import { Book } from "@/types/book";
import { validateReading } from "@/services/readingService";
import { toast } from "sonner";
import { QuizModal } from "@/components/books/QuizModal";

interface CurrentBookProps {
  book: Book | null;
  onProgressUpdate?: (newProgress: number) => void;
}

export function CurrentBook({ book, onProgressUpdate }: CurrentBookProps) {
  const navigate = useNavigate();
  const [isValidating, setIsValidating] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  
  const userId = localStorage.getItem("user") || "user123";
  
  if (!book) {
    return (
      <Card className="border-coffee-light">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-serif text-coffee-darker">Ma lecture en cours</CardTitle>
        </CardHeader>
        <CardContent className="text-center p-6">
          <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-coffee-darker mb-2">Aucune lecture en cours</h3>
          <p className="text-muted-foreground mb-4">Commencez votre prochaine aventure de lecture</p>
          <Button 
            className="bg-coffee-dark hover:bg-coffee-darker"
            onClick={() => navigate("/explore")}
          >
            Explorer les livres
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  const totalPages = book.totalChapters * 30;
  const pagesRead = book.chaptersRead * 30;
  const progressPercentage = (pagesRead / totalPages) * 100;
  
  const handleNavigateToBook = () => {
    navigate(`/books/${book.id}`);
  };
  
  const handleValidateReading = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (book.chaptersRead >= book.totalChapters) {
      navigate(`/books/${book.id}`);
      return;
    }
    
    try {
      setIsValidating(true);
      const nextSegment = book.chaptersRead + 1;
      
      await validateReading({
        user_id: userId,
        book_id: book.id,
        segment: nextSegment
      });
      
      toast.success("30 pages validées avec succès!");
      setShowQuiz(true);
      
      if (onProgressUpdate) {
        onProgressUpdate(book.chaptersRead + 1);
      }
    } catch (error: any) {
      if (error.error === "Segment déjà validé") {
        toast.error("Vous avez déjà validé ce segment de lecture!");
      } else {
        toast.error("Erreur lors de la validation: " + (error.error || "Erreur inconnue"));
      }
    } finally {
      setIsValidating(false);
    }
  };
  
  const handleQuizComplete = (passed: boolean) => {
    setShowQuiz(false);
    if (!passed) {
      toast.error("Essayez encore! Assurez-vous d'avoir bien lu le chapitre.");
    }
  };

  return (
    <>
      <Card className="border-coffee-light">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-serif text-coffee-darker">Ma lecture en cours</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="book-cover w-20 h-30 flex-shrink-0">
              {book.coverImage ? (
                <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-chocolate-medium">
                  <span className="text-white font-serif italic text-xl">{book.title.substring(0, 1)}</span>
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <h3 className="font-medium text-coffee-darker hover:underline cursor-pointer" onClick={handleNavigateToBook}>
                {book.title}
              </h3>
              <p className="text-sm text-muted-foreground">{book.author}</p>
              
              <div className="mt-3 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-coffee-darker">Progression</span>
                  <span className="text-muted-foreground">{pagesRead} sur {totalPages} pages</span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
              </div>
              
              <Button 
                className="mt-4 w-full bg-coffee-dark hover:bg-coffee-darker"
                onClick={handleValidateReading}
                disabled={isValidating}
              >
                {isValidating ? (
                  <><Loader2 className="h-4 w-4 mr-1 animate-spin" /> Validation...</>
                ) : (
                  <>Valider 30 pages supplémentaires <ChevronRight className="h-4 w-4 ml-1" /></>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {showQuiz && (
        <QuizModal 
          bookTitle={book.title} 
          chapterNumber={book.chaptersRead}
          onComplete={handleQuizComplete}
          onClose={() => setShowQuiz(false)}
        />
      )}
    </>
  );
}
