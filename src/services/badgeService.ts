import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/types/badge";
import { toast } from "sonner";

// Cache for available badges (populated from database)
let cachedBadges: Badge[] | null = null;

/**
 * Fetches all available badges from database
 */
export const fetchAvailableBadges = async (): Promise<Badge[]> => {
  if (cachedBadges) {
    return cachedBadges;
  }

  try {
    const { data, error } = await supabase
      .from('badges')
      .select('id, slug, label, description, icon, color, rarity, category')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching badges:', error);
      return [];
    }

    cachedBadges = data || [];
    return cachedBadges;
  } catch (error) {
    console.error('Error fetching badges:', error);
    return [];
  }
};

/**
 * Gets available badges (uses cache if available)
 * @deprecated Use fetchAvailableBadges() instead for async loading
 */
export const getAvailableBadges = (): Badge[] => {
  return cachedBadges || [];
};

/**
 * For backward compatibility - use fetchAvailableBadges() instead
 * @deprecated This will be empty until fetchAvailableBadges() is called
 */
export let availableBadges: Badge[] = [];

// Initialize badges cache on module load
fetchAvailableBadges().then(badges => {
  availableBadges = badges;
});

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
 * @deprecated Use autoGrantBadges() instead for automatic attribution
 */
export const unlockBadge = async (userId: string, badgeId: string): Promise<boolean> => {
  try {
    const badges = await fetchAvailableBadges();
    const badgeExists = badges.some(badge => badge.id === badgeId || badge.slug === badgeId);

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
    const badgeInfo = badges.find(b => b.id === badgeId);
    if (badgeInfo) {
      toast.success(`Nouveau badge débloqué : ${badgeInfo.label}`);
    }

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
    // Fetch badges with complete info using JOIN
    const { data, error } = await supabase
      .from('user_badges')
      .select(`
        badge_id,
        earned_at,
        badges:badge_id (
          id,
          slug,
          label,
          description,
          icon,
          color,
          rarity,
          category
        )
      `)
      .eq('user_id', userId);

    if (error) {
      console.error('Erreur lors de la récupération des badges:', error);
      return [];
    }

    // Map to Badge format
    const userBadges = data
      .filter(ub => ub.badges) // Filter out any null badges
      .map(ub => {
        const badgeData = ub.badges as any;
        return {
          id: badgeData.id,
          slug: badgeData.slug,
          label: badgeData.label,
          description: badgeData.description,
          icon: badgeData.icon,
          color: badgeData.color,
          rarity: badgeData.rarity,
          category: badgeData.category,
          dateEarned: new Date(ub.earned_at).toLocaleDateString('fr-FR')
        } as Badge;
      });

    return userBadges;
  } catch (error) {
    console.error('Erreur lors de la récupération des badges:', error);
    return [];
  }
};

/**
 * Auto-grants all eligible badges to a user using SQL function
 * This is the NEW recommended way to grant badges automatically
 */
export const autoGrantBadges = async (userId: string): Promise<Badge[]> => {
  try {
    const { data, error } = await supabase
      .rpc('auto_grant_badges', { p_user_id: userId });

    if (error) {
      console.error('Error auto-granting badges:', error);
      return [];
    }

    // Show toasts for newly granted badges
    if (data && Array.isArray(data) && data.length > 0) {
      const newBadges = (data as any[]).filter((row: any) => row.newly_granted);

      for (const row of newBadges) {
        toast.success(`🏆 Nouveau badge débloqué : ${(row as any).badge_name}`);
      }

      // Return the badges in the expected format
      const badges = await fetchAvailableBadges();
      return newBadges.map((row: any) => {
        const badge = badges.find(b => b.id === row.granted_badge_id);
        return badge || {
          id: row.granted_badge_id,
          slug: '',
          label: row.badge_name,
          description: '',
          icon: '🏆',
          color: 'blue-500',
          rarity: 'common'
        } as Badge;
      });
    }

    return [];
  } catch (error) {
    console.error('Error auto-granting badges:', error);
    return [];
  }
};

/**
 * Vérifie et débloque automatiquement les badges basés sur les statistiques
 * @deprecated Use autoGrantBadges() instead - it uses SQL views for better performance
 */
export const checkAndUnlockBadges = async (userId: string): Promise<Badge[]> => {
  // Use the new auto-grant system
  return autoGrantBadges(userId);
};

/**
 * Enregistre une session de lecture pour les statistiques
 * @deprecated Not used anymore - sessions are tracked via reading_validations
 */
export const recordReadingSession = async (
  userId: string,
  startTime: Date,
  endTime: Date
): Promise<void> => {
  try {
    const durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));

    if (durationMinutes < 1) {
      return;
    }

    console.log(`📊 Session de lecture enregistrée: ${durationMinutes} minutes pour l'utilisateur ${userId}`);
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement de la session:', error);
  }
};
