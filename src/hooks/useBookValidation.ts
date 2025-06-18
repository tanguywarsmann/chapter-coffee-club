
import { Book } from "@/types/book";
import { useBookQuiz } from "./useBookQuiz";
import { useConfetti } from "./useConfetti";
import { useReadingProgress } from "./useReadingProgress";
import { useValidationState } from "./useValidationState";
import { useQuizCompletion } from "./useQuizCompletion";
import { validateUserAndBook, checkBookCompletion, showValidationError } from "@/utils/validationUtils";
import { toast } from "sonner";
import { useStableCallback } from "./useStableCallback";
import { usePerformanceTracker } from "@/utils/performanceAudit";
import { withErrorHandling } from "@/utils/errorBoundaryUtils";
import { useCallback, useMemo } from "react";

export const useBookValidation = (
  book: Book | null,
  userId: string | null,
  onProgressUpdate?: (bookId: string) => void
) => {
  const { trackRender, trackApiCall, trackError } = usePerformanceTracker('useBookValidation');
  
  const {
    isValidating,
    setIsValidating,
    validationSegment,
    setValidationSegment,
    validationError,
    setValidationError,
    resetValidationState
  } = useValidationState();

  const { showConfetti } = useConfetti();
  const { forceRefresh } = useReadingProgress();

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
    handleLockExpire
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

  // Stabiliser la fonction de validation avec gestion d'erreur robuste
  const handleValidateReading = useStableCallback(
    withErrorHandling(async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      trackApiCall();
      setValidationError(null);
      
      // Validation préliminaire consolidée
      if (!validateUserAndBook(userId, book)) {
        trackError(new Error('User or book validation failed'));
        return;
      }
      
      if (book && checkBookCompletion(book)) {
        return;
      }
      
      try {
        setIsValidating(true);
        const nextSegment = (book!.chaptersRead || 0) + 1;
        
        console.log(`[useBookValidation] Setting validation segment to ${nextSegment} for book:`, book!.title);
        setValidationSegment(nextSegment);
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        setValidationError(errorMessage);
        showValidationError(error, "de la préparation de la validation");
        trackError(error as Error);
      } finally {
        setIsValidating(false);
      }
    }, 'useBookValidation.handleValidateReading')
  );

  // Optimiser la confirmation de validation
  const handleValidationConfirm = useStableCallback(
    withErrorHandling(async () => {
      console.log(`[useBookValidation] handleValidationConfirm called with segment:`, validationSegment);
      
      trackApiCall();
      
      if (!validateUserAndBook(userId, book)) {
        trackError(new Error('User or book validation failed in confirm'));
        return;
      }
      
      // Calcul sécurisé du segment avec fallback
      let segmentToValidate = validationSegment;
      if (!segmentToValidate && book) {
        segmentToValidate = (book.chaptersRead || 0) + 1;
        console.log(`[useBookValidation] Recalculated segment: ${segmentToValidate}`);
        setValidationSegment(segmentToValidate);
      }
      
      if (!segmentToValidate) {
        const error = new Error(`No segment to validate for book: ${book?.title}`);
        trackError(error);
        toast.error("Impossible de déterminer le segment à valider", { duration: 3000 });
        return;
      }

      try {
        setIsValidating(true);
        console.log(`[useBookValidation] Preparing question for segment ${segmentToValidate}`);
        await prepareAndShowQuestion(segmentToValidate);
        
        // Refresh immédiat pour éviter les états incohérents
        forceRefresh();
      } catch (error: any) {
        console.error("Erreur lors de la préparation de la validation:", error);
        trackError(error);
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

  // Mémoriser les valeurs de retour pour éviter les re-rendus
  const returnValue = useMemo(() => ({
    isValidating,
    showQuiz,
    setShowQuiz,
    quizChapter,
    validationSegment,
    setValidationSegment,
    currentQuestion,
    showSuccessMessage,
    setShowSuccessMessage,
    handleValidateReading,
    prepareAndShowQuestion,
    handleQuizComplete,
    handleValidationConfirm,
    showConfetti,
    validationError,
    isLocked,
    remainingLockTime,
    handleLockExpire,
    newBadges,
    forceRefresh
  }), [
    isValidating,
    showQuiz,
    setShowQuiz,
    quizChapter,
    validationSegment,
    setValidationSegment,
    currentQuestion,
    showSuccessMessage,
    setShowSuccessMessage,
    handleValidateReading,
    prepareAndShowQuestion,
    handleQuizComplete,
    handleValidationConfirm,
    showConfetti,
    validationError,
    isLocked,
    remainingLockTime,
    handleLockExpire,
    newBadges,
    forceRefresh
  ]);

  trackRender();
  
  return returnValue;
};
