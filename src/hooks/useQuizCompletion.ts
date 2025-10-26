
import { useState } from "react";
import { Book } from "@/types/book";
import { Badge } from "@/types/badge";
import { UserQuest } from "@/types/quest";
import { addXP } from "@/services/user/levelService";
import { getBookReadingProgress } from "@/services/reading/progressService";
import { useReadingProgress } from "./useReadingProgress";

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
        // Force immediate refresh of multiple data sources for mobile
        console.log("🔄 Rafraîchissement immédiat après validation réussie (enhanced mobile)");
        
        // 1. Force refresh of reading progress hook
        forceRefresh();
        
        // 2. Trigger parent component update
        if (onProgressUpdate) {
          onProgressUpdate(book.id);
        }
        
        // 3. Multiple attempts to get fresh book progress data for mobile compatibility
        const refreshAttempts = [0, 100, 300]; // Immediate, then delayed attempts
        
        for (const delay of refreshAttempts) {
          setTimeout(async () => {
            try {
              const updatedProgress = await getBookReadingProgress(userId, book.id);
              if (updatedProgress) {
                console.log(`📚 Progression mise à jour (attempt delay: ${delay}ms):`, {
                  chaptersRead: updatedProgress.chaptersRead,
                  progressPercent: updatedProgress.progressPercent
                });
              }
            } catch (error) {
              console.error(`Erreur lors de la récupération (attempt delay: ${delay}ms):`, error);
            }
          }, delay);
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
