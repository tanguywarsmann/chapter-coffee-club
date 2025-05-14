
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
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
 * @param xp Points d'expérience
 * @returns Niveau correspondant
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
 * @param level Niveau actuel
 * @returns Points d'XP requis pour le niveau suivant
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
 * @param userId ID de l'utilisateur
 * @returns Informations de niveau et d'XP
 */
export async function getUserLevel(userId: string): Promise<UserLevel | null> {
  try {
    const { data, error } = await supabase
      .from('user_levels')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error) throw error;
    
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
 * @param userId ID de l'utilisateur
 * @returns Nouvelle entrée de niveau
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
    
    if (error) throw error;
    return data as UserLevel;
  } catch (error) {
    console.error("Erreur lors de l'initialisation du niveau utilisateur:", error);
    return null;
  }
}

/**
 * Ajoute des points d'XP à un utilisateur
 * @param userId ID de l'utilisateur
 * @param amount Quantité d'XP à ajouter
 */
export async function addXP(userId: string, amount: number): Promise<void> {
  try {
    if (!userId) throw new Error("ID utilisateur non spécifié");
    if (amount <= 0) return; // Ne rien faire si le montant est négatif ou nul
    
    // Récupérer les données de niveau actuelles
    const currentLevel = await getUserLevel(userId);
    if (!currentLevel) return;
    
    // Calculer les nouvelles valeurs
    const newXP = currentLevel.xp + amount;
    const oldLevel = currentLevel.level;
    const newLevel = getLevelFromXP(newXP);
    
    // Mettre à jour la base de données
    const { error } = await supabase
      .from('user_levels')
      .update({ 
        xp: newXP, 
        level: newLevel, 
        last_updated: new Date().toISOString() 
      })
      .eq('user_id', userId);
    
    if (error) throw error;
    
    // Notifier si l'utilisateur a gagné un niveau
    if (newLevel > oldLevel) {
      toast({
        title: `Niveau supérieur ! Félicitations, vous êtes maintenant niveau ${newLevel}`,
        variant: "success"
      });
    }
  } catch (error) {
    console.error("Erreur lors de l'ajout d'XP:", error);
  }
}
