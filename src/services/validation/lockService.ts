
import { supabase } from "@/integrations/supabase/client";

interface ValidationLockResult {
  isLocked: boolean;
  remainingTime: number | null;
}

/**
 * Vérifie si un utilisateur est actuellement bloqué pour valider un segment de livre spécifique
 */
export const checkValidationLock = async (
  userId: string,
  bookId: string,
  segment: number
): Promise<ValidationLockResult> => {
  try {
    // Clé de cache pour éviter des requêtes redondantes rapprochées
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
    
    // Calculer les secondes restantes si verrouillé
    const remainingTime = isLocked 
      ? Math.floor((lockedUntil.getTime() - now.getTime()) / 1000) 
      : null;

    // Mettre en cache le résultat pendant 5 secondes pour éviter des requêtes répétées
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
 * Crée ou met à jour un verrouillage de validation après plusieurs tentatives échouées
 */
export const createValidationLock = async (
  userId: string, 
  bookId: string, 
  segment: number
): Promise<boolean> => {
  try {
    // Verrouillagepour 1 heure à partir de maintenant
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

/**
 * Efface les caches liés aux verrouillagess
 * @param userId ID de l'utilisateur
 * @param bookId ID du livre (optionnel)
 */
export const clearLockCache = (userId: string, bookId?: string): void => {
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
