
import { supabase } from "@/integrations/supabase/client";
import { ReadingProgress } from "@/types/reading";

export const getUserReadingProgress = async (userId: string): Promise<ReadingProgress[]> => {
  if (!userId) {
    return [];
  }
  
  const validUuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!validUuidPattern.test(userId)) {
    return [];
  }
  
  try {
    const { data, error } = await supabase
      .from('reading_progress')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      return [];
    }

    return (data || []).map(item => ({
      ...item,
      totalChapters: item.totalChapters ?? item.expected_segments ?? 1,
      validations: []
    }));
    
  } catch (error) {
    return [];
  }
};

export const getBookReadingProgress = async (userId: string, bookId: string): Promise<ReadingProgress | null> => {
  if (!userId) {
    return null;
  }
  
  const validUuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!validUuidPattern.test(userId)) {
    return null;
  }
  
  try {
    const { data, error } = await supabase
      .from('reading_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('book_id', bookId)
      .maybeSingle();

    if (error) {
      return null;
    }

    return data ? { ...data, validations: [] } : null;
  } catch (error) {
    return null;
  }
};
