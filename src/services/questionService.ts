
import { supabase } from "@/integrations/supabase/client";
import { ReadingQuestion } from "@/types/reading";

// Fonction utilitaire pour convertir un UUID de livre en slug
const convertBookIdToSlug = async (bookId: string): Promise<string | null> => {
  console.log(`Converting book ID ${bookId} to slug`);
  
  try {
    // Récupérer le livre depuis la table books pour obtenir son slug
    const { data, error } = await supabase
      .from('books')
      .select('slug')
      .eq('id', bookId)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching book slug:', error);
      return null;
    }
    
    if (!data || !data.slug) {
      console.warn(`No slug found for book ID ${bookId}`);
      return null;
    }
    
    console.log(`Book ID ${bookId} converted to slug: ${data.slug}`);
    return data.slug;
  } catch (error) {
    console.error('Exception fetching book slug:', error);
    return null;
  }
};

export const getQuestionForBookSegment = async (
  bookId: string, 
  segment: number
): Promise<ReadingQuestion | null> => {
  console.log(`Fetching question for book ID ${bookId}, segment ${segment}`);
  
  try {
    // Convertir l'UUID du livre en slug
    const bookSlug = await convertBookIdToSlug(bookId);
    
    if (!bookSlug) {
      console.error(`Unable to convert book ID ${bookId} to slug`);
      return null;
    }
    
    console.log(`Querying Supabase for book slug ${bookSlug}, segment ${segment}`);
    
    // Utiliser le slug pour interroger la table reading_questions
    const { data, error } = await supabase
      .from('reading_questions')
      .select('*')
      .eq('book_slug', bookSlug)
      .eq('segment', segment)
      .maybeSingle();

    if (error) {
      console.error('Error fetching question from Supabase:', error);
      throw new Error(`Database error: ${error.message}`);
    }

    // Si nous avons trouvé une question dans la base de données, la retourner
    if (data) {
      console.log('Question found in Supabase:', data);
      return data;
    }

    // Si aucune question n'a été trouvée, journaliser et retourner null
    console.warn(`No question found in Supabase for book slug ${bookSlug}, segment ${segment}`);
    return null;
  } catch (error) {
    console.error('Exception fetching question from Supabase:', error);
    throw error;
  }
};

// Cette fonction n'est utilisée que lorsqu'aucune question n'est trouvée dans Supabase
export const getFallbackQuestion = (): ReadingQuestion => ({
  id: 'fallback',
  book_slug: '',
  segment: 0,
  question: "Quel est l'élément principal de ce passage ?",
  answer: "libre" // Cela signifie que n'importe quelle réponse sera acceptée
});
