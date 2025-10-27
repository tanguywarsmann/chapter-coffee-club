
import { supabase } from "@/integrations/supabase/client";
import { Quest, UserQuest, QuestSlug } from "@/types/quest";
import { addXP } from "@/services/user/levelService";
import { getUserReadingProgress } from "./reading/progressService";
import { Database } from "@/integrations/supabase/types";
import { toast } from "sonner";

type UserQuestRecord = Database['public']['Tables']['user_quests']['Row'];

// Cache for available quests (populated from database)
let cachedQuests: Quest[] | null = null;

/**
 * Fetches all available quests from database
 */
export const fetchAvailableQuests = async (): Promise<Quest[]> => {
  if (cachedQuests) {
    return cachedQuests;
  }

  try {
    // Type assertion until Supabase types are regenerated
    const { data, error } = await (supabase as any)
      .from('quests')
      .select('slug, title, description, icon, category, xp_reward')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching quests:', error);
      return [];
    }

    cachedQuests = (data || []) as Quest[];
    return cachedQuests;
  } catch (error) {
    console.error('Error fetching quests:', error);
    return [];
  }
};

// Helper functions pour gérer les timezones
const getLocalHour = (isoDate: string, userTimezone?: string): number => {
  const timezone = userTimezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
  const date = new Date(isoDate);
  const localDateStr = date.toLocaleString('en-US', { timeZone: timezone, hour12: false });
  const localDate = new Date(localDateStr);
  return localDate.getHours();
};

const getLocalDay = (isoDate: string, userTimezone?: string): number => {
  const timezone = userTimezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
  const date = new Date(isoDate);
  const localDateStr = date.toLocaleString('en-US', { timeZone: timezone, weekday: 'long', year: 'numeric', month: 'numeric', day: 'numeric' });
  const localDate = new Date(localDateStr);
  return localDate.getDay();
};

const getLocalDateString = (isoDate: string, userTimezone?: string): string => {
  const timezone = userTimezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
  const date = new Date(isoDate);
  return date.toLocaleDateString('en-CA', { timeZone: timezone }); // format YYYY-MM-DD
};

/**
 * Gets available quests from cache
 * @deprecated Use fetchAvailableQuests() for async loading
 */
export const getAvailableQuests = (): Quest[] => {
  return cachedQuests || [];
};

/**
 * Available quests - populated from database on module load
 * @deprecated Use fetchAvailableQuests() instead for async loading
 */
export let availableQuests: Quest[] = [];

// Initialize quests cache on module load
fetchAvailableQuests().then(quests => {
  availableQuests = quests;
});

/**
 * Complète une quête pour un utilisateur
 * @returns UserQuest si nouvelle quête débloquée, null si déjà débloquée ou erreur
 */
export const completeQuest = async (userId: string, questSlug: string): Promise<UserQuest | null> => {
  try {
    if (!userId || !questSlug) {
      console.error("completeQuest: userId and questSlug are required");
      return null;
    }

    // Vérifier si la quête est déjà débloquée
    // Type assertion until Supabase types are regenerated
    const { data: existingQuest, error: questError } = await (supabase as any)
      .from('user_quests')
      .select('*')
      .eq('user_id', userId)
      .eq('quest_slug', questSlug)
      .maybeSingle();

    if (questError && questError.code !== 'PGRST116') {
      console.error("Error checking existing quest:", questError);
      return null;
    }

    if (existingQuest) {
      console.log("Quest already unlocked:", questSlug);
      return null; // Quête déjà débloquée
    }

    // Insérer la quête terminée dans la table user_quests
    // Type assertion until Supabase types are regenerated
    const { data, error } = await (supabase as any)
      .from('user_quests')
      .insert({
        user_id: userId,
        quest_slug: questSlug,
        unlocked_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Error completing quest:", error);
      return null;
    }

    console.log(`✅ Quête challengeante terminée avec succès: ${questSlug} pour l'utilisateur ${userId}`);

    // Récupérer les infos de la quête depuis la DB pour obtenir le XP reward
    const quests = await fetchAvailableQuests();
    const questInfo = quests.find(q => q.slug === questSlug);

    // Ajouter des points XP pour la complétion d'une quête (XP depuis la DB)
    const xpReward = questInfo?.xp_reward || 100; // Default fallback pour challenges
    const xpSuccess = await addXP(userId, xpReward);
    if (xpSuccess) {
      console.log(`✅ XP ajouté pour la quête challengeante: +${xpReward} XP`);
    }

    // Enrichir les données de la quête avec les infos de la DB
    const userQuest: UserQuest = {
      ...data,
      quest: questInfo,
    };

    return userQuest;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    console.error("Error completing quest:", errorMsg);
    return null;
  }
};

/**
 * Vérifie les quêtes d'un utilisateur et les débloque selon certaines conditions
 * @returns Array de UserQuest nouvellement débloquées
 */
export const checkUserQuests = async (userId: string): Promise<UserQuest[]> => {
  const newlyUnlockedQuests: UserQuest[] = [];

  try {
    if (!userId) {
      console.error("checkUserQuests: userId is required");
      return [];
    }

    console.log(`🔍 Vérification des quêtes pour l'utilisateur ${userId}`);

    // Récupérer les quêtes disponibles depuis la DB
    const availableQuests = await fetchAvailableQuests();

    // Récupérer la progression de lecture de l'utilisateur
    const readingProgress = await getUserReadingProgress(userId);
    
    // Récupérer les validations de l'utilisateur
    const { data: validations, error: validationError } = await supabase
      .from('reading_validations')
      .select('*')
      .eq('user_id', userId)
      .order('validated_at', { ascending: false });

    if (validationError) {
      console.error("Error fetching validations:", validationError);
      return;
    }

    // Récupérer les livres terminés
    const completedBooks = readingProgress.filter(p => p.status === 'completed');

    // Récupérer les données de streak
    const { data: streakData } = await supabase.rpc('get_user_streaks' as any, { user_id: userId });
    const currentStreak = (streakData as any)?.current || 0;
    const bestStreak = (streakData as any)?.best || 0;

    // Vérifier chaque quête challengeante disponible
    for (const quest of availableQuests) {
      let shouldUnlock = false;

      switch (quest.slug) {
        // ===== MARATHONS - Défis intenses =====
        case 'marathon_reader':
          // 10 validations en 1 journée
          if (validations && validations.length >= 10) {
            const validationsByDate: { [key: string]: number } = {};
            validations.forEach(v => {
              const date = getLocalDateString(v.validated_at);
              validationsByDate[date] = (validationsByDate[date] || 0) + 1;
            });
            shouldUnlock = Object.values(validationsByDate).some(count => count >= 10);
          }
          break;

        case 'binge_reading':
          // 3 livres terminés en 7 jours
          if (completedBooks.length >= 3) {
            // Grouper les livres par période de 7 jours
            const sortedBooks = [...completedBooks].sort((a, b) =>
              new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime()
            );

            for (let i = 0; i <= sortedBooks.length - 3; i++) {
              const firstBook = new Date(sortedBooks[i].updated_at);
              const thirdBook = new Date(sortedBooks[i + 2].updated_at);
              const daysDiff = Math.floor((thirdBook.getTime() - firstBook.getTime()) / (1000 * 60 * 60 * 24));
              if (daysDiff <= 7) {
                shouldUnlock = true;
                break;
              }
            }
          }
          break;

        case 'night_marathon':
          // 5 validations entre 22h-6h
          if (validations && validations.length >= 5) {
            const nightValidations = validations.filter(v => {
              const hour = getLocalHour(v.validated_at);
              return hour >= 22 || hour < 6;
            });
            shouldUnlock = nightValidations.length >= 5;
          }
          break;

        // ===== VITESSE & PERFORMANCE - Défis de rapidité =====
        case 'lightning_reader':
          // Livre 300+ pages en <3 jours
          shouldUnlock = completedBooks.some(book => {
            if (!book.started_at || !book.total_pages || book.total_pages < 300) return false;
            const startDate = new Date(book.started_at);
            const endDate = new Date(book.updated_at);
            const daysDiff = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
            return daysDiff < 3;
          });
          break;

        case 'speed_demon':
          // Livre en <24h
          shouldUnlock = completedBooks.some(book => {
            if (!book.started_at) return false;
            const startDate = new Date(book.started_at);
            const endDate = new Date(book.updated_at);
            const hoursDiff = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);
            return hoursDiff < 24;
          });
          break;

        case 'sprinter':
          // 50+ pages en 1 session (on vérifie si current_page a augmenté de 50+ d'un coup)
          // Pour l'instant, on vérifie juste si un livre a plus de 50 pages lues
          shouldUnlock = readingProgress.some(book =>
            book.current_page && book.current_page >= 50
          );
          break;

        // ===== VARIÉTÉ & EXPLORATION - Défis de diversité =====
        case 'explorer':
          // 3 livres de genres différents en 30 jours
          // Pour l'instant simplifié : 3 livres terminés en 30 jours
          if (completedBooks.length >= 3) {
            const now = new Date();
            const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            const recentBooks = completedBooks.filter(book =>
              new Date(book.updated_at) >= thirtyDaysAgo
            );
            shouldUnlock = recentBooks.length >= 3;
          }
          break;

        case 'completionist':
          // 3+ livres du même auteur (on vérifie via book_id patterns ou on simplifie)
          // Simplifié pour l'instant : 3 livres terminés
          shouldUnlock = completedBooks.length >= 3;
          break;

        // ===== RÉGULARITÉ EXTRÊME - Défis de constance =====
        case 'unstoppable':
          // 30 jours consécutifs
          shouldUnlock = currentStreak >= 30 || bestStreak >= 30;
          break;

        case 'punctual':
          // Même heure (±1h) pendant 7 jours consécutifs
          if (validations && validations.length >= 7) {
            // Grouper par jour et vérifier si heures similaires
            const last7Days = validations.slice(0, 7);
            const hours = last7Days.map(v => getLocalHour(v.validated_at));

            // Vérifier si toutes les heures sont dans une fourchette de ±1h
            const minHour = Math.min(...hours);
            const maxHour = Math.max(...hours);
            shouldUnlock = (maxHour - minHour) <= 2; // ±1h de différence
          }
          break;

        case 'perfect_month':
          // 1 validation/jour pendant 30 jours
          shouldUnlock = currentStreak >= 30 || bestStreak >= 30;
          break;

        // ===== HORAIRES SPÉCIAUX - Défis de timing =====
        case 'early_bird':
          // Lire avant 7h (heure locale)
          if (validations && validations.length > 0) {
            shouldUnlock = validations.some(v => {
              const hour = getLocalHour(v.validated_at);
              return hour < 7;
            });
          }
          break;

        case 'night_owl':
          // Lire après 23h (heure locale)
          if (validations && validations.length > 0) {
            shouldUnlock = validations.some(v => {
              const hour = getLocalHour(v.validated_at);
              return hour >= 23;
            });
          }
          break;

        case 'weekend_warrior':
          // Lire le samedi ET le dimanche du MÊME weekend
          if (validations && validations.length >= 2) {
            shouldUnlock = validations.some(satValidation => {
              const satDay = getLocalDay(satValidation.validated_at);
              if (satDay !== 6) return false; // Pas un samedi

              // Obtenir la date du samedi en timezone locale
              const satDateStr = getLocalDateString(satValidation.validated_at);
              const satDate = new Date(satDateStr + 'T00:00:00');

              // Calculer le dimanche suivant
              const sunDate = new Date(satDate);
              sunDate.setDate(sunDate.getDate() + 1);
              const expectedSundayStr = sunDate.toISOString().split('T')[0];

              // Chercher une validation ce dimanche précis
              return validations.some(sunValidation => {
                const sunDateStr = getLocalDateString(sunValidation.validated_at);
                return sunDateStr === expectedSundayStr && getLocalDay(sunValidation.validated_at) === 0;
              });
            });
          }
          break;

        default:
          break;
      }

      if (shouldUnlock) {
        const unlockedQuest = await completeQuest(userId, quest.slug);
        if (unlockedQuest) {
          console.log(`🎉 Quête challengeante débloquée: ${quest.slug}`);
          newlyUnlockedQuests.push(unlockedQuest);
        }
      }
    }
  } catch (error) {
    console.error("Error checking user quests:", error);
  }

  return newlyUnlockedQuests;
};

/**
 * Récupère toutes les quêtes d'un utilisateur
 */
export const getUserQuests = async (userId: string): Promise<UserQuest[]> => {
  try {
    if (!userId) {
      console.error("getUserQuests: userId is required");
      return [];
    }

    // Type assertion until Supabase types are regenerated
    const { data, error } = await (supabase as any)
      .from('user_quests')
      .select('*')
      .eq('user_id', userId)
      .order('unlocked_at', { ascending: false });

    if (error) {
      console.error("Error fetching user quests:", error);
      return [];
    }

    // Récupérer les détails des quêtes depuis la DB
    const availableQuests = await fetchAvailableQuests();

    // Mapper les quêtes de l'utilisateur pour inclure les détails de la quête
    const userQuests = data.map(item => {
      const questDetails = availableQuests.find(q => q.slug === item.quest_slug);
      return {
        ...item,
        quest: questDetails
      };
    });

    return userQuests;
  } catch (error) {
    console.error("Error fetching user quests:", error);
    return [];
  }
};

/**
 * Récupère les statistiques des quêtes pour l'affichage
 */
export const getQuestStats = async (userId: string): Promise<{
  completed: number;
  total: number;
  completionRate: number;
}> => {
  try {
    const [userQuests, availableQuests] = await Promise.all([
      getUserQuests(userId),
      fetchAvailableQuests()
    ]);

    const completed = userQuests.length;
    const total = availableQuests.length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      completed,
      total,
      completionRate
    };
  } catch (error) {
    console.error("Error fetching quest stats:", error);
    const availableQuests = await fetchAvailableQuests();
    return {
      completed: 0,
      total: availableQuests.length,
      completionRate: 0
    };
  }
};

/**
 * Calcule la progression vers une quête spécifique (pour affichage)
 * Retourne { current, target } pour les quêtes graduelles, null pour les autres
 */
export const getQuestProgress = async (
  userId: string,
  questSlug: string
): Promise<{ current: number; target: number } | null> => {
  try {
    if (!userId || !questSlug) return null;

    // Récupérer les données nécessaires
    const readingProgress = await getUserReadingProgress(userId);
    const { data: validations } = await supabase
      .from('reading_validations')
      .select('*')
      .eq('user_id', userId)
      .order('validated_at', { ascending: false });

    if (!validations) return null;

    const completedBooks = readingProgress.filter(p => p.status === 'completed');
    const { data: streakData } = await supabase.rpc('get_user_streaks' as any, { user_id: userId });
    const currentStreak = (streakData as any)?.current || 0;

    // Calculer la progression selon la quête
    switch (questSlug) {
      case 'marathon_reader': {
        // 10 validations en 1 journée - trouver le max atteint aujourd'hui
        const today = getLocalDateString(new Date().toISOString());
        const todayValidations = validations.filter(v =>
          getLocalDateString(v.validated_at) === today
        ).length;
        return { current: Math.min(todayValidations, 10), target: 10 };
      }

      case 'night_marathon': {
        // 5 validations entre 22h-6h
        const nightValidations = validations.filter(v => {
          const hour = getLocalHour(v.validated_at);
          return hour >= 22 || hour < 6;
        }).length;
        return { current: Math.min(nightValidations, 5), target: 5 };
      }

      case 'binge_reading': {
        // 3 livres en 7 jours - trouver le max sur une fenêtre glissante
        if (completedBooks.length < 3) {
          return { current: completedBooks.length, target: 3 };
        }

        const sortedBooks = [...completedBooks].sort((a, b) =>
          new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime()
        );

        let maxInWeek = 0;
        for (let i = 0; i <= sortedBooks.length - 3; i++) {
          const firstBook = new Date(sortedBooks[i].updated_at);
          const thirdBook = new Date(sortedBooks[i + 2].updated_at);
          const daysDiff = Math.floor((thirdBook.getTime() - firstBook.getTime()) / (1000 * 60 * 60 * 24));
          if (daysDiff <= 7) {
            maxInWeek = 3;
            break;
          }
        }
        return { current: maxInWeek || completedBooks.length, target: 3 };
      }

      case 'unstoppable': {
        // 30 jours consécutifs
        return { current: Math.min(currentStreak, 30), target: 30 };
      }

      case 'punctual': {
        // Même heure pendant 7 jours - logique complexe, on retourne null
        // (trop complexe pour un simple indicateur de progression)
        return null;
      }

      case 'perfect_month': {
        // 1 validation/jour pendant 30 jours
        return { current: Math.min(currentStreak, 30), target: 30 };
      }

      // Quêtes non graduelles (événements uniques)
      default:
        return null;
    }
  } catch (error) {
    console.error(`Error calculating progress for quest ${questSlug}:`, error);
    return null;
  }
};
