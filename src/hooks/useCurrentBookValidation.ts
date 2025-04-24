
import { useState } from "react";
import { toast } from "sonner";
import { Book } from "@/types/book";
import { ReadingQuestion } from "@/types/reading";
import { getQuestionForBookSegment, getFallbackQuestion, isSegmentAlreadyValidated } from "@/services/questionService";
import { validateReading } from "@/services/reading";

export const useCurrentBookValidation = (
  userId: string | null,
  book: Book | null,
  onProgressUpdate?: (bookId: string) => void
) => {
  const [isValidating, setIsValidating] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizChapter, setQuizChapter] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState<ReadingQuestion | null>(null);

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
      
      const segmentValidated = await isSegmentAlreadyValidated(userId, book.id, nextSegment);
      
      if (segmentValidated) {
        toast.info(`Segment ${nextSegment} déjà validé`);
        setIsValidating(false);
        return;
      }
      
      const question = await getQuestionForBookSegment(book.id, nextSegment);
      
      if (question) {
        setCurrentQuestion(question);
        setQuizChapter(nextSegment);
        setShowQuiz(true);
      } else {
        const fallbackQuestion = getFallbackQuestion();
        setCurrentQuestion(fallbackQuestion);
        setQuizChapter(nextSegment);
        setShowQuiz(true);
      }
    } catch (error) {
      console.error("Error preparing validation:", error);
      toast.error("Erreur lors de la préparation de la validation: " + 
        (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsValidating(false);
    }
  };

  const handleQuizComplete = async (passed: boolean) => {
    setShowQuiz(false);
    if (!passed || !userId || !book) {
      if (!passed) {
        toast.error("Essayez encore! Assurez-vous d'avoir bien lu le chapitre.");
      }
      return;
    }
    
    try {
      setIsValidating(true);
      const nextSegment = book.chaptersRead + 1;
      
      const result = await validateReading({
        user_id: userId,
        book_id: book.id,
        segment: nextSegment
      });
      
      if (result.already_validated) {
        toast.info(`Segment ${nextSegment} déjà validé`);
      } else {
        toast.success(`Segment ${nextSegment} validé avec succès! 🎉`);
      }
      
      if (onProgressUpdate) {
        onProgressUpdate(book.id);
      }
      
    } catch (error: any) {
      toast.error("Erreur lors de la validation: " + 
        (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsValidating(false);
    }
  };

  return {
    isValidating,
    showQuiz,
    setShowQuiz,
    quizChapter,
    currentQuestion,
    handleValidateReading,
    handleQuizComplete
  };
};
