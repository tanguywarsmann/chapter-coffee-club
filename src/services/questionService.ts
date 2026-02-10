import { supabase } from "@/integrations/supabase/client";
import { ReadingQuestion, PublicReadingQuestion } from "@/types/reading";

export interface CorrectAnswerResult {
  correctAnswer: string;
  revealedAt: string;
  segment: number;
  bookId: string;
}

type JokerRevealParams = {
  bookId: string;       // UUID
  questionId: string;   // UUID
  userId: string;       // UUID
  consume?: boolean;    // default true
};

export async function getCorrectAnswerAfterJoker(params: JokerRevealParams): Promise<string> {
  const { bookId, questionId, userId, consume = true } = params;

  if (!bookId || !questionId || !userId) {
    throw new Error("joker-reveal: missing bookId/questionId/userId");
  }

  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData?.session?.access_token;
  const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

  console.log('[JOKER SERVICE] Calling joker-reveal with params:', { bookId, questionId, userId, consume });

  const { data, error } = await supabase.functions.invoke("joker-reveal", {
    body: { bookId, questionId, userId, consume },
    headers,
  });

  console.log("[JOKER SERVICE] Response from edge function:", { data, error });
  if (error) throw new Error(error.message || "joker-reveal failed");
  if (!data?.answer) throw new Error("joker-reveal: no answer returned");

  return data.answer as string;
}

export async function getQuestionForBookSegment(bookSlug: string, segment: number): Promise<PublicReadingQuestion | null> {
  try {
    // Guard: only query reading_questions if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.warn('[questionService] No authenticated session — skipping reading_questions fetch');
      return null;
    }

    const { data, error } = await supabase
      .from('reading_questions')
      .select('id, book_slug, segment, question, book_id')
      .eq('book_slug', bookSlug)
      .eq('segment', segment)
      .maybeSingle();

    if (error) {
      console.error('Error fetching question:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getQuestionForBookSegment:', error);
    return null;
  }
}

export async function isSegmentAlreadyValidated(userId: string, bookId: string, segment: number): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('reading_validations')
      .select('id')
      .eq('user_id', userId)
      .eq('book_id', bookId)
      .eq('segment', segment)
      .maybeSingle();

    if (error) {
      console.error('Error checking validation:', error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error('Error in isSegmentAlreadyValidated:', error);
    return false;
  }
}
