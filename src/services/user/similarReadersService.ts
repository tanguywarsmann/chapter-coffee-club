
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types/user";
import { getDisplayName } from "@/services/user/userProfileService";

/**
 * Find users who are reading the same books as the current user
 * @param currentUserId The ID of the current user
 * @param limit Maximum number of similar users to return
 * @returns Array of user objects with similar reading interests
 */
export async function findSimilarReaders(currentUserId: string, limit: number = 3): Promise<User[]> {
  try {
    if (!currentUserId) return [];

    // First, get the books the current user is reading
    const { data: currentUserBooks, error: booksError } = await supabase
      .from('reading_progress')
      .select('book_id')
      .eq('user_id', currentUserId)
      .eq('status', 'in_progress');

    if (booksError || !currentUserBooks?.length) {
      console.error("Error fetching current user's books:", booksError);
      return [];
    }

    const bookIds = currentUserBooks.map(item => item.book_id);

    // Find other users who are reading any of these same books
    const { data: similarReaders, error: readersError } = await supabase
      .from('reading_progress')
      .select(`
        user_id
      `)
      .in('book_id', bookIds)
      .eq('status', 'in_progress')
      .neq('user_id', currentUserId)
      .limit(limit * 3); // Fetch more than needed to filter out duplicates

    if (readersError || !similarReaders) {
      console.error("Error finding similar readers:", readersError);
      return [];
    }

    // Get unique users by ID
    const uniqueUserIds = [...new Set(similarReaders.map(item => item.user_id))];
    
    // Fetch complete user profiles for these IDs
    const { data: usersData, error: usersError } = await supabase
      .from('profiles')
      .select('*')
      .in('id', uniqueUserIds)
      .limit(limit);

    if (usersError || !usersData) {
      console.error("Error fetching user profiles:", usersError);
      return [];
    }

    // Map the profiles to match the User type
    const users: User[] = usersData.map(profile => {
      const displayName = getDisplayName(profile.username, profile.email, profile.id);
      
      return {
        id: profile.id,
        name: displayName,
        email: profile.email || "",
        avatar: undefined, // No avatar available
        is_admin: profile.is_admin || false,
        username: profile.username
      };
    });

    return users;
  } catch (error) {
    console.error("Exception in findSimilarReaders:", error);
    return [];
  }
}
