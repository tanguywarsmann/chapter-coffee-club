
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BookOpen, ChevronRight } from "lucide-react";
import { Book } from "@/types/book";
import { toast } from "sonner";

interface CurrentBookProps {
  book: Book | null;
  onProgressUpdate?: (newProgress: number) => void;
}

export function CurrentBook({ book, onProgressUpdate }: CurrentBookProps) {
  const [currentPages, setCurrentPages] = useState(book?.chaptersRead || 0);
  const navigate = useNavigate();
  
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
  
  // Calculate the progress percentage
  const totalPages = book.pages || book.totalChapters * 30; // Estimation if no exact page count
  const pagesRead = book.chaptersRead * 30;
  const progressPercentage = (pagesRead / totalPages) * 100;
  
  const handleValidateProgress = () => {
    const newPagesRead = pagesRead + 30;
    const newProgressPercentage = (newPagesRead / totalPages) * 100;
    
    // Update local state
    setCurrentPages(currentPages + 1);
    
    // Call the parent component's update function if provided
    if (onProgressUpdate) {
      onProgressUpdate(currentPages + 1);
    }
    
    // Show success toast
    toast.success("Bravo ! 30 pages ajoutées à votre progression.");
    
    // Show achievement toast if certain milestones are reached
    if (newPagesRead >= 100 && pagesRead < 100) {
      toast.success("🏆 Vous avez débloqué le badge '100 pages' !", {
        duration: 5000
      });
    }
  };

  return (
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
            <h3 className="font-medium text-coffee-darker hover:underline cursor-pointer" onClick={() => navigate(`/books/${book.id}`)}>
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
              onClick={handleValidateProgress}
            >
              Valider 30 pages supplémentaires <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
