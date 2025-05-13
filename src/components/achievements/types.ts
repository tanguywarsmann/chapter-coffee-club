
import { Badge } from "@/types/badge";

export interface BadgeGridProps {
  badges: Badge[];
  isLocked?: boolean;
  className?: string;
}

export interface BadgeCardProps {
  badge: Badge;
  isLocked?: boolean;
  className?: string;
}

export interface BadgeRarityProgressProps {
  earnedBadges: Badge[];
  allBadges: Badge[];
  className?: string;
}
