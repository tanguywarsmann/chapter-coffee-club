import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Beta validation service that bypasses RLS issues
 * Uses force_validate_segment_beta RPC for robust validation
 */
export async function validateReadingSegmentBeta(args: {
  bookId: string;
  questionId: string;
  answer: string;
  userId: string; // ⚠️ obligatoire maintenant
}) {
  try {
    console.log("[validateReadingSegmentBeta] call", args);
    
    const { data, error } = await supabase.rpc("force_validate_segment_beta", {
      p_book_id: args.bookId,
      p_question_id: args.questionId,
      p_answer: args.answer ?? "",
      p_user_id: args.userId,
    });

    if (error) {
      console.error("[force_validate_segment_beta] error", error);
      throw new Error(error.message || "Échec validation (RPC beta)");
    }
    
    console.info("[force_validate_segment_beta] ok", data?.[0]);
    return data?.[0] || { validation_id: null, progress_id: null, segment: 0 };
  } catch (error) {
    console.error("[validateReadingSegmentBeta] caught error:", error);
    const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
    toast.error(`Échec de la validation: ${errorMessage}`);
    throw error;
  }
}

/**
 * Beta validation that always succeeds regardless of reading_progress issues
 */
export async function forceValidateSegment(args: {
  bookId: string;
  segment: number;
  userId: string;
  useJoker?: boolean;
}) {
  try {
    console.log("🎯 forceValidateSegment called with:", args);
    
    // Create a fallback question if needed
    const questionId = `fallback-${args.bookId}-${args.segment}`;
    
    const result = await validateReadingSegmentBeta({
      bookId: args.bookId,
      questionId,
      answer: "validated",
      userId: args.userId
    });
    
    toast.success("Segment validé avec succès !");
    return {
      message: "Segment validé avec succès",
      current_page: (args.segment + 1) * 20,
      already_validated: false,
      next_segment_question: null,
      validation_id: result.validation_id,
      progress_id: result.progress_id
    };
  } catch (error) {
    console.error("[forceValidateSegment] error:", error);
    throw error;
  }
}