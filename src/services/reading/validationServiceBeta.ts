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

export async function validateReadingSegmentBeta(args: ValidateArgs): Promise<any> {
  console.log("[validateReadingSegmentBeta] Raw args:", args);
  
  if (!args.userId || !args.bookId || !args.questionId) {
    throw new Error("Missing required parameters");
  }
  
  // CRITICAL: Nettoyer le bookId du préfixe "fallback-"
  let cleanBookId = args.bookId;
  if (cleanBookId.startsWith('fallback-')) {
    cleanBookId = cleanBookId.replace('fallback-', '');
  }
  
  // Nettoyer aussi le questionId si nécessaire
  let cleanQuestionId = args.questionId;
  if (cleanQuestionId.startsWith('fallback-')) {
    cleanQuestionId = cleanQuestionId.replace('fallback-', '');
  }

  console.log("[validateReadingSegmentBeta] Clean IDs:", { cleanBookId, cleanQuestionId });

  try {
    const { data, error } = await supabase.rpc("force_validate_segment_beta", {
      p_book_id: cleanBookId,
      p_question_id: cleanQuestionId,
      p_answer: args.answer || "",
      p_user_id: args.userId,
      p_used_joker: Boolean(args.usedJoker),
      p_correct: args.correct !== false
    });

    if (error) {
      console.error("[RPC] Error:", error);
      throw new Error(`RPC error: ${error.message}`);
    }

    console.log("[validateReadingSegmentBeta] Success:", data);
    return data;
  } catch (err) {
    console.error("[validateReadingSegmentBeta] Exception:", err);
    throw err;
  }
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
    // Nettoyer le bookId du préfixe "fallback-" s'il existe
    let cleanBookId = args.bookId;
    if (cleanBookId.startsWith('fallback-')) {
      cleanBookId = cleanBookId.replace('fallback-', '');
    }
    
    // Create a fallback question if needed - SANS le préfixe fallback sur le bookId
    const questionId = `fallback-${cleanBookId}-${args.segment}`;
    
    const result = await validateReadingSegmentBeta({
      bookId: cleanBookId, // Utiliser l'ID nettoyé
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
      validation_id: result.validation_id || result.progress_id,
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