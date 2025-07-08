import { supabase } from "@/integrations/supabase/client";
import { ReadingValidation } from "@/types/reading";

/**
 * Récupère l'historique des validations pour un utilisateur et un livre
 */
export async function getValidationHistory(userId: string, bookId: string): Promise<ReadingValidation[]> {
  try {
    const { data, error } = await supabase
      .from('reading_validations')
      .select('*')
      .eq('user_id', userId)
      .eq('book_id', bookId)
      .order('segment', { ascending: true });

    if (error) {
      console.error('[getValidationHistory] Error:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('[getValidationHistory] Exception:', error);
    return [];
  }
}