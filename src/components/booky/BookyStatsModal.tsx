import { memo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CompanionData } from "@/lib/booky";
import { getStageById, getProgressToNextStage, getNextStage } from "@/lib/bookyStages";
import { BookyAvatar } from "./BookyAvatar";
import { StageParticles } from "./StageParticles";
import { Flame, Trophy, Calendar, BookOpen } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface BookyStatsModalProps {
  companion: CompanionData;
  isOpen: boolean;
  onClose: () => void;
}

export const BookyStatsModal = memo(function BookyStatsModal({
  companion,
  isOpen,
  onClose,
}: BookyStatsModalProps) {
  const stage = getStageById(companion.current_stage);
  const nextStage = getNextStage(companion.current_stage);
  const progressInfo = getProgressToNextStage(companion.total_reading_days);

  const stats = [
    {
      icon: Calendar,
      label: "Jours de lecture",
      value: companion.total_reading_days,
      color: "text-blue-500",
    },
    {
      icon: Flame,
      label: "Série actuelle",
      value: `${companion.current_streak} jours`,
      color: "text-orange-500",
    },
    {
      icon: Trophy,
      label: "Meilleure série",
      value: `${companion.longest_streak} jours`,
      color: "text-yellow-500",
    },
    {
      icon: BookOpen,
      label: "Cette semaine",
      value: `${companion.segments_this_week} segments`,
      color: "text-primary",
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-center">
            Statistiques de Booky
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Booky Avatar with particles */}
          <div 
            className="relative flex flex-col items-center py-6 rounded-xl overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${stage.gradient[0]}20, ${stage.gradient[1]}15)`,
            }}
          >
            <StageParticles stageId={companion.current_stage} count={10} />
            
            <div className="relative z-10">
              <BookyAvatar stageId={companion.current_stage} size="xl" animate />
              {/* Glow effect */}
              <div 
                className="absolute inset-0 rounded-full blur-2xl -z-10 opacity-40"
                style={{ backgroundColor: stage.glowColor }}
              />
            </div>
            
            {/* Stage name and description */}
            <div className="relative z-10 text-center mt-4 space-y-1">
              <h3 className="font-semibold text-lg text-foreground">{stage.name}</h3>
              <p className="text-sm text-muted-foreground max-w-xs">{stage.description}</p>
            </div>
          </div>

          {/* Progress to next stage */}
          {progressInfo && nextStage && (
            <div className="bg-muted/20 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Prochaine évolution</span>
                <span className="font-medium text-foreground">{nextStage.name}</span>
              </div>
              <Progress 
                value={progressInfo.progress} 
                className="h-2"
              />
              <p className="text-xs text-center text-muted-foreground">
                Encore <span className="font-semibold text-foreground">{progressInfo.daysRemaining}</span> jour{progressInfo.daysRemaining > 1 ? 's' : ''} de lecture
              </p>
            </div>
          )}

          {/* Max stage message */}
          {!nextStage && (
            <div className="bg-gradient-to-r from-amber-500/10 to-yellow-500/10 rounded-xl p-4 text-center">
              <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
                🏆 Stade maximum atteint !
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Booky est devenu légendaire grâce à toi
              </p>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="bg-muted/30 rounded-xl p-4 space-y-2"
              >
                <div className="flex items-center gap-2">
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                  <span className="text-xs text-muted-foreground">
                    {stat.label}
                  </span>
                </div>
                <p className="text-xl font-semibold text-foreground">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>

          {/* Motivational message */}
          {companion.current_streak === 0 ? (
            <div className="bg-primary/5 rounded-lg p-4 text-center">
              <p className="text-sm text-foreground/80">
                Valide un segment aujourd'hui pour démarrer une nouvelle série ! 🔥
              </p>
            </div>
          ) : companion.current_streak < 7 ? (
            <div className="bg-primary/5 rounded-lg p-4 text-center">
              <p className="text-sm text-foreground/80">
                Plus que {7 - companion.current_streak} jour{7 - companion.current_streak > 1 ? 's' : ''} pour atteindre une série d'une semaine ! 📚
              </p>
            </div>
          ) : (
            <div className="bg-primary/5 rounded-lg p-4 text-center">
              <p className="text-sm text-foreground/80">
                Continue comme ça, tu es sur une belle lancée ! 🚀
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
});
