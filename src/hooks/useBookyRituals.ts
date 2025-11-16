import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { UpdateProgressResult } from "@/lib/booky";

export interface BookyRitualsResult {
  showBirthRitual: boolean;
  showWeekRitual: boolean;
  showReturnRitual: boolean;
  closeBirthRitual: () => void;
  closeWeekRitual: () => void;
  closeReturnRitual: () => void;
}

export function useBookyRituals(
  bookyResult: UpdateProgressResult | null | undefined
): BookyRitualsResult {
  const queryClient = useQueryClient();
  const [showBirth, setShowBirth] = useState(false);
  const [showWeek, setShowWeek] = useState(false);
  const [showReturn, setShowReturn] = useState(false);

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
      stage: bookyResult.companion?.current_stage,
      total_reading_days: bookyResult.companion?.total_reading_days
    });

    // 1) Mettre à jour le cache du companion pour le widget
    if (bookyResult.companion) {
      console.log("🦊 [Booky][Rituals] Mise à jour du cache companion:", bookyResult.companion);
      queryClient.setQueryData(
        ["companion", bookyResult.companion.user_id],
        bookyResult.companion
      );
    }

    // 2) Gérer la priorité des rituels
    if (bookyResult.isFirstDay) {
      console.log("🦊 Déclenchement BirthRitual");
      setShowBirth(true);
    } else if (bookyResult.isFirstWeek) {
      console.log("🦊 Déclenchement WeekRitual");
      setShowWeek(true);
    } else if (bookyResult.isReturnAfterBreak) {
      console.log("🦊 Déclenchement ReturnRitual");
      setShowReturn(true);
    }
  }, [bookyResult, queryClient]);

  return {
    showBirthRitual: showBirth,
    showWeekRitual: showWeek,
    showReturnRitual: showReturn,
    closeBirthRitual: () => setShowBirth(false),
    closeWeekRitual: () => setShowWeek(false),
    closeReturnRitual: () => setShowReturn(false),
  };
}
