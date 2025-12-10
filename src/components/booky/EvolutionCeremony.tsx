import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BookyAvatar } from "./BookyAvatar";
import { CelebrationParticles } from "./StageParticles";
import { getStageById, BOOKY_BRAND } from "@/lib/bookyStages";
import confetti from "canvas-confetti";

interface EvolutionCeremonyProps {
  open: boolean;
  onClose: () => void;
  previousStage: number;
  newStage: number;
}

type Phase = "intro" | "glow" | "transform" | "reveal" | "celebrate";

const PHASE_TIMING: Record<Phase, number> = {
  intro: 1500,
  glow: 1500,
  transform: 2000,
  reveal: 1500,
  celebrate: 3000,
};

export function EvolutionCeremony({ 
  open, 
  onClose, 
  previousStage, 
  newStage 
}: EvolutionCeremonyProps) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [showParticles, setShowParticles] = useState(false);

  const oldStageData = getStageById(previousStage);
  const newStageData = getStageById(newStage);

  useEffect(() => {
    if (!open) {
      setPhase("intro");
      setShowParticles(false);
      return;
    }

    const timers: NodeJS.Timeout[] = [];
    let elapsed = 0;

    // Phase transitions
    const phases: Phase[] = ["intro", "glow", "transform", "reveal", "celebrate"];
    phases.forEach((p, i) => {
      if (i > 0) {
        elapsed += PHASE_TIMING[phases[i - 1]];
        timers.push(setTimeout(() => setPhase(p), elapsed));
      }
    });

    // Particles during transform
    timers.push(setTimeout(() => setShowParticles(true), PHASE_TIMING.intro + PHASE_TIMING.glow));

    // Confetti on celebrate
    const confettiTime = PHASE_TIMING.intro + PHASE_TIMING.glow + PHASE_TIMING.transform + PHASE_TIMING.reveal;
    timers.push(setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: [BOOKY_BRAND.primary, BOOKY_BRAND.primaryLight, BOOKY_BRAND.secondary],
      });
    }, confettiTime));

    return () => timers.forEach(clearTimeout);
  }, [open]);

  const phaseIndex = ["intro", "glow", "transform", "reveal", "celebrate"].indexOf(phase);
  const showOldAvatar = phaseIndex <= 2;
  const showNewAvatar = phaseIndex >= 3;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md border-none overflow-hidden p-0">
        <motion.div
          className="relative flex flex-col items-center justify-center min-h-[450px] p-8"
          animate={{
            background: showNewAvatar 
              ? `linear-gradient(135deg, ${newStageData.gradient[0]}, ${newStageData.gradient[1]})`
              : `linear-gradient(135deg, ${oldStageData.gradient[0]}, ${oldStageData.gradient[1]})`,
          }}
          transition={{ duration: 1 }}
        >
          {/* Glow effect during transformation */}
          <AnimatePresence>
            {(phase === "glow" || phase === "transform") && (
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className="absolute w-48 h-48 rounded-full"
                  style={{ 
                    background: `radial-gradient(circle, ${BOOKY_BRAND.primaryLight}80 0%, transparent 70%)` 
                  }}
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Celebration particles */}
          <CelebrationParticles 
            color={newStageData.particleColor} 
            count={20}
            isActive={showParticles}
          />

          {/* Title */}
          <motion.div
            className="text-center mb-6 z-10"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <motion.h2
              className="text-2xl font-bold text-white drop-shadow-lg"
              animate={{
                scale: phase === "celebrate" ? [1, 1.1, 1] : 1,
              }}
              transition={{ duration: 0.5 }}
            >
              {phase === "celebrate" ? "🎉 Évolution !" : "✨ Transformation..."}
            </motion.h2>
          </motion.div>

          {/* Avatar container */}
          <div className="relative w-40 h-40 flex items-center justify-center z-10">
            {/* Old avatar - fades out during transform */}
            <AnimatePresence>
              {showOldAvatar && (
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  initial={{ opacity: 1, scale: 1 }}
                  animate={{
                    opacity: phase === "transform" ? 0 : 1,
                    scale: phase === "glow" ? 1.1 : phase === "transform" ? 0.5 : 1,
                    rotate: phase === "transform" ? 360 : 0,
                    filter: phase === "glow" ? "brightness(1.5)" : "brightness(1)",
                  }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ duration: 1.5 }}
                >
                  <BookyAvatar stageId={previousStage} size="xl" animate />
                </motion.div>
              )}
            </AnimatePresence>

            {/* New avatar - appears during reveal */}
            <AnimatePresence>
              {showNewAvatar && (
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  initial={{ opacity: 0, scale: 0.3, rotate: -180 }}
                  animate={{ 
                    opacity: 1, 
                    scale: 1, 
                    rotate: 0,
                  }}
                  transition={{ 
                    duration: 1,
                    type: "spring",
                    stiffness: 200,
                    damping: 15,
                  }}
                >
                  <BookyAvatar stageId={newStage} size="xl" animate />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Transformation ring effect */}
            <AnimatePresence>
              {phase === "transform" && (
                <motion.div
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute border-2 rounded-full"
                      style={{ 
                        borderColor: BOOKY_BRAND.primaryLight,
                        width: 120 + i * 30,
                        height: 120 + i * 30,
                      }}
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ 
                        scale: [0.5, 1.5], 
                        opacity: [0.8, 0],
                      }}
                      transition={{
                        duration: 1.5,
                        delay: i * 0.3,
                        repeat: 1,
                        ease: "easeOut",
                      }}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Stage info */}
          <AnimatePresence mode="wait">
            {phase === "intro" && (
              <motion.div
                key="old-stage"
                className="text-center mt-6 z-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <p className="text-white/80 text-sm">
                  {oldStageData.name}
                </p>
              </motion.div>
            )}

            {phase === "celebrate" && (
              <motion.div
                key="new-stage"
                className="text-center mt-6 z-10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <p className="text-xl font-bold text-white mb-2">
                  {newStageData.name}
                </p>
                <p className="text-white/90 text-sm max-w-xs">
                  {newStageData.evolutionMessage}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Close button */}
          <AnimatePresence>
            {phase === "celebrate" && (
              <motion.div
                className="mt-8 z-10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
              >
                <Button
                  onClick={onClose}
                  className="px-8 py-3 text-lg font-semibold"
                  style={{
                    background: `linear-gradient(135deg, ${BOOKY_BRAND.primary}, ${BOOKY_BRAND.primaryDark})`,
                  }}
                >
                  Continuer l'aventure
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Progress dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {["intro", "glow", "transform", "reveal", "celebrate"].map((p, i) => (
              <motion.div
                key={p}
                className="w-2 h-2 rounded-full"
                animate={{
                  backgroundColor: i <= phaseIndex ? BOOKY_BRAND.primary : "rgba(255,255,255,0.3)",
                  scale: i === phaseIndex ? 1.3 : 1,
                }}
                transition={{ duration: 0.3 }}
              />
            ))}
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
