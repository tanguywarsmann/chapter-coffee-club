
import { supabase } from "@/integrations/supabase/client";
import { ReadingProgress } from "@/types/reading";

// Helper to normalize user ID format
const normalizeUserId = (userId: string): string => {
  if (!userId) return "";
  
  try {
    // Check if it's a JSON string
    if (userId.startsWith('{') && userId.includes('}')) {
      const parsedUser = JSON.parse(userId);
      if (parsedUser.id) {
        // If we have a JSON object with id, use the id as the UUID
        return parsedUser.id;
      } else if (parsedUser.email) {
        // Fallback: If no id but we have email, use a hash of the email
        console.log('No id found in user object, using email hash:', parsedUser.email);
        return parsedUser.email.replace(/[^a-zA-Z0-9]/g, '');
      }
    }
    return userId;
  } catch (e) {
    console.error('Error normalizing user ID:', e);
    return userId;
  }
};

// Get all reading progress for a user
export const getUserReadingProgress = async (userId: string): Promise<ReadingProgress[]> => {
  const normalizedUserId = normalizeUserId(userId);
  console.log('Getting reading progress for normalized userId:', normalizedUserId);
  
  try {
    const { data, error } = await supabase
      .from('reading_progress')
      .select('*')
      .eq('user_id', normalizedUserId);

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
  const normalizedUserId = normalizeUserId(userId);
  console.log('Getting book progress for normalized userId:', normalizedUserId, 'bookId:', bookId);
  
  try {
    const { data, error } = await supabase
      .from('reading_progress')
      .select('*')
      .eq('user_id', normalizedUserId)
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
