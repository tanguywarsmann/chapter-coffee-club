
// Caching utilities for reading progress

import { ReadingProgress } from "@/types/reading";

// Use shared cache instance for all progress queries
export const progressCache = new Map<string, {
  data: ReadingProgress[],
  timestamp: number
}>();

export const CACHE_DURATION = 30000; // 30 seconds

/**
 * Clear a user's reading progress cache entry, or all cache
 * @param userId
 */
export const clearProgressCache = async (userId?: string): Promise<void> => {
  console.log(`🗑️ Clearing progress cache${userId ? ` for user ${userId}` : ' (all users)'}`);
  if (userId) {
    progressCache.delete(userId);
  } else {
    progressCache.clear();
  }
};
