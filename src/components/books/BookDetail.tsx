import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Book } from "@/types/book";
import { BookDetailHeader } from "./BookDetailHeader";
import { BookCoverInfo } from "./BookCoverInfo";
import { BookDescription } from "./BookDescription";
import { Button } from "@/components/ui/button";
import { BookProgressBar } from "./BookProgressBar";
import { BookValidationModals } from "./BookValidationModals";
import { BookBadgeDialog } from "./BookBadgeDialog";
import { BookQuestDialog } from "./BookQuestDialog";
import { useBookDetailProgress } from "@/hooks/useBookDetailProgress";
import { useBookValidation } from "@/hooks/useBookValidation";
import { BookMonthlyRewardModal } from "./BookMonthlyRewardHandler";
import { toast } from "sonner";
import { usePerformanceTracker } from "@/utils/performanceAudit";
import { withErrorHandling } from "@/utils/errorBoundaryUtils";
import { useStableCallback } from "@/hooks/useStableCallback";
import { MemoizedComponent } from "@/components/common/MemoizedComponent";
import { useJokersInfo } from "@/hooks/useJokersInfo";
import { ValidationHistory } from "./ValidationHistory";
import { getValidationHistory } from "@/services/reading/validationHistoryService";
import { ReadingValidation } from "@/types/reading";
import { useExpectedSegments } from "@/hooks/useExpectedSegments";
import { uiJokersAllowed } from "@/utils/jokerUiGate";

interface BookDetailProps {
  book: Book;
  onChapterComplete?: (bookId: string) => void;
}

export const BookDetail = ({ book, onChapterComplete }: BookDetailProps) => {
  const { trackRender, trackApiCall, trackError } = usePerformanceTracker('BookDetail');
  
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
    showQuestDialog,
    setShowQuestDialog,
    unlockedQuests,
    monthlyReward,
    showMonthlyReward,
    setShowMonthlyReward,
    handleMainButtonClick,
    sessionStartTimeRef,
    isUsingJoker,
    jokersRemaining
  } = useBookValidation({
    book: currentBook,
    userId: user?.id || null,
    currentBook,
    setCurrentBook,
    refreshProgressData,
    refreshReadingProgress,
    user,
    onChapterComplete
  });

  const [showValidationModal, setShowValidationModal] = useState(false);
  const [validationHistory, setValidationHistory] = useState<ReadingValidation[]>([]);

  // UI gating pour les jokers
  const expectedSegments = useExpectedSegments(currentBook);
  const uiJokersAllowedCount = uiJokersAllowed(expectedSegments);
  
  // Hook pour récupérer les informations de jokers (mais override avec UI gating)
  const { jokersAllowed: originalJokersAllowed, jokersUsed } = useJokersInfo({
    bookId: currentBook?.id || null,
    userId: user?.id || null,
    expectedSegments: expectedSegments
  });
  
  // Force le gating UI
  const jokersAllowed = uiJokersAllowedCount;

  // Mémoriser les calculs de progression pour éviter les re-calculs
  const progressData = useMemo(() => {
    const chaptersRead = readingProgress?.chaptersRead || currentBook.chaptersRead || 0;
    const totalChapters = readingProgress?.totalSegments ||
      currentBook.totalChapters ||
      currentBook.expectedSegments ||
      currentBook.total_chapters ||
      1;
    const isBookCompleted = chaptersRead >= totalChapters;
    const showValidationButton = !isBookCompleted;

    return {
      chaptersRead,
      totalChapters,
      isBookCompleted,
      showValidationButton
    };
  }, [
    readingProgress?.chaptersRead,
    readingProgress?.totalSegments,
    currentBook.chaptersRead,
    currentBook.totalChapters,
    currentBook.expectedSegments,
    currentBook.total_chapters
  ]);

  // Load validation history when book changes
  useEffect(() => {
    const loadValidationHistory = async () => {
      if (!user?.id || !currentBook?.id) return;
      
      try {
        const history = await getValidationHistory(user.id, currentBook.id);
        setValidationHistory(history);
      } catch (error) {
        console.error('Error loading validation history:', error);
        setValidationHistory([]);
      }
    };

    loadValidationHistory();
  }, [currentBook?.id, user?.id]);

  // Gestionnaire d'ouverture de modal stabilisé
  const handleOpenValidationModal = useStableCallback(
    withErrorHandling(() => {
      const segment = (readingProgress?.chaptersRead || currentBook?.chaptersRead || 0) + 1;
      console.log(`[BookDetail] Opening validation modal for segment ${segment}, book:`, currentBook.title);
      
      if (segment <= 0) {
        trackError(new Error('Invalid segment calculated'));
        toast.error("Impossible de déterminer le segment à valider");
        return;
      }
      
      setValidationSegment(segment);
      setShowValidationModal(true);

      if (!sessionStartTimeRef.current) {
        sessionStartTimeRef.current = new Date();
      }
    }, 'BookDetail.handleOpenValidationModal')
  );

  // Gestionnaire de confirmation de modal amélioré
  const handleModalValidationConfirm = useStableCallback(
    withErrorHandling(() => {
      console.log(`[BookDetail] Modal validation confirm with segment:`, validationSegment);
      
      // Validation renforcée du segment
      if (!validationSegment) {
        const recalculatedSegment = (readingProgress?.chaptersRead || currentBook?.chaptersRead || 0) + 1;
        console.log(`[BookDetail] Recalculating segment in modal: ${recalculatedSegment}`);
        
        if (!recalculatedSegment || recalculatedSegment <= 0) {
          trackError(new Error('Unable to calculate valid segment'));
          toast.error("Impossible de déterminer le segment à valider");
          return;
        }
        
        setValidationSegment(recalculatedSegment);
      }
      
      setShowValidationModal(false);
      handleValidationConfirm();
    }, 'BookDetail.handleModalValidationConfirm')
  );

  // Effect optimisé pour fermer la modal si segment déjà validé
  useEffect(() => {
    if (showValidationModal && validationSegment) {
      const isAlreadyValidated = readingProgress && validationSegment <= (readingProgress.chaptersRead || 0);

      if (isAlreadyValidated) {
        console.log(`[BookDetail] Segment ${validationSegment} already validated, closing modal`);
        setShowValidationModal(false);
        // Batch les refreshs pour éviter les appels redondants
        Promise.all([refreshProgressData(), forceRefresh()]).catch(error => {
          trackError(error);
        });
      }
    }
  }, [showValidationModal, validationSegment, readingProgress?.chaptersRead, refreshProgressData, forceRefresh, trackError]);

  trackRender();

  return (
    <Card className="border-coffee-light">
      <BookDetailHeader title={currentBook.title} />
      <CardContent className="space-y-4">
        <MemoizedComponent deps={[currentBook.id, currentBook.title]}>
          <BookCoverInfo book={currentBook} />
          <BookDescription description={currentBook.description} />
        </MemoizedComponent>

        {progressData.isBookCompleted ? (
          <MemoizedComponent deps={[progressData.isBookCompleted]}>
            <div className="bg-green-50 p-4 rounded-md border border-green-200 text-center">
              <p className="text-green-800 font-medium">Félicitations ! Vous avez terminé ce livre.</p>
            </div>
          </MemoizedComponent>
        ) : progressData.showValidationButton && (
          <MemoizedComponent deps={[progressData.chaptersRead, isValidating]}>
            <>
              <Button
                variant="bookCta"
                disabled={isValidating}
                onClick={handleOpenValidationModal}
                className="w-full py-3 text-h4 font-serif my-4"
              >
                <span className="!text-white">
                  {progressData.chaptersRead > 0 ? "Valider ma lecture" : "Commencer ma lecture"}
                </span>
              </Button>
            </>
          </MemoizedComponent>
        )}

        <MemoizedComponent deps={[progressData.chaptersRead, progressData.totalChapters, progressPercent, jokersUsed, jokersAllowed]}>
          <>
            <p className="text-muted-foreground text-center">
              Progression : {progressData.chaptersRead} / {progressData.totalChapters} segments validés.
            </p>
            <BookProgressBar 
              progressPercent={progressPercent} 
              jokersUsed={jokersUsed}
              jokersAllowed={jokersAllowed}
              ref={progressRef} 
            />
          </>
        </MemoizedComponent>

        {/* Modals - Only render when needed */}
        {(showValidationModal || showQuiz || showSuccessMessage) && (
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
            jokersUsed={jokersUsed}
            jokersAllowed={jokersAllowed}
            jokersRemaining={jokersRemaining}
            isUsingJoker={isUsingJoker}
            onValidationClose={() => setShowValidationModal(false)}
            onValidationConfirm={handleModalValidationConfirm}
            onQuizClose={() => setShowQuiz(false)}
            onQuizComplete={handleQuizComplete}
            onSuccessClose={() => setShowSuccessMessage(false)}
            onLockExpire={handleLockExpire}
          />
        )}

        {/* Badge Dialog - Only render when needed */}
        {showBadgeDialog && (
          <BookBadgeDialog
            open={showBadgeDialog}
            badges={unlockedBadges}
            setOpen={setShowBadgeDialog}
          />
        )}

        {/* Quest Dialog - Only render when needed */}
        {showQuestDialog && (
          <BookQuestDialog
            open={showQuestDialog}
            quests={unlockedQuests}
            setOpen={setShowQuestDialog}
          />
        )}

        {/* Monthly Reward Modal - Only render when needed */}
        {showMonthlyReward && (
          <BookMonthlyRewardModal
            monthlyReward={monthlyReward}
            showMonthlyReward={showMonthlyReward}
            onClose={() => setShowMonthlyReward(false)}
          />
        )}

        {/* Validation History - Only show if there are validations */}
        {validationHistory.length > 0 && (
          <MemoizedComponent deps={[validationHistory.length]}>
            <ValidationHistory validations={validationHistory} />
          </MemoizedComponent>
        )}
      </CardContent>
    </Card>
  );
};
