
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Book } from "@/types/book";
import { BookDetailHeader } from "./BookDetailHeader";
import { BookCoverInfo } from "./BookCoverInfo";
import { BookDescription } from "./BookDescription";
import { Button } from "@/components/ui/button";
import { BookProgressBar } from "./BookProgressBar";
import { BookValidationModals } from "./BookValidationModals";
import { BookBadgeDialog } from "./BookBadgeDialog";
import { useBookDetailProgress } from "@/hooks/useBookDetailProgress";
import { useBookValidationHandler } from "@/hooks/useBookValidationHandler";
import { BookMonthlyRewardModal } from "./BookMonthlyRewardHandler";

interface BookDetailProps {
  book: Book;
  onChapterComplete?: (bookId: string) => void;
}

export const BookDetail = ({ book, onChapterComplete }: BookDetailProps) => {
  const {
    currentBook,
    setCurrentBook,
    progressPercent,
    readingProgress,
    progressRef,
    refreshReadingProgress,
    refreshProgressData,
    user
  } = useBookDetailProgress(book);

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
    handleLockExpire,
    forceRefresh,
    showBadgeDialog,
    setShowBadgeDialog,
    unlockedBadges,
    monthlyReward,
    showMonthlyReward,
    setShowMonthlyReward,
    handleMainButtonClick,
    sessionStartTimeRef,
  } = useBookValidationHandler({
    currentBook,
    setCurrentBook,
    refreshProgressData,
    refreshReadingProgress,
    user,
    onChapterComplete
  });

  const [showValidationModal, setShowValidationModal] = useState(false);

  // --- Progress & validation UI state ---
  const chaptersRead = readingProgress?.chaptersRead || currentBook.chaptersRead || 0;
  const totalChapters = readingProgress?.totalSegments ||
    currentBook.totalChapters ||
    currentBook.expectedSegments ||
    currentBook.total_chapters ||
    1;
  const isBookCompleted = chaptersRead >= totalChapters;
  const showValidationButton = !isBookCompleted;

  // --- Validation Modal Handler ---
  const handleOpenValidationModal = () => {
    const segment = (readingProgress?.chaptersRead || currentBook?.chaptersRead || 0) + 1;
    console.log(`[BookDetail] Opening validation modal for segment ${segment}, book:`, currentBook.title);
    
    setValidationSegment(segment);
    setShowValidationModal(true);

    if (!sessionStartTimeRef.current) {
      sessionStartTimeRef.current = new Date();
    }
  };

  // --- Enhanced validation confirm handler ---
  const handleModalValidationConfirm = () => {
    console.log(`[BookDetail] Modal validation confirm with segment:`, validationSegment);
    
    // Vérifier que le segment est bien défini avant de fermer la modal
    if (!validationSegment) {
      const recalculatedSegment = (readingProgress?.chaptersRead || currentBook?.chaptersRead || 0) + 1;
      console.log(`[BookDetail] Recalculating segment in modal: ${recalculatedSegment}`);
      setValidationSegment(recalculatedSegment);
      
      if (!recalculatedSegment) {
        toast.error("Impossible de déterminer le segment à valider");
        return;
      }
    }
    
    setShowValidationModal(false);
    handleValidationConfirm();
  };

  // If validation segment is already done, close modal
  useEffect(() => {
    if (showValidationModal && validationSegment) {
      const isAlreadyValidated = readingProgress && validationSegment <= (readingProgress.chaptersRead || 0);

      if (isAlreadyValidated) {
        console.log(`[BookDetail] Segment ${validationSegment} already validated, closing modal`);
        setShowValidationModal(false);
        refreshProgressData();
        forceRefresh();
      }
    }
  }, [showValidationModal, validationSegment, readingProgress, refreshProgressData, forceRefresh]);

  return (
    <Card className="border-coffee-light">
      <BookDetailHeader title={currentBook.title} />
      <CardContent className="space-y-4">
        <BookCoverInfo book={currentBook} />
        <BookDescription description={currentBook.description} />

        {isBookCompleted ? (
          <div className="bg-green-50 p-4 rounded-md border border-green-200 text-center">
            <p className="text-green-800 font-medium">Félicitations ! Vous avez terminé ce livre.</p>
            <p className="text-sm text-green-600 mt-1">Ce livre contient {currentBook.totalSegments} segments de lecture.</p>
          </div>
        ) : showValidationButton && (
          <>
            <Button
              disabled={isValidating}
              onClick={handleOpenValidationModal}
              className="w-full bg-coffee-dark text-white hover:bg-coffee-darker py-3 text-lg font-serif my-4"
            >
              {chaptersRead > 0 ? "Valider ma lecture" : "Commencer ma lecture"}
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              Ce livre contient {currentBook.totalSegments} segments de lecture.
            </p>
          </>
        )}

        <p className="text-muted-foreground text-center">
          Progression : {chaptersRead} / {totalChapters} segments validés.
        </p>
        <BookProgressBar progressPercent={progressPercent} ref={progressRef} />

        {/* Validation/Quiz Modals */}
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
          onValidationConfirm={handleModalValidationConfirm}
          onQuizClose={() => setShowQuiz(false)}
          onQuizComplete={handleQuizComplete}
          onSuccessClose={() => setShowSuccessMessage(false)}
          onLockExpire={handleLockExpire}
        />

        {/* Badge Dialog */}
        <BookBadgeDialog
          open={showBadgeDialog}
          badges={unlockedBadges}
          setOpen={setShowBadgeDialog}
        />

        {/* Monthly Reward Badge Modal */}
        <BookMonthlyRewardModal
          monthlyReward={monthlyReward}
          showMonthlyReward={showMonthlyReward}
          onClose={() => setShowMonthlyReward(false)}
        />
      </CardContent>
    </Card>
  );
};
