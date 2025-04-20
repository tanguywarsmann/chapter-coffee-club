
import { supabase } from "@/integrations/supabase/client";
import { ReadingQuestion } from "@/types/reading";

export const getQuestionForBookSegment = async (
  bookId: string, 
  segment: number
): Promise<ReadingQuestion | null> => {
  const { data, error } = await supabase
    .from('reading_questions')
    .select('*')
    .eq('book_id', bookId)
    .eq('segment', segment)
    .single();

  if (error || !data) {
    console.error('Error fetching question:', error);
    return null;
  }

  return data;
};

export const createQuestionForBookSegment = async (
  question: Omit<ReadingQuestion, 'id' | 'created_at'>
): Promise<ReadingQuestion | null> => {
  const { data, error } = await supabase
    .from('reading_questions')
    .insert(question)
    .select()
    .single();

  if (error || !data) {
    console.error('Error creating question:', error);
    return null;
  }

  return data;
};
