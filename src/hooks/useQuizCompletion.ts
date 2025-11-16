
import { useState, useRef, useEffect, useMemo } from "react";
import { Book } from "@/types/book";
import { Badge } from "@/types/badge";
import { UserQuest } from "@/types/quest";
import { addXP } from "@/services/user/levelService";
import { getBookReadingProgress } from "@/services/reading/progressService";
import { useReadingProgress } from "./useReadingProgress";
import { toast } from "sonner";
import { useBookyRituals } from "./useBookyRituals";
import { UpdateProgressResult } from "@/lib/booky";
import { debounce } from "lodash";

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
  // FIX P0-3: Ajouter isMounted guard
  const isMounted = useRef(true);
  
  const [newBadges, setNewBadges] = useState<Badge[]>([]);
  const [newQuests, setNewQuests] = useState<UserQuest[]>([]);
  const [bookyResult, setBookyResult] = useState<UpdateProgressResult | null>(null);
  const { forceRefresh } = useReadingProgress();

  // FIX P0-3: Cleanup
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // FIX P0-1: Debounce forceRefresh pour éviter cascade de re-renders
  const debouncedForceRefresh = useMemo(
    () => debounce(() => {
      if (isMounted.current) {
        forceRefresh();
      }
    }, 500), // 500ms debounce pour éviter les appels multiples rapides
    [forceRefresh]
  );

  const rituals = useBookyRituals(bookyResult);

  const handleQuizComplete = async (correct: boolean, useJoker?: boolean) => {
    console.log("🎲 useQuizCompletion.handleQuizComplete called with:", { correct, useJoker });
    try {
      const result = await originalHandleQuizComplete(correct, useJoker);
      
      // FIX P0-3: Check isMounted avant setState
      if (!isMounted.current) return result;
      
      if (correct && userId && book?.id) {
        // FIX P0-1: Utiliser le debounced refresh au lieu du direct
        console.log("🔄 Rafraîchissement debounced après validation réussie");
        
        // Force refresh of reading progress hook (debounced)
        debouncedForceRefresh();
        
        // Trigger parent component update
        if (onProgressUpdate) {
          onProgressUpdate(book.id);
        }
      }
      
      // FIX P0-3: Check isMounted avant chaque setState
      if (!isMounted.current) return result;
      
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

      if (!isMounted.current) return result;

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

      if (!isMounted.current) return result;

      // Check for Booky rituals (indépendant des quêtes/badges)
      if (result?.bookyResult) {
        console.log("🦊 [Booky][QuizCompletion] bookyResult reçu:", result.bookyResult);
        console.log("🦊 [Booky][QuizCompletion] flags:", {
          isFirstDay: result.bookyResult.isFirstDay,
          isFirstWeek: result.bookyResult.isFirstWeek,
          isReturnAfterBreak: result.bookyResult.isReturnAfterBreak
        });
        setBookyResult(result.bookyResult);
      }

      return result;
    } catch (error) {
      console.error("Error in quiz completion:", error);
      
      // FIX P0-4: Toast d'erreur plus explicite
      toast.error("Erreur lors de la validation. Vos données seront rafraîchies.");
      
      // Même en cas d'erreur, essayer de rafraîchir les données (debounced)
      try {
        if (isMounted.current) {
          debouncedForceRefresh();
        }
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
    handleQuizComplete,
    ...rituals,
  };
};
