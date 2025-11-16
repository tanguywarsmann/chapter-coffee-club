import { memo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CompanionData } from "@/lib/booky";
import { Flame, Trophy, Calendar, BookOpen } from "lucide-react";

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
  const isEgg = companion.current_stage === 1;
  const hasGlasses = companion.current_streak >= 7;

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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            Statistiques de Booky
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Booky Avatar */}
          <div className="flex justify-center">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center text-7xl shadow-lg">
              {isEgg ? "🥚" : hasGlasses ? "🦊🤓" : "🦊"}
            </div>
          </div>

          {/* Stage description */}
          <p className="text-center text-muted-foreground text-sm">
            {isEgg
              ? "Continue de lire pour voir ton compagnon éclore !"
              : hasGlasses
              ? "Ton renardeau studieux est fier de toi ! 🎓"
              : "Ton renardeau grandit avec chaque lecture ! 📚"}
          </p>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="bg-muted/30 rounded-xl p-4 space-y-2"
              >
                <div className="flex items-center gap-2">
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  <span className="text-xs text-muted-foreground">
                    {stat.label}
                  </span>
                </div>
                <p className="text-2xl font-semibold text-foreground">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>

          {/* Motivational message */}
          {companion.current_streak === 0 ? (
            <div className="bg-primary/5 rounded-lg p-4 text-center">
              <p className="text-sm text-foreground/80">
                Valide un segment aujourd'hui pour démarrer une nouvelle série
                ! 🔥
              </p>
            </div>
          ) : companion.current_streak < 7 ? (
            <div className="bg-primary/5 rounded-lg p-4 text-center">
              <p className="text-sm text-foreground/80">
                Plus que {7 - companion.current_streak} jours pour que Booky
                gagne ses lunettes ! 🤓
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
