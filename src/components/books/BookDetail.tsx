import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Book } from "@/types/book";
import { useAuth } from "@/contexts/AuthContext";
import { getBookReadingProgress } from "@/services/progressService";
import { useBookValidation } from "@/hooks/useBookValidation";
import { BookDetailHeader } from "./BookDetailHeader";
import { BookCoverInfo } from "./BookCoverInfo";
import { BookDescription } from "./BookDescription";
import { Button } from "@/components/ui/button";
import { BookProgressBar } from "./BookProgressBar";
import { BookValidationModals } from "./BookValidationModals";
import { toast } from "sonner";
import { checkBadgesForUser, recordReadingSession } from "@/services/badgeService";
import { calculateReadingProgress } from "@/lib/progress";
import { ReadingProgress } from "@/types/reading";

interface BookDetailProps {
  book: Book;
  onChapterComplete?: (bookId: string) => void;
}

export const BookDetail = ({ book, onChapterComplete }: BookDetailProps) => {
  const [currentBook, setCurrentBook] = useState<Book>(book);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [readingProgress, setReadingProgress] = useState<ReadingProgress | null>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const sessionStartTimeRef = useRef<Date | null>(null);

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
    showConfetti,
    isLocked,
    remainingLockTime,
    handleLockExpire
  } = useBookValidation(currentBook, user?.id, (bookId) => {
    if (onChapterComplete) {
      onChapterComplete(bookId);
    }
    if (user?.id) {
      checkBadgesForUser(user.id);
    }
  });

  const [showValidationModal, setShowValidationModal] = useState(false);

  // Fetch reading progress whenever the book or user changes
  useEffect(() => {
    const fetchProgress = async () => {
      if (user?.id && currentBook?.id) {
        try {
          const progress = await getBookReadingProgress(user.id, currentBook.id);
          if (progress) {
            setReadingProgress(progress);

            // Update the book with validation data
            const chaptersRead = progress.validations?.length || 0;
            if (chaptersRead !== currentBook.chaptersRead) {
              setCurrentBook(prevBook => ({
                ...prevBook,
                chaptersRead: chaptersRead
              }));
            }
          }
        } catch (error) {
          console.error("Error fetching book reading progress:", error);
        }
      }
    };

    fetchProgress();
  }, [user?.id, currentBook?.id]);

  // Calculate progress percentage based on validations
  useEffect(() => {
    const chapters = readingProgress?.validations?.length || 0;
    const total = readingProgress?.total_chapters || currentBook.expectedSegments || 1;

    console.log("→ Calcul progression", { chapters, total });

    setProgressPercent(
      calculateReadingProgress(chapters, total)
    );
  }, [readingProgress?.validations, currentBook.expectedSegments]);

  const getCurrentSegmentToValidate = () => {
    if (!readingProgress || !readingProgress.validations) return 1;
    return (readingProgress.validations.length || 0) + 1;
  };

  const handleMainButtonClick = async () => {
    if (!user?.id) {
      toast.error("Vous devez être connecté pour commencer ou valider votre lecture");
      return;
    }

    const segment = getCurrentSegmentToValidate();
    setValidationSegment(segment);
    setShowValidationModal(true);

    // Start session timer if not already started
    if (!sessionStartTimeRef.current) {
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

  // Check if book is completed based on validations
  const chaptersRead = readingProgress?.validations?.length || currentBook.chaptersRead || 0;
  const totalChapters = readingProgress?.total_chapters || 
                       currentBook.totalChapters || 
                       currentBook.expectedSegments || 1;
  const isBookCompleted = chaptersRead >= totalChapters;
  const showValidationButton = !isBookCompleted;

  return (
    <Card className="border-coffee-light">
      <BookDetailHeader title={currentBook.title} />
      <CardContent className="space-y-4">
        <BookCoverInfo book={currentBook} />
        <BookDescription description={currentBook.description} />

        {isBookCompleted ? (
          <div className="bg-green-50 p-4 rounded-md border border-green-200 text-center">
            <p className="text-green-800 font-medium">Félicitations ! Vous avez terminé ce livre.</p>
          </div>
        ) : showValidationButton && (
          <Button
            disabled={isValidating}
            onClick={handleMainButtonClick}
            className="w-full bg-coffee-dark text-white hover:bg-coffee-darker py-3 text-lg font-serif my-4"
          >
            {chaptersRead > 0 ? "Valider ma lecture" : "Commencer ma lecture"}
          </Button>
        )}
        <p className="text-muted-foreground text-center">
          Progression : {chaptersRead} / {totalChapters} segments validés.
        </p>

        <BookProgressBar progressPercent={progressPercent} ref={progressRef} />

        <BookValidationModals
          book={currentBook}
          showValidationModal={showValidationModal}
          showQuizModal={showQuiz}
          showSuccessMessage={showSuccessMessage}
          validationSegment={validationSegment}
          currentQuestion={currentQuestion}
          isValidating={isValidating}
          isLocked={isLocked}
          remainingLockTime={remainingLockTime}
          onValidationClose={() => setShowValidationModal(false)}
          onValidationConfirm={() => {
            setShowValidationModal(false);
            handleValidationConfirm();
          }}
          onQuizClose={() => setShowQuiz(false)}
          onQuizComplete={handleQuizCompleteWrapper}
          onSuccessClose={() => setShowSuccessMessage(false)}
          onLockExpire={handleLockExpire}
        />
      </CardContent>
    </Card>
  );
};
