import { useState, useEffect } from "react";
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
  const [showBirth, setShowBirth] = useState(false);
  const [showWeek, setShowWeek] = useState(false);
  const [showReturn, setShowReturn] = useState(false);

  useEffect(() => {
    if (!bookyResult) return;

    // Priorité : 1) Naissance, 2) Semaine, 3) Retour
    if (bookyResult.isFirstDay) {
      setShowBirth(true);
    } else if (bookyResult.isFirstWeek) {
      setShowWeek(true);
    } else if (bookyResult.isReturnAfterBreak) {
      setShowReturn(true);
    }
  }, [bookyResult]);

  return {
    showBirthRitual: showBirth,
    showWeekRitual: showWeek,
    showReturnRitual: showReturn,
    closeBirthRitual: () => setShowBirth(false),
    closeWeekRitual: () => setShowWeek(false),
    closeReturnRitual: () => setShowReturn(false),
  };
}
