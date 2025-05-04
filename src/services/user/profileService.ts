
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Follow a user
 * @param targetUserId The user ID to follow
 */
export async function followUser(targetUserId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('followers')
      .insert({
        follower_id: supabase.auth.getSession().then(({ data }) => data.session?.user?.id),
        following_id: targetUserId
      });

    if (error) throw error;
  } catch (error: any) {
    console.error("Error following user:", error);
    throw new Error(error.message || "Could not follow user");
  }
}

/**
 * Unfollow a user
 * @param targetUserId The user ID to unfollow
 */
export async function unfollowUser(targetUserId: string): Promise<void> {
  try {
    const { data: session } = await supabase.auth.getSession();
    const userId = session.session?.user?.id;
    
    if (!userId) throw new Error("User not authenticated");

    const { error } = await supabase
      .from('followers')
      .delete()
      .match({
        follower_id: userId,
        following_id: targetUserId
      });

    if (error) throw error;
  } catch (error: any) {
    console.error("Error unfollowing user:", error);
    throw new Error(error.message || "Could not unfollow user");
  }
}

/**
 * Check if current user is following another user
 * @param userId The user ID to check
 * @returns Boolean indicating if following the user
 */
export async function isFollowing(userId: string): Promise<boolean> {
  try {
    const { data: session } = await supabase.auth.getSession();
    const currentUserId = session.session?.user?.id;
    
    if (!currentUserId) return false;

    const { data, error } = await supabase
      .from('followers')
      .select('id')
      .match({
        follower_id: currentUserId,
        following_id: userId
      })
      .maybeSingle();

    if (error) throw error;
    return !!data;
  } catch (error: any) {
    console.error("Error checking follow status:", error);
    return false;
  }
}

/**
 * Get follower counts for a user
 * @param userId The user ID to get counts for
 * @returns Object with followers and following counts
 */
export async function getFollowerCounts(userId: string): Promise<{ followers: number, following: number }> {
  try {
    // Get followers count (people who follow this user)
    const { data: followers, error: followersError } = await supabase
      .from('followers')
      .select('id', { count: 'exact' })
      .eq('following_id', userId);
    
    if (followersError) throw followersError;
    
    // Get following count (people this user follows)
    const { data: following, error: followingError } = await supabase
      .from('followers')
      .select('id', { count: 'exact' })
      .eq('follower_id', userId);
    
    if (followingError) throw followingError;
    
    return {
      followers: followers.length,
      following: following.length
    };
  } catch (error: any) {
    console.error("Error getting follower counts:", error);
    return { followers: 0, following: 0 };
  }
}

/**
 * Get user info by ID
 */
export async function getUserInfo(userId: string) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error("Error fetching user info:", error);
    return null;
  }
}

export async function searchUsers(query: string, limit: number = 5) {
  try {
    // In a real app, this would search by name or other fields
    // For now we'll just get some recent profiles
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(limit);
      
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error("Error searching users:", error);
    return [];
  }
}
