
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Database } from "@/integrations/supabase/types";

type UserLevelRecord = Database['public']['Tables']['user_levels']['Row'];

/**
 * Structure représentant les informations de niveau d'un utilisateur
 */
export interface UserLevel {
  id?: string;
  user_id: string;
  xp: number;
  level: number;
  last_updated?: string;
}

/**
 * Calcule le niveau en fonction des points d'expérience
 */
export function getLevelFromXP(xp: number): number {
  if (xp >= 1000) return 5;
  if (xp >= 500) return 4;
  if (xp >= 250) return 3;
  if (xp >= 100) return 2;
  return 1;
}

/**
 * Calcule l'XP nécessaire pour le niveau suivant
 */
export function getXPForNextLevel(level: number): number {
  switch (level) {
    case 1: return 100;
    case 2: return 250;
    case 3: return 500;
    case 4: return 1000;
    default: return 0; // Au niveau 5, il n'y a plus de niveau suivant
  }
}

/**
 * Récupère les informations de niveau d'un utilisateur
 */
export async function getUserLevel(userId: string): Promise<UserLevel | null> {
  try {
    if (!userId) {
      console.error("getUserLevel: userId is required");
      return null;
    }

    const { data, error } = await supabase
      .from('user_levels')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error) {
      console.error("Erreur lors de la récupération du niveau utilisateur:", error);
      return null;
    }
    
    if (!data) {
      // Si l'utilisateur n'a pas encore d'entrée, on la crée
      return initializeUserLevel(userId);
    }
    
    return data as UserLevel;
  } catch (error) {
    console.error("Erreur lors de la récupération du niveau utilisateur:", error);
    return null;
  }
}

/**
 * Initialise une nouvelle entrée de niveau pour un utilisateur
 */
async function initializeUserLevel(userId: string): Promise<UserLevel | null> {
  try {
    const newLevel: UserLevel = {
      user_id: userId,
      xp: 0,
      level: 1
    };
    
    const { data, error } = await supabase
      .from('user_levels')
      .insert(newLevel)
      .select()
      .single();
    
    if (error) {
      console.error("Erreur lors de l'initialisation du niveau utilisateur:", error);
      return null;
    }
    
    console.log(`✅ Niveau utilisateur initialisé pour ${userId}`);
    return data as UserLevel;
  } catch (error) {
    console.error("Erreur lors de l'initialisation du niveau utilisateur:", error);
    return null;
  }
}

/**
 * Ajoute des points d'XP à un utilisateur
 */
export async function addXP(userId: string, amount: number): Promise<boolean> {
  try {
    if (!userId) {
      console.error("addXP: userId is required");
      return false;
    }
    
    if (amount <= 0) {
      console.log("addXP: amount must be positive");
      return false;
    }
    
    // ✅ Appeler la RPC atomique increment_user_xp
    const { data, error } = await supabase
      .rpc('increment_user_xp', {
        p_user_id: userId,
        p_amount: amount
      });
    
    if (error) {
      console.error("Erreur lors de l'ajout d'XP:", error);
      return false;
    }
    
    // data contient { old_level, new_level, new_xp, amount }
    const result = data as { old_level: number; new_level: number; new_xp: number; amount: number };
    
    console.log(`✅ XP ajouté: +${result.amount} XP pour ${userId} (Total: ${result.new_xp} XP, Niveau: ${result.new_level})`);
    
    // Notifier si l'utilisateur a gagné un niveau
    if (result.new_level > result.old_level) {
      toast.success(`Niveau supérieur ! Vous êtes maintenant niveau ${result.new_level}`, {
        duration: 5000,
      });
      console.log(`🎉 Niveau supérieur ! Utilisateur ${userId} est maintenant niveau ${result.new_level}`);
    }
    
    return true;
  } catch (error) {
    console.error("Erreur lors de l'ajout d'XP:", error);
    return false;
  }
}

/**
 * Récupère les statistiques de niveau pour l'affichage
 */
export async function getUserLevelStats(userId: string): Promise<{
  level: number;
  xp: number;
  xpForNextLevel: number;
  progressToNextLevel: number;
} | null> {
  try {
    const userLevel = await getUserLevel(userId);
    if (!userLevel) return null;

    const xpForNextLevel = getXPForNextLevel(userLevel.level);
    const currentLevelXP = userLevel.level > 1 ? getXPForNextLevel(userLevel.level - 1) : 0;
    const progressToNextLevel = xpForNextLevel > 0 ? 
      Math.min(100, ((userLevel.xp - currentLevelXP) / (xpForNextLevel - currentLevelXP)) * 100) : 100;

    return {
      level: userLevel.level,
      xp: userLevel.xp,
      xpForNextLevel,
      progressToNextLevel
    };
  } catch (error) {
    console.error("Erreur lors de la récupération des stats de niveau:", error);
    return null;
  }
}
