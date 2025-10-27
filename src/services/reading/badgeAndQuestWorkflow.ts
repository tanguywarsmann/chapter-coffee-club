
import { clearProgressCache, getBookReadingProgress } from "./progressService";
import { mutate } from "swr";
import { addXP } from "@/services/user/levelService";
import { checkBadgesForUser } from "@/services/user/streakBadgeService";
import { checkUserQuests } from "@/services/questService";
import { checkAndGrantMonthlyReward } from "@/services/monthlyRewardService";

export async function handleBadgeAndQuestWorkflow(request: any, progressId: string, clampedPage: number, nextSegment: number, book_id: string, user_id: string, question: any) {
  // Invalidation aggressive des caches
  await clearProgressCache(user_id);
  mutate((key) => typeof key === 'string' && key.includes(`reading-progress-${user_id}`), undefined, { revalidate: true });
  mutate((key) => typeof key === 'string' && key.includes(`book-progress-${book_id}`), undefined, { revalidate: true });
  mutate((key) => typeof key === 'string' && key.includes(`jokers-info-${book_id}`), undefined, { revalidate: true });
  mutate(() => getBookReadingProgress(user_id, book_id), undefined, { revalidate: true });

  // NOTE: recordReadingActivity() removed - streaks now calculated from reading_validations table via get_user_streaks() SQL function
  await addXP(user_id, 10);

  const newBadges = await checkBadgesForUser(user_id, true);

  // Check for newly unlocked quests (synchronous now!)
  let newQuests = [];
  try {
    newQuests = await checkUserQuests(user_id);
  } catch (error) {
    console.error("Error checking quests:", error);
  }

  setTimeout(async () => {
    try {
      await checkAndGrantMonthlyReward(user_id);
    } catch (_) { }
  }, 0);

  // Return new badges and quests
  return {
    newBadges: newBadges && newBadges.length > 0 ? newBadges : undefined,
    newQuests: newQuests && newQuests.length > 0 ? newQuests : undefined
  };
}
