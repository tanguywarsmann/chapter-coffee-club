
import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Book } from "@/types/book";
import { useAuth } from "@/contexts/AuthContext";
import { syncBookWithAPI } from "@/services/reading";
import { useBookValidation } from "@/hooks/useBookValidation";
import { getBookReadingProgress } from "@/services/reading/progressService";
import { BookDetailHeader } from "./BookDetailHeader";
import { BookCoverInfo } from "./BookCoverInfo";
import { BookDescription } from "./BookDescription";
import { Button } from "@/components/ui/button";
import { BookProgressBar } from "./BookProgressBar";
import { BookValidationModals } from "./BookValidationModals";
import { toast } from "sonner";
import { checkBadgesForUser } from "@/services/badgeService";

interface BookDetailProps {
  book: Book;
  onChapterComplete?: (bookId: string) => void;
}

export const BookDetail = ({ book, onChapterComplete }: BookDetailProps) => {
  const [currentBook, setCurrentBook] = useState<Book>(book);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [readingProgress, setReadingProgress] = useState<any>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  
  const {
    isValidating,
    showQuiz,
    setShowQuiz,
    validationSegment,
    setValidationSegment,
    currentQuestion,
    prepareAndShowQuestion,
    handleQuizComplete
  } = useBookValidation(currentBook, user?.id, (bookId) => {
    // Appeler le callback original si fourni
    if (onChapterComplete) {
      onChapterComplete(bookId);
    }
    
    // Vérifier les badges après avoir complété un chapitre
    if (user?.id) {
      checkBadgesForUser(user.id);
    }
  });

  const [showValidationModal, setShowValidationModal] = useState(false);

  useEffect(() => {
    if (currentBook && currentBook.totalChapters) {
      setProgressPercent(
        Math.min(
          100,
          Math.round(((currentBook.chaptersRead || 0) / currentBook.totalChapters) * 100)
        )
      );
    }
  }, [currentBook]);

  useEffect(() => {
    const fetchProgress = async () => {
      if (user?.id) {
        const progress = await getBookReadingProgress(user.id, currentBook.id);
        setReadingProgress(progress);
      }
    };
    fetchProgress();
  }, [user?.id, currentBook.id]);

  const getCurrentSegmentToValidate = () => {
    const currentPage = readingProgress?.current_page || 0;
    return Math.floor(currentPage / 30) + 1;
  };

  const handleMainButtonClick = async () => {
    if (!user?.id) {
      toast.error("Vous devez être connecté pour commencer ou valider votre lecture");
      return;
    }

    const lectureInit = !!(readingProgress?.current_page || currentBook.chaptersRead);
    const segment = getCurrentSegmentToValidate();
    setValidationSegment(segment);
    setShowValidationModal(true);
    
    // Enregistrer le début d'une session de lecture (pour badges)
    if (!lectureInit) {
      // Stocker l'heure de début en localStorage pour la récupérer plus tard
      localStorage.setItem(`reading_start_${user.id}_${currentBook.id}`, new Date().toISOString());
    }
  };

  const handleValidationModalConfirm = () => {
    setShowValidationModal(false);
    if (validationSegment) {
      prepareAndShowQuestion(validationSegment);
    }
  };

  return (
    <Card className="border-coffee-light">
      <BookDetailHeader title={currentBook.title} />
      <CardContent className="space-y-4">
        <BookCoverInfo book={currentBook} />
        <BookDescription description={currentBook.description} />
        <Button
          disabled={isValidating}
          onClick={handleMainButtonClick}
          className="w-full bg-coffee-dark text-white hover:bg-coffee-darker py-3 text-lg font-serif my-4"
        >
          {readingProgress?.current_page ? "Valider ma lecture" : "Commencer ma lecture"}
        </Button>
        <BookProgressBar progressPercent={progressPercent} />
        
        <BookValidationModals
          book={currentBook}
          showValidationModal={showValidationModal}
          showQuizModal={showQuiz}
          validationSegment={validationSegment}
          currentQuestion={currentQuestion}
          isValidating={isValidating}
          onValidationClose={() => setShowValidationModal(false)}
          onValidationConfirm={handleValidationModalConfirm}
          onQuizClose={() => setShowQuiz(false)}
          onQuizComplete={(correct) => {
            handleQuizComplete(correct);
            
            // Vérifier les badges après avoir complété un quiz
            if (user?.id) {
              checkBadgesForUser(user.id);
              
              // Si le livre est terminé, stocker dans la liste des livres terminés
              if (currentBook.isCompleted) {
                const completedBooks = localStorage.getItem(`completed_books_${user.id}`) 
                  ? JSON.parse(localStorage.getItem(`completed_books_${user.id}`) || '[]')
                  : [];
                  
                if (!completedBooks.some((b: Book) => b.id === currentBook.id)) {
                  completedBooks.push(currentBook);
                  localStorage.setItem(`completed_books_${user.id}`, JSON.stringify(completedBooks));
                  
                  // Terminer la session de lecture
                  const startTimeStr = localStorage.getItem(`reading_start_${user.id}_${currentBook.id}`);
                  if (startTimeStr) {
                    const startTime = new Date(startTimeStr);
                    const endTime = new Date();
                    
                    // Enregistrer la session (ceci déclenchera aussi la vérification des badges)
                    const { recordReadingSession } = require('@/services/badgeService');
                    recordReadingSession(user.id, startTime, endTime);
                    
                    // Supprimer l'heure de début
                    localStorage.removeItem(`reading_start_${user.id}_${currentBook.id}`);
                  }
                }
              }
            }
          }}
        />
      </CardContent>
    </Card>
  );
}
