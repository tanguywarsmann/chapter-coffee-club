
import { Badge } from "@/types/badge";
import { BadgeGridProps } from "./types";
import { cn } from "@/lib/utils";
import { BadgeCard } from "./BadgeCard";

export function BadgeGrid({ badges, isLocked = false }: BadgeGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
      {badges.map((badge) => (
        <BadgeCard 
          key={badge.id}
          badge={badge}
          isLocked={isLocked}
        />
      ))}
    </div>
  );
}
