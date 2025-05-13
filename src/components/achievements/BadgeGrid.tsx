
import { Badge } from "@/types/badge";
import { BadgeGridProps } from "./types";
import { cn } from "@/lib/utils";
import { BadgeCard } from "./BadgeCard";

export function BadgeGrid({ 
  badges, 
  isLocked = false, 
  favoriteBadgeIds = [],
  onFavoriteToggle,
  showFavoriteToggle = false,
  className
}: BadgeGridProps) {
  return (
    <div className={cn("grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6", className)}>
      {badges.map((badge) => (
        <BadgeCard 
          key={badge.id}
          badge={badge}
          isLocked={isLocked}
          isFavorite={favoriteBadgeIds.includes(badge.id)}
          onFavoriteToggle={() => onFavoriteToggle?.(badge.id)}
          showFavoriteToggle={showFavoriteToggle && !isLocked}
        />
      ))}
    </div>
  );
}
