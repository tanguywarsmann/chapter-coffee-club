import { memo, useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getCompanion, ensureCompanionExists } from "@/lib/booky";
import { getStageById, getProgressToNextStage } from "@/lib/bookyStages";
import { BookyStatsModal } from "./BookyStatsModal";
import { BookyAvatar } from "./BookyAvatar";
import { StageParticles } from "./StageParticles";
import { motion } from "framer-motion";
import { Flame, BookOpen, ChevronRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export const BookyWidget = memo(function BookyWidget() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: companion, isLoading } = useQuery({
    queryKey: ["companion", user?.id],
    queryFn: () => (user?.id ? getCompanion(user.id) : null),
    enabled: !!user?.id,
  });

  console.log("🦊 [Booky][Widget] companion data from react-query:", companion);

  // Auto-create companion if needed
  useEffect(() => {
    if (!user?.id) return;
    if (isLoading) return;
    if (companion) return;

    (async () => {
      try {
        const created = await ensureCompanionExists(user.id);
        queryClient.setQueryData(["companion", user.id], created);
      } catch (error) {
        console.error("[BookyWidget] Failed to ensure companion:", error);
      }
    })();
  }, [user?.id, isLoading, companion, queryClient]);

  if (isLoading) return null;

  const isDebugUser = user?.email === "tanguy.warsmann@gmail.com";

  // Debug Panel Component
  const DebugPanel = () => {
    if (!isDebugUser) return null;

    return (
      <div className="mt-2 border-t border-dashed border-neutral-300 pt-2 px-4 pb-4">
        <div className="text-xs font-semibold text-neutral-700 mb-2 flex items-center justify-between">
          <span>🛠️ DEBUG BOOKY</span>
          <button 
            onClick={() => queryClient.invalidateQueries({ queryKey: ["companion", user?.id] })}
            className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
          >
            Refresh
          </button>
        </div>
        {companion ? (
          <pre className="text-xs text-neutral-600 whitespace-pre-wrap break-words bg-neutral-50 p-2 rounded">
            {JSON.stringify(
              {
                user_id: companion.user_id?.slice(0, 8) + "...",
                current_stage: companion.current_stage,
                total_reading_days: companion.total_reading_days,
                current_streak: companion.current_streak,
                longest_streak: companion.longest_streak,
                last_reading_date: companion.last_reading_date,
                segments_this_week: companion.segments_this_week,
                has_seen_birth_ritual: companion.has_seen_birth_ritual,
                has_seen_week_ritual: companion.has_seen_week_ritual,
                has_seen_return_ritual: companion.has_seen_return_ritual,
              },
              null,
              2
            )}
          </pre>
        ) : (
          <div className="text-xs text-orange-600">
            ⚠️ Aucun companion en DB pour cet utilisateur
          </div>
        )}
      </div>
    );
  };

  // Mystery state: egg visible even without companion in DB
  if (!companion) {
    return (
      <div>
        <motion.div
          className="relative cursor-pointer group"
          onClick={() => setIsModalOpen(true)}
          whileHover={{ scale: 1.02 }}
          animate={{ y: [0, -4, 0] }}
          transition={{
            y: { duration: 2, repeat: Infinity, ease: "easeInOut" },
          }}
        >
          <div className="bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5 backdrop-blur-sm rounded-2xl p-6 border border-border/40 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            <div className="flex items-center gap-6">
              <div className="relative flex-shrink-0">
                <BookyAvatar stageId={1} size="lg" animate />
              </div>
              <div className="flex-1">
                <p className="text-sm text-foreground/70 italic">
                  Il se passe quelque chose quand tu lis…
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors" />
            </div>
          </div>
        </motion.div>
        <DebugPanel />
      </div>
    );
  }

  const stage = getStageById(companion.current_stage);
  const progressInfo = getProgressToNextStage(companion.total_reading_days);

  return (
    <div>
      <motion.div
        className="relative cursor-pointer group"
        onClick={() => setIsModalOpen(true)}
        whileHover={{ scale: 1.02 }}
        animate={{ y: [0, -4, 0] }}
        transition={{
          y: { duration: 2, repeat: Infinity, ease: "easeInOut" },
        }}
      >
        <div 
          className="relative rounded-2xl p-6 border border-border/40 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${stage.gradient[0]}15, ${stage.gradient[1]}10)`,
          }}
        >
          {/* Stage particles for stages 3+ */}
          <StageParticles stageId={companion.current_stage} count={6} />
          
          <div className="relative z-10 flex items-center gap-5">
            {/* Booky Avatar */}
            <div className="relative flex-shrink-0">
              <BookyAvatar stageId={companion.current_stage} size="lg" animate />
              {/* Glow effect */}
              <div 
                className="absolute inset-0 rounded-full blur-xl -z-10 opacity-0 group-hover:opacity-60 transition-opacity"
                style={{ backgroundColor: stage.glowColor }}
              />
            </div>

            {/* Stats and Progress */}
            <div className="flex-1 space-y-3">
              {/* Stage name */}
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {stage.name}
              </p>
              
              {/* Streak and segments */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-foreground/80">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <span className="font-semibold">{companion.current_streak}j</span>
                </div>
                <div className="flex items-center gap-1.5 text-foreground/60 text-sm">
                  <BookOpen className="w-4 h-4 text-primary" />
                  <span>{companion.segments_this_week} cette semaine</span>
                </div>
              </div>

              {/* Progress to next stage */}
              {progressInfo && (
                <div className="space-y-1">
                  <Progress 
                    value={progressInfo.progress} 
                    className="h-1.5 bg-muted/50"
                  />
                  <p className="text-xs text-muted-foreground">
                    {progressInfo.daysRemaining} jour{progressInfo.daysRemaining > 1 ? 's' : ''} → prochaine évolution
                  </p>
                </div>
              )}
            </div>

            {/* Hover indicator */}
            <ChevronRight className="w-5 h-5 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors" />
          </div>
        </div>
      </motion.div>

      <DebugPanel />

      <BookyStatsModal
        companion={companion}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
});
