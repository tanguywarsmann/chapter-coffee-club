import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export function useBookValidation({ bookId, onSuccess }) {
  const handleQuizComplete = async (correct, useJoker = false) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Appel direct RPC
      const { error } = await supabase.rpc("force_validate_segment_beta", {
        p_book_id: bookId,
        p_question_id: "00000000-0000-0000-0000-000000000001",
        p_answer: "test",
        p_user_id: user.id,
        p_used_joker: useJoker,
        p_correct: correct
      });

      if (!error) {
        toast.success("Validé!");
        onSuccess?.();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return { handleQuizComplete, isValidating: false };
}

export function handleQuizCompleteWrapper(params) {
  console.log("Wrapper called:", params);
}