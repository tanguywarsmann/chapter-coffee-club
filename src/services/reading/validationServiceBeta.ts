import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type ValidateArgs = {
  bookId: string;
  questionId: string;
  answer: string;
  userId: string;
  usedJoker?: boolean;
  correct?: boolean;
};

type RpcRow = {
  validation_id: string;
  progress_id: string | null;
  validated_segment: number;
};

/**
 * Beta validation service with UPSERT - no more 409 conflicts
 * Uses force_validate_segment_beta RPC for robust validation
 */
export async function validateReadingSegmentBeta(args: ValidateArgs) {
  console.log("[validateReadingSegmentBeta] call", args);

  const { data, error } = await supabase.rpc("force_validate_segment_beta", {
    p_book_id: args.bookId,
    p_question_id: args.questionId,
    p_answer: args.answer ?? "",
    p_user_id: args.userId,          // ⚠️ obligatoire
    p_used_joker: !!args.usedJoker,
    p_correct: args.correct ?? true,
  });

  if (error) {
    console.error("[force_validate_segment_beta] error", error);
    // 🔎 Log complet pour 400: message + details + hint
    console.error("RPC error raw:", { message: error.message, details: (error as any).details, hint: (error as any).hint });
    throw new Error(error.message || "Échec validation (RPC beta)");
  }

  const row = (data?.[0] ?? null) as RpcRow | null;
  console.info("[force_validate_segment_beta] result", row);
  return row;
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
      validation_id: result?.validation_id || null,
      progress_id: result?.progress_id || null
    };
  } catch (error) {
    console.error("[forceValidateSegment] error:", error);
    throw error;
  }
}