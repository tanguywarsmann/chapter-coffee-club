import { useState } from "react";
import { toast } from "sonner";
import { Book } from "@/types/book";
import { ReadingQuestion } from "@/types/reading";
import { getQuestionForBookSegment, isSegmentAlreadyValidated } from "@/services/questionService";
import { validateReading } from "@/services/reading/validationService";
import { checkValidationLock } from "@/services/validation/lockService";

export const useBookQuiz = (
  book: Book | null,
  userId: string | null,
  onProgressUpdate?: (bookId: string) => void
) => {
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizChapter, setQuizChapter] = useState<number>(0);
  const [currentQuestion, setCurrentQuestion] = useState<ReadingQuestion | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [remainingLockTime, setRemainingLockTime] = useState<number | null>(null);

  const handleLockExpire = () => {
    setIsLocked(false);
    setRemainingLockTime(null);
  };

  const prepareAndShowQuestion = async (segment: number) => {
    if (!userId || !book || !book.id) {
      throw new Error("User or book information missing");
    }

    try {
      setIsValidating(true);

      // Check if user is locked from validating this segment
      const lockCheck = await checkValidationLock(userId, book.id, segment);
      
      if (lockCheck.isLocked && lockCheck.remainingTime !== null) {
        setIsLocked(true);
        setRemainingLockTime(lockCheck.remainingTime);
        return;
      }

      // Check if segment is already validated
      const alreadyValidated = await isSegmentAlreadyValidated(
        userId, 
        book.id, 
        segment
      );

      if (alreadyValidated) {
        toast.info("Ce segment a déjà été validé");
        return;
      }

      // Get question for this segment
      const question = await getQuestionForBookSegment(book.id, segment);

      if (question) {
        setCurrentQuestion(question);
      } else {
        // Fallback for when no question exists
        setCurrentQuestion({
          id: `fallback-${book.id}-${segment}`,
          book_slug: book.slug,
          segment: segment,
          question: "Avez-vous bien lu ce segment ?",
          answer: "oui"
        });
      }

      setQuizChapter(segment);
      setShowQuiz(true);
    } catch (error) {
      console.error("Error preparing question:", error);
      toast.error("Erreur lors de la préparation du quiz");
      throw error;
    } finally {
      setIsValidating(false);
    }
  };

  const handleQuizComplete = async (correct: boolean, useJoker: boolean = false) => {
    if (!userId || !book || !book.id) {
      toast.error("Information utilisateur ou livre manquante");
      return;
    }

    try {
      setIsValidating(true);

      if (correct || useJoker) {
        // Validate reading segment
        const result = await validateReading({
          user_id: userId,
          book_id: book.id,
          segment: quizChapter,
          correct: useJoker ? true : correct, // Joker simulates a correct answer
          used_joker: useJoker
        });

        if (useJoker) {
          toast.success("Segment validé grâce à un Joker !");
        }

        // Close quiz modal
        setShowQuiz(false);

        // Show success message
        setShowSuccessMessage(true);

        // Update parent component if needed
        if (onProgressUpdate) {
          onProgressUpdate(book.id);
        }
        
        // Return the result including any new badges
        return result;
      } else {
        // Handle incorrect answer without joker
        setShowQuiz(false);
        toast.error("Réponse incorrecte. Essayez de relire le passage.");
        return { canUseJoker: true };
      }
    } catch (error) {
      console.error("Error completing quiz:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast.error(`Erreur lors de la validation : ${errorMessage.substring(0, 100)}`);
      throw error;
    } finally {
      setIsValidating(false);
    }
  };

  return {
    showQuiz,
    setShowQuiz,
    quizChapter,
    currentQuestion,
    showSuccessMessage,
    setShowSuccessMessage,
    isValidating,
    prepareAndShowQuestion,
    handleQuizComplete,
    isLocked,
    remainingLockTime,
    handleLockExpire
  };
};
