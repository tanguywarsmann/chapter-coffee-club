import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types/user";
import { getDisplayName } from "@/services/user/userProfileService";

// Type pour la réponse de la fonction RPC find_similar_readers
type SimilarUserResponse = {
  similar_user_id: string;
};

// Cache pour les lecteurs similaires avec durée de vie
const similarReadersCache = new Map<string, { readers: User[]; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Find users who are reading the same books as the current user
 * @param currentUserId The ID of the current user
 * @param limit Maximum number of similar users to return
 * @returns Array of user objects with similar reading interests
 */
export async function findSimilarReaders(currentUserId: string, limit: number = 3): Promise<User[]> {
  try {
    if (!currentUserId) return [];

    // Vérifier le cache avant de faire l'appel API
    const cacheKey = `similar_${currentUserId}_${limit}`;
    const cached = similarReadersCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.readers;
    }

    // Appel de la fonction RPC Supabase
    const { data: similarUsers, error: usersError } = (await supabase.rpc("find_similar_readers", {
      user_id: currentUserId,
      max_results: limit,
    })) as { data: SimilarUserResponse[] | null; error: any };

    if (usersError || !similarUsers || similarUsers.length === 0) {
      console.log("No similar readers found:", usersError || "Empty result");
      return [];
    }

    // Typage explicite ici pour éviter les erreurs TS
    const userIds: string[] = similarUsers.map((item: SimilarUserResponse) => item.similar_user_id);

    // Récupérer les profils Supabase
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, username, email")
      .in("id", userIds);

    if (profilesError || !profiles || profiles.length === 0) {
      console.error("Error fetching user profiles:", profilesError);
      return [];
    }

    // Préparer le tableau final de lecteurs similaires
    const users: User[] = profiles.map((profile) => {
      const displayName = getDisplayName(profile.username, profile.email, profile.id);
      return {
        id: profile.id,
        name: displayName,
        email: profile.email || "",
        username: profile.username,
        is_admin: false, // Mise à jour possible plus tard
        // isFollowed: followingIds.includes(profile.id) // optionnel
      };
    });

    // Mettre en cache pour les futurs appels
    similarReadersCache.set(cacheKey, {
      readers: users,
      timestamp: Date.now(),
    });

    console.log(`Returning ${users.length} similar readers`);
    return users;
  } catch (error) {
    console.error("Exception in findSimilarReaders:", error);
    return [];
  }
}

// Fonction pour invalider le cache des lecteurs similaires
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
