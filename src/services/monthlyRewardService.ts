
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/types/badge";
import { ReadingValidation } from "@/types/reading";
import { unlockBadge } from "@/services/badgeService";
import { Database } from "@/integrations/supabase/types";

type UserMonthlyReward = Database['public']['Tables']['user_monthly_rewards']['Row'];
type ReadingValidationRecord = Database['public']['Tables']['reading_validations']['Row'];

/**
 * Vérifie si un utilisateur a déjà reçu une récompense pour le mois en cours
 */
export async function hasMonthlyReward(userId: string, month: string): Promise<boolean> {
  if (!userId) return false;
  
  const { data, error } = await supabase
    .from('user_monthly_rewards')
    .select('id')
    .eq('user_id', userId)
    .eq('month', month)
    .maybeSingle();
  
  if (error) {
    console.error("Erreur lors de la vérification des récompenses mensuelles:", error);
    return false;
  }
  
  return !!data;
}

/**
 * Récupère les validations de lecture d'un utilisateur pour un mois spécifique
 */
export async function getMonthlyValidations(
  userId: string, 
  year: number, 
  month: number
): Promise<ReadingValidation[]> {
  if (!userId) return [];
  
  // Format the dates for the start and end of the month
  const startDate = new Date(year, month - 1, 1).toISOString();
  const endDate = new Date(year, month, 0).toISOString();
  
  const { data, error } = await supabase
    .from('reading_validations')
    .select('*')
    .eq('user_id', userId)
    .gte('validated_at', startDate)
    .lte('validated_at', endDate);
  
  if (error) {
    console.error("Erreur lors de la récupération des validations mensuelles:", error);
    return [];
  }
  
  return data || [];
}

/**
 * Crée un badge spécial pour la récompense mensuelle
 */
function createMonthlyRewardBadge(year: number, month: number): Badge {
  const monthName = new Date(year, month - 1, 1).toLocaleString('fr-FR', { month: 'long' });
  const formattedMonth = month.toString().padStart(2, '0');
  
  return {
    id: `gift-${year}-${formattedMonth}`,
    name: `Cadeau du mois : ${monthName} ${year}`,
    description: `Récompense pour avoir validé plus de 10 segments en ${monthName} ${year}`,
    icon: '🎁',
    color: 'amber-100',
    rarity: 'epic'
  };
}

/**
 * Enregistre une récompense mensuelle pour un utilisateur
 */
async function recordMonthlyReward(
  userId: string, 
  badgeId: string, 
  month: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('user_monthly_rewards')
      .insert({
        user_id: userId,
        badge_id: badgeId,
        month: month
      });
    
    if (error) {
      console.error("Erreur lors de l'enregistrement de la récompense mensuelle:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Erreur inattendue:", error);
    return false;
  }
}

/**
 * Vérifie et accorde une récompense mensuelle si l'utilisateur est éligible
 */
export async function checkAndGrantMonthlyReward(userId: string): Promise<Badge | null> {
  if (!userId) return null;
  
  try {
    // Définir le mois actuel
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1; // Les mois commencent à 0
    const monthStr = `${year}-${month.toString().padStart(2, '0')}`;
    
    // Vérifier si l'utilisateur a déjà reçu une récompense pour ce mois
    const alreadyRewarded = await hasMonthlyReward(userId, monthStr);
    
    if (alreadyRewarded) {
      return null;
    }
    
    // Récupérer les validations de ce mois
    const validations = await getMonthlyValidations(userId, year, month);
    
    // Vérifier s'il y a au moins 10 segments validés
    if (validations.length >= 10) {
      // Créer un badge pour la récompense mensuelle
      const badge = createMonthlyRewardBadge(year, month);
      
      // Enregistrer la récompense
      const recorded = await recordMonthlyReward(userId, badge.id, monthStr);
      
      if (recorded) {
        // Débloquer le badge
        await unlockBadge(userId, badge.id);
        
        // Retourner le badge pour affichage
        return badge;
      }
    }
    
    return null;
  } catch (error) {
    console.error("Erreur lors de la vérification des récompenses mensuelles:", error);
    return null;
  }
}
