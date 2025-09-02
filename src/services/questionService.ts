import { supabase } from "@/integrations/supabase/client";
import { ReadingQuestion } from "@/types/reading";

export interface CorrectAnswerResult {
  correctAnswer: string;
  revealedAt: string;
  segment: number;
  bookId: string;
}

export async function getCorrectAnswerAfterJoker(params: {
  bookId?: string;
  bookSlug?: string;
  segment: number;
  questionId?: string;
  consume?: boolean; // default true
}): Promise<CorrectAnswerResult> {
  const { data, error } = await supabase.functions.invoke('joker-reveal', {
    body: {
      bookId: params.bookId,
      bookSlug: params.bookSlug,
      segment: params.segment,
      questionId: params.questionId,
      consume: params.consume ?? true
    }
  });

  if (error) {
    console.error('Joker reveal error:', error);
    throw new Error(error.message || 'Failed to reveal correct answer');
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  return data as CorrectAnswerResult;
}

export async function getQuestionForBookSegment(bookId: string, segment: number): Promise<ReadingQuestion | null> {
  try {
    const { data, error } = await supabase
      .from('reading_questions')
      .select('*')
      .eq('book_slug', bookId)
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