// Unified toast system for consistent notifications
import { toast } from "sonner";

export const toastSuccess = (message: string, description?: string) => {
  toast.success(message, {
    description,
    duration: 4000,
  });
};

export const toastError = (message: string, description?: string) => {
  toast.error(message, {
    description,
    duration: 4000,
  });
};

export const toastInfo = (message: string, description?: string) => {
  toast(message, {
    description,
    duration: 3000,
  });
};

export const toastXP = (xpAmount: number, description?: string) => {
  toast.success(`+${xpAmount} XP`, {
    description: description || "Continue comme ça !",
    duration: 3000,
    icon: "🎯",
  });
};

export const toastLevelUp = (newLevel: number) => {
  toast.success(`Niveau ${newLevel} atteint !`, {
    description: "Tu progresses, bravo !",
    duration: 5000,
    icon: "🎉",
  });
};

export const toastNearLevelUp = (xpRemaining: number, nextLevel: number) => {
  toast(`Plus que ${xpRemaining} XP pour le niveau ${nextLevel} !`, {
    description: "Continue comme ça !",
    duration: 3000,
    icon: "⚡",
  });
};
