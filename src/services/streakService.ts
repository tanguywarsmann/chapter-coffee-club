
import { ReadingActivity, ReadingStreak } from "@/types/reading";

const ACTIVITY_KEY = "reading_activity";
const STREAK_KEY = "reading_streak";

const isSameDay = (date1: string, date2: string): boolean => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

const isConsecutiveDay = (date1: string, date2: string): boolean => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays === 1;
};

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

  // Sort activities by date
  const sortedDates = activities
    .map(a => new Date(a.date))
    .sort((a, b) => b.getTime() - a.getTime());

  const today = new Date();
  const lastActivityDate = sortedDates[0];

  // If last activity was more than a day ago, reset current streak
  if (!isSameDay(lastActivityDate.toISOString(), today.toISOString()) && 
      !isConsecutiveDay(lastActivityDate.toISOString(), today.toISOString())) {
    userStreak.current_streak = 1;
  } else {
    // Calculate current streak
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

  // Update longest streak if current is higher
  userStreak.longest_streak = Math.max(userStreak.current_streak, userStreak.longest_streak);
  userStreak.last_validation_date = today.toISOString();

  streaks[userId] = userStreak;
  localStorage.setItem(STREAK_KEY, JSON.stringify(streaks));
};

const getUserActivities = (userId: string): ReadingActivity[] => {
  const storedActivities = localStorage.getItem(ACTIVITY_KEY);
  const activities: ReadingActivity[] = storedActivities ? JSON.parse(storedActivities) : [];
  return activities.filter(activity => activity.user_id === userId);
};

export const getUserStreak = (userId: string): ReadingStreak => {
  const storedStreak = localStorage.getItem(STREAK_KEY);
  const streaks: Record<string, ReadingStreak> = storedStreak ? JSON.parse(storedStreak) : {};
  return streaks[userId] || {
    current_streak: 0,
    longest_streak: 0,
    last_validation_date: ""
  };
};

