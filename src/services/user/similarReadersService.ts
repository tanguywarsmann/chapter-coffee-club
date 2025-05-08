
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types/user";
import { getDisplayName } from "@/services/user/userProfileService";

// Cache pour les lecteurs similaires avec durée de vie
const similarReadersCache = new Map<string, { readers: User[], timestamp: number }>();
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
    
    if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
      return cached.readers;
    }

    // Optimiser en faisant une seule requête avec des jointures
    const { data: similarUsers, error: usersError } = await supabase
      .rpc('find_similar_readers', {
        user_id: currentUserId,
        max_results: limit
      });

    if (usersError || !similarUsers?.length) {
      console.log("No similar readers found:", usersError || "Empty result");
      return [];
    }
    
    // Récupérer les profils des utilisateurs similaires
    const userIds = similarUsers.map(item => item.similar_user_id);
    
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, username, email')
      .in('id', userIds);
      
    if (profilesError || !profiles?.length) {
      console.error("Error fetching user profiles:", profilesError);
      return [];
    }
    
    // Mapper les profils pour correspondre au type User
    const users: User[] = profiles.map(profile => {
      const displayName = getDisplayName(profile.username, profile.email, profile.id);
      
      return {
        id: profile.id,
        name: displayName,
        email: profile.email || "",
        username: profile.username,
        is_admin: false, // Cette valeur sera mise à jour plus tard si nécessaire
      };
    });
    
    // Mettre en cache pour les appels futurs
    similarReadersCache.set(cacheKey, { 
      readers: users, 
      timestamp: Date.now() 
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
    // Invalider uniquement les entrées de cache pour cet utilisateur
    for (const key of similarReadersCache.keys()) {
      if (key.startsWith(`similar_${userId}`)) {
        similarReadersCache.delete(key);
      }
    }
  } else {
    // Invalider tout le cache
    similarReadersCache.clear();
  }
}
