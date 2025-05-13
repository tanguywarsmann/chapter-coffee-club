
import { Badge } from "@/types/badge";
import { ReadingValidation } from "@/types/reading";
import { supabase } from "@/integrations/supabase/client";

/**
 * Récupère les validations de lecture d'un utilisateur
 */
export const getUserReadingValidations = async (userId: string): Promise<ReadingValidation[]> => {
  if (!userId) return [];
  
  try {
    const { data, error } = await supabase
      .from('reading_validations')
      .select('*')
      .eq('user_id', userId)
      .order('validated_at', { ascending: true });
    
    if (error) {
      console.error('Error fetching reading validations:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Unexpected error fetching reading validations:', error);
    return [];
  }
};

/**
 * Vérifie si l'utilisateur a une série de jours consécutifs de lecture
 * @param validations Liste des validations de lecture
 * @param days Nombre de jours consécutifs à vérifier
 * @returns Un objet avec hasStreak et la date de fin si trouvée
 */
export const checkConsecutiveDaysStreak = (
  validations: ReadingValidation[], 
  days: number = 3
): { hasStreak: boolean, endDate?: string } => {
  if (!validations || validations.length < days) return { hasStreak: false };
  
  // Extraire les dates uniques de validation (une par jour)
  const uniqueDates = new Set<string>();
  
  for (const validation of validations) {
    const date = new Date(validation.validated_at || validation.date_validated || '').toISOString().split('T')[0];
    uniqueDates.add(date);
  }
  
  // Convertir en tableau et trier
  const sortedDates = Array.from(uniqueDates).sort();
  
  // Vérifier s'il y a le nombre de jours consécutifs requis
  if (sortedDates.length < days) return { hasStreak: false };
  
  for (let i = 0; i <= sortedDates.length - days; i++) {
    let isConsecutive = true;
    
    for (let j = 0; j < days - 1; j++) {
      const currentDay = new Date(sortedDates[i + j]);
      const nextDay = new Date(sortedDates[i + j + 1]);
      
      const diff = (nextDay.getTime() - currentDay.getTime()) / (1000 * 60 * 60 * 24);
      
      if (diff !== 1) {
        isConsecutive = false;
        break;
      }
    }
    
    if (isConsecutive) {
      return { 
        hasStreak: true, 
        endDate: sortedDates[i + days - 1] // Date du dernier jour
      };
    }
  }
  
  return { hasStreak: false };
};

/**
 * Crée un badge de série dynamique basé sur le nombre de jours
 */
export const createStreakBadge = (days: number, endDate: string): Badge | null => {
  const formattedDate = new Date(endDate).toLocaleDateString('fr-FR');
  
  if (days === 3) {
    return {
      id: "streak-3",
      name: "Série en cours 🔥",
      description: "Tu as lu 3 jours de suite sans t'arrêter",
      icon: "🔥",
      color: "orange-100",
      rarity: "rare",
      dateEarned: formattedDate
    };
  } 
  else if (days === 5) {
    return {
      id: "streak-5",
      name: "Série avancée 🔥🔥",
      description: "Tu as lu 5 jours de suite sans t'arrêter",
      icon: "🔥🔥",
      color: "orange-100",
      rarity: "epic",
      dateEarned: formattedDate
    };
  }
  else if (days === 7) {
    return {
      id: "streak-7",
      name: "Super série 🔥🔥🔥",
      description: "Tu as lu 7 jours de suite sans t'arrêter",
      icon: "🔥🔥🔥",
      color: "orange-100",
      rarity: "legendary",
      dateEarned: formattedDate
    };
  }
  
  return null;
};

/**
 * Génère tous les badges de série applicables pour un utilisateur
 */
export const generateDynamicStreakBadges = async (userId: string): Promise<Badge[]> => {
  if (!userId) return [];
  
  try {
    const validations = await getUserReadingValidations(userId);
    const badges: Badge[] = [];
    
    // Vérifier les différentes longueurs de séries
    const streakDays = [7, 5, 3]; // Par ordre décroissant pour prioriser les badges les plus prestigieux
    
    for (const days of streakDays) {
      const streakCheck = checkConsecutiveDaysStreak(validations, days);
      
      if (streakCheck.hasStreak && streakCheck.endDate) {
        const badge = createStreakBadge(days, streakCheck.endDate);
        if (badge) {
          badges.push(badge);
          break; // Ne prendre que le badge de la plus longue série
        }
      }
    }
    
    return badges;
  } catch (error) {
    console.error('Error generating streak badges:', error);
    return [];
  }
};
