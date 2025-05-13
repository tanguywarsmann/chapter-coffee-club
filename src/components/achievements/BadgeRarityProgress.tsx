
import { Badge } from "@/types/badge";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

// Define the props for the component
export interface BadgeRarityProgressProps {
  earnedBadges: Badge[];
  allBadges: Badge[];
  className?: string;
}

// Define the structure for rarity data
interface RarityInfo {
  name: string;
  label: string;
  color: string;
  bgColor: string;
  progressColor: string;
}

export function BadgeRarityProgress({ 
  earnedBadges, 
  allBadges, 
  className 
}: BadgeRarityProgressProps) {
  // Define rarity configurations with their display properties
  const rarities: RarityInfo[] = [
    {
      name: "legendary",
      label: "Légendaires",
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      progressColor: "bg-amber-400"
    },
    {
      name: "epic",
      label: "Épiques",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      progressColor: "bg-purple-400"
    },
    {
      name: "rare",
      label: "Rares",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      progressColor: "bg-blue-400"
    },
    {
      name: "common",
      label: "Communs",
      color: "text-gray-600",
      bgColor: "bg-gray-50",
      progressColor: "bg-gray-400"
    }
  ];

  // Group badges by rarity
  const calculateProgress = (rarity: string) => {
    const totalBadges = allBadges.filter(badge => badge.rarity === rarity).length;
    const earnedCount = earnedBadges.filter(badge => badge.rarity === rarity).length;
    const percentage = totalBadges > 0 ? Math.round((earnedCount / totalBadges) * 100) : 0;
    
    return {
      earned: earnedCount,
      total: totalBadges,
      percentage
    };
  };

  return (
    <div className={cn("space-y-3", className)}>
      {rarities.map(rarity => {
        const progress = calculateProgress(rarity.name);
        
        // Skip rarities with no badges
        if (progress.total === 0) return null;
        
        return (
          <div key={rarity.name} className="space-y-1">
            <div className="flex justify-between items-center">
              <span className={cn("text-sm font-medium", rarity.color)}>
                {rarity.label}
              </span>
              <span className="text-xs text-coffee-medium">
                {progress.earned} / {progress.total}
              </span>
            </div>
            
            <Progress 
              value={progress.percentage} 
              className={cn("h-2 bg-coffee-lightest", rarity.bgColor)}
              indicatorClassName={rarity.progressColor}
            />
          </div>
        );
      })}
    </div>
  );
}
