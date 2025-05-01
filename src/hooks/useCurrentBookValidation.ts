
import { useEffect, useState } from "react";
import { Book } from "@/types/book";
import { useBookValidation } from "./useBookValidation";
import { supabase } from "@/integrations/supabase/client";

export const useCurrentBookValidation = (
  userId: string | null,
  book: Book | null,
  onProgressUpdate?: (bookId: string) => void
) => {
  const [currentUserId, setCurrentUserId] = useState<string | null>(userId);
  
  useEffect(() => {
    // If userId is not provided, try to get it from Supabase
    if (!userId) {
      const fetchUser = async () => {
        const { data } = await supabase.auth.getUser();
        if (data?.user?.id) {
          setCurrentUserId(data.user.id);
        }
      };
      
      fetchUser();
    } else {
      setCurrentUserId(userId);
    }
  }, [userId]);
  
  const {
    isValidating,
    showQuiz,
    setShowQuiz,
    quizChapter,
    validationSegment,
    setValidationSegment,
    currentQuestion,
    showSuccessMessage,
    setShowSuccessMessage,
    prepareAndShowQuestion,
    handleQuizComplete,
    handleValidationConfirm,
    handleValidateReading,
    showConfetti
  } = useBookValidation(book, currentUserId, onProgressUpdate);

  return {
    isValidating,
    showQuiz,
    setShowQuiz,
    quizChapter,
    validationSegment,
    setValidationSegment,
    currentQuestion,
    showSuccessMessage,
    setShowSuccessMessage,
    prepareAndShowQuestion,
    handleQuizComplete,
    handleValidationConfirm,
    handleValidateReading,
    showConfetti
  };
};
