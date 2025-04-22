
import { supabase } from "@/integrations/supabase/client";
import { ReadingQuestion } from "@/types/reading";

export const getQuestionForBookSegment = async (
  bookId: string, 
  segment: number
): Promise<ReadingQuestion | null> => {
  console.log(`Fetching question for book ${bookId}, segment ${segment}`);
  
  try {
    // Essayer d'abord par book_id (correspondance directe d'ID)
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

    // Si pas d'erreur mais pas de données, cela signifie qu'il n'y a pas de question pour ce segment
    if (!errorById && !dataById) {
      console.warn(`No question found for book ${bookId}, segment ${segment}`);
      return null;
    }

    if (errorById) {
      console.error('Error fetching question by ID:', errorById);
    }
    
    // Utiliser une question générique par défaut
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
  answer: "libre" // Cela signifie que n'importe quelle réponse sera acceptée
});
