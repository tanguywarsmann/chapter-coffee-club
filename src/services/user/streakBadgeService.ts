
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/types/badge";
import { ReadingValidation } from "@/types/reading";
import { availableBadges, isBadgeUnlocked, unlockBadge } from "../badgeService";

// Get list of validations for a user
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
  
  return data || [];
};

// Check if user has 3 consecutive days of reading
export const checkConsecutiveDays = async (userId: string): Promise<{
  has3DayStreak: boolean;
  has5DayStreak: boolean;
  has7DayStreak: boolean;
  endDate?: string;
  streakLength?: number;
}> => {
  const validations = await getUserValidations(userId);
  
  if (!validations || validations.length < 3) {
    return { has3DayStreak: false, has5DayStreak: false, has7DayStreak: false };
  }
  
  // Get unique dates (date part only, without time)
  const dates = new Set<string>();
  validations.forEach(validation => {
    const date = new Date(validation.validated_at || validation.date_validated || '').toISOString().split('T')[0];
    dates.add(date);
  });
  
  // Convert to array and sort
  const sortedDates = Array.from(dates).sort();
  
  // Look for consecutive sequences
  let maxStreak = 1;
  let currentStreak = 1;
  let streakEndDate = sortedDates[0];
  
  for (let i = 1; i < sortedDates.length; i++) {
    const currentDate = new Date(sortedDates[i]);
    const prevDate = new Date(sortedDates[i-1]);
    
    // Check if dates are consecutive
    const diffDays = (currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
    
    if (diffDays === 1) {
      // Dates are consecutive, increment streak
      currentStreak++;
      streakEndDate = sortedDates[i];
    } else if (diffDays > 1) {
      // Streak broken, reset
      if (currentStreak > maxStreak) {
        maxStreak = currentStreak;
      }
      currentStreak = 1;
      streakEndDate = sortedDates[i];
    }
  }
  
  // Check final streak
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

// Create dynamic streak badge
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
    name,
    description,
    icon: "🔥",
    color: "orange-100",
    rarity,
    dateEarned: formattedDate
  };
};

// Check badges for user and return newly unlocked badges
export const checkBadgesForUser = async (userId: string, returnNewlyUnlocked = false): Promise<Badge[]> => {
  if (!userId) return [];
  
  try {
    const newlyUnlockedBadges: Badge[] = [];
    
    // Check for streak badges
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
      // Check for 5-day streak badge in the future
    } else if (streakInfo.has3DayStreak && streakInfo.endDate) {
      // The 3-day streak is a dynamic badge, not stored in the database
      // It will be shown in getUserBadges
    }
    
    // Add other badge checks here in the future
    
    return newlyUnlockedBadges;
  } catch (error) {
    console.error("Error checking badges for user:", error);
    return [];
  }
};
