import { supabase } from "@/integrations/supabase/client";
import { Quest, UserQuest, QuestSlug } from "@/types/quest";
import { addXP } from "@/services/user/levelService";
import { getUserReadingProgress } from "./reading/progressService";

// Définition des quêtes disponibles
export const availableQuests: Quest[] = [
  {
    slug: 'early_reader',
    title: 'Lecteur matinal',
    description: 'Lire un livre avant 7h du matin',
    icon: 'sun'
  },
  {
    slug: 'triple_valide',
    title: 'Triple validation',
    description: 'Valider 3 segments de lecture en une seule journée',
    icon: 'zap'
  },
  {
    slug: 'multi_booker',
    title: 'Multi-lecteur',
    description: 'Avoir 3 livres en cours de lecture simultanément',
    icon: 'books'
  },
  {
    slug: 'back_on_track',
    title: 'De retour sur les rails',
    description: 'Reprendre la lecture après une pause de 7 jours',
    icon: 'refresh'
  }
];

// Mock function to simulate quest completion
export const completeQuest = async (userId: string, questSlug: string): Promise<void> => {
  try {
    // Check if the quest is already unlocked
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
      return; // Quest already unlocked
    }

    // Insert the completed quest into the user_quests table
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
  } catch (error: any) {
    console.error("Error completing quest:", error.message);
    throw error;
  }
};

// Check user quests and unlock them based on certain conditions
export const checkUserQuests = async (userId: string): Promise<void> => {
  try {
    // Fetch user's reading progress
    const readingProgress = await getUserReadingProgress(userId);

    // Check each available quest and unlock if conditions are met
    for (const quest of availableQuests) {
      let shouldUnlock = false;

      switch (quest.slug) {
        case 'read-10-books':
          // Example: Unlock if user has read 10 books
          shouldUnlock = readingProgress.length >= 10;
          break;
        case 'complete-5-quests':
          // Example: Unlock if user has completed 5 other quests
          const { count, error } = await supabase
            .from('user_quests')
            .select('*', { count: 'exact', head: false })
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
        // Unlock the quest for the user
        await completeQuest(userId, quest.slug);
      }
    }
  } catch (error) {
    console.error("Error checking user quests:", error);
  }
};

// Get all quests for a user
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

    // Map the user quests to include quest details
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
