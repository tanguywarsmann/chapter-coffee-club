
import { useState } from "react";
import { Book } from "@/types/book";
import { Badge } from "@/types/badge";
import { UserQuest } from "@/types/quest";
import { addXP } from "@/services/user/levelService";
import { getBookReadingProgress } from "@/services/reading/progressService";
import { useReadingProgress } from "./useReadingProgress";
import { toast } from "sonner";

interface UseQuizCompletionProps {
  book: Book | null;
  userId: string | null;
  originalHandleQuizComplete: (correct: boolean, useJoker?: boolean) => Promise<any>;
  onProgressUpdate?: (bookId: string) => void;
}

export const useQuizCompletion = ({
  book,
  userId,
  originalHandleQuizComplete,
  onProgressUpdate
}: UseQuizCompletionProps) => {
  const [newBadges, setNewBadges] = useState<Badge[]>([]);
  const [newQuests, setNewQuests] = useState<UserQuest[]>([]);
  const { forceRefresh } = useReadingProgress();

  const handleQuizComplete = async (correct: boolean, useJoker?: boolean) => {
    console.log("🎲 useQuizCompletion.handleQuizComplete called with:", { correct, useJoker });
    try {
      const result = await originalHandleQuizComplete(correct, useJoker);
      
      if (correct && userId && book?.id) {
        // ✅ Phase 2.1: Optimisation - Un seul refresh au lieu de 3
        console.log("🔄 Rafraîchissement immédiat après validation réussie");
        
        // Force refresh of reading progress hook
        forceRefresh();
        
        // Trigger parent component update
        if (onProgressUpdate) {
          onProgressUpdate(book.id);
        }
      }
      
      // Check if there are any newly unlocked badges
      if (result?.newBadges && result.newBadges.length > 0) {
        setNewBadges(result.newBadges);

        // Ajouter des XP supplémentaires pour un streak (30 XP)
        if (userId && result.newBadges.some(badge => badge.id && badge.id.includes('streak'))) {
          await addXP(userId, 30);
        }
      } else {
        setNewBadges([]);
      }

      // Check if there are any newly unlocked quests
      if (result?.newQuests && result.newQuests.length > 0) {
        console.log("🏆 Nouvelles quêtes débloquées:", result.newQuests);
        setNewQuests(result.newQuests);

        // Toast spécial pour les quêtes (plus prestigieux que les badges)
        result.newQuests.forEach((quest: any) => {
          const questTitle = quest.quest?.title || quest.quest_slug;
          const xpReward = quest.quest?.xp_reward || 100;

          toast.success(`🏆 Challenge Complété : ${questTitle}`, {
            description: `+${xpReward} XP • Exploit rare débloqué !`,
            duration: 8000, // Plus long que les badges (8s vs 6s)
            className: 'quest-toast-special bg-gradient-to-r from-amber-100 to-yellow-100 border-2 border-amber-400',
          });
        });
      } else {
        setNewQuests([]);
      }

      return result;
    } catch (error) {
      console.error("Error in quiz completion:", error);
      
      // Même en cas d'erreur, essayer de rafraîchir les données
      try {
        forceRefresh();
      } catch (refreshError) {
        console.error("Erreur lors du rafraîchissement des données:", refreshError);
      }
      
      throw error;
    }
  };

  return {
    newBadges,
    setNewBadges,
    newQuests,
    setNewQuests,
    handleQuizComplete
  };
};
