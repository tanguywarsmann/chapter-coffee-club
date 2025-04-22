
import { supabase } from "@/integrations/supabase/client";
import { ReadingQuestion } from "@/types/reading";

export const getQuestionForBookSegment = async (
  bookId: string, 
  segment: number
): Promise<ReadingQuestion | null> => {
  const { data, error } = await supabase
    .from('reading_questions')
    .select('*')
    .eq('book_slug', bookId)
    .eq('segment', segment)
    .maybeSingle();

  if (error || !data) {
    console.error('Error fetching question:', error);
    return null;
  }

  return data;
};

export const getFallbackQuestion = (): ReadingQuestion => ({
  id: 'fallback',
  book_slug: '',
  segment: 0,
  question: "Quel est l'élément principal de ce passage ?",
  answer: "libre"
});

