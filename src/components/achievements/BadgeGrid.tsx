
import { Badge } from "@/types/badge";

interface BadgeGridProps {
  badges: Badge[] | Omit<Badge, "dateEarned">[];
  isLocked?: boolean;
}

export function BadgeGrid({ badges, isLocked = false }: BadgeGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
      {badges.map(badge => (
        <div key={badge.id} className={`flex flex-col items-center text-center space-y-3 ${isLocked ? 'opacity-70' : ''}`}>
          <div className={`w-24 h-24 rounded-full ${isLocked ? 'bg-muted' : `bg-${badge.color}`} flex items-center justify-center ${isLocked ? 'shadow-sm' : 'shadow-md'} relative`}>
            <span className={`text-4xl ${isLocked ? 'grayscale' : ''}`}>{badge.icon}</span>
            {isLocked && (
              <div className="absolute inset-0 rounded-full bg-coffee-dark/20 flex items-center justify-center">
                <span className="text-xl">🔒</span>
              </div>
            )}
          </div>
          <div className="space-y-1">
            <h3 className="font-medium text-coffee-darker">{badge.name}</h3>
            <p className="text-xs text-muted-foreground">{badge.description}</p>
            {!isLocked && 'dateEarned' in badge && (
              <p className="text-xs font-medium text-coffee-medium mt-1">
                Obtenu le {badge.dateEarned}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
function getRarityStyle(rarity: string) {
  switch (rarity) {
    case "legendary":
      return "border-4 border-yellow-400 shadow-lg shadow-yellow-300/30 bg-gradient-to-br from-yellow-100 to-white";
    case "epic":
      return "border-2 border-purple-400 shadow-md shadow-purple-300/30 bg-gradient-to-br from-purple-100 to-white";
    case "rare":
      return "border border-blue-300 shadow-sm shadow-blue-200 bg-gradient-to-br from-blue-50 to-white";
    case "common":
    default:
      return "border border-gray-200 bg-white";
  }
}
