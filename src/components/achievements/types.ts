
import { Badge } from "@/types/badge";

export interface BadgeGridProps {
  badges: Badge[];
  isLocked?: boolean;
  className?: string;
  favoriteBadgeIds?: string[];
  onFavoriteToggle?: (badgeId: string) => void;
  showFavoriteToggle?: boolean;
}

export interface BadgeCardProps {
  badge: Badge;
  isLocked?: boolean;
  className?: string;
  isFavorite?: boolean;
  onFavoriteToggle?: () => void;
  showFavoriteToggle?: boolean;
}

export interface BadgeRarityProgressProps {
  earnedBadges: Badge[];
  allBadges: Badge[];
  className?: string;
}
