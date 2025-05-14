
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Database } from "@/integrations/supabase/types";

type ProfileRecord = Database['public']['Tables']['profiles']['Row'];
type FollowerRecord = Database['public']['Tables']['followers']['Row'];

/**
 * Suit un utilisateur
 * @param targetUserId L'ID de l'utilisateur à suivre
 */
export async function followUser(targetUserId: string): Promise<void> {
  try {
    // Récupérer d'abord l'ID utilisateur connecté
    const { data: session } = await supabase.auth.getSession();
    const currentUserId = session.session?.user?.id;

    if (!currentUserId) throw new Error("User not authenticated");

    // Insérer avec des valeurs string déjà résolues
    const { error } = await supabase
      .from('followers')
      .insert({
        follower_id: currentUserId,
        following_id: targetUserId
      });

    if (error) throw error;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Could not follow user";
    console.error("Error following user:", error);
    throw new Error(errorMessage);
  }
}

/**
 * Ne plus suivre un utilisateur
 * @param targetUserId L'ID de l'utilisateur à ne plus suivre
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
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Could not unfollow user";
    console.error("Error unfollowing user:", error);
    throw new Error(errorMessage);
  }
}

/**
 * Vérifie si l'utilisateur courant suit un autre utilisateur
 * @param userId L'ID de l'utilisateur à vérifier
 * @returns Booléen indiquant si l'utilisateur est suivi
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
  } catch (error) {
    console.error("Error checking follow status:", error);
    return false;
  }
}

interface FollowerCounts {
  followers: number;
  following: number;
}

/**
 * Récupère le nombre d'abonnés et d'abonnements pour un utilisateur
 * @param userId L'ID de l'utilisateur
 * @returns Objet contenant le nombre d'abonnés et d'abonnements
 */
export async function getFollowerCounts(userId: string): Promise<FollowerCounts> {
  try {
    // Récupérer le nombre d'abonnés (personnes qui suivent cet utilisateur)
    const { data: followers, error: followersError } = await supabase
      .from('followers')
      .select('id', { count: 'exact' })
      .eq('following_id', userId);
    
    if (followersError) throw followersError;
    
    // Récupérer le nombre d'abonnements (personnes que cet utilisateur suit)
    const { data: following, error: followingError } = await supabase
      .from('followers')
      .select('id', { count: 'exact' })
      .eq('follower_id', userId);
    
    if (followingError) throw followingError;
    
    return {
      followers: followers.length,
      following: following.length
    };
  } catch (error) {
    console.error("Error getting follower counts:", error);
    return { followers: 0, following: 0 };
  }
}

/**
 * Récupère les utilisateurs qui suivent un utilisateur spécifique
 * @param userId L'ID de l'utilisateur
 * @returns Tableau d'objets utilisateur
 */
export async function getFollowers(userId: string): Promise<ProfileRecord[]> {
  try {
    const { data: followerIds, error: followerError } = await supabase
      .from('followers')
      .select('follower_id')
      .eq('following_id', userId);
    
    if (followerError) throw followerError;
    
    if (!followerIds.length) return [];
    
    // Récupérer les informations de profil pour chaque abonné
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .in('id', followerIds.map(item => item.follower_id));
    
    if (profilesError) throw profilesError;
    
    return profiles || [];
  } catch (error) {
    console.error("Error getting followers:", error);
    return [];
  }
}

/**
 * Récupère les utilisateurs qu'un utilisateur spécifique suit
 * @param userId L'ID de l'utilisateur
 * @returns Tableau d'objets utilisateur
 */
export async function getFollowing(userId: string): Promise<ProfileRecord[]> {
  try {
    const { data: followingIds, error: followingError } = await supabase
      .from('followers')
      .select('following_id')
      .eq('follower_id', userId);
    
    if (followingError) throw followingError;
    
    if (!followingIds.length) return [];
    
    // Récupérer les informations de profil pour chaque utilisateur suivi
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .in('id', followingIds.map(item => item.following_id));
    
    if (profilesError) throw profilesError;
    
    return profiles || [];
  } catch (error) {
    console.error("Error getting following:", error);
    return [];
  }
}

/**
 * Récupère les informations d'un utilisateur par son ID
 * @param userId L'ID de l'utilisateur
 * @returns Objet utilisateur ou null
 */
export async function getUserInfo(userId: string): Promise<ProfileRecord | null> {
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

/**
 * Recherche des utilisateurs
 * @param query Requête de recherche
 * @param limit Limite de résultats
 * @returns Tableau d'objets utilisateur
 */
export async function searchUsers(query: string, limit: number = 5): Promise<ProfileRecord[]> {
  try {
    // Dans une application réelle, ceci rechercherait par nom ou d'autres champs
    // Pour l'instant, nous récupérons simplement quelques profils récents
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(limit);
      
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error("Error searching users:", error);
    return [];
  }
}
