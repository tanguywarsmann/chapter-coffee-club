
import { useState } from "react";
import { toast } from "sonner";
import { Book } from "@/types/book";
import { ReadingQuestion } from "@/types/reading";
import { getQuestionForBookSegment, getFallbackQuestion } from "@/services/questionService";

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
      const question = await getQuestionForBookSegment(book.id, segment);
      
      if (question) {
        setCurrentQuestion(question);
        setQuizChapter(segment);
        setShowQuiz(true);
      } else {
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

    if (onProgressUpdate && book) {
      onProgressUpdate(book.id);
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
