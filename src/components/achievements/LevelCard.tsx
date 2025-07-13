import { Star, Sparkles } from "lucide-react";

interface LevelCardProps {
  xp: number;
  level: number;
}

export function LevelCard({ xp, level }: LevelCardProps) {
  // Calculate progress toward next level (every 1000 XP)
  const progressPercent = (xp % 1000) / 10; // Convert to percentage (0-100)
  
  return (
    <div className="group relative">
      {/* Effet de lueur d'arrière-plan avec les couleurs Reed */}
      <div className="absolute inset-0 bg-gradient-to-br from-reed-primary/20 to-reed-secondary/20 rounded-3xl blur-xl transform group-hover:scale-105 transition-transform duration-500" />
      
      <div className="relative bg-white/70 backdrop-blur-md border border-white/40 rounded-3xl p-6 sm:p-8 shadow-2xl hover:shadow-3xl transition-all duration-500 group-hover:-translate-y-1">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
          <div className="relative flex-shrink-0">
            <div className="absolute inset-0 bg-gradient-to-br from-reed-primary to-reed-dark rounded-2xl blur-sm opacity-30 scale-110" />
            <div className="relative p-3 sm:p-4 bg-gradient-to-br from-reed-secondary to-reed-light rounded-2xl border border-reed-primary/30">
              <Star className="h-6 w-6 sm:h-8 sm:w-8 text-reed-primary" />
            </div>
            {/* Badge niveau */}
            <div className="absolute -top-2 -right-2">
              <div className="px-2 py-1 bg-gradient-to-br from-reed-primary to-reed-dark rounded-full text-xs font-bold text-white">
                {level}
              </div>
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-xs sm:text-sm font-serif font-medium text-reed-dark uppercase tracking-wider mb-2">
              Niveau {level}
            </h3>
            <p className="text-lg sm:text-xl font-serif font-semibold text-reed-darker mb-3 break-words">
              {xp.toLocaleString()} XP
            </p>
            
            {/* Barre de progression vers le niveau suivant */}
            <div className="w-full bg-reed-light/50 rounded-full h-2 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-reed-primary to-reed-secondary transition-all duration-1000 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-xs text-reed-dark mt-1">
              {1000 - (xp % 1000)} XP jusqu'au niveau {level + 1}
            </p>
          </div>
          
          <div className="flex-shrink-0">
            <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-reed-primary animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}