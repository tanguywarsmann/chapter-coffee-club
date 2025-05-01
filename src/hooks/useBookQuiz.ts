
import { useState } from "react";
import { toast } from "sonner";
import { Book } from "@/types/book";
import { ReadingQuestion } from "@/types/reading";
import { getQuestionForBookSegment, getFallbackQuestion } from "@/services/questionService";
import { validateReading } from "@/services/reading/validationService";

export const useBookQuiz = (
  book: Book | null,
  userId: string | null,
  onProgressUpdate?: (bookId: string) => void
) => {
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizChapter, setQuizChapter] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState<ReadingQuestion | null>(null);

  const prepareAndShowQuestion = async (segment: number) => {
    if (!userId || !book) {
      toast.error("Vous devez être connecté pour valider votre lecture");
      return;
    }

    try {
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
      toast.error("Erreur lors de la préparation de la validation");
    }
  };

  const handleQuizComplete = async (passed: boolean) => {
    setShowQuiz(false);
    
    if (!passed) {
      toast.error("Essayez encore! Assurez-vous d'avoir bien lu le chapitre.");
      return;
    }

    if (!userId || !book) {
      toast.error("Informations d'utilisateur ou de livre manquantes");
      return;
    }
    
    try {
      // Validate this segment in Supabase
      const validationResult = await validateReading({
        user_id: userId,
        book_id: book.id,
        segment: quizChapter
      });
      
      console.log("Quiz completed, validation result:", validationResult);
      
      if (onProgressUpdate && book) {
        onProgressUpdate(book.id);
      }
      
      // Check if there is a next segment question
      if (!validationResult.already_validated && validationResult.next_segment_question) {
        await prepareAndShowQuestion(quizChapter + 1);
      }
    } catch (error) {
      console.error("Error during quiz completion:", error);
      toast.error("Erreur lors de la validation du quiz");
    }
  };

  return {
    showQuiz,
    setShowQuiz,
    quizChapter,
    currentQuestion,
    prepareAndShowQuestion,
    handleQuizComplete
  };
};
