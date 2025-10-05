
import { Flame, Medal, Sparkles } from "lucide-react";

interface StreakStatsProps {
  current: number;
  best: number;
}

export function StreakStats({ current, best }: StreakStatsProps) {

  const formatStreakText = (streak: number, label: string) => {
    const safeStreak = streak ?? 0;
    if (safeStreak === 0) return `Aucune ${label.toLowerCase()}`;
    if (safeStreak === 1) return `${safeStreak} jour`;
    return `${safeStreak} jours`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
      {/* Série actuelle avec design premium Reed */}
      <div className="group relative">
        {/* Effet de lueur d'arrière-plan avec les couleurs Reed */}
        <div className="absolute inset-0 bg-gradient-to-br from-reed-primary/20 to-reed-secondary/20 rounded-3xl blur-xl transform group-hover:scale-105 transition-transform duration-500" />
        
        <div className="relative bg-white/70 backdrop-blur-md border border-white/40 rounded-3xl p-6 sm:p-8 shadow-2xl hover:shadow-3xl transition-all duration-500 group-hover:-translate-y-1">
          {/* Icône avec effet brillant Reed */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
            <div className="relative flex-shrink-0">
              <div className="absolute inset-0 bg-gradient-to-br from-reed-primary to-reed-dark rounded-2xl blur-sm opacity-30 scale-110" />
              <div className="relative p-3 sm:p-4 bg-gradient-to-br from-reed-secondary to-reed-light rounded-2xl border border-reed-primary/30">
                <Flame className="h-6 w-6 sm:h-8 sm:w-8 text-reed-primary" />
              </div>
              {/* Particules décoratives */}
              <div className="absolute -top-1 -right-1">
                <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-reed-primary animate-pulse" />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-caption sm:text-body-sm font-serif font-medium text-reed-dark uppercase mb-2">
                Série Actuelle
              </h3>
              <p className="text-h4 sm:text-h3 font-serif font-semibold text-reed-darker leading-tight break-words">
                {formatStreakText(current ?? 0, "série")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Record personnel */}
      <div className="group relative">
        <div className="absolute inset-0 bg-gradient-to-br from-reed-dark/20 to-reed-primary/20 rounded-3xl blur-xl transform group-hover:scale-105 transition-transform duration-500" />
        
        <div className="relative bg-white/70 backdrop-blur-md border border-white/40 rounded-3xl p-6 sm:p-8 shadow-2xl hover:shadow-3xl transition-all duration-500 group-hover:-translate-y-1">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
            <div className="relative flex-shrink-0">
              <div className="absolute inset-0 bg-gradient-to-br from-reed-dark to-reed-darker rounded-2xl blur-sm opacity-30 scale-110" />
              <div className="relative p-3 sm:p-4 bg-gradient-to-br from-reed-light to-reed-secondary rounded-2xl border border-reed-primary/30">
                <Medal className="h-6 w-6 sm:h-8 sm:w-8 text-reed-dark" />
              </div>
              <div className="absolute -top-1 -right-1">
                <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-reed-primary animate-pulse" />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-caption sm:text-body-sm font-serif font-medium text-reed-dark uppercase mb-2">
                Record Personnel
              </h3>
              <p className="text-h4 sm:text-h3 font-serif font-semibold text-reed-darker leading-tight break-words">
                {formatStreakText(best ?? 0, "record")}
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
