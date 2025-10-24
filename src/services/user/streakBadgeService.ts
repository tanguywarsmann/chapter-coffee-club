
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/types/badge";
import { ReadingValidation } from "@/types/reading";
import { availableBadges, isBadgeUnlocked, unlockBadge } from "../badgeService";
import { Database } from "@/integrations/supabase/types";

type ReadingValidationRecord = Database['public']['Tables']['reading_validations']['Row'];

/**
 * Récupère la liste des validations d'un utilisateur
 * @param userId ID de l'utilisateur
 * @returns Liste des validations
 */
export const getUserValidations = async (userId: string): Promise<ReadingValidation[]> => {
  if (!userId) return [];
  
  const { data, error } = await supabase
    .from('reading_validations')
    .select('*')
    .eq('user_id', userId)
    .order('validated_at', { ascending: true });
    
  if (error) {
    console.error('Error fetching user validations:', error);
    return [];
  }
  
  return data as ReadingValidation[];
};

interface StreakResult {
  has3DayStreak: boolean;
  has5DayStreak: boolean;
  has7DayStreak: boolean;
  endDate?: string;
  streakLength?: number;
}

/**
 * Vérifie si l'utilisateur a des jours consécutifs de lecture
 * @param userId ID de l'utilisateur
 * @returns Résultat détaillé des séries
 */
export const checkConsecutiveDays = async (userId: string): Promise<StreakResult> => {
  const validations = await getUserValidations(userId);
  
  if (!validations || validations.length < 3) {
    return { has3DayStreak: false, has5DayStreak: false, has7DayStreak: false };
  }
  
  // Récupérer les dates uniques (partie date uniquement, sans heure)
  const dates = new Set<string>();
  validations.forEach(validation => {
    const validationDate = validation.validated_at || validation.date_validated || '';
    if (validationDate) {
      const date = new Date(validationDate).toISOString().split('T')[0];
      dates.add(date);
    }
  });
  
  // Convertir en tableau et trier
  const sortedDates = Array.from(dates).sort();
  
  // Rechercher des séquences consécutives
  let maxStreak = 1;
  let currentStreak = 1;
  let streakEndDate = sortedDates[0];
  
  for (let i = 1; i < sortedDates.length; i++) {
    const currentDate = new Date(sortedDates[i]);
    const prevDate = new Date(sortedDates[i-1]);
    
    // Vérifier si les dates sont consécutives
    const diffDays = (currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
    
    if (diffDays === 1) {
      // Les dates sont consécutives, incrémenter la série
      currentStreak++;
      streakEndDate = sortedDates[i];
    } else if (diffDays > 1) {
      // Série interrompue, réinitialiser
      if (currentStreak > maxStreak) {
        maxStreak = currentStreak;
      }
      currentStreak = 1;
      streakEndDate = sortedDates[i];
    }
  }
  
  // Vérifier la série finale
  if (currentStreak > maxStreak) {
    maxStreak = currentStreak;
  }
  
  return {
    has3DayStreak: maxStreak >= 3,
    has5DayStreak: maxStreak >= 5,
    has7DayStreak: maxStreak >= 7,
    endDate: streakEndDate,
    streakLength: maxStreak
  };
};

/**
 * Crée un badge de série dynamique
 * @param days Nombre de jours de la série
 * @param endDate Date de fin de la série
 * @returns Badge de série
 */
export const createStreakBadge = (days: number, endDate: string): Badge => {
  let name = "Série en cours 🔥";
  let description = "Tu as lu 3 jours de suite sans t'arrêter";
  let rarity: "common" | "rare" | "epic" | "legendary" = "rare";
  let id = "streak-3";
  
  if (days >= 7) {
    name = "Série brûlante 🔥🔥🔥";
    description = "Tu as lu 7 jours de suite sans t'arrêter";
    rarity = "epic";
    id = "streak-7";
  } else if (days >= 5) {
    name = "Série chaude 🔥🔥";
    description = "Tu as lu 5 jours de suite sans t'arrêter";
    rarity = "rare";
    id = "streak-5";
  }
  
  const formattedDate = new Date(endDate).toLocaleDateString('fr-FR');
  
  return {
    id,
    label: name,
    slug: id,
    name,
    description,
    icon: "🔥",
    color: "orange-100",
    rarity,
    dateEarned: formattedDate
  };
};

/**
 * Vérifie les badges pour un utilisateur et retourne les badges nouvellement débloqués
 * @param userId ID de l'utilisateur
 * @param returnNewlyUnlocked Retourner uniquement les badges nouvellement débloqués
 * @returns Liste des badges
 */
export const checkBadgesForUser = async (userId: string, returnNewlyUnlocked = false): Promise<Badge[]> => {
  if (!userId) return [];
  
  try {
    const newlyUnlockedBadges: Badge[] = [];
    
    // Vérifier les badges de série
    const streakInfo = await checkConsecutiveDays(userId);
    
    if (streakInfo.has7DayStreak && streakInfo.endDate) {
      const badgeId = "serie-7-jours";
      const wasUnlocked = await isBadgeUnlocked(userId, badgeId);
      
      if (!wasUnlocked) {
        await unlockBadge(userId, badgeId);
        
        if (returnNewlyUnlocked) {
          const badge = availableBadges.find(b => b.id === badgeId);
          if (badge) {
            newlyUnlockedBadges.push({
              ...badge,
              dateEarned: new Date().toLocaleDateString('fr-FR')
            });
          }
        }
      }
    } else if (streakInfo.has5DayStreak && streakInfo.endDate) {
      // Vérifier le badge de série de 5 jours à l'avenir
    } else if (streakInfo.has3DayStreak && streakInfo.endDate) {
      // Le badge de série de 3 jours est un badge dynamique, pas stocké en base de données
      // Il sera affiché dans getUserBadges
    }
    
    // Ajouter d'autres vérifications de badge ici à l'avenir
    
    return newlyUnlockedBadges;
  } catch (error) {
    console.error("Error checking badges for user:", error);
    return [];
  }
};
