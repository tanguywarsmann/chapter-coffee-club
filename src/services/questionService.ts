
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

// Nouvelle fonction pour vérifier si un segment a déjà été validé
export const isSegmentAlreadyValidated = async (
  userId: string, 
  bookId: string, 
  segment: number
): Promise<boolean> => {
  console.log(`Checking if segment ${segment} is already validated for book ${bookId} by user ${userId}`);
  
  try {
    const { data, error } = await supabase
      .from('reading_validations')
      .select('id')
      .eq('user_id', userId)
      .eq('book_id', bookId)
      .eq('segment', segment)
      .maybeSingle();
      
    if (error) {
      console.error('Error checking segment validation:', error);
      return false;
    }
    
    const isValidated = !!data;
    console.log(`Segment ${segment} validation status:`, isValidated ? 'already validated' : 'not validated yet');
    return isValidated;
  } catch (error) {
    console.error('Exception checking segment validation:', error);
    return false;
  }
};
