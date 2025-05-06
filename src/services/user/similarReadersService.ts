
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

    // First, get the books the current user is reading (status = 'in_progress')
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
    console.log(`Found ${bookIds.length} books that user ${currentUserId} is currently reading`);

    // Find other users who are reading any of these same books (also 'in_progress')
    const { data: similarReaders, error: readersError } = await supabase
      .from('reading_progress')
      .select(`
        user_id,
        book_id
      `)
      .in('book_id', bookIds)
      .eq('status', 'in_progress')
      .neq('user_id', currentUserId); // Exclude the current user

    if (readersError || !similarReaders?.length) {
      console.log("No similar readers found:", readersError || "Empty result");
      return [];
    }

    console.log(`Found ${similarReaders.length} reading entries from other users`);

    // Group by user_id to count how many same books they're reading
    const userReadingCounts = similarReaders.reduce((acc: Record<string, { count: number, books: string[] }>, item) => {
      if (!acc[item.user_id]) {
        acc[item.user_id] = { count: 0, books: [] };
      }
      acc[item.user_id].count++;
      acc[item.user_id].books.push(item.book_id);
      return acc;
    }, {});

    // Sort users by the number of books they share with the current user (most similar first)
    const sortedUserIds = Object.keys(userReadingCounts).sort((a, b) => 
      userReadingCounts[b].count - userReadingCounts[a].count
    ).slice(0, limit);

    if (sortedUserIds.length === 0) {
      console.log("No users with similar reading found after sorting");
      return [];
    }

    // Fetch complete user profiles for these IDs from the profiles table
    const { data: usersData, error: usersError } = await supabase
      .from('profiles')
      .select('*')
      .in('id', sortedUserIds);

    if (usersError || !usersData?.length) {
      console.error("Error fetching user profiles:", usersError);
      return [];
    }

    // Map the profiles to match the User type with proper display names
    const users: User[] = usersData.map(profile => {
      const displayName = getDisplayName(profile.username, profile.email, profile.id);
      
      return {
        id: profile.id,
        name: displayName,
        email: profile.email || "",
        username: profile.username,
        is_admin: profile.is_admin || false,
      };
    });

    console.log(`Returning ${users.length} similar readers`);
    return users;
  } catch (error) {
    console.error("Exception in findSimilarReaders:", error);
    return [];
  }
}
