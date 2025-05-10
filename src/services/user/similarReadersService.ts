import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types/user";
import { getDisplayName } from "@/services/user/userProfileService";

type SimilarUserResponse = {
  similar_user_id: string;
};

const similarReadersCache = new Map<string, { readers: User[]; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000;

export async function findSimilarReaders(currentUserId: string, limit: number = 3): Promise<User[]> {
  try {
    if (!currentUserId) return [];

    const cacheKey = `similar_${currentUserId}_${limit}`;
    const cached = similarReadersCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.readers;
    }

    const response = await supabase.rpc('find_similar_readers', {
      user_id: currentUserId,
      max_results: limit,
    });

    const similarUsers = response.data as SimilarUserResponse[];
    const usersError = response.error;

    if (usersError || !Array.isArray(similarUsers) || similarUsers.length === 0) {
      console.log("No similar readers found:", usersError || "Empty result");
      return [];
    }

    const userIds: string[] = similarUsers.map((item) => item.similar_user_id);

    // Fait avec contournement TS2345
    const { data, error: profilesError } = await supabase
      .from('profiles')
      .select('id, username, email')
      .in('id' as any, userIds as any);

    // Contournement TS2589
    const typedProfiles = (data ?? []) as {
      id: string;
      username?: string;
      email?: string;
    }[];

    if (profilesError || typedProfiles.length === 0) {
      console.error("Error fetching user profiles:", profilesError);
      return [];
    }

    const users: User[] = typedProfiles.map((profile) => ({
      id: profile.id,
      name: getDisplayName(profile.username, profile.email, profile.id),
      email: profile.email || "",
      username: profile.username,
      avatar: undefined,
      is_admin: false,
    }));

    similarReadersCache.set(cacheKey, {
      readers: users,
      timestamp: Date.now(),
    });

    return users;
  } catch (error) {
    console.error("Exception in findSimilarReaders:", error);
    return [];
  }
}

export function invalidateSimilarReadersCache(userId?: string) {
  if (userId) {
    for (const key of similarReadersCache.keys()) {
      if (key.startsWith(`similar_${userId}`)) {
        similarReadersCache.delete(key);
      }
    }
  } else {
    similarReadersCache.clear();
  }
}

