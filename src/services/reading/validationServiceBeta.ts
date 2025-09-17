import { supabase } from "@/integrations/supabase/client";

export interface ValidateArgs {
  bookId: string;
  questionId: string;
  answer: string;
  userId: string;
  usedJoker?: boolean;
  correct?: boolean;
}

export interface ValidationSuccess {
  ok: true;
  validation_id: string;
  progress_id: string;
  validated_segment: number;
}

export interface ValidationError {
  ok: false;
  code?: string;
  message?: string;
}

export type ValidationResult = ValidationSuccess | ValidationError;

export async function validateReadingSegmentBeta(args: ValidateArgs): Promise<ValidationSuccess> {
  console.log("[validateReadingSegmentBeta] Starting:", args);

  if (!args.userId || !args.bookId || !args.questionId) {
    throw new Error("Missing required parameters");
  }

  const { data, error } = await supabase.rpc("force_validate_segment_beta", {
    p_book_id: args.bookId,
    p_question_id: args.questionId,
    p_answer: args.answer || "",
    p_user_id: args.userId,
    p_used_joker: Boolean(args.usedJoker),
    p_correct: args.correct !== false
  });

  if (error) {
    console.error("[RPC] Supabase error:", error);
    throw new Error(`RPC error: ${error.message}`);
  }

  const result = data as unknown as ValidationResult;

  if (!result?.ok) {
    const err = result as ValidationError;
    console.error("[RPC] Business error:", err);
    throw new Error(err?.message || `Validation failed (${err?.code || "UNKNOWN"})`);
  }

  console.log("[validateReadingSegmentBeta] Success:", result);
  return result as ValidationSuccess;
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

/**
 * Legacy function for backward compatibility
 * Uses the new robust RPC underneath
 */
export async function forceValidateSegment(args: {
  bookId: string;
  segment: number;
  userId: string;
  useJoker?: boolean;
}) {
  try {
    // Create a fallback question if needed
    const questionId = `fallback-${args.bookId}-${args.segment}`;
    
    const result = await validateReadingSegmentBeta({
      bookId: args.bookId,
      questionId,
      answer: "validated",
      userId: args.userId,
      usedJoker: args.useJoker
    });
    
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

export async function getUserProfile() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user?.id) return null;

  try {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .maybeSingle();
    return data;
  } catch {
    return null;
  }
}