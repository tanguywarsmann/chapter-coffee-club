
import { supabase } from "@/integrations/supabase/client";
import { ReadingQuestion } from "@/types/reading";

export const getQuestionForBookSegment = async (
  bookId: string, 
  segment: number
): Promise<ReadingQuestion | null> => {
  console.log(`Fetching question for book ${bookId}, segment ${segment}`);
  
  try {
    // First, try by book_id (direct ID match)
    const { data: dataById, error: errorById } = await supabase
      .from('reading_questions')
      .select('*')
      .eq('book_slug', bookId)
      .eq('segment', segment)
      .maybeSingle();

    if (dataById) {
      console.log('Question found by book_id:', dataById);
      return dataById;
    }

    // If no error but no data, it means there's no question for this segment
    if (!errorById && !dataById) {
      console.warn(`No question found for book ${bookId}, segment ${segment}`);
      return null;
    }

    if (errorById) {
      console.error('Error fetching question by ID:', errorById);
    }
    
    // Fallback to using a generic question
    console.log('Using fallback question for segment', segment);
    return getFallbackQuestion();
  } catch (error) {
    console.error('Exception fetching question:', error);
    return getFallbackQuestion();
  }
};

export const getFallbackQuestion = (): ReadingQuestion => ({
  id: 'fallback',
  book_slug: '',
  segment: 0,
  question: "Quel est l'élément principal de ce passage ?",
  answer: "libre" // This means any answer will be accepted
});
