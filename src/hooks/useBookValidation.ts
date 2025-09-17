
import { useState, useRef, useCallback, useMemo } from "react";
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
  } = useBookQuiz(book, userId, onProgressUpdate, isValidating, setIsValidating);

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

      try {
        setIsValidating(true);
        await prepareAndShowQuestion(segmentToValidate);
        
        // Refresh immédiat pour éviter les états incohérents
        forceRefresh();
      } catch (error: any) {
        toast.error("Erreur de validation", {
          description: error.message || "Impossible de préparer la validation",
          duration: 5000
        });
        
        // Refresh même en cas d'erreur pour resynchroniser
        forceRefresh();
      } finally {
        setIsValidating(false);
      }
    }, 'useBookValidation.handleValidationConfirm')
  );

  // Handler consolidé pour la complétion du quiz - CORRECTION DOUBLE VALIDATION
  const handleQuizCompleteWrapper = useCallback(async (correct: boolean, useJoker?: boolean) => {
    console.log("📞 handleQuizCompleteWrapper called:", { correct, useJoker });

    // SI JOKER UTILISÉ ET CORRECT -> PAS DE VALIDATION SUPPLÉMENTAIRE
    if (useJoker && correct) {
      console.log("🃏 Joker used successfully - skipping RPC validation");
      showConfetti();
      // Retourner immédiatement sans appeler handleQuizComplete
      return { success: true, newBadges: [] };
    }

    if (correct) {
      console.log("🎉 Showing confetti and success animations");
      showConfetti();
    }
    
    // Appeler handleQuizComplete SEULEMENT si pas de joker
    const result = await handleQuizComplete(correct, false);
    
    if (correct && result) {
      // Handle badges and rewards complets
      if (userId) {
        // Check for new badges
        if (result?.newBadges && result.newBadges.length > 0) {
          console.log("🏆 New badges unlocked:", result.newBadges);
          setUnlockedBadges(result.newBadges);
          setShowBadgeDialog(true);
        }
        
        // Handle completed books
        if ((currentBook || book)?.isCompleted) {
          const completedBooks = localStorage.getItem(`completed_books_${userId}`)
            ? JSON.parse(localStorage.getItem(`completed_books_${userId}`) || '[]')
            : [];
          if (!completedBooks.some((b: Book) => b.id === (currentBook || book)!.id)) {
            completedBooks.push(currentBook || book);
            localStorage.setItem(`completed_books_${userId}`, JSON.stringify(completedBooks));
          }
        }
        
        // Record reading session
        if (sessionStartTimeRef.current) {
          const endTime = new Date();
          recordReadingSession(userId, sessionStartTimeRef.current, endTime);
          sessionStartTimeRef.current = null;
        }
        
        // Check monthly reward
        try {
          const monthlyBadge = await checkAndGrantMonthlyReward(userId);
          if (monthlyBadge) {
            console.log("🎁 Monthly reward available");
            setTimeout(() => {
              setShowMonthlyReward(true);
            }, 1500); // Après les confettis
          }
        } catch (error) {
          console.warn("Monthly reward check failed:", error);
        }
      }
      
      toast.success("Segment validé avec succès !");
    }
    
    // Force refresh de toutes les données
    console.log("🔄 Forcing complete data refresh");
    if (refreshProgressData) {
      await refreshProgressData();
    }
    forceRefresh();
    
    return result;
  }, [
    handleQuizComplete,
    showConfetti,
    refreshProgressData,
    forceRefresh,
    userId,
    setCurrentBook,
    currentBook,
    book,
    setShowBadgeDialog,
    setUnlockedBadges,
    setShowMonthlyReward,
  ]);

  // New signature wrapper for modal components
  const handleQuizCompleteForModals = useCallback((args: { correct: boolean; useJoker: boolean }) => {
    return handleQuizCompleteWrapper(args.correct, args.useJoker);
  }, [handleQuizCompleteWrapper]);

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
    handleQuizComplete: handleQuizCompleteForModals, // Use new signature for modals
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
    handleQuizCompleteForModals,
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
