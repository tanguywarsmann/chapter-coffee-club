
import { supabase } from "@/integrations/supabase/client";
import { Quest, UserQuest, QuestSlug } from "@/types/quest";
import { addXP } from "@/services/user/levelService";
import { getUserReadingProgress } from "./reading/progressService";
import { Database } from "@/integrations/supabase/types";
import { toast } from "sonner";

type UserQuestRecord = Database['public']['Tables']['user_quests']['Row'];

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

// Définition des quêtes disponibles
export const availableQuests: Quest[] = [
  // LECTURE HORAIRE
  {
    slug: 'early_reader' as QuestSlug,
    title: 'Lecteur matinal',
    description: 'Lire un livre avant 7h du matin',
    icon: 'sunrise'
  },
  {
    slug: 'night_owl' as QuestSlug,
    title: 'Marathon nocturne',
    description: 'Lire après 22h (noctambule de la lecture)',
    icon: 'moon'
  },
  {
    slug: 'sunday_reader' as QuestSlug,
    title: 'Lecteur du dimanche',
    description: 'Lire un dimanche (détente garantie)',
    icon: 'coffee'
  },
  {
    slug: 'weekend_warrior' as QuestSlug,
    title: 'Week-end de lecture',
    description: 'Lire le samedi ET le dimanche',
    icon: 'calendar'
  },

  // VALIDATIONS
  {
    slug: 'triple_valide' as QuestSlug,
    title: 'Triple validation',
    description: 'Valider 3 segments de lecture en une seule journée',
    icon: 'zap'
  },
  {
    slug: 'centurion' as QuestSlug,
    title: 'Centurion',
    description: 'Valider 100 segments de lecture au total',
    icon: 'shield'
  },

  // LIVRES
  {
    slug: 'first_book' as QuestSlug,
    title: 'Premier pas',
    description: 'Terminer votre tout premier livre',
    icon: 'book-open'
  },
  {
    slug: 'bibliophile' as QuestSlug,
    title: 'Bibliophile',
    description: 'Terminer 5 livres au total',
    icon: 'library'
  },
  {
    slug: 'multi_booker' as QuestSlug,
    title: 'Multi-lecteur',
    description: 'Avoir 3 livres en cours de lecture simultanément',
    icon: 'books'
  },

  // VITESSE & RÉGULARITÉ
  {
    slug: 'speed_reader' as QuestSlug,
    title: 'Vitesse de croisière',
    description: 'Terminer un livre en moins de 7 jours',
    icon: 'rocket'
  },
  {
    slug: 'fire_streak' as QuestSlug,
    title: 'Série de feu',
    description: 'Lire pendant 7 jours consécutifs',
    icon: 'flame'
  },
  {
    slug: 'back_on_track' as QuestSlug,
    title: 'De retour sur les rails',
    description: 'Reprendre la lecture après une pause de 7 jours',
    icon: 'refresh'
  }
];

/**
 * Complète une quête pour un utilisateur
 */
export const completeQuest = async (userId: string, questSlug: string): Promise<boolean> => {
  try {
    if (!userId || !questSlug) {
      console.error("completeQuest: userId and questSlug are required");
      return false;
    }

    // Vérifier si la quête est déjà débloquée
    const { data: existingQuest, error: questError } = await supabase
      .from('user_quests')
      .select('*')
      .eq('user_id', userId)
      .eq('quest_slug', questSlug)
      .maybeSingle();

    if (questError && questError.code !== 'PGRST116') {
      console.error("Error checking existing quest:", questError);
      return false;
    }

    if (existingQuest) {
      console.log("Quest already unlocked:", questSlug);
      return true; // Quête déjà débloquée
    }

    // Insérer la quête terminée dans la table user_quests
    const { data, error } = await supabase
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
      return false;
    }

    console.log(`✅ Quête terminée avec succès: ${questSlug} pour l'utilisateur ${userId}`);
    
    // Ajouter des points XP pour la complétion d'une quête (50 XP)
    const xpSuccess = await addXP(userId, 50);
    if (xpSuccess) {
      console.log(`✅ XP ajouté pour la quête: +50 XP`);
    }

    // Notifier l'utilisateur
    const questInfo = availableQuests.find(q => q.slug === questSlug);
    if (questInfo) {
      toast.success(`Quête terminée : ${questInfo.title}`, {
        duration: 5000,
      });
    }
    
    return true;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    console.error("Error completing quest:", errorMsg);
    return false;
  }
};

/**
 * Vérifie les quêtes d'un utilisateur et les débloque selon certaines conditions
 */
export const checkUserQuests = async (userId: string): Promise<void> => {
  try {
    if (!userId) {
      console.error("checkUserQuests: userId is required");
      return;
    }

    console.log(`🔍 Vérification des quêtes pour l'utilisateur ${userId}`);

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

    // Vérifier chaque quête disponible
    for (const quest of availableQuests) {
      let shouldUnlock = false;

      switch (quest.slug) {
        // ===== LECTURE HORAIRE =====
        case 'early_reader':
          // Vérifier si l'utilisateur a lu avant 7h (heure locale)
          if (validations && validations.length > 0) {
            shouldUnlock = validations.some(v => {
              const hour = getLocalHour(v.validated_at);
              return hour < 7;
            });
          }
          break;

        case 'night_owl':
          // Vérifier si l'utilisateur a lu après 22h (heure locale)
          if (validations && validations.length > 0) {
            shouldUnlock = validations.some(v => {
              const hour = getLocalHour(v.validated_at);
              return hour >= 22;
            });
          }
          break;

        case 'sunday_reader':
          // Vérifier si l'utilisateur a lu un dimanche (timezone local)
          if (validations && validations.length > 0) {
            shouldUnlock = validations.some(v => {
              const day = getLocalDay(v.validated_at);
              return day === 0; // 0 = dimanche
            });
          }
          break;

        case 'weekend_warrior':
          // Vérifier si l'utilisateur a lu le samedi ET le dimanche du MÊME weekend
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

        // ===== VALIDATIONS =====
        case 'triple_valide':
          // Vérifier si l'utilisateur a validé 3 segments dans la même journée
          if (validations && validations.length >= 3) {
            const today = new Date().toISOString().split('T')[0];
            const todayValidations = validations.filter(v =>
              v.validated_at.startsWith(today)
            );
            shouldUnlock = todayValidations.length >= 3;
          }
          break;

        case 'centurion':
          // Vérifier si l'utilisateur a validé 100 segments au total
          shouldUnlock = validations && validations.length >= 100;
          break;

        // ===== LIVRES =====
        case 'first_book':
          // Vérifier si l'utilisateur a terminé son premier livre
          shouldUnlock = completedBooks.length >= 1;
          break;

        case 'bibliophile':
          // Vérifier si l'utilisateur a terminé 5 livres
          shouldUnlock = completedBooks.length >= 5;
          break;

        case 'multi_booker':
          // Vérifier si l'utilisateur a 3 livres en cours
          const inProgressBooks = readingProgress.filter(p => p.status === 'in_progress');
          shouldUnlock = inProgressBooks.length >= 3;
          break;

        // ===== VITESSE & RÉGULARITÉ =====
        case 'speed_reader':
          // Vérifier si l'utilisateur a terminé un livre en moins de 7 jours
          shouldUnlock = completedBooks.some(book => {
            if (!book.started_at) return false;
            const startDate = new Date(book.started_at);
            const endDate = new Date(book.updated_at);
            const daysDiff = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
            return daysDiff < 7;
          });
          break;

        case 'fire_streak':
          // Vérifier si l'utilisateur a un streak actuel ou meilleur de 7 jours
          // Cette fonction existe déjà dans la DB (get_user_streaks)
          const { data: streakData, error: streakError } = await supabase
            .rpc('get_user_streaks' as any, { user_id: userId });

          if (!streakError && streakData) {
            const bestStreak = (streakData as any).best || 0;
            shouldUnlock = bestStreak >= 7;
          }
          break;

        case 'back_on_track':
          // Vérifier si l'utilisateur a repris la lecture après 7 jours
          if (validations && validations.length >= 2) {
            const lastValidation = new Date(validations[0].validated_at);
            const previousValidation = new Date(validations[1].validated_at);
            const daysDifference = Math.floor((lastValidation.getTime() - previousValidation.getTime()) / (1000 * 60 * 60 * 24));
            shouldUnlock = daysDifference >= 7;
          }
          break;

        default:
          break;
      }

      if (shouldUnlock) {
        const success = await completeQuest(userId, quest.slug);
        if (success) {
          console.log(`🎉 Quête automatiquement débloquée: ${quest.slug}`);
        }
      }
    }
  } catch (error) {
    console.error("Error checking user quests:", error);
  }
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

    const { data, error } = await supabase
      .from('user_quests')
      .select('*')
      .eq('user_id', userId)
      .order('unlocked_at', { ascending: false });

    if (error) {
      console.error("Error fetching user quests:", error);
      return [];
    }

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
    const userQuests = await getUserQuests(userId);
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
    return {
      completed: 0,
      total: availableQuests.length,
      completionRate: 0
    };
  }
};
