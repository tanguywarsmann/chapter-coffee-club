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
import { checkBadgesForUser, recordReadingSession } from "@/services/badgeService";
import { calculateReadingProgress } from "@/lib/progress";

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
    showSuccessMessage,
    setShowSuccessMessage,
    prepareAndShowQuestion,
    handleQuizComplete,
    handleValidationConfirm,
    showConfetti
  } = useBookValidation(currentBook, user?.id, (bookId) => {
    if (onChapterComplete) {
      onChapterComplete(bookId);
    }
    if (user?.id) {
      checkBadgesForUser(user.id);
    }
  });

  const [showValidationModal, setShowValidationModal] = useState(false);
  const sessionStartTimeRef = useRef<Date | null>(null);

  useEffect(() => {
    if (currentBook) {
      const chaptersRead = currentBook.chaptersRead || 0;
      const totalChapters = currentBook.totalChapters || currentBook.expectedSegments || 1;

      console.log("BookDetail → Progress debug:", {
        title: currentBook.title,
        chaptersRead,
        totalChapters
      });

      setProgressPercent(calculateReadingProgress(
        chaptersRead,
        totalChapters
      ));
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

    if (!lectureInit) {
      sessionStartTimeRef.current = new Date();
    }
  };

  const handleQuizCompleteWrapper = (correct: boolean) => {
    handleQuizComplete(correct);

    if (correct) {
      showConfetti();

      if (user?.id) {
        checkBadgesForUser(user.id);

        if (currentBook.isCompleted) {
          const completedBooks = localStorage.getItem(`completed_books_${user.id}`)
            ? JSON.parse(localStorage.getItem(`completed_books_${user.id}`) || '[]')
            : [];

          if (!completedBooks.some((b: Book) => b.id === currentBook.id)) {
            completedBooks.push(currentBook);
            localStorage.setItem(`completed_books_${user.id}`, JSON.stringify(completedBooks));
          }
        }

        if (sessionStartTimeRef.current) {
          const endTime = new Date();
          recordReadingSession(user.id, sessionStartTimeRef.current, endTime);
          sessionStartTimeRef.current = null;
        }
      }
    }
  };

  const isBookCompleted = (currentBook.chaptersRead || 0) >= (currentBook.totalChapters || currentBook.expectedSegments || 1);
  const showValidationButton = !isBookCompleted;

  return (
    <Card className="border-coffee-light">
      <BookDetailHeader title={currentBook.title} />
      <CardContent className="space-y-4">
        <BookCoverInfo book={currentBook} />
        <BookDescription description={currentBook.description} />

        {showValidationButton && (
          <Button
            disabled={isValidating}
            onClick={handleMainButtonClick}
            className="w-full bg-coffee-dark text-white hover:bg-coffee-darker py-3 text-lg font-serif my-4"
          >
            {readingProgress?.current_page ? "Valider ma lecture" : "Commencer ma lecture"}
          </Button>
        )}

        <BookProgressBar progressPercent={progressPercent} ref={progressRef} />

        <BookValidationModals
          book={currentBook}
          showValidationModal={showValidationModal}
          showQuizModal={showQuiz}
          showSuccessMessage={showSuccessMessage}
          validationSegment={validationSegment}
          currentQuestion={currentQuestion}
          isValidating={isValidating}
          onValidationClose={() => setShowValidationModal(false)}
          onValidationConfirm={() => {
            setShowValidationModal(false);
            handleValidationConfirm();
          }}
          onQuizClose={() => setShowQuiz(false)}
          onQuizComplete={handleQuizCompleteWrapper}
          onSuccessClose={() => setShowSuccessMessage(false)}
        />
      </CardContent>
    </Card>
  );
};
