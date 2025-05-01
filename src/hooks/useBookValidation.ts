
import { useState } from "react";
import { toast } from "sonner";
import { Book } from "@/types/book";
import { useBookQuiz } from "./useBookQuiz";
import { validateReading } from "@/services/reading/validationService";
import { useConfetti } from "./useConfetti";

export const useBookValidation = (
  book: Book | null,
  userId: string | null,
  onProgressUpdate?: (bookId: string) => void
) => {
  const [isValidating, setIsValidating] = useState(false);
  const [validationSegment, setValidationSegment] = useState<number | null>(null);
  const { showConfetti } = useConfetti();

  const {
    showQuiz,
    setShowQuiz,
    quizChapter,
    currentQuestion,
    prepareAndShowQuestion,
    handleQuizComplete
  } = useBookQuiz(book, userId, onProgressUpdate);

  const handleValidateReading = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!userId || !book) {
      toast.error("Vous devez être connecté pour valider votre lecture");
      return;
    }
    
    if (book.chaptersRead >= book.totalChapters) {
      toast.success("Vous avez déjà terminé ce livre !");
      return;
    }
    
    try {
      setIsValidating(true);
      const nextSegment = book.chaptersRead + 1;
      setValidationSegment(nextSegment);
    } catch (error) {
      console.error("Error preparing validation:", error);
      toast.error("Erreur lors de la préparation de la validation: " + 
        (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsValidating(false);
    }
  };

  const handleValidationConfirm = async () => {
    if (!userId || !book || !validationSegment) {
      toast.error("Informations manquantes pour la validation");
      return;
    }

    try {
      setIsValidating(true);
      
      // Before directly validating, check if there's a question to show
      await prepareAndShowQuestion(validationSegment);
      
      // If there's no question to show, we handle it in the prepareAndShowQuestion function
      // This means we won't immediately validate unless prepareAndShowQuestion decides to
      
      setValidationSegment(null);
    } catch (error) {
      console.error("Error in validation confirm:", error);
      toast.error("Erreur lors de la validation: " + 
        (error instanceof Error ? error.message : String(error)));
      setIsValidating(false);
      setValidationSegment(null);
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
    handleValidateReading,
    prepareAndShowQuestion,
    handleQuizComplete,
    handleValidationConfirm
  };
};
