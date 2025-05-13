
import { Badge } from "@/types/badge";

export interface BadgeGridProps {
  badges: Badge[];
  isLocked?: boolean;
}

export interface BadgeCardProps {
  badge: Badge;
  isLocked?: boolean;
  className?: string;
}
