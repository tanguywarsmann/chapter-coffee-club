import { useState } from "react";
import { toast } from "sonner";
import { mutate } from "swr";
import { Book } from "@/types/book";
import { PublicReadingQuestion } from "@/types/reading";
import { getQuestionForBookSegment, isSegmentAlreadyValidated } from "@/services/questionService";
import { forceValidateSegment } from "@/services/reading/validationServiceBeta";
import { checkValidationLock } from "@/services/validation/lockService";
import { getRemainingJokers, useJokerAtomically } from "@/services/jokerService";

export const useBookQuiz = (
  book: Book | null,
  userId: string | null,
  onProgressUpdate?: (bookId: string) => void,
  isValidating: boolean = false,
  setIsValidating?: (value: boolean) => void
) => {
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizChapter, setQuizChapter] = useState<number>(0);
  const [currentQuestion, setCurrentQuestion] = useState<PublicReadingQuestion | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [remainingLockTime, setRemainingLockTime] = useState<number | null>(null);
  const [isUsingJoker, setIsUsingJoker] = useState(false);
  const [jokersRemaining, setJokersRemaining] = useState<number>(0);

  const handleLockExpire = () => {
    setIsLocked(false);
    setRemainingLockTime(null);
  };

  const prepareAndShowQuestion = async (segment: number) => {
    if (!userId || !book || !book.id) {
      throw new Error("User or book information missing");
    }

    try {
      if (setIsValidating) setIsValidating(true);

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

      // Récupérer le nombre de jokers restants
      const remainingJokersCount = await getRemainingJokers(book.id, userId);
      setJokersRemaining(remainingJokersCount);

      // Get question for this segment using book slug
      const question = await getQuestionForBookSegment(book.slug || book.id, segment);

      if (question) {
        setCurrentQuestion(question);
      } else {
        console.log("❌ No question found for segment", segment);
        toast.error("Aucune question trouvée pour ce segment");
        return;
      }

      setQuizChapter(segment);
      setShowQuiz(true);
    } catch (error) {
      console.error("Error preparing question:", error);
      toast.error("Erreur lors de la préparation du quiz");
      throw error;
    } finally {
      if (setIsValidating) setIsValidating(false);
    }
  };

  const handleQuizComplete = async (correct: boolean, useJoker: boolean = false) => {
    console.log("🎯 useBookQuiz.handleQuizComplete called with:", { correct, useJoker });
    
    if (!userId || !book || !book.id) {
      toast.error("Information utilisateur ou livre manquante");
      return;
    }

    try {
      if (setIsValidating) setIsValidating(true);

      if (correct) {
        console.log("✅ Success - showing animations and updating UI");
        
        // Close quiz and show success with animations
        setShowQuiz(false);
        setShowSuccessMessage(true);
        
        // Force cache refresh for all relevant data (no duplicate validation calls)
        mutate(['jokers-info', book.id]);
        mutate(['book-progress', book.id]);
        mutate((key) => typeof key === 'string' && key.includes('reading-progress'), undefined, { revalidate: true });
        
        // Trigger parent updates
        if (onProgressUpdate) {
          onProgressUpdate(book.id);
        }
        
        return { success: true, newBadges: [] };
      } else {
        console.log("❌ Quiz failed - no additional validation needed");
        setShowQuiz(false);
        return { canUseJoker: jokersRemaining > 0 };
      }
    } catch (error) {
      console.error("❌ Error in quiz completion:", error);
      return { canUseJoker: jokersRemaining > 0 };
    } finally {
      if (setIsValidating) setIsValidating(false);
      setIsUsingJoker(false);
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
    handleLockExpire,
    isUsingJoker,
    jokersRemaining
  };
};
