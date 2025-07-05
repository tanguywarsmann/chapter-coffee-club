
import { useEffect, useState } from "react";
import { Book } from "@/types/book";
import { useBookValidation } from "./useBookValidation";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useCurrentBookValidation = (
  userId: string | null,
  book: Book | null,
  onProgressUpdate?: (bookId: string) => void
) => {
  const [currentUserId, setCurrentUserId] = useState<string | null>(userId);
  const [isLoadingUser, setIsLoadingUser] = useState<boolean>(!userId);
  
  useEffect(() => {
    // If userId is not provided, try to get it from Supabase
    if (!userId) {
      setIsLoadingUser(true);
      const fetchUser = async () => {
        try {
          const { data, error } = await supabase.auth.getUser();
          
          if (error) {
            toast.error("Session expirée. Veuillez vous reconnecter.");
            return;
          }
          
          if (data?.user?.id) {
            setCurrentUserId(data.user.id);
          }
        } catch (error) {
          toast.error("Impossible de récupérer les informations de session");
        } finally {
          setIsLoadingUser(false);
        }
      };
      
      fetchUser();
    } else {
      setCurrentUserId(userId);
      setIsLoadingUser(false);
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
  } = useBookValidation({
    book,
    userId: currentUserId,
    onProgressUpdate
  });

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
    showConfetti,
    isLoadingUser
  };
};
