import { useState } from "react";
import { toast } from "sonner";
import { Book } from "@/types/book";
import { ReadingQuestion } from "@/types/reading";
import { getQuestionForBookSegment, isSegmentAlreadyValidated } from "@/services/questionService";
import { validateReading } from "@/services/reading/validationService";
import { checkValidationLock } from "@/services/validation/lockService";
import { useJokerAtomically, getRemainingJokers } from "@/services/jokerService";
import { invalidateAllJokersCache } from "@/hooks/useJokersInfo";

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

      // Récupérer le nombre de jokers restants
      const remainingJokersCount = await getRemainingJokers(book.id, userId);
      setJokersRemaining(remainingJokersCount);

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

      if (useJoker) {
        setIsUsingJoker(true);
        
        // Utiliser la fonction RPC atomique
        const jokerResult = await useJokerAtomically(book.id, userId, quizChapter);
        
        if (!jokerResult.success) {
          setShowQuiz(false);
          return { canUseJoker: false };
        }
        
        // Mettre à jour le compteur de jokers
        setJokersRemaining(jokerResult.jokersRemaining);
        
        // Valider le segment avec le joker
        const result = await validateReading({
          user_id: userId,
          book_id: book.id,
          segment: quizChapter,
          correct: true, // Joker simule une réponse correcte
          used_joker: true
        });
        
        toast.success("Segment validé grâce à un Joker !");
        
        // Invalider les caches SWR pour synchronisation
        await invalidateAllJokersCache(book.id);
        
        // Fermer le quiz et afficher le message de succès
        setShowQuiz(false);
        setShowSuccessMessage(true);
        
        // Mettre à jour le parent si nécessaire
        if (onProgressUpdate) {
          onProgressUpdate(book.id);
        }
        
        return result;
      } else if (correct) {
        // Validate reading segment normalement
        const result = await validateReading({
          user_id: userId,
          book_id: book.id,
          segment: quizChapter,
          correct: true,
          used_joker: false
        });

        // Invalider les caches SWR pour synchronisation
        await invalidateAllJokersCache(book.id);

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
        return { canUseJoker: jokersRemaining > 0 };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast.error(`Erreur lors de la validation : ${errorMessage.substring(0, 100)}`);
      throw error;
    } finally {
      // 🔑 Toujours exécuté, même en cas d'erreur ou de fermeture prématurée
      setIsValidating(false);
      setIsUsingJoker(false);
    }
  };

  // Méthode pour réinitialiser l'état (utile pour les changements de segment)
  const resetQuizState = () => {
    setIsValidating(false);
    setIsUsingJoker(false);
    setShowQuiz(false);
    setShowSuccessMessage(false);
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
    jokersRemaining,
    resetQuizState
  };
};
