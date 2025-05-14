
import { supabase } from "@/integrations/supabase/client";
import { ReadingQuestion } from "@/types/reading";
import { toast } from "@/hooks/use-toast";

// Fonction utilitaire pour convertir un UUID de livre en slug
const convertBookIdToSlug = async (bookId: string): Promise<string | null> => {
  if (!bookId) {
    console.error('BookId est nul ou non défini');
    return null;
  }
  
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
  if (!bookId) {
    console.error('BookId est nul ou non défini');
    return null;
  }

  console.log(`Fetching question for book ID ${bookId}, segment ${segment}`);
  
  try {
    // Convertir l'UUID du livre en slug
    const bookSlug = await convertBookIdToSlug(bookId);
    
    if (!bookSlug) {
      console.error(`Unable to convert book ID ${bookId} to slug`);
      return null;
    }
    
    // S'assurer que segment est au moins 1
    const validSegment = Math.max(1, segment);
    
    console.log(`Querying Supabase for book slug ${bookSlug}, segment ${validSegment}`);
    
    // Utiliser le slug pour interroger la table reading_questions
    const { data, error } = await supabase
      .from('reading_questions')
      .select('*')
      .eq('book_slug', bookSlug)
      .eq('segment', validSegment);

    if (error) {
      console.error('Error fetching question from Supabase:', error);
      toast({
        title: "Erreur de chargement",
        description: "Impossible de charger la question pour ce segment",
        variant: "destructive",
      });
      return null;
    }

    // Si nous avons trouvé des questions, retourner la première
    if (data && data.length > 0) {
      console.log(`Found ${data.length} questions, returning the first one:`, data[0]);
      return data[0];
    }

    // Si aucune question n'a été trouvée, journaliser et retourner null
    console.warn(`No question found in Supabase for book slug ${bookSlug}, segment ${validSegment}`);
    return null;
  } catch (error) {
    console.error('Exception fetching question from Supabase:', error);
    toast({
      title: "Erreur inattendue",
      description: "Une erreur est survenue lors du chargement de la question",
      variant: "destructive",
    });
    return null;
  }
};

// Cette fonction n'est utilisée que lorsqu'aucune question n'est trouvée dans Supabase
export const getFallbackQuestion = (): ReadingQuestion => ({
  id: 'fallback',
  book_slug: '',
  segment: 1,
  question: "Quel est l'élément principal de ce passage ?",
  answer: "libre" // Cela signifie que n'importe quelle réponse sera acceptée
});

// Fonction pour vérifier si un segment a déjà été validé
export const isSegmentAlreadyValidated = async (
  userId: string, 
  bookId: string, 
  segment: number
): Promise<boolean> => {
  if (!userId || !bookId) {
    console.error('UserId ou BookId est nul ou non défini');
    return false;
  }

  console.log(`Checking if segment ${segment} is already validated for book ${bookId} by user ${userId}`);
  
  try {
    // S'assurer que segment est au moins 1
    const validSegment = Math.max(1, segment);
    
    const { data, error } = await supabase
      .from('reading_validations')
      .select('id')
      .eq('user_id', userId)
      .eq('book_id', bookId)
      .eq('segment', validSegment)
      .maybeSingle();
      
    if (error) {
      console.error('Error checking segment validation:', error);
      return false;
    }
    
    const isValidated = !!data;
    console.log(`Segment ${validSegment} validation status:`, isValidated ? 'already validated' : 'not validated yet');
    return isValidated;
  } catch (error) {
    console.error('Exception checking segment validation:', error);
    return false;
  }
};
