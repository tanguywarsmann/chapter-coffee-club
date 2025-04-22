
import { supabase } from "@/integrations/supabase/client";
import { ReadingQuestion } from "@/types/reading";

export const getQuestionForBookSegment = async (
  bookId: string, 
  segment: number
): Promise<ReadingQuestion | null> => {
  console.log(`Fetching question for book ${bookId}, segment ${segment}`);
  
  try {
    // Query Supabase for a question matching the book_slug and segment
    const { data, error } = await supabase
      .from('reading_questions')
      .select('*')
      .eq('book_slug', bookId)
      .eq('segment', segment)
      .maybeSingle();

    if (error) {
      console.error('Error fetching question from Supabase:', error);
      throw new Error(`Database error: ${error.message}`);
    }

    // If we found a question in the database, return it
    if (data) {
      console.log('Question found in Supabase:', data);
      return data;
    }

    // If no question was found, log it and return null (no fallback here)
    console.warn(`No question found in Supabase for book ${bookId}, segment ${segment}`);
    return null;
  } catch (error) {
    console.error('Exception fetching question from Supabase:', error);
    throw error;
  }
};

// This function is only used when no question is found in Supabase
export const getFallbackQuestion = (): ReadingQuestion => ({
  id: 'fallback',
  book_slug: '',
  segment: 0,
  question: "Quel est l'élément principal de ce passage ?",
  answer: "libre" // Cela signifie que n'importe quelle réponse sera acceptée
});
