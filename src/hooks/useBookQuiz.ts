import { useState } from "react";
import { toast } from "sonner";
import { mutate } from "swr";
import { Book } from "@/types/book";
import { ReadingQuestion } from "@/types/reading";
import { getQuestionForBookSegment, isSegmentAlreadyValidated } from "@/services/questionService";
import { validateReading } from "@/services/reading/validationService";
import { checkValidationLock } from "@/services/validation/lockService";
import { useJokerAtomically, getRemainingJokers } from "@/services/jokerService";

export const useBookQuiz = (
  book: Book | null,
  userId: string | null,
  onProgressUpdate?: (bookId: string) => void,
  isValidating: boolean = false,
  setIsValidating?: (value: boolean) => void
) => {
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizChapter, setQuizChapter] = useState<number>(0);
  const [currentQuestion, setCurrentQuestion] = useState<ReadingQuestion | null>(null);
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
        
        // Utiliser la fonction RPC atomique
        const jokerResult = await useJokerAtomically(book.id, userId, quizChapter);
        
        if (!jokerResult.success) {
          setShowQuiz(false);
          return { canUseJoker: false };
        }
        
        // Mettre à jour le compteur de jokers
        setJokersRemaining(jokerResult.jokersRemaining);
        
        // Invalider le cache SWR pour rafraîchir l'affichage des jokers
        mutate(['jokers-info', book.id]);
        mutate(['book-progress', book.id]);
        
        // Valider le segment avec le joker
        const result = await validateReading({
          user_id: userId,
          book_id: book.id,
          segment: quizChapter,
          correct: true, // Joker simule une réponse correcte
          used_joker: true
        });
        
        if (process.env.NODE_ENV === 'development') {
          console.log("✅ Validation avec joker réussie:", result);
        }
        toast.success("Segment validé grâce à un Joker !");
        
        // Fermer le quiz et afficher le message de succès
        setShowQuiz(false);
        setShowSuccessMessage(true);
        
        // Mettre à jour le parent si nécessaire
        if (onProgressUpdate) {
          onProgressUpdate(book.id);
        }
        
        return result;
      } else if (correct) {
        if (process.env.NODE_ENV === 'development') {
          console.log("✅ Réponse correcte sans joker");
        }
        
        // Validate reading segment normalement
        const result = await validateReading({
          user_id: userId,
          book_id: book.id,
          segment: quizChapter,
          correct: true,
          used_joker: false
        });

        if (process.env.NODE_ENV === 'development') {
          console.log("✅ Validation normale réussie:", result);
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
        if (process.env.NODE_ENV === 'development') {
          console.log("❌ Réponse incorrecte - pas de joker utilisé");
        }
        // Handle incorrect answer without joker
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
