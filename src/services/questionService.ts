import { supabase } from "@/integrations/supabase/client";
import { ReadingQuestion, PublicReadingQuestion } from "@/types/reading";

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
  console.log('[JOKER SERVICE] Calling joker-reveal with params:', params);
  
  const { data, error } = await supabase.functions.invoke('joker-reveal', {
    body: {
      bookId: params.bookId,
      bookSlug: params.bookSlug,
      segment: params.segment,
      questionId: params.questionId,
      consume: params.consume ?? true
    }
  });

  console.log('[JOKER SERVICE] Response from edge function:', { data, error });

  if (error) {
    console.error('joker-reveal invoke error', error);
    throw new Error(error.message || 'Failed to reveal correct answer');
  }

  if (data?.error) {
    console.error('joker-reveal payload error', data);
    throw new Error(data.error);
  }

  // Log the joker recording status
  if (data?.validationSaved && data?.jokerRecorded) {
    console.log('✅ Joker successfully recorded in database');
  } else {
    console.warn('⚠️ Joker may not have been recorded properly:', {
      validationSaved: data?.validationSaved,
      jokerRecorded: data?.jokerRecorded,
      debugInfo: data?._debug
    });
  }

  return data as CorrectAnswerResult;
}

export async function getQuestionForBookSegment(bookSlug: string, segment: number): Promise<PublicReadingQuestion | null> {
  try {
    const { data, error } = await supabase
      .from('reading_questions_public')
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