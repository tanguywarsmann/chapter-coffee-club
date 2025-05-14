
import { supabase } from "@/integrations/supabase/client";
import { Quest, UserQuest, QuestSlug } from "@/types/quest";
import { addXP } from "@/services/user/levelService";
import { getUserReadingProgress } from "./reading/progressService";
import { Database } from "@/integrations/supabase/types";

type UserQuestRecord = Database['public']['Tables']['user_quests']['Row'];

// Définition des quêtes disponibles
export const availableQuests: Quest[] = [
  {
    slug: 'early_reader' as QuestSlug,
    title: 'Lecteur matinal',
    description: 'Lire un livre avant 7h du matin',
    icon: 'sun'
  },
  {
    slug: 'triple_valide' as QuestSlug,
    title: 'Triple validation',
    description: 'Valider 3 segments de lecture en une seule journée',
    icon: 'zap'
  },
  {
    slug: 'multi_booker' as QuestSlug,
    title: 'Multi-lecteur',
    description: 'Avoir 3 livres en cours de lecture simultanément',
    icon: 'books'
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
 * @param userId ID de l'utilisateur
 * @param questSlug Slug de la quête
 */
export const completeQuest = async (userId: string, questSlug: string): Promise<void> => {
  try {
    // Vérifier si la quête est déjà débloquée
    const { data: existingQuest, error: questError } = await supabase
      .from('user_quests')
      .select('*')
      .eq('user_id', userId)
      .eq('quest_slug', questSlug)
      .single();

    if (questError && questError.code !== '404') {
      console.error("Error checking existing quest:", questError);
      throw new Error("Failed to check existing quest");
    }

    if (existingQuest) {
      console.log("Quest already unlocked:", questSlug);
      return; // Quête déjà débloquée
    }

    // Insérer la quête terminée dans la table user_quests
    const { data, error } = await supabase
      .from('user_quests')
      .insert([{
        user_id: userId,
        quest_slug: questSlug,
        unlocked_at: new Date().toISOString(),
      }]);

    if (error) {
      console.error("Error completing quest:", error);
      throw new Error("Failed to complete quest");
    }

    console.log("Quest completed successfully:", questSlug);
    
    // Ajouter des points XP pour la complétion d'une quête (50 XP)
    await addXP(userId, 50);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    console.error("Error completing quest:", errorMsg);
    throw error;
  }
};

/**
 * Vérifie les quêtes d'un utilisateur et les débloque selon certaines conditions
 * @param userId ID de l'utilisateur
 */
export const checkUserQuests = async (userId: string): Promise<void> => {
  try {
    // Récupérer la progression de lecture de l'utilisateur
    const readingProgress = await getUserReadingProgress(userId);

    // Vérifier chaque quête disponible et débloquer si les conditions sont remplies
    for (const quest of availableQuests) {
      let shouldUnlock = false;

      switch (quest.slug) {
        case 'read-10-books':
          // Exemple : Débloquer si l'utilisateur a lu 10 livres
          shouldUnlock = readingProgress.length >= 10;
          break;
        case 'complete-5-quests':
          // Exemple : Débloquer si l'utilisateur a complété 5 autres quêtes
          const { count, error } = await supabase
            .from('user_quests')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId);

          if (error) {
            console.error("Error fetching completed quests:", error);
            continue;
          }

          shouldUnlock = (count || 0) >= 5;
          break;
        default:
          break;
      }

      if (shouldUnlock) {
        // Débloquer la quête pour l'utilisateur
        await completeQuest(userId, quest.slug);
      }
    }
  } catch (error) {
    console.error("Error checking user quests:", error);
  }
};

/**
 * Récupère toutes les quêtes d'un utilisateur
 * @param userId ID de l'utilisateur
 * @returns Liste des quêtes de l'utilisateur
 */
export const getUserQuests = async (userId: string): Promise<UserQuest[]> => {
  try {
    const { data, error } = await supabase
      .from('user_quests')
      .select('*')
      .eq('user_id', userId);

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
