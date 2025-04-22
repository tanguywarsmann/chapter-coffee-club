import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BookOpen, ChevronRight, Loader2 } from "lucide-react";
import { Book } from "@/types/book";
import { validateReading } from "@/services/reading";
import { toast } from "sonner";
import { QuizModal } from "@/components/books/QuizModal";
import { ReadingQuestion } from "@/types/reading";
import { getFallbackQuestion, getQuestionForBookSegment } from "@/services/questionService";
import { supabase } from "@/integrations/supabase/client";

interface CurrentBookProps {
  book: Book | null;
  onProgressUpdate?: (bookId: string) => void;
}

export function CurrentBook({ book, onProgressUpdate }: CurrentBookProps) {
  const navigate = useNavigate();
  const [isValidating, setIsValidating] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizChapter, setQuizChapter] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState<ReadingQuestion | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user?.id) {
        setUserId(data.user.id);
      } else {
        toast.warning("Vous n'êtes pas connecté. Certaines fonctionnalités seront limitées.");
      }
    };
    getUser();
  }, []);
  
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
    
    if (!userId) {
      toast.error("Vous devez être connecté pour valider votre lecture");
      return;
    }
    
    if (book.chaptersRead >= book.totalChapters) {
      toast.success("Vous avez déjà terminé ce livre !");
      navigate(`/books/${book.id}`);
      return;
    }
    
    try {
      setIsValidating(true);
      const nextSegment = book.chaptersRead + 1;
      console.log(`Recherche d'une question pour le livre ${book.id}, segment ${nextSegment}`);
      
      // Récupérer la question pour le segment avant validation
      let question;
      try {
        question = await getQuestionForBookSegment(book.id, nextSegment);
      } catch (error) {
        console.error("Erreur lors de la récupération de la question:", error);
        question = null;
      }
      
      if (question) {
        console.log("Question trouvée:", question);
        setCurrentQuestion(question);
      } else {
        console.log("Aucune question trouvée, utilisation de la question par défaut");
        const fallbackQuestion = getFallbackQuestion();
        setCurrentQuestion(fallbackQuestion);
      }
      
      // Définir le chapitre du quiz et afficher la modale
      setQuizChapter(nextSegment);
      setShowQuiz(true);
      
    } catch (error: any) {
      console.error("Error preparing validation:", error);
      toast.error("Erreur lors de la préparation de la validation: " + 
        (error.message || error.error || "Erreur inconnue"));
    } finally {
      setIsValidating(false);
    }
  };
  
  const handleQuizComplete = async (passed: boolean) => {
    setShowQuiz(false);
    
    if (!passed) {
      toast.error("Essayez encore! Assurez-vous d'avoir bien lu le chapitre.");
      return;
    }
    
    if (!userId) {
      toast.error("Vous devez être connecté pour valider votre lecture");
      return;
    }
    
    try {
      setIsValidating(true);
      const nextSegment = book.chaptersRead + 1;
      
      console.log(`Validation du segment ${nextSegment} pour le livre ${book.id}`);
      await validateReading({
        user_id: userId,
        book_id: book.id,
        segment: nextSegment
      });
      
      toast.success("Segment validé avec succès!");
      
      if (onProgressUpdate) {
        onProgressUpdate(book.id);
      }
      
      // Redirection vers la page du livre pour voir la progression mise à jour
      navigate(`/books/${book.id}`);
      
    } catch (error: any) {
      if (error.message === "Segment déjà validé") {
        toast.warning("Vous avez déjà validé ce segment de lecture!");
      } else {
        toast.error("Erreur lors de la validation: " + 
          (error.message || error.error || "Erreur inconnue"));
      }
    } finally {
      setIsValidating(false);
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
                className="mt-4 w-full bg-coffee-dark hover:bg-coffee-darker text-center"
                onClick={handleValidateReading}
                disabled={isValidating}
              >
                {isValidating ? (
                  <><Loader2 className="h-4 w-4 mr-1 animate-spin" /> Validation...</>
                ) : (
                  <>
                    <span className="text-center">Valider 30 pages</span>
                    <ChevronRight className="h-4 w-4 ml-1 flex-shrink-0" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {showQuiz && currentQuestion && (
        <QuizModal 
          bookTitle={book.title} 
          chapterNumber={quizChapter}
          onComplete={handleQuizComplete}
          onClose={() => setShowQuiz(false)}
          question={currentQuestion}
        />
      )}
    </>
  );
}
