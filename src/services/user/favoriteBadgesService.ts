
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
    // Première requête: récupérer les ID des badges favoris
    const { data: favoriteData, error: favoriteError } = await supabase
      .from("user_favorite_badges")
      .select("badge_id")
      .eq("user_id", userId);
    
    if (favoriteError) {
      console.error("Error fetching favorite badge IDs:", favoriteError);
      return [];
    }
    
    if (!favoriteData || favoriteData.length === 0) {
      return [];
    }
    
    // Extraire les IDs des badges
    const badgeIds = favoriteData.map(item => item.badge_id);
    
    // Seconde requête: récupérer les badges complets
    const { data: badgesData, error: badgesError } = await supabase
      .from("badges")
      .select("*")
      .in("id", badgeIds);
    
    if (badgesError) {
      console.error("Error fetching badges:", badgesError);
      return [];
    }
    
    // Mapper les données sur le type Badge
    return (badgesData || []).map(badge => ({
      id: badge.id,
      name: badge.name || badge.label || "Badge",
      description: badge.description || "",
      icon: badge.icon || "🏆",
      icon_url: badge.icon_url || "",
      slug: badge.slug || "",
      color: badge.color || "yellow-300",
      rarity: badge.rarity as 'common' | 'rare' | 'epic' | 'legendary' || "common"
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
