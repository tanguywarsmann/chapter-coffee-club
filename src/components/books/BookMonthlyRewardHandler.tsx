
import { useState, useEffect } from "react";
import { Badge } from "@/types/badge";
import { checkAndGrantMonthlyReward } from "@/services/monthlyRewardService";
import { MonthlyRewardModal } from "./MonthlyRewardModal";

interface BookMonthlyRewardHandlerProps {
  userId: string | undefined;
}

export function useMonthlyReward(userId: string | undefined) {
  const [monthlyReward, setMonthlyReward] = useState<Badge | null>(null);
  const [showMonthlyReward, setShowMonthlyReward] = useState(false);

  useEffect(() => {
    if (userId) {
      checkAndGrantMonthlyReward(userId).then(badge => {
        if (badge) {
          setMonthlyReward(badge);
          setShowMonthlyReward(true);
        }
      });
    }
  }, [userId]);

  return { monthlyReward, showMonthlyReward, setShowMonthlyReward };
}

interface ModalProps {
  monthlyReward: Badge | null;
  showMonthlyReward: boolean;
  onClose: () => void;
}
export function BookMonthlyRewardModal({ monthlyReward, showMonthlyReward, onClose }: ModalProps) {
  return (
    <MonthlyRewardModal 
      badge={monthlyReward}
      isOpen={showMonthlyReward}
      onClose={onClose}
    />
  )
}
