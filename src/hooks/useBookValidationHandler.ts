
import { useState, useRef, useCallback, useEffect } from "react";
import { Book } from "@/types/book";
import { Badge } from "@/types/badge";
import { useBookValidation } from "@/hooks/useBookValidation";
import { toast } from "sonner";
import { recordReadingSession } from "@/services/badgeService";
import { checkAndGrantMonthlyReward } from "@/services/monthlyRewardService";
import { useMonthlyReward } from "@/components/books/BookMonthlyRewardHandler";

export function useBookValidationHandler({
  currentBook,
  setCurrentBook,
  refreshProgressData,
  refreshReadingProgress,
  user,
  onChapterComplete
}: {
  currentBook: Book;
  setCurrentBook: (b: Book) => void;
  refreshProgressData: () => Promise<void>;
  refreshReadingProgress: (force?: boolean) => void;
  user: any;
  onChapterComplete?: (bookId: string) => void;
}) {
  const sessionStartTimeRef = useRef<Date | null>(null);
  const [showBadgeDialog, setShowBadgeDialog] = useState(false);
  const [unlockedBadges, setUnlockedBadges] = useState<Badge[]>([]);
  const [validationSegment, setValidationSegment] = useState<number | null>(null);

  // Monthly reward
  const { monthlyReward, showMonthlyReward, setShowMonthlyReward } = useMonthlyReward(user?.id);

  const {
    isValidating,
    showQuiz,
    setShowQuiz,
    currentQuestion,
    showSuccessMessage,
    setShowSuccessMessage,
    prepareAndShowQuestion,
    handleQuizComplete,
    handleValidationConfirm: originalHandleValidationConfirm,
    showConfetti,
    isLocked,
    remainingLockTime,
    handleLockExpire,
    forceRefresh,
    setValidationSegment: setBookValidationSegment
  } = useBookValidation(currentBook, user?.id, onChapterComplete);

  // Synchroniser les segments entre les deux hooks
  useEffect(() => {
    if (validationSegment !== null) {
      console.log(`[useBookValidationHandler] Syncing validation segment: ${validationSegment}`);
      setBookValidationSegment(validationSegment);
    }
  }, [validationSegment, setBookValidationSegment]);

  // Handler for main validation button
  const handleMainButtonClick = useCallback((readingProgress: any) => {
    if (!user?.id) {
      toast.error("Vous devez être connecté pour commencer ou valider votre lecture");
      return;
    }

    const segment = (readingProgress?.chaptersRead || currentBook?.chaptersRead || 0) + 1;
    console.log(`[useBookValidationHandler] Setting validation segment to ${segment} for book:`, currentBook?.title);
    setValidationSegment(segment);

    if (!sessionStartTimeRef.current) {
      sessionStartTimeRef.current = new Date();
    }
  }, [user?.id, currentBook]);

  // Wrapper pour handleValidationConfirm avec vérifications supplémentaires
  const handleValidationConfirm = useCallback(async () => {
    console.log(`[useBookValidationHandler] handleValidationConfirm called with segment:`, validationSegment);
    
    if (!validationSegment) {
      // Essayer de recalculer le segment
      const recalculatedSegment = (currentBook?.chaptersRead || 0) + 1;
      console.log(`[useBookValidationHandler] Recalculating segment: ${recalculatedSegment}`);
      setValidationSegment(recalculatedSegment);
      setBookValidationSegment(recalculatedSegment);
      
      if (!recalculatedSegment) {
        toast.error("Impossible de déterminer le segment à valider");
        return;
      }
    }
    
    await originalHandleValidationConfirm();
  }, [validationSegment, currentBook, originalHandleValidationConfirm, setBookValidationSegment]);

  // Handler for quiz completion (correct or not)
  const handleQuizCompleteWrapper = useCallback(async (correct: boolean) => {
    try {
      const result = await handleQuizComplete(correct);

      if (correct) {
        showConfetti();
        await refreshProgressData();
        forceRefresh();

        setTimeout(async () => {
          await refreshProgressData();
          refreshReadingProgress(true);
        }, 100);
        setTimeout(async () => {
          await refreshProgressData();
          refreshReadingProgress(true);
          setCurrentBook(currentBook);
        }, 500);

        if (user?.id) {
          if (result?.newBadges && result.newBadges.length > 0) {
            setUnlockedBadges(result.newBadges);
            setShowBadgeDialog(true);
          }
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
          // Monthly reward dialog
          const monthlyBadge = await checkAndGrantMonthlyReward(user.id);
          if (monthlyBadge) {
            setTimeout(() => {
              setShowMonthlyReward(true);
            }, 1000);
          }
        }
        toast.success("Segment validé avec succès !");
      } else {
        await refreshProgressData();
        forceRefresh();
      }
    } catch (error) {
      toast.error("Une erreur est survenue lors de la validation");
      await refreshProgressData();
      forceRefresh();
    }
  }, [
    handleQuizComplete,
    showConfetti,
    refreshProgressData,
    forceRefresh,
    refreshReadingProgress,
    user?.id,
    setCurrentBook,
    currentBook,
    setShowBadgeDialog,
    setUnlockedBadges,
    setShowMonthlyReward,
  ]);

  return {
    isValidating,
    showQuiz,
    setShowQuiz,
    validationSegment,
    setValidationSegment,
    currentQuestion,
    showSuccessMessage,
    setShowSuccessMessage,
    prepareAndShowQuestion,
    handleQuizComplete: handleQuizCompleteWrapper,
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
  };
}
