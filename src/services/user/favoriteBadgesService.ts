
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/types/badge";
import { toast } from "sonner";
import { Database } from "@/integrations/supabase/types";

type UserFavoriteBadgeRecord = Database['public']['Tables']['user_favorite_badges']['Row'];
type BadgeRecord = Database['public']['Tables']['badges']['Row'];

/**
 * Récupère les badges favoris d'un utilisateur
 * @param userId ID de l'utilisateur
 * @returns Tableau d'identifiants de badges favoris
 */
export async function getFavoriteBadges(userId: string): Promise<string[]> {
  if (!userId) {
    console.error("ID utilisateur non fourni");
    return [];
  }
  
  try {
    const { data, error } = await supabase
      .from("user_favorite_badges")
      .select("badge_id")
      .eq("user_id", userId);
    
    if (error) {
      console.error("Error fetching favorite badges:", error);
      toast.error("Erreur de chargement des badges favoris");
      throw error;
    }
    
    return data.map(item => item.badge_id);
  } catch (error) {
    console.error("Error fetching favorite badges:", error);
    return [];
  }
}

/**
 * Récupère les badges favoris d'un utilisateur avec les données complètes de badge
 * @param userId ID de l'utilisateur
 * @returns Tableau d'objets Badge
 */
export async function getUserFavoriteBadges(userId: string): Promise<Badge[]> {
  if (!userId) {
    console.error("ID utilisateur non fourni");
    return [];
  }
  
  try {
    // Première requête: récupérer les ID des badges favoris
    const { data: favoriteData, error: favoriteError } = await supabase
      .from("user_favorite_badges")
      .select("badge_id")
      .eq("user_id", userId);
    
    if (favoriteError) {
      console.error("Error fetching favorite badge IDs:", favoriteError);
      toast.error("Erreur de chargement des identifiants des badges favoris");
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
      toast.error("Erreur de chargement des détails des badges");
      return [];
    }
    
    // Mapper les données sur le type Badge
    return (badgesData || []).map((badge: BadgeRecord) => ({
      id: badge.id,
      label: badge.label || "Badge",
      slug: badge.slug || "",
      description: badge.description || "",
      icon: badge.icon || "🏆",
      icon_url: badge.icon_url || "",
      color: badge.color || "yellow-300",
      rarity: (badge.rarity as 'common' | 'rare' | 'epic' | 'legendary') || "common"
    }));
  } catch (error) {
    console.error("Error fetching favorite badges:", error);
    toast.error("Erreur inattendue lors du chargement des badges favoris");
    return [];
  }
}

/**
 * Ajoute un badge aux favoris d'un utilisateur
 * @param userId ID de l'utilisateur
 * @param badgeId ID du badge
 * @returns Vrai si l'opération a réussi
 */
export async function addFavoriteBadge(userId: string, badgeId: string): Promise<boolean> {
  if (!userId || !badgeId) {
    console.error("ID utilisateur ou ID badge non fourni");
    toast.error("Paramètres invalides pour ajouter le badge favori");
    return false;
  }
  
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
 * Supprime un badge des favoris d'un utilisateur
 * @param userId ID de l'utilisateur
 * @param badgeId ID du badge
 * @returns Vrai si l'opération a réussi
 */
export async function removeFavoriteBadge(userId: string, badgeId: string): Promise<boolean> {
  if (!userId || !badgeId) {
    console.error("ID utilisateur ou ID badge non fourni");
    toast.error("Paramètres invalides pour retirer le badge favori");
    return false;
  }
  
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
 * Bascule le statut favori d'un badge
 * @param userId ID de l'utilisateur
 * @param badgeId ID du badge
 * @param currentFavorites Liste actuelle des IDs de badges favoris
 * @returns Liste mise à jour des IDs de badges favoris
 */
export async function toggleFavoriteBadge(
  userId: string, 
  badgeId: string, 
  currentFavorites: string[]
): Promise<string[]> {
  if (!userId || !badgeId) {
    console.error("ID utilisateur ou ID badge non fourni");
    toast.error("Paramètres invalides pour modifier les favoris");
    return currentFavorites;
  }
  
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
  
  return currentFavorites; // Retourner inchangé si l'opération a échoué
}
