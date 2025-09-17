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
      p_correct: args.correct ?? null // Laisser le serveur décider si null/undefined
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
 * Legacy function - DÉSACTIVÉ pour éviter les doubles appels
 */
export async function forceValidateSegment(args: {
  bookId: string;
  segment: number;
  userId: string;
  useJoker?: boolean;
}) {
  console.log("❌ forceValidateSegment called - THIS SHOULD NOT HAPPEN");
  throw new Error("forceValidateSegment is disabled - use validateReadingSegmentBeta directly");
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