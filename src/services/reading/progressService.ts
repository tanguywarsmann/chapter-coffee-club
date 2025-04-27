
import { supabase } from "@/integrations/supabase/client";
import { ReadingProgress } from "@/types/reading";

// Get all reading progress for a user
export const getUserReadingProgress = async (userId: string): Promise<ReadingProgress[]> => {
  if (!userId) {
    console.error('Invalid user ID: empty string received');
    return [];
  }
  
  // Make sure we have a valid UUID
  const validUuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!validUuidPattern.test(userId)) {
    console.error('Invalid UUID format:', userId);
    return [];
  }
  
  console.log('[DIAGNOSTIQUE] Récupération de la progression pour userId:', userId);
  
  try {
    console.log('[DIAGNOSTIQUE] Envoi de la requête à Supabase pour reading_progress');
    const { data, error } = await supabase
      .from('reading_progress')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('[DIAGNOSTIQUE] Erreur lors de la récupération de la progression:', error);
      return [];
    }

    console.log('[DIAGNOSTIQUE] Progression récupérée:', data?.length || 0, 'entrées');
    console.log('[DIAGNOSTIQUE] Entrées de progression:', data);
    return (data || []).map(item => ({
      ...item,
      validations: []
    }));
  } catch (error) {
    console.error('[DIAGNOSTIQUE] Exception pendant la récupération de la progression:', error);
    return [];
  }
};

// Get reading progress for a specific book/user
export const getBookReadingProgress = async (userId: string, bookId: string): Promise<ReadingProgress | null> => {
  if (!userId) {
    console.error('Invalid user ID: empty string received');
    return null;
  }
  
  // Make sure we have a valid UUID
  const validUuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!validUuidPattern.test(userId)) {
    console.error('Invalid UUID format:', userId);
    return null;
  }
  
  console.log('[DIAGNOSTIQUE] Récupération de la progression du livre - userId:', userId, 'bookId:', bookId);
  
  try {
    const { data, error } = await supabase
      .from('reading_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('book_id', bookId)
      .maybeSingle();

    if (error) {
      console.error('[DIAGNOSTIQUE] Erreur lors de la récupération de la progression du livre:', error);
      return null;
    }

    console.log('[DIAGNOSTIQUE] Progression du livre récupérée:', data ? 'trouvée' : 'non trouvée');
    return data ? { ...data, validations: [] } : null;
  } catch (error) {
    console.error('[DIAGNOSTIQUE] Exception pendant la récupération de la progression du livre:', error);
    return null;
  }
};
