import { memo, useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getCompanion, ensureCompanionExists } from "@/lib/booky";
import { BookyStatsModal } from "./BookyStatsModal";
import { motion } from "framer-motion";
import { Flame, BookOpen } from "lucide-react";

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

  // Auto-création du companion si besoin
  useEffect(() => {
    if (!user?.id) return;
    if (isLoading) return;

    // Si un companion existe déjà, ne rien faire
    if (companion) return;

    // Auto-création du companion au premier chargement
    (async () => {
      try {
        const created = await ensureCompanionExists(user.id);
        // Mettre immédiatement à jour le cache pour le widget
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
            onClick={() => queryClient.invalidateQueries({ queryKey: ["companion", user.id] })}
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

  // État "mystère" : l'œuf est visible même sans companion en DB
  if (!companion) {
    return (
      <div>
        <motion.div
          className="relative cursor-pointer group"
          onClick={() => setIsModalOpen(true)}
          whileHover={{ scale: 1.02 }}
          animate={{
            y: [0, -4, 0],
          }}
          transition={{
            y: {
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            },
          }}
        >
          <div className="bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5 backdrop-blur-sm rounded-2xl p-6 border border-border/40 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-6">
              {/* Œuf mystère */}
              <div className="relative flex-shrink-0">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center text-5xl">
                  🥚
                </div>
                <div className="absolute inset-0 rounded-full bg-primary/5 blur-xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              {/* Message mystère */}
              <div className="flex-1">
                <p className="text-sm text-foreground/70 italic">
                  Il se passe quelque chose quand tu lis…
                </p>
              </div>

              {/* Hover indicator */}
              <div className="text-muted-foreground/50 group-hover:text-muted-foreground transition-colors">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
            </div>
          </div>
        </motion.div>
        <DebugPanel />
      </div>
    );
  }

  const isEgg = companion.current_stage === 1;
  const hasGlasses = companion.current_streak >= 7;

  return (
    <div>
      <motion.div
        className="relative cursor-pointer group"
        onClick={() => setIsModalOpen(true)}
        whileHover={{ scale: 1.02 }}
        animate={{
          y: [0, -4, 0],
        }}
        transition={{
          y: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          },
        }}
      >
        <div className="bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5 backdrop-blur-sm rounded-2xl p-6 border border-border/40 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-6">
            {/* Booky Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center text-5xl">
                {isEgg ? "🥚" : hasGlasses ? "🦊🤓" : "🦊"}
              </div>
              {/* Subtle glow effect */}
              <div className="absolute inset-0 rounded-full bg-primary/5 blur-xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            {/* Stats */}
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2 text-foreground/80">
                <Flame className="w-4 h-4 text-orange-500" />
                <span className="font-medium">{companion.current_streak} jours</span>
              </div>
              <div className="flex items-center gap-2 text-foreground/60 text-sm">
                <BookOpen className="w-4 h-4 text-primary" />
                <span>{companion.segments_this_week} segments cette semaine</span>
              </div>
            </div>

            {/* Hover indicator */}
            <div className="text-muted-foreground/50 group-hover:text-muted-foreground transition-colors">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
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
