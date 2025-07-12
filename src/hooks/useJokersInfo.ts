import { useState, useEffect } from "react";
import { getRemainingJokers } from "@/services/jokerService";

interface UseJokersInfoProps {
  bookId: string | null;
  userId: string | null;
  expectedSegments?: number;
}

export function useJokersInfo({ bookId, userId, expectedSegments = 0 }: UseJokersInfoProps) {
  const [jokersRemaining, setJokersRemaining] = useState<number>(0);
  const [jokersAllowed, setJokersAllowed] = useState<number>(0);
  const [jokersUsed, setJokersUsed] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadJokersInfo = async () => {
      if (!bookId || !userId) {
        setJokersRemaining(0);
        setJokersAllowed(0);
        setJokersUsed(0);
        return;
      }

      setIsLoading(true);
      try {
        const remaining = await getRemainingJokers(bookId, userId);
        const allowed = Math.floor(expectedSegments / 10) + 1;
        const used = Math.max(0, allowed - remaining);

        setJokersRemaining(remaining);
        setJokersAllowed(allowed);
        setJokersUsed(used);
      } catch (error) {
        console.error("Erreur lors du chargement des informations de jokers:", error);
        setJokersRemaining(0);
        setJokersAllowed(0);
        setJokersUsed(0);
      } finally {
        setIsLoading(false);
      }
    };

    loadJokersInfo();
  }, [bookId, userId, expectedSegments]);

  const updateJokersInfo = async () => {
    if (!bookId || !userId) return;
    
    try {
      const remaining = await getRemainingJokers(bookId, userId);
      const allowed = Math.floor(expectedSegments / 10) + 1;
      const used = Math.max(0, allowed - remaining);

      setJokersRemaining(remaining);
      setJokersUsed(used);
    } catch (error) {
      console.error("Erreur lors de la mise à jour des informations de jokers:", error);
    }
  };

  return {
    jokersRemaining,
    jokersAllowed,
    jokersUsed,
    isLoading,
    updateJokersInfo
  };
}