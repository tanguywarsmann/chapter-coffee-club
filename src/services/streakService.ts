
import { ReadingActivity, ReadingStreak } from "@/types/reading";

const ACTIVITY_KEY = "reading_activity";
const STREAK_KEY = "reading_streak";

/**
 * Vérifie si deux dates représentent le même jour
 */
const isSameDay = (date1: string, date2: string): boolean => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

/**
 * Vérifie si deux dates sont des jours consécutifs
 */
const isConsecutiveDay = (date1: string, date2: string): boolean => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays === 1;
};

/**
 * Enregistre une activité de lecture pour l'utilisateur
 * @param userId ID de l'utilisateur
 */
export const recordReadingActivity = (userId: string): void => {
  const today = new Date().toISOString();
  const storedActivities = localStorage.getItem(ACTIVITY_KEY);
  const activities: ReadingActivity[] = storedActivities ? JSON.parse(storedActivities) : [];
  
  const hasActivityToday = activities.some(
    activity => activity.user_id === userId && isSameDay(activity.date, today)
  );
  
  if (!hasActivityToday) {
    activities.push({ user_id: userId, date: today });
    localStorage.setItem(ACTIVITY_KEY, JSON.stringify(activities));
    updateStreak(userId);
  }
};

/**
 * Met à jour la série de lecture de l'utilisateur
 * @param userId ID de l'utilisateur
 */
const updateStreak = (userId: string): void => {
  const activities = getUserActivities(userId);
  if (activities.length === 0) return;

  const storedStreak = localStorage.getItem(STREAK_KEY);
  const streaks: Record<string, ReadingStreak> = storedStreak ? JSON.parse(storedStreak) : {};
  const userStreak = streaks[userId] || {
    current_streak: 0,
    longest_streak: 0,
    last_validation_date: ""
  };

  // Trier les activités par date
  const sortedDates = activities
    .map(a => new Date(a.date))
    .sort((a, b) => b.getTime() - a.getTime());

  const today = new Date();
  const lastActivityDate = sortedDates[0];

  // Si la dernière activité date de plus d'un jour, réinitialiser la série actuelle
  if (!isSameDay(lastActivityDate.toISOString(), today.toISOString()) && 
      !isConsecutiveDay(lastActivityDate.toISOString(), today.toISOString())) {
    userStreak.current_streak = 1;
  } else {
    // Calculer la série actuelle
    let currentStreak = 1;
    for (let i = 1; i < sortedDates.length; i++) {
      if (isConsecutiveDay(sortedDates[i].toISOString(), sortedDates[i-1].toISOString())) {
        currentStreak++;
      } else {
        break;
      }
    }
    userStreak.current_streak = currentStreak;
  }

  // Mettre à jour la plus longue série si la série actuelle est plus élevée
  userStreak.longest_streak = Math.max(userStreak.current_streak, userStreak.longest_streak);
  userStreak.last_validation_date = today.toISOString();

  streaks[userId] = userStreak;
  localStorage.setItem(STREAK_KEY, JSON.stringify(streaks));
};

/**
 * Récupère les activités de lecture de l'utilisateur
 * @param userId ID de l'utilisateur
 * @returns Liste des activités de lecture
 */
const getUserActivities = (userId: string): ReadingActivity[] => {
  const storedActivities = localStorage.getItem(ACTIVITY_KEY);
  const activities: ReadingActivity[] = storedActivities ? JSON.parse(storedActivities) : [];
  return activities.filter(activity => activity.user_id === userId);
};

/**
 * Récupère les informations de série de l'utilisateur
 * @param userId ID de l'utilisateur
 * @returns Informations de série
 */
export const getUserStreak = (userId: string): ReadingStreak => {
  const storedStreak = localStorage.getItem(STREAK_KEY);
  const streaks: Record<string, ReadingStreak> = storedStreak ? JSON.parse(storedStreak) : {};
  return streaks[userId] || {
    current_streak: 0,
    longest_streak: 0,
    last_validation_date: ""
  };
};
