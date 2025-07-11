
import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { Book } from "@/types/book";
import { Badge } from "@/types/badge";
import { useBookQuiz } from "./useBookQuiz";
import { useConfetti } from "./useConfetti";
import { useReadingProgress } from "./useReadingProgress";
import { useValidationState } from "./useValidationState";
import { useQuizCompletion } from "./useQuizCompletion";
import { validateUserAndBook, checkBookCompletion, showValidationError } from "@/utils/validationUtils";
import { toast } from "sonner";
import { useStableCallback } from "./useStableCallback";
import { withErrorHandling } from "@/utils/errorBoundaryUtils";
import { recordReadingSession } from "@/services/badgeService";
import { checkAndGrantMonthlyReward } from "@/services/monthlyRewardService";
import { useMonthlyReward } from "@/components/books/BookMonthlyRewardHandler";
import { mutate } from "swr";

interface UseBookValidationProps {
  book: Book | null;
  userId: string | null;
  onProgressUpdate?: (bookId: string) => void;
  currentBook?: Book;
  setCurrentBook?: (b: Book) => void;
  refreshProgressData?: () => Promise<void>;
  refreshReadingProgress?: (force?: boolean) => void;
  user?: any;
  onChapterComplete?: (bookId: string) => void;
}

/**
 * Hook consolidé pour la validation des livres - version 0.16
 * Fusion de useBookValidation et useBookValidationHandler
 */
export const useBookValidation = ({
  book,
  userId,
  onProgressUpdate,
  currentBook,
  setCurrentBook,
  refreshProgressData,
  refreshReadingProgress,
  user,
  onChapterComplete
}: UseBookValidationProps) => {
  const sessionStartTimeRef = useRef<Date | null>(null);
  const [showBadgeDialog, setShowBadgeDialog] = useState(false);
  const [unlockedBadges, setUnlockedBadges] = useState<Badge[]>([]);
  const [validationSegment, setValidationSegment] = useState<number | null>(null);

  const {
    isValidating,
    setIsValidating,
    validationSegment: stateValidationSegment,
    setValidationSegment: setStateValidationSegment,
    validationError,
    setValidationError,
    resetValidationState
  } = useValidationState();

  const { showConfetti } = useConfetti();
  const { forceRefresh } = useReadingProgress();

  // Monthly reward
  const { monthlyReward, showMonthlyReward, setShowMonthlyReward } = useMonthlyReward(userId);

  const {
    showQuiz,
    setShowQuiz,
    quizChapter,
    currentQuestion,
    showSuccessMessage,
    setShowSuccessMessage,
    prepareAndShowQuestion,
    handleQuizComplete: originalHandleQuizComplete,
    isLocked,
    remainingLockTime,
    handleLockExpire,
    isUsingJoker,
    jokersRemaining
  } = useBookQuiz(book, userId, onProgressUpdate);

  const {
    newBadges,
    setNewBadges,
    handleQuizComplete
  } = useQuizCompletion({
    book,
    userId,
    originalHandleQuizComplete,
    onProgressUpdate
  });

  // Synchroniser les segments entre les états
  const effectiveValidationSegment = validationSegment || stateValidationSegment;

  // Debug logging pour tracer isValidating
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line no-console
      console.info('[Dbg:isValidating]', { isValidating, seg: effectiveValidationSegment });
    }
  }, [isValidating, effectiveValidationSegment]);

  // Handler for main validation button
  const handleMainButtonClick = useCallback((readingProgress: any) => {
    if (!userId) {
      toast.error("Vous devez être connecté pour commencer ou valider votre lecture");
      return;
    }

    const segment = (readingProgress?.chaptersRead || (currentBook || book)?.chaptersRead || 0) + 1;
    setValidationSegment(segment);
    setStateValidationSegment(segment);

    if (!sessionStartTimeRef.current) {
      sessionStartTimeRef.current = new Date();
    }
  }, [userId, currentBook, book, setStateValidationSegment]);

  // Validation principale optimisée
  const handleValidateReading = useStableCallback(
    withErrorHandling(async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      setValidationError(null);
      
      // Validation préliminaire consolidée
      if (!validateUserAndBook(userId, book)) {
        return;
      }
      
      if (book && checkBookCompletion(book)) {
        return;
      }
      
      try {
        setIsValidating(true);
        const nextSegment = (book!.chaptersRead || 0) + 1;
        
        setValidationSegment(nextSegment);
        setStateValidationSegment(nextSegment);
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        setValidationError(errorMessage);
        showValidationError(error, "de la préparation de la validation");
      } finally {
        setIsValidating(false);
      }
    }, 'useBookValidation.handleValidateReading')
  );

  // Confirmation de validation optimisée
  const handleValidationConfirm = useStableCallback(
    withErrorHandling(async () => {
      if (!validateUserAndBook(userId, book)) {
        return;
      }
      
      // Calcul sécurisé du segment avec fallback
      let segmentToValidate = effectiveValidationSegment;
      if (!segmentToValidate && book) {
        segmentToValidate = (book.chaptersRead || 0) + 1;
        setValidationSegment(segmentToValidate);
        setStateValidationSegment(segmentToValidate);
      }
      
      if (!segmentToValidate) {
        toast.error("Impossible de déterminer le segment à valider", { duration: 3000 });
        return;
      }

      setIsValidating(true);
      try {
        await prepareAndShowQuestion(segmentToValidate);
        
        // Refresh immédiat pour éviter les états incohérents
        forceRefresh();
      } catch (error: any) {
        console.error('[prepareAndShowQuestion]', error);
        toast.error("Erreur de validation", {
          description: error.message || "Impossible de préparer la validation",
          duration: 5000
        });
        
        // Refresh même en cas d'erreur pour resynchroniser
        forceRefresh();
        throw error; // pour que le finally soit toujours déclenché
      } finally {
        setIsValidating(false);
      }
    }, 'useBookValidation.handleValidationConfirm')
  );

  // Handler consolidé pour la complétion du quiz
  const handleQuizCompleteWrapper = useCallback(async (correct: boolean, useJoker?: boolean) => {
    setIsValidating(true);
    try {
      const result = await handleQuizComplete(correct, useJoker);

      if (correct) {
        showConfetti();
        
        if (refreshProgressData) {
          await refreshProgressData();
        }
        forceRefresh();

        // Refreshs en cascade pour assurer la cohérence
        setTimeout(async () => {
          if (refreshProgressData) {
            await refreshProgressData();
          }
          if (refreshReadingProgress) {
            refreshReadingProgress(true);
          }
        }, 100);
        
        setTimeout(async () => {
          if (refreshProgressData) {
            await refreshProgressData();
          }
          if (refreshReadingProgress) {
            refreshReadingProgress(true);
          }
          if (setCurrentBook && currentBook) {
            setCurrentBook(currentBook);
          }
        }, 500);

        if (userId) {
          if (result?.newBadges && result.newBadges.length > 0) {
            setUnlockedBadges(result.newBadges);
            setShowBadgeDialog(true);
          }
          
          if ((currentBook || book)?.isCompleted) {
            const completedBooks = localStorage.getItem(`completed_books_${userId}`)
              ? JSON.parse(localStorage.getItem(`completed_books_${userId}`) || '[]')
              : [];
            if (!completedBooks.some((b: Book) => b.id === (currentBook || book)!.id)) {
              completedBooks.push(currentBook || book);
              localStorage.setItem(`completed_books_${userId}`, JSON.stringify(completedBooks));
            }
          }
          
          if (sessionStartTimeRef.current) {
            const endTime = new Date();
            recordReadingSession(userId, sessionStartTimeRef.current, endTime);
            sessionStartTimeRef.current = null;
          }
          
          // Monthly reward dialog
          const monthlyBadge = await checkAndGrantMonthlyReward(userId);
          if (monthlyBadge) {
            setTimeout(() => {
              setShowMonthlyReward(true);
            }, 1000);
          }
        }
        toast.success("Segment validé avec succès !");
      } else {
        if (refreshProgressData) {
          await refreshProgressData();
        }
        forceRefresh();
      }
    } catch (error) {
      toast.error("Une erreur est survenue lors de la validation");
      if (refreshProgressData) {
        await refreshProgressData();
      }
      forceRefresh();
    } finally {
      setIsValidating(false);
      // Déplacer mutate() après le finally pour garantir la synchronisation
      if (book?.id) {
        mutate(['book-progress', book.id]);
        mutate(['jokers-info', book.id]);
      }
    }
  }, [
    handleQuizComplete,
    showConfetti,
    refreshProgressData,
    forceRefresh,
    refreshReadingProgress,
    userId,
    setCurrentBook,
    currentBook,
    book,
    setShowBadgeDialog,
    setUnlockedBadges,
    setShowMonthlyReward,
  ]);

  // Mémoriser les valeurs de retour pour éviter les re-rendus
  const returnValue = useMemo(() => ({
    isValidating,
    showQuiz,
    setShowQuiz,
    quizChapter,
    validationSegment: effectiveValidationSegment,
    setValidationSegment,
    currentQuestion,
    showSuccessMessage,
    setShowSuccessMessage,
    handleValidateReading,
    prepareAndShowQuestion,
    handleQuizComplete: handleQuizCompleteWrapper,
    handleValidationConfirm,
    showConfetti,
    validationError,
    isLocked,
    remainingLockTime,
    handleLockExpire,
    newBadges,
    forceRefresh,
    showBadgeDialog,
    setShowBadgeDialog,
    unlockedBadges,
    monthlyReward,
    showMonthlyReward,
    setShowMonthlyReward,
    handleMainButtonClick,
    sessionStartTimeRef,
    isUsingJoker,
    jokersRemaining,
  }), [
    isValidating,
    showQuiz,
    setShowQuiz,
    quizChapter,
    effectiveValidationSegment,
    setValidationSegment,
    currentQuestion,
    showSuccessMessage,
    setShowSuccessMessage,
    handleValidateReading,
    prepareAndShowQuestion,
    handleQuizCompleteWrapper,
    handleValidationConfirm,
    showConfetti,
    validationError,
    isLocked,
    remainingLockTime,
    handleLockExpire,
    newBadges,
    forceRefresh,
    showBadgeDialog,
    unlockedBadges,
    monthlyReward,
    showMonthlyReward,
    handleMainButtonClick,
    isUsingJoker,
    jokersRemaining,
  ]);
  
  return returnValue;
};
