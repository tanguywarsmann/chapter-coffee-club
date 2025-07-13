import { supabase } from '@/lib/supabaseClient';

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
    .single();          // ← retourne exactement une ligne

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
