
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/types/badge";
import { toast } from "sonner";

/**
 * Get favorite badges for a user
 * @param userId User ID
 * @returns Array of favorite badge IDs
 */
export async function getFavoriteBadges(userId: string): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from("user_favorite_badges")
      .select("badge_id")
      .eq("user_id", userId);
    
    if (error) throw error;
    return data.map(item => item.badge_id);
  } catch (error) {
    console.error("Error fetching favorite badges:", error);
    return [];
  }
}

/**
 * Get user's favorite badges with complete badge data
 * @param userId User ID
 * @returns Array of badge objects
 */
export async function getUserFavoriteBadges(userId: string): Promise<Badge[]> {
  try {
    const { data, error } = await supabase
      .from("user_favorite_badges")
      .select(`
        badge_id,
        badges!inner(*)
      `)
      .eq("user_id", userId);
    
    if (error) {
      console.error("Error fetching favorite badges:", error);
      return [];
    }
    
    // Transform the joined data into Badge objects
    return (data || []).map(item => ({
      id: item.badges.id,
      label: item.badges.label,
      description: item.badges.description,
      slug: item.badges.slug,
      icon_url: item.badges.icon_url
    }));
  } catch (error) {
    console.error("Error fetching favorite badges:", error);
    return [];
  }
}

/**
 * Add a badge to user's favorites
 * @param userId User ID
 * @param badgeId Badge ID
 * @returns True if successful
 */
export async function addFavoriteBadge(userId: string, badgeId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("user_favorite_badges")
      .insert({ user_id: userId, badge_id: badgeId });
    
    if (error) {
      if (error.message.includes("Maximum of 3 favorite badges")) {
        toast.error("Maximum de 3 badges favoris atteint");
      } else {
        toast.error("Erreur lors de l'ajout du badge favori");
        console.error("Error adding favorite badge:", error);
      }
      return false;
    }
    
    toast.success("Badge ajouté aux favoris");
    return true;
  } catch (error) {
    console.error("Error adding favorite badge:", error);
    toast.error("Erreur lors de l'ajout du badge favori");
    return false;
  }
}

/**
 * Remove a badge from user's favorites
 * @param userId User ID
 * @param badgeId Badge ID
 * @returns True if successful
 */
export async function removeFavoriteBadge(userId: string, badgeId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("user_favorite_badges")
      .delete()
      .eq("user_id", userId)
      .eq("badge_id", badgeId);
    
    if (error) {
      toast.error("Erreur lors de la suppression du badge favori");
      console.error("Error removing favorite badge:", error);
      return false;
    }
    
    toast.success("Badge retiré des favoris");
    return true;
  } catch (error) {
    console.error("Error removing favorite badge:", error);
    toast.error("Erreur lors de la suppression du badge favori");
    return false;
  }
}

/**
 * Toggle favorite status of a badge
 * @param userId User ID
 * @param badgeId Badge ID
 * @param currentFavorites Current favorite badge IDs
 * @returns Updated array of favorite badge IDs
 */
export async function toggleFavoriteBadge(
  userId: string, 
  badgeId: string, 
  currentFavorites: string[]
): Promise<string[]> {
  const isCurrentlyFavorite = currentFavorites.includes(badgeId);
  
  let success;
  if (isCurrentlyFavorite) {
    success = await removeFavoriteBadge(userId, badgeId);
    if (success) {
      return currentFavorites.filter(id => id !== badgeId);
    }
  } else {
    success = await addFavoriteBadge(userId, badgeId);
    if (success) {
      return [...currentFavorites, badgeId];
    }
  }
  
  return currentFavorites; // Return unchanged if operation failed
}
