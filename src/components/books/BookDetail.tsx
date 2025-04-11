
import { useState } from "react";
import { Book } from "@/types/book";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, ArrowLeft, Award, Share2, Bookmark, BookmarkCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { QuizModal } from "@/components/books/QuizModal";

interface BookDetailProps {
  book: Book;
  onChapterComplete: (bookId: string) => void;
}

export function BookDetail({ book, onChapterComplete }: BookDetailProps) {
  const [showQuiz, setShowQuiz] = useState(false);
  const [bookmarked, setBookmarked] = useState(book.isBookmarked || false);
  const navigate = useNavigate();

  const progressPercentage = (book.chaptersRead / book.totalChapters) * 100;

  const handleStartReading = () => {
    if (book.chaptersRead < book.totalChapters) {
      setShowQuiz(true);
    } else {
      toast.info("Vous avez déjà terminé ce livre!");
    }
  };

  const handleQuizComplete = (passed: boolean) => {
    setShowQuiz(false);
    if (passed) {
      toast.success("Bravo! Vous avez terminé ce chapitre!");
      onChapterComplete(book.id);
      
      if (book.chaptersRead + 1 >= book.totalChapters) {
        toast.success("Félicitations! Vous avez terminé ce livre!", {
          icon: <Award className="h-5 w-5 text-yellow-500" />,
          duration: 5000,
        });
      }
    } else {
      toast.error("Essayez encore! Assurez-vous d'avoir bien lu le chapitre.");
    }
  };

  const toggleBookmark = () => {
    setBookmarked(!bookmarked);
    toast.success(bookmarked ? "Livre retiré de vos favoris" : "Livre ajouté à vos favoris");
  };

  const handleShare = () => {
    toast.success("Lien partagé avec succès!");
  };

  return (
    <>
      <div className="mb-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="text-coffee-darker">
          <ArrowLeft className="mr-2 h-4 w-4" /> Retour
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="book-cover aspect-[2/3] md:col-span-1 bg-coffee-medium">
          {book.coverImage ? (
            <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-chocolate-medium">
              <span className="text-white font-serif italic text-4xl">{book.title.substring(0, 1)}</span>
            </div>
          )}
        </div>
        
        <div className="md:col-span-2 space-y-6">
          <div>
            <div className="flex items-center justify-between">
              <h1 className="text-2xl md:text-3xl font-serif font-medium text-coffee-darker">{book.title}</h1>
              <div className="flex space-x-2">
                <Button size="icon" variant="ghost" onClick={toggleBookmark} className="text-coffee-dark hover:text-coffee-darker">
                  {bookmarked ? <BookmarkCheck className="h-5 w-5" /> : <Bookmark className="h-5 w-5" />}
                </Button>
                <Button size="icon" variant="ghost" onClick={handleShare} className="text-coffee-dark hover:text-coffee-darker">
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
            </div>
            <p className="text-lg text-muted-foreground">{book.author}</p>
            
            <div className="flex flex-wrap gap-2 mt-3">
              {book.categories.map((category, index) => (
                <Badge key={index} variant="outline" className="border-coffee-light">
                  {category}
                </Badge>
              ))}
            </div>
          </div>
          
          <Card className="border-coffee-light">
            <CardHeader>
              <h3 className="text-lg font-medium text-coffee-darker">À propos de ce livre</h3>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-line">{book.description}</p>
            </CardContent>
          </Card>
          
          <Card className="border-coffee-light">
            <CardHeader>
              <h3 className="text-lg font-medium text-coffee-darker">Votre progression</h3>
            </CardHeader>
            <CardContent>
              <div className="reading-progress mb-2">
                <div className="progress-bar" style={{ width: `${progressPercentage}%` }}></div>
              </div>
              <p className="text-sm text-muted-foreground">
                {book.chaptersRead} sur {book.totalChapters} chapitres terminés ({Math.round(progressPercentage)}%)
              </p>
            </CardContent>
            <CardFooter>
              <Button className="w-full bg-coffee-dark hover:bg-coffee-darker" onClick={handleStartReading}>
                <BookOpen className="mr-2 h-5 w-5" />
                {book.chaptersRead === 0 ? "Commencer à lire" : 
                 book.chaptersRead < book.totalChapters ? "Continuer à lire" : "Relire"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
      
      {showQuiz && (
        <QuizModal 
          bookTitle={book.title} 
          chapterNumber={book.chaptersRead + 1}
          onComplete={handleQuizComplete}
          onClose={() => setShowQuiz(false)}
        />
      )}
    </>
  );
}
