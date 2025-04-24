
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
    showQuizModal,
    setShowQuizModal,
    validationSegment,
    setValidationSegment,
    currentQuestion,
    prepareAndShowQuestion,
    handleQuizComplete
  } = useBookValidation(currentBook, user?.id, onChapterComplete);

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
          showQuizModal={showQuizModal}
          validationSegment={validationSegment}
          currentQuestion={currentQuestion}
          isValidating={isValidating}
          onValidationClose={() => setShowValidationModal(false)}
          onValidationConfirm={handleValidationModalConfirm}
          onQuizClose={() => setShowQuizModal(false)}
          onQuizComplete={handleQuizComplete}
        />
      </CardContent>
    </Card>
  );
};
