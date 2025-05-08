
import { supabase } from "@/integrations/supabase/client";

/**
 * Checks if a user is currently locked out from validating a specific book segment
 */
export const checkValidationLock = async (
  userId: string,
  bookId: string,
  segment: number
): Promise<{ isLocked: boolean; remainingTime: number | null }> => {
  try {
    // Cache key pour éviter des requêtes redondantes rapprochées
    const cacheKey = `lock_${userId}_${bookId}_${segment}`;
    const cachedResult = sessionStorage.getItem(cacheKey);
    
    if (cachedResult) {
      const parsed = JSON.parse(cachedResult);
      const now = new Date();
      const lockedUntil = new Date(parsed.lockedUntil);
      
      // Si le lock est encore valide dans le cache
      if (lockedUntil > now) {
        const remainingTime = Math.floor((lockedUntil.getTime() - now.getTime()) / 1000);
        return { isLocked: true, remainingTime };
      }
      
      // Si le cache est expiré, on le supprime et on continue
      sessionStorage.removeItem(cacheKey);
    }
    
    const { data, error } = await supabase
      .from("validation_locks")
      .select("locked_until")
      .eq("user_id", userId)
      .eq("book_id", bookId)
      .eq("segment", segment)
      .maybeSingle();

    if (error) {
      console.error("Error checking validation lock:", error);
      return { isLocked: false, remainingTime: null };
    }

    if (!data) {
      return { isLocked: false, remainingTime: null };
    }

    const now = new Date();
    const lockedUntil = new Date(data.locked_until);

    const isLocked = lockedUntil > now;
    
    // Calculate remaining seconds if locked
    const remainingTime = isLocked 
      ? Math.floor((lockedUntil.getTime() - now.getTime()) / 1000) 
      : null;

    // Cache the result for 5 seconds to avoid repeated queries
    if (isLocked) {
      sessionStorage.setItem(cacheKey, JSON.stringify({ 
        lockedUntil: data.locked_until
      }));
    }

    return { isLocked, remainingTime };
  } catch (error) {
    console.error("Exception checking validation lock:", error);
    return { isLocked: false, remainingTime: null };
  }
};

/**
 * Creates or updates a validation lock after multiple failed attempts
 */
export const createValidationLock = async (
  userId: string, 
  bookId: string, 
  segment: number
): Promise<boolean> => {
  try {
    // Lock for 1 hour from now
    const lockedUntil = new Date();
    lockedUntil.setHours(lockedUntil.getHours() + 1);
    
    const cacheKey = `lock_${userId}_${bookId}_${segment}`;

    const { error } = await supabase
      .from("validation_locks")
      .upsert({
        user_id: userId,
        book_id: bookId,
        segment: segment,
        locked_until: lockedUntil.toISOString(),
      });

    if (error) {
      console.error("Error creating validation lock:", error);
      return false;
    }
    
    // Mettre également à jour le cache
    sessionStorage.setItem(cacheKey, JSON.stringify({ 
      lockedUntil: lockedUntil.toISOString()
    }));

    return true;
  } catch (error) {
    console.error("Exception creating validation lock:", error);
    return false;
  }
};

// Ajouter une fonction pour effacer les caches liés aux locks
export const clearLockCache = (userId: string, bookId?: string) => {
  // Si on a un bookId, on nettoie juste ce livre
  if (bookId) {
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && key.startsWith(`lock_${userId}_${bookId}`)) {
        sessionStorage.removeItem(key);
      }
    }
  } else {
    // Sinon on nettoie tous les locks de l'utilisateur
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && key.startsWith(`lock_${userId}`)) {
        sessionStorage.removeItem(key);
      }
    }
  }
};
