import { memo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { getCompanion } from "@/lib/booky";
import { BookyStatsModal } from "./BookyStatsModal";
import { motion } from "framer-motion";
import { Flame, BookOpen } from "lucide-react";

export const BookyWidget = memo(function BookyWidget() {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: companion, isLoading } = useQuery({
    queryKey: ["companion", user?.id],
    queryFn: () => (user?.id ? getCompanion(user.id) : null),
    enabled: !!user?.id,
  });

  if (isLoading || !companion) return null;

  const isEgg = companion.current_stage === 1;
  const hasGlasses = companion.current_streak >= 7;

  return (
    <>
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

      <BookyStatsModal
        companion={companion}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
});
