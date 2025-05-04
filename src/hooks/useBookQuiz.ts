
import { useState } from "react";
import { toast } from "sonner";
import { Book } from "@/types/book";
import { ReadingQuestion } from "@/types/reading";
import { getQuestionForBookSegment, getFallbackQuestion, isSegmentAlreadyValidated } from "@/services/questionService";
import { validateReading } from "@/services/reading/validationService";

export const useBookQuiz = (
  book: Book | null,
  userId: string | null,
  onProgressUpdate?: (bookId: string) => void
) => {
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizChapter, setQuizChapter] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState<ReadingQuestion | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const prepareAndShowQuestion = async (segment: number) => {
    if (!userId) {
      const error = "Vous devez être connecté pour valider votre lecture";
      setErrorMessage(error);
      toast.error(error, {
        description: "Connectez-vous pour enregistrer votre progression",
        duration: 5000
      });
      return;
    }

    if (!book) {
      const error = "Informations du livre manquantes";
      setErrorMessage(error);
      toast.error(error);
      return;
    }

    try {
      setIsLoading(true);
      setShowSuccessMessage(false);
      setErrorMessage(null);
      
      // First, check if segment is already validated
      const alreadyValidated = await isSegmentAlreadyValidated(userId, book.id, segment);
      
      if (alreadyValidated) {
        console.log("Segment already validated:", segment);
        toast.info("Ce segment a déjà été validé", {
          description: "Votre progression a bien été enregistrée",
          duration: 3000
        });
        
        if (onProgressUpdate) {
          onProgressUpdate(book.id);
        }
        
        return;
      }

      console.log("Preparing question for segment:", segment);
      const question = await getQuestionForBookSegment(book.id, segment);
      
      if (question) {
        console.log("Found question:", question);
        setCurrentQuestion(question);
        setQuizChapter(segment);
        setShowQuiz(true);
      } else {
        console.log("Using fallback question for segment:", segment);
        const fallbackQuestion = getFallbackQuestion();
        setCurrentQuestion(fallbackQuestion);
        setQuizChapter(segment);
        setShowQuiz(true);
      }
    } catch (error) {
      console.error("Error preparing question:", error);
      const errorMsg = error instanceof Error ? error.message : String(error);
      setErrorMessage(errorMsg);
      toast.error("Erreur lors de la préparation de la validation", {
        description: "Veuillez réessayer dans quelques instants",
        duration: 5000
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuizComplete = async (passed: boolean) => {
    if (!passed) {
      toast.error("Essayez encore!", {
        description: "Assurez-vous d'avoir bien lu le chapitre",
        duration: 4000
      });
      return;
    }

    if (!userId || !book) {
      toast.error("Informations d'utilisateur ou de livre manquantes", {
        description: "Impossible de valider votre progression",
        duration: 5000
      });
      return;
    }
    
    try {
      setIsLoading(true);
      setErrorMessage(null);
      
      // Validate this segment in Supabase
      const validationResult = await validateReading({
        user_id: userId,
        book_id: book.id,
        segment: quizChapter
      });
      
      console.log("Quiz completed, validation result:", validationResult);
      
      // Show success message instead of next question
      setShowSuccessMessage(true);
      toast.success("Chapitre validé !", {
        description: "Votre progression a été enregistrée",
        duration: 3000
      });
      
      if (onProgressUpdate && book) {
        onProgressUpdate(book.id);
      }
      
      // No longer automatically show next question
      // Instead, close the quiz modal and show success message
      setShowQuiz(false);
    } catch (error) {
      console.error("Error during quiz completion:", error);
      const errorMsg = error instanceof Error ? error.message : String(error);
      setErrorMessage(errorMsg);
      toast.error("Erreur lors de la validation du quiz", {
        description: "Veuillez réessayer dans quelques instants",
        duration: 5000
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    showQuiz,
    setShowQuiz,
    quizChapter,
    currentQuestion,
    isLoading,
    showSuccessMessage,
    setShowSuccessMessage,
    prepareAndShowQuestion,
    handleQuizComplete,
    errorMessage
  };
};
