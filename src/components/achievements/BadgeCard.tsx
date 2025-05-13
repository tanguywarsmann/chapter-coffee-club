
import { Badge } from "@/types/badge";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export interface BadgeCardProps {
  badge: Badge;
  isLocked?: boolean;
  className?: string;
}

const rarityStyles: Record<string, string> = {
  legendary: "border-4 border-yellow-400 shadow-lg shadow-yellow-300/30 bg-gradient-to-br from-yellow-100 to-white",
  epic: "border-2 border-purple-400 shadow-md shadow-purple-300/30 bg-gradient-to-br from-purple-100 to-white",
  rare: "border border-blue-300 shadow-sm shadow-blue-200/30 bg-gradient-to-br from-blue-50 to-white",
  common: "border border-gray-200 bg-white",
};

export function BadgeCard({ badge, isLocked = false, className }: BadgeCardProps) {
  const { name, icon, description, rarity = "common", dateEarned } = badge;
  
  // Get the appropriate style based on the badge's rarity
  const rarityClass = rarityStyles[rarity] || rarityStyles.common;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div 
            className={cn(
              "flex flex-col items-center text-center space-y-3 transition-all duration-200",
              isLocked ? "opacity-70" : "hover:scale-105",
              className
            )}
          >
            <div 
              className={cn(
                "w-20 h-20 rounded-full flex items-center justify-center relative",
                rarityClass,
                isLocked ? "shadow-sm grayscale" : "shadow-md"
              )}
            >
              <span className="text-3xl">{icon}</span>
              
              {/* Overlay with lock for locked badges */}
              {isLocked && (
                <div className="absolute inset-0 rounded-full bg-coffee-dark/20 flex items-center justify-center">
                  <span className="text-xl">🔒</span>
                </div>
              )}
              
              {/* Rarity label for unlocked badges */}
              {!isLocked && (
                <div className="absolute -bottom-2 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white shadow text-coffee-dark border border-coffee-light">
                  {rarity}
                </div>
              )}
            </div>
            
            <div className="space-y-1 px-1">
              <h3 className={cn("font-medium text-sm", isLocked ? "text-coffee-medium" : "text-coffee-darker")}>
                {name}
              </h3>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {description}
              </p>
              
              {/* Date earned for unlocked badges */}
              {!isLocked && dateEarned && (
                <p className="text-[10px] font-medium text-coffee-medium mt-1">
                  Obtenu le {dateEarned}
                </p>
              )}
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-[200px] text-sm">
          <div className="space-y-1">
            <p className="font-medium">{name}</p>
            <p className="text-xs">{description}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
