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
    if (process.env.NODE_ENV === 'development') {
      console.log("🎯 handleQuizComplete called with:", { correct, useJoker });
    }
    
    if (!userId || !book || !book.id) {
      toast.error("Information utilisateur ou livre manquante");
      return;
    }

    try {
      if (setIsValidating) setIsValidating(true);

      if (useJoker) {
        if (process.env.NODE_ENV === 'development') {
          console.log("🃏 Utilisation d'un joker pour le segment:", quizChapter);
        }
        setIsUsingJoker(true);
        
        // Use bypass validation - always succeeds
        const result = await forceValidateSegment({
          bookId: book.id,
          segment: quizChapter,
          userId,
          useJoker: true
        });
        
        // Update joker count via normal flow (optional - can be ignored if it fails)
        try {
          const expectedSegmentsSafe = Number(
            book?.expectedSegments ??
            book?.expected_segments ??
            book?.totalSegments ??
            book?.total_chapters ??
            0
          );
          
          const jokerResult = await useJokerAtomically(book.id, userId, quizChapter, expectedSegmentsSafe);
          if (jokerResult.success) {
            setJokersRemaining(jokerResult.jokersRemaining);
          }
        } catch (jokerError) {
          console.warn("Joker count update failed (non-critical):", jokerError);
        }
        
        // Invalidate cache
        mutate(['jokers-info', book.id]);
        mutate(['book-progress', book.id]);
        
        toast.success("Segment validé grâce à un Joker !");
        setShowQuiz(false);
        setShowSuccessMessage(true);
        
        if (onProgressUpdate) {
          onProgressUpdate(book.id);
        }
        
        return result;
      } else if (correct) {
        if (process.env.NODE_ENV === 'development') {
          console.log("✅ Réponse correcte sans joker");
        }
        
        // Use bypass validation - always succeeds
        const result = await forceValidateSegment({
          bookId: book.id,
          segment: quizChapter,
          userId,
          useJoker: false
        });

        setShowQuiz(false);
        setShowSuccessMessage(true);

        if (onProgressUpdate) {
          onProgressUpdate(book.id);
        }
        
        return result;
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.log("❌ Réponse incorrecte - pas de joker utilisé");
        }
        setShowQuiz(false);
        toast.error("Réponse incorrecte. Essayez de relire le passage.");
        return { canUseJoker: jokersRemaining > 0 };
      }
    } catch (error) {
      console.error("❌ Error completing quiz:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast.error(`Erreur lors de la validation : ${errorMessage.substring(0, 100)}`);
      throw error;
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
