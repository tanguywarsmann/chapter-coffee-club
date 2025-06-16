
import { Book } from "@/types/book";
import { useBookQuiz } from "./useBookQuiz";
import { useConfetti } from "./useConfetti";
import { useReadingProgress } from "./useReadingProgress";
import { useValidationState } from "./useValidationState";
import { useQuizCompletion } from "./useQuizCompletion";
import { validateUserAndBook, checkBookCompletion, showValidationError } from "@/utils/validationUtils";
import { toast } from "sonner";

export const useBookValidation = (
  book: Book | null,
  userId: string | null,
  onProgressUpdate?: (bookId: string) => void
) => {
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

  const handleValidateReading = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setValidationError(null);
    
    if (!validateUserAndBook(userId, book)) {
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
    } finally {
      setIsValidating(false);
    }
  };

  const handleValidationConfirm = async () => {
    console.log(`[useBookValidation] handleValidationConfirm called with segment:`, validationSegment);
    
    if (!validateUserAndBook(userId, book)) {
      return;
    }
    
    // Sécurité : recalculer le segment si nécessaire
    let segmentToValidate = validationSegment;
    if (!segmentToValidate && book) {
      segmentToValidate = (book.chaptersRead || 0) + 1;
      console.log(`[useBookValidation] Recalculated segment: ${segmentToValidate}`);
      setValidationSegment(segmentToValidate);
    }
    
    if (!segmentToValidate) {
      console.error(`[useBookValidation] No segment to validate for book:`, book?.title);
      toast.error("Impossible de déterminer le segment à valider", {
        duration: 3000
      });
      return;
    }

    try {
      setIsValidating(true);
      console.log(`[useBookValidation] Preparing question for segment ${segmentToValidate}`);
      await prepareAndShowQuestion(segmentToValidate);
      
      // Refresh progress data after validation attempt
      forceRefresh();
    } catch (error: any) {
      console.error("Erreur lors de la préparation de la validation:", error);
      toast.error("Erreur de validation", {
        description: error.message || "Impossible de préparer la validation",
        duration: 5000
      });
      
      // Même en cas d'erreur, essayer de rafraîchir les données
      forceRefresh();
    } finally {
      setIsValidating(false);
    }
  };

  return {
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
  };
};
