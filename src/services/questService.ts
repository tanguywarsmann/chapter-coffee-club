import { supabase } from "@/integrations/supabase/client";
import { Quest } from "@/types/quest";
import { addXP } from "@/services/user/levelService";
import { getUserReadingProgress } from "./reading/progressService";

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
  } catch (error: any) {
    console.error("Error completing quest:", error.message);
    throw error;
  }
};

// Check user quests and unlock them based on certain conditions
export const checkUserQuests = async (userId: string): Promise<void> => {
  try {
    // Fetch user's reading progress (assuming you have a function for this)
    const readingProgress = await getUserReadingProgress(userId); // Replace 'some_book_id' with a relevant book ID if needed

    // Check each available quest and unlock if conditions are met
    for (const quest of availableQuests) {
      let shouldUnlock = false;

      switch (quest.slug) {
        case 'read-10-books':
          // Example: Unlock if user has read 10 books (customize this condition)
          shouldUnlock = (readingProgress?.total_pages || 0) >= 10;
          break;
        case 'complete-5-quests':
          // Example: Unlock if user has completed 5 other quests (customize this condition)
          // This requires fetching the number of completed quests for the user
          const { count, error } = await supabase
            .from('user_quests')
            .select('*', { count: 'exact', head: false })
            .eq('user_id', userId);

          if (error) {
            console.error("Error fetching completed quests:", error);
            continue; // Skip this quest if there's an error
          }

          shouldUnlock = (count || 0) >= 5;
          break;
        // Add more cases for other quests as needed
        default:
          break;
      }

      if (shouldUnlock) {
        // Unlock the quest for the user
        await completeQuest(userId, quest.slug);
        
        // Ajouter des points XP pour la complétion d'une quête (50 XP)
        await addXP(userId, 50);
      }
    }
  } catch (error) {
    console.error("Error checking user quests:", error);
  }
};

// Get all quests for a user
export const getUserQuests = async (userId: string): Promise<Quest[]> => {
  try {
    const { data, error } = await supabase
      .from('user_quests')
      .select('quest_slug')
      .eq('user_id', userId);

    if (error) {
      console.error("Error fetching user quests:", error);
      return [];
    }

    // Map the slugs to full quest objects
    const quests = data.map(item => availableQuests.find(q => q.slug === item.quest_slug)).filter(Boolean) as Quest[];
    return quests;
  } catch (error) {
    console.error("Error fetching user quests:", error);
    return [];
  }
};
