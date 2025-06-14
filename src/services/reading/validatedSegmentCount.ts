
import { supabase } from "@/integrations/supabase/client";

/**
 * Count number of segments validated for a user/book
 */
export async function getValidatedSegmentCount(userId: string, bookId: string): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('reading_validations')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('book_id', bookId);

    if (error) {
      console.error('[getValidatedSegmentCount] Error:', error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error('[getValidatedSegmentCount] Exception:', error);
    return 0;
  }
}
