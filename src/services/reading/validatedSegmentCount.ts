
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

/**
 * FIX N+1: Batch fetch ALL validated segment counts for multiple books in ONE query
 * This eliminates the N+1 query problem when loading reading lists
 */
export async function getAllValidatedSegmentCounts(
  userId: string,
  bookIds: string[]
): Promise<Record<string, number>> {
  if (!userId || bookIds.length === 0) {
    return {};
  }

  try {
    console.log(`[getAllValidatedSegmentCounts] Fetching counts for ${bookIds.length} books in ONE query`);

    const { data, error } = await supabase
      .from('reading_validations')
      .select('book_id, segment')
      .eq('user_id', userId)
      .in('book_id', bookIds);

    if (error) {
      console.error('[getAllValidatedSegmentCounts] Error:', error);
      return {};
    }

    // Group validations by book_id and count
    const counts: Record<string, number> = {};

    if (data) {
      data.forEach(validation => {
        const bookId = validation.book_id;
        counts[bookId] = (counts[bookId] || 0) + 1;
      });
    }

    console.log(`[getAllValidatedSegmentCounts] Fetched counts for ${Object.keys(counts).length} books with validations`);

    return counts;
  } catch (error) {
    console.error('[getAllValidatedSegmentCounts] Exception:', error);
    return {};
  }
}
