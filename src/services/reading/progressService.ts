
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
  
  console.log('Getting reading progress for userId:', userId);
  
  try {
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
  } catch (error) {
    console.error('Exception fetching reading progress:', error);
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
  
  console.log('Getting book progress for userId:', userId, 'bookId:', bookId);
  
  try {
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
  } catch (error) {
    console.error('Exception fetching book progress:', error);
    return null;
  }
};
