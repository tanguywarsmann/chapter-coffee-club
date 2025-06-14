import { useState, useRef, useCallback, useEffect } from "react";
import { Book } from "@/types/book";
import { Badge } from "@/types/badge";
import { useBookValidation } from "@/hooks/useBookValidation";
import { toast } from "sonner";
import { recordReadingSession } from "@/services/badgeService";
import { checkAndGrantMonthlyReward } from "@/services/monthlyRewardService";
import { useMonthlyReward } from "@/components/books/BookMonthlyRewardHandler";

/*
  This hook encapsulates all validation/quiz logic, including
  - Setting up and handling badge dialog
  - Handling quiz completion, confetti, refreshing, and session logic
  - Handling monthly reward trigger

  Compose this inside BookDetail and pass the props into the correct places.
*/
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
    handleValidationConfirm,
    showConfetti,
    isLocked,
    remainingLockTime,
    handleLockExpire,
    forceRefresh
  } = useBookValidation(currentBook, user?.id, onChapterComplete);

  // Handler for main validation button
  const handleMainButtonClick = useCallback((readingProgress: any) => {
    if (!user?.id) {
      toast.error("Vous devez être connecté pour commencer ou valider votre lecture");
      return;
    }

    const segment = (readingProgress?.chaptersRead || 0) + 1;
    setValidationSegment(segment);

    if (!sessionStartTimeRef.current) {
      sessionStartTimeRef.current = new Date();
    }
  }, [user?.id]);

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
