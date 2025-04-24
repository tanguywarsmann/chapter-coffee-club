
import { useState } from "react";
import { toast } from "sonner";
import { Book } from "@/types/book";
import { ReadingQuestion } from "@/types/reading";
import { validateReading } from "@/services/reading/validationService";
import { getQuestionForBookSegment, getFallbackQuestion } from "@/services/questionService";
import { isSegmentAlreadyValidated } from "@/services/questionService";

export const useBookValidation = (
  book: Book,
  userId: string | null,
  onSuccess?: (bookId: string) => void
) => {
  const [isValidating, setIsValidating] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [validationSegment, setValidationSegment] = useState<number | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<ReadingQuestion | null>(null);

  const prepareAndShowQuestion = async (segment: number) => {
    if (!userId) {
      toast.error("Données de validation incomplètes");
      return;
    }
    setIsValidating(true);
    try {
      const segmentValidated = await isSegmentAlreadyValidated(userId, book.id, segment);
      if (segmentValidated) {
        toast.info(`Segment ${segment} déjà validé`);
        setValidationSegment(null);
        setIsValidating(false);
        return;
      }
      
      try {
        const question = await getQuestionForBookSegment(book.id, segment);
        if (question) {
          console.log("Question found for segment:", question);
          setCurrentQuestion(question);
          setShowQuizModal(true);
        } else {
          console.log("No question found, using fallback");
          const fallbackQuestion = getFallbackQuestion();
          setCurrentQuestion(fallbackQuestion);
          setShowQuizModal(true);
        }
      } catch (error) {
        console.error("Error getting question:", error);
        toast.error("Erreur lors de la récupération de la question: " + 
          (error instanceof Error ? error.message : String(error)));
        
        const fallbackQuestion = getFallbackQuestion();
        setCurrentQuestion(fallbackQuestion);
        setShowQuizModal(true);
      }
    } catch (error) {
      toast.error("Erreur lors de la préparation de la validation: " + 
        (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsValidating(false);
    }
  };

  const handleQuizComplete = async (passed: boolean) => {
    setShowQuizModal(false);
    if (!passed || !userId || !validationSegment) {
      if (!passed) {
        toast.error("Réponse incorrecte. Réessayez plus tard.");
      }
      setValidationSegment(null);
      return;
    }
    try {
      setIsValidating(true);
      const result = await validateReading({
        user_id: userId,
        book_id: book.id,
        segment: validationSegment
      });

      if (result.already_validated) {
        toast.info(`Segment ${validationSegment} déjà validé`);
      } else {
        toast.success(`Segment ${validationSegment} validé 🎉`);
      }

      if (onSuccess) {
        onSuccess(book.id);
      }
    } catch (error: any) {
      toast.error("Erreur lors de la validation: " + 
        (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsValidating(false);
      setValidationSegment(null);
    }
  };

  return {
    isValidating,
    showQuizModal,
    setShowQuizModal,
    validationSegment,
    setValidationSegment,
    currentQuestion,
    prepareAndShowQuestion,
    handleQuizComplete
  };
};
