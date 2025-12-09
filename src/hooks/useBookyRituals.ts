import { useState, useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { UpdateProgressResult, markRitualAsSeen } from "@/lib/booky";

export interface BookyRitualsResult {
  showBirthRitual: boolean;
  showWeekRitual: boolean;
  showReturnRitual: boolean;
  showEvolution: boolean;
  evolutionData: { previousStage: number; newStage: number } | null;
  closeBirthRitual: () => void;
  closeWeekRitual: () => void;
  closeReturnRitual: () => void;
  closeEvolution: () => void;
}

export function useBookyRituals(
  bookyResult: UpdateProgressResult | null | undefined
): BookyRitualsResult {
  const queryClient = useQueryClient();
  const [showBirth, setShowBirth] = useState(false);
  const [showWeek, setShowWeek] = useState(false);
  const [showReturn, setShowReturn] = useState(false);
  const [showEvolution, setShowEvolution] = useState(false);
  const [evolutionData, setEvolutionData] = useState<{ previousStage: number; newStage: number } | null>(null);

  useEffect(() => {
    console.log("🦊 [Booky][Rituals] bookyResult changed:", bookyResult);

    if (!bookyResult) {
      console.log("🦊 [Booky][Rituals] bookyResult is null/undefined");
      return;
    }

    console.log("🦊 [Booky][Rituals] Flags:", {
      isFirstDay: bookyResult.isFirstDay,
      isFirstWeek: bookyResult.isFirstWeek,
      isReturnAfterBreak: bookyResult.isReturnAfterBreak,
      isEvolution: bookyResult.isEvolution,
      previousStage: bookyResult.previousStage,
      newStage: bookyResult.newStage,
      stage: bookyResult.companion?.current_stage,
      total_reading_days: bookyResult.companion?.total_reading_days
    });

    // 1) Update companion cache for widget
    if (bookyResult.companion) {
      console.log("🦊 [Booky][Rituals] Updating companion cache:", bookyResult.companion);
      queryClient.setQueryData(
        ["companion", bookyResult.companion.user_id],
        bookyResult.companion
      );
    }

    // 2) Handle ritual priority (birth > evolution > week > return)
    if (bookyResult.isFirstDay) {
      console.log("🦊 Triggering BirthRitual");
      setShowBirth(true);
    } else if (bookyResult.isEvolution) {
      console.log("🦊 Triggering EvolutionCeremony", bookyResult.previousStage, "→", bookyResult.newStage);
      setEvolutionData({ previousStage: bookyResult.previousStage, newStage: bookyResult.newStage });
      setShowEvolution(true);
    } else if (bookyResult.isFirstWeek) {
      console.log("🦊 Triggering WeekRitual");
      setShowWeek(true);
    } else if (bookyResult.isReturnAfterBreak) {
      console.log("🦊 Triggering ReturnRitual");
      setShowReturn(true);
    }
  }, [bookyResult, queryClient]);

  const closeBirthRitual = useCallback(async () => {
    if (bookyResult?.companion?.user_id) {
      await markRitualAsSeen(bookyResult.companion.user_id, 'birth');
    }
    setShowBirth(false);
  }, [bookyResult?.companion?.user_id]);

  const closeWeekRitual = useCallback(async () => {
    if (bookyResult?.companion?.user_id) {
      await markRitualAsSeen(bookyResult.companion.user_id, 'week');
    }
    setShowWeek(false);
  }, [bookyResult?.companion?.user_id]);

  const closeReturnRitual = useCallback(async () => {
    if (bookyResult?.companion?.user_id) {
      await markRitualAsSeen(bookyResult.companion.user_id, 'return');
    }
    setShowReturn(false);
  }, [bookyResult?.companion?.user_id]);

  const closeEvolution = useCallback(() => {
    setShowEvolution(false);
    setEvolutionData(null);
  }, []);

  return {
    showBirthRitual: showBirth,
    showWeekRitual: showWeek,
    showReturnRitual: showReturn,
    showEvolution,
    evolutionData,
    closeBirthRitual,
    closeWeekRitual,
    closeReturnRitual,
    closeEvolution,
  };
}
