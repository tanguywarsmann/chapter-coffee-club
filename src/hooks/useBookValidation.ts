import { useState } from "react";
import { toast } from "sonner";
import { Book } from "@/types/book";
import { useBookQuiz } from "./useBookQuiz";
import { validateReading } from "@/services/reading/validationService";
import { useConfetti } from "./useConfetti";
import { Badge } from "@/types/badge";
import { addXP } from "@/services/user/levelService";

export const useBookValidation = (
  book: Book | null,
  userId: string | null,
  onProgressUpdate?: (bookId: string) => void
) => {
  const [isValidating, setIsValidating] = useState(false);
  const [validationSegment, setValidationSegment] = useState<number | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [newBadges, setNewBadges] = useState<Badge[]>([]);
  const { showConfetti } = useConfetti();

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

  const handleValidateReading = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setValidationError(null);
    
    if (!userId) {
      toast.error("Vous devez être connecté pour valider votre lecture : Connectez-vous pour enregistrer votre progression.", {
        duration: 5000
      });
      return;
    }
    
    if (!book) {
      toast.error("Information du livre manquante : Impossible de valider sans les informations du livre", {
        duration: 3000
      });
      return;
    }
    
    if (book.chaptersRead >= book.totalChapters) {
      toast.success("Vous avez déjà terminé ce livre ! : Votre progression a été entièrement enregistrée.", {
        duration: 3000
      });
      return;
    }
    
    try {
      setIsValidating(true);
      const nextSegment = book.chaptersRead + 1;
      setValidationSegment(nextSegment);
    } catch (error) {
      console.error("Error preparing validation:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      setValidationError(errorMessage);
      toast.error(`Erreur lors de la préparation de la validation : ${errorMessage.substring(0, 100)}`, {
        duration: 5000
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleQuizComplete = async (correct: boolean) => {
    try {
      const result = await originalHandleQuizComplete(correct);
      
      // Check if there are any newly unlocked badges
      if (result?.newBadges && result.newBadges.length > 0) {
        setNewBadges(result.newBadges);
        
        // Ajouter des XP supplémentaires pour un streak (30 XP)
        if (userId && result.newBadges.some(badge => badge.id && badge.id.includes('streak'))) {
          await addXP(userId, 30);
        }
      } else {
        setNewBadges([]);
      }
      
      return result;
    } catch (error) {
      console.error("Error in quiz completion:", error);
      throw error;
    }
  };

  const handleValidationConfirm = async () => {
    if (!userId) {
      toast.error("Vous devez être connecté", {
        description: "Session expirée ou déconnectée",
        duration: 5000
      });
      return;
    }
    
    if (!book) {
      toast.error("Information du livre manquante", {
        duration: 3000
      });
      return;
    }
    
    if (!validationSegment) {
      toast.error("Segment de validation non spécifié", {
        duration: 3000
      });
      return;
    }

    try {
      setIsValidating(true);
      await prepareAndShowQuestion(validationSegment);
    } catch (error: any) {
      console.error("Erreur lors de la préparation de la validation:", error);
      toast.error("Erreur de validation", {
        description: error.message || "Impossible de préparer la validation",
        duration: 5000
      });
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
    newBadges
  };
};
