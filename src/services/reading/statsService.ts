import { supabase } from '@/integrations/supabase/client';

export type UserStats = {
  booksRead: number;
  pagesRead: number;
  badgesCount: number;
  streakCurrent: number;
  streakBest: number;
  questsDone: number;
  xp: number;
  lvl: number;
};

export async function getUserStats(userId: string): Promise<UserStats> {
  const { data, error } = await supabase
    .rpc('get_user_stats', { uid: userId })
    .single();

  if (error) throw error;

  return {
    booksRead:     data.books_read,
    pagesRead:     data.pages_read,
    badgesCount:   data.badges_count,
    streakCurrent: data.streak_current,
    streakBest:    data.streak_best,
    questsDone:    data.quests_done,
    xp:            data.xp,
    lvl:           data.lvl,
  };
}

// Legacy functions for backward compatibility (use getUserStats instead)
export async function getBooksReadCount(userId: string): Promise<number> {
  const stats = await getUserStats(userId);
  return stats.booksRead;
}

export async function getTotalPagesRead(userId: string): Promise<number> {
  const stats = await getUserStats(userId);
  return stats.pagesRead;
}

export async function getCurrentStreak(userId: string): Promise<number> {
  const stats = await getUserStats(userId);
  return stats.streakCurrent;
}

export async function getBestStreak(userId: string): Promise<number> {
  const stats = await getUserStats(userId);
  return stats.streakBest;
}

// Additional legacy functions that may be needed
export async function getValidatedSegmentsCount(userId: string): Promise<number> {
  const { count } = await supabase
    .from("reading_validations")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);
  return count || 0;
}

export async function getEstimatedReadingTime(userId: string): Promise<number> {
  // Estimate based on average reading speed (250 words per minute, ~500 words per page)
  const stats = await getUserStats(userId);
  const estimatedMinutes = stats.pagesRead * 2; // 2 minutes per page
  return Math.round(estimatedMinutes / 60); // Return hours
}

export function getReaderProfileMessage(booksRead: number, segmentsValidated: number, readingTimeHours: number): string {
  if (booksRead === 0) return "Nouveau lecteur - Commencez votre premier livre !";
  if (booksRead <= 2) return "Lecteur débutant - Continuez votre parcours !";
  if (booksRead <= 5) return "Lecteur régulier - Vous progressez bien !";
  if (booksRead <= 10) return "Lecteur passionné - Excellent rythme !";
  return "Lecteur expert - Vous êtes un vrai passionné !";
}

export async function getAveragePagesPerWeek(userId: string): Promise<number> {
  // Get validations from the last 4 weeks
  const fourWeeksAgo = new Date();
  fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
  
  const { count } = await supabase
    .from("reading_validations")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("validated_at", fourWeeksAgo.toISOString());
    
  // Estimate pages (assuming ~10 pages per validation)
  const estimatedPages = (count || 0) * 10;
  return Math.round(estimatedPages / 4); // Average per week
}
