import { useState, useRef, useCallback } from 'react';
import { toast } from "sonner";
import { validateReadingSegmentBeta } from "@/services/reading/validationServiceBeta";
import { supabase } from "@/integrations/supabase/client";

interface UseBookValidationOptions {
  bookId: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useBookValidation({ bookId, onSuccess, onError }: UseBookValidationOptions) {
  const [isValidating, setIsValidating] = useState(false);
  const inFlightRef = useRef(false);

  const handleQuizComplete = useCallback(async (
    correct: boolean,
    useJoker: boolean = false
  ) => {
    console.log("📞 handleQuizComplete called:", { bookId, correct, useJoker });

    if (inFlightRef.current) {
      console.log("🚫 Already validating, skipping");
      return;
    }

    // Récupérer les infos nécessaires depuis le contexte
    const questionId = sessionStorage.getItem('current_question_id');
    const answer = sessionStorage.getItem('current_answer') || 'validated';
    
    if (!questionId) {
      console.error("❌ No question ID in context");
      return;
    }

    inFlightRef.current = true;
    setIsValidating(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) {
        throw new Error("Not authenticated");
      }

      const result = await validateReadingSegmentBeta({
        bookId,
        questionId,
        answer,
        userId: user.id,
        usedJoker: useJoker,
        correct
      });

      console.log("✅ Validation success:", result);

      if (correct) {
        toast.success("Bravo ! Segment validé avec succès");
      }

      onSuccess?.();

    } catch (error) {
      console.error("❌ Validation error:", error);
      toast.error("Impossible de valider le segment");
      onError?.(error instanceof Error ? error : new Error("Unknown error"));
    } finally {
      inFlightRef.current = false;
      setIsValidating(false);
    }
  }, [bookId, onSuccess, onError]);

  return {
    handleQuizComplete,
    isValidating
  };
}

// Export wrapper pour compatibilité
export function handleQuizCompleteWrapper(params: { correct: boolean; useJoker?: boolean }) {
  console.log("📞 handleQuizCompleteWrapper called:", params);
  
  // Stocker temporairement les params pour le hook
  sessionStorage.setItem('quiz_result', JSON.stringify(params));
  
  // Trigger un event custom que les composants peuvent écouter
  window.dispatchEvent(new CustomEvent('quiz-complete', { detail: params }));
}