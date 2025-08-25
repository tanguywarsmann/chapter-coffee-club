
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/types/badge";
import { toast } from "sonner";

export const availableBadges: Badge[] = [
  {
    id: "premier-livre",
    slug: "premier-livre",
    name: "Premier livre terminé",
    description: "Félicitations ! Vous avez terminé votre premier livre sur VREAD.",
    icon: "🎉",
    color: "green-500",
    rarity: "common"
  },
  {
    id: "serie-7-jours",
    slug: "serie-7-jours", 
    name: "Série de 7 jours",
    description: "Vous avez lu pendant 7 jours consécutifs sans interruption !",
    icon: "🔥",
    color: "orange-500",
    rarity: "rare"
  },
  {
    id: "lecteur-assidu",
    slug: "lecteur-assidu",
    name: "Lecteur assidu",
    description: "Vous avez validé 50 segments de lecture.",
    icon: "📚",
    color: "blue-500", 
    rarity: "epic"
  },
  {
    id: "badge_test_insertion",
    slug: "badge_test_insertion",
    name: "Badge de test",
    description: "Badge utilisé pour les tests de développement.",
    icon: "🧪",
    color: "purple-500",
    rarity: "common"
  }
];

/**
 * Vérifie si un badge est déjà débloqué pour un utilisateur
 */
export const isBadgeUnlocked = async (userId: string, badgeId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('user_badges')
      .select('id')
      .eq('user_id', userId)
      .eq('badge_id', badgeId)
      .maybeSingle();

    if (error) {
      console.error('Erreur lors de la vérification du badge:', error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error('Erreur lors de la vérification du badge:', error);
    return false;
  }
};

/**
 * Débloque un nouveau badge pour un utilisateur
 */
export const unlockBadge = async (userId: string, badgeId: string): Promise<boolean> => {
  try {
    // Vérifier si le badge existe dans la liste des badges disponibles
    const badgeExists = availableBadges.some(badge => badge.id === badgeId || badge.slug === badgeId);
    if (!badgeExists) {
      console.error(`Badge non trouvé: ${badgeId}`);
      return false;
    }

    // Vérifier si le badge est déjà débloqué
    const alreadyUnlocked = await isBadgeUnlocked(userId, badgeId);
    if (alreadyUnlocked) {
      console.log(`Badge déjà débloqué: ${badgeId}`);
      return true;
    }

    // Insérer le nouveau badge
    const { data, error } = await supabase
      .from('user_badges')
      .insert({
        user_id: userId,
        badge_id: badgeId,
        earned_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Erreur lors du débloquage du badge:', error);
      return false;
    }

    console.log(`✅ Badge débloqué avec succès: ${badgeId} pour l'utilisateur ${userId}`);
    toast.success(`Nouveau badge débloqué : ${availableBadges.find(b => b.id === badgeId)?.name || badgeId}`);
    
    return true;
  } catch (error) {
    console.error('Erreur lors du débloquage du badge:', error);
    return false;
  }
};

/**
 * Récupère tous les badges d'un utilisateur
 */
export const getUserBadges = async (userId: string): Promise<Badge[]> => {
  try {
    const { data, error } = await supabase
      .from('user_badges')
      .select('badge_id, earned_at')
      .eq('user_id', userId);

    if (error) {
      console.error('Erreur lors de la récupération des badges:', error);
      return [];
    }

    // Mapper les badges avec leurs informations complètes
    const userBadges = data.map(userBadge => {
      const badgeInfo = availableBadges.find(badge => 
        badge.id === userBadge.badge_id || badge.slug === userBadge.badge_id
      );

      if (!badgeInfo) {
        console.warn(`Badge non trouvé dans availableBadges: ${userBadge.badge_id}`);
        return null;
      }

      return {
        ...badgeInfo,
        dateEarned: new Date(userBadge.earned_at).toLocaleDateString('fr-FR')
      };
    }).filter(badge => badge !== null) as Badge[];

    return userBadges;
  } catch (error) {
    console.error('Erreur lors de la récupération des badges:', error);
    return [];
  }
};

/**
 * Enregistre une session de lecture pour les statistiques
 */
export const recordReadingSession = async (
  userId: string, 
  startTime: Date, 
  endTime: Date
): Promise<void> => {
  try {
    const durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));
    
    if (durationMinutes < 1) {
      return; // Ignorer les sessions trop courtes
    }

    console.log(`📊 Session de lecture enregistrée: ${durationMinutes} minutes pour l'utilisateur ${userId}`);
    
    // Ici, vous pourriez enregistrer dans une table de sessions si nécessaire
    // Pour l'instant, on log juste pour le debugging
    
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement de la session:', error);
  }
};

/**
 * Vérifie et débloque automatiquement les badges basés sur les statistiques
 */
export const checkAndUnlockBadges = async (userId: string): Promise<Badge[]> => {
  try {
    const newBadges: Badge[] = [];
    
    // Récupérer les statistiques de l'utilisateur
    const { data: progressData, error: progressError } = await supabase
      .from('reading_progress')
      .select('*')
      .eq('user_id', userId);

    if (progressError) {
      console.error('Erreur lors de la récupération des progrès:', progressError);
      return [];
    }

    const { data: validationData, error: validationError } = await supabase
      .from('reading_validations')
      .select('*')
      .eq('user_id', userId);

    if (validationError) {
      console.error('Erreur lors de la récupération des validations:', validationError);
      return [];
    }

    // Vérifier le badge "Premier livre terminé"
    const completedBooks = progressData?.filter(p => p.status === 'completed') || [];
    if (completedBooks.length >= 1) {
      const wasUnlocked = await isBadgeUnlocked(userId, 'premier-livre');
      if (!wasUnlocked) {
        const success = await unlockBadge(userId, 'premier-livre');
        if (success) {
          const badge = availableBadges.find(b => b.id === 'premier-livre');
          if (badge) newBadges.push(badge);
        }
      }
    }

    // Vérifier le badge "Lecteur assidu" (50 validations)
    const validationCount = validationData?.length || 0;
    if (validationCount >= 50) {
      const wasUnlocked = await isBadgeUnlocked(userId, 'lecteur-assidu');
      if (!wasUnlocked) {
        const success = await unlockBadge(userId, 'lecteur-assidu');
        if (success) {
          const badge = availableBadges.find(b => b.id === 'lecteur-assidu');
          if (badge) newBadges.push(badge);
        }
      }
    }

    return newBadges;
  } catch (error) {
    console.error('Erreur lors de la vérification des badges:', error);
    return [];
  }
};
