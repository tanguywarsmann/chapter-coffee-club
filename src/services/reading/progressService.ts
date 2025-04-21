
import { supabase } from "@/integrations/supabase/client";
import { ReadingProgress } from "@/types/reading";

// Get all reading progress for a user
export const getUserReadingProgress = async (userId: string): Promise<ReadingProgress[]> => {
  const { data, error } = await supabase
    .from('reading_progress')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching reading progress:', error);
    return [];
  }

  return (data || []).map(item => ({
    ...item,
    validations: []
  }));
};

// Get reading progress for a specific book/user
export const getBookReadingProgress = async (userId: string, bookId: string): Promise<ReadingProgress | null> => {
  const { data, error } = await supabase
    .from('reading_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('book_id', bookId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching book progress:', error);
    return null;
  }

  return data ? { ...data, validations: [] } : null;
};
