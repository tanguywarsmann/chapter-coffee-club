import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { BOOKY_BRAND, getStageById } from "@/lib/bookyStages";
import { BookyAvatar } from "./BookyAvatar";
import { CelebrationParticles } from "./StageParticles";
import confetti from "canvas-confetti";

interface BirthRitualProps {
  isOpen: boolean;
  onClose: () => void;
}

type Phase = "egg" | "shake" | "crack" | "hatch" | "reveal" | "celebrate";

const PHASE_TIMINGS = {
  egg: 800,
  shake: 1500,
  crack: 1200,
  hatch: 800,
  reveal: 300,
};

export function BirthRitual({ isOpen, onClose }: BirthRitualProps) {
  const [phase, setPhase] = useState<Phase>("egg");
  const [showCelebration, setShowCelebration] = useState(false);

  const stage = getStageById(2); // Renardeau

  useEffect(() => {
    if (!isOpen) {
      setPhase("egg");
      setShowCelebration(false);
      return;
    }

    // Animation sequence
    const timers: NodeJS.Timeout[] = [];

    let elapsed = 0;
    
    // Egg appears
    elapsed += PHASE_TIMINGS.egg;
    timers.push(setTimeout(() => setPhase("shake"), elapsed));
    
    // Shake phase
    elapsed += PHASE_TIMINGS.shake;
    timers.push(setTimeout(() => setPhase("crack"), elapsed));
    
    // Crack phase
    elapsed += PHASE_TIMINGS.crack;
    timers.push(setTimeout(() => setPhase("hatch"), elapsed));
    
    // Hatch phase (explosion)
    elapsed += PHASE_TIMINGS.hatch;
    timers.push(setTimeout(() => {
      setPhase("reveal");
      setShowCelebration(true);
      
      // Launch confetti
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.5, x: 0.5 },
        colors: [BOOKY_BRAND.primary, BOOKY_BRAND.gold, BOOKY_BRAND.primaryLight],
        shapes: ['circle', 'square'],
        scalar: 0.8,
        gravity: 0.8,
      });
    }, elapsed));
    
    // Reveal → Celebrate
    elapsed += PHASE_TIMINGS.reveal;
    timers.push(setTimeout(() => setPhase("celebrate"), elapsed));

    return () => timers.forEach(clearTimeout);
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="sm:max-w-md border-0 overflow-hidden p-0"
        style={{
          background: `linear-gradient(175deg, ${BOOKY_BRAND.dark} 0%, ${BOOKY_BRAND.darker} 100%)`,
        }}
      >
        {/* Top highlight */}
        <div 
          className="absolute top-0 left-[10%] right-[10%] h-[1px]"
          style={{ background: `linear-gradient(90deg, transparent, ${BOOKY_BRAND.primary}50, transparent)` }}
        />

        <div className="relative px-8 py-10 flex flex-col items-center min-h-[400px]">
          
          {/* Background glow */}
          <motion.div
            className="absolute inset-0 opacity-30"
            animate={{
              background: phase === "celebrate" 
                ? `radial-gradient(circle at 50% 40%, ${BOOKY_BRAND.gold}40 0%, transparent 60%)`
                : `radial-gradient(circle at 50% 40%, ${BOOKY_BRAND.primary}20 0%, transparent 50%)`,
            }}
            transition={{ duration: 1 }}
          />

          {/* Celebration particles */}
          <CelebrationParticles isActive={showCelebration} color={BOOKY_BRAND.gold} />

          {/* Main animation container */}
          <div className="relative w-40 h-40 flex items-center justify-center mb-8">
            <AnimatePresence mode="wait">
              {/* Egg phases */}
              {["egg", "shake", "crack"].includes(phase) && (
                <motion.div
                  key="egg"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ 
                    scale: 1, 
                    opacity: 1,
                    rotate: phase === "shake" ? [-8, 8, -8, 8, -4, 4, 0] : 0,
                  }}
                  exit={{ scale: 1.5, opacity: 0 }}
                  transition={{
                    scale: { type: "spring", stiffness: 300, damping: 20 },
                    rotate: { duration: 1.2, ease: "easeInOut" },
                  }}
                  className="absolute"
                >
                  {/* Egg with cracks */}
                  <svg width="120" height="156" viewBox="0 0 80 104" fill="none">
                    <defs>
                      <linearGradient id="birthEggGradient" x1="40" y1="14" x2="40" y2="102" gradientUnits="userSpaceOnUse">
                        <stop stopColor="hsl(35, 30%, 85%)" />
                        <stop offset="1" stopColor="hsl(25, 30%, 75%)" />
                      </linearGradient>
                    </defs>
                    
                    {/* Egg glow */}
                    <motion.ellipse
                      cx="40"
                      cy="58"
                      rx="42"
                      ry="50"
                      fill={BOOKY_BRAND.primary}
                      opacity="0.2"
                      animate={{ 
                        opacity: phase === "shake" ? [0.2, 0.4, 0.2] : 0.2,
                        scale: phase === "shake" ? [1, 1.05, 1] : 1,
                      }}
                      transition={{ duration: 0.5, repeat: phase === "shake" ? Infinity : 0 }}
                    />
                    
                    {/* Egg body */}
                    <ellipse cx="40" cy="58" rx="36" ry="44" fill="url(#birthEggGradient)" />
                    
                    {/* Highlight */}
                    <ellipse cx="28" cy="42" rx="12" ry="18" fill="white" opacity="0.3" />
                    
                    {/* Cracks (appear in crack phase) */}
                    {phase === "crack" && (
                      <motion.g
                        initial={{ opacity: 0, pathLength: 0 }}
                        animate={{ opacity: 1, pathLength: 1 }}
                        transition={{ duration: 0.8 }}
                      >
                        <motion.path
                          d="M40 20 L38 35 L45 40 L42 55"
                          stroke={BOOKY_BRAND.dark}
                          strokeWidth="2"
                          fill="none"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 0.5 }}
                        />
                        <motion.path
                          d="M55 45 L48 52 L52 60 L45 70"
                          stroke={BOOKY_BRAND.dark}
                          strokeWidth="2"
                          fill="none"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 0.5, delay: 0.2 }}
                        />
                        <motion.path
                          d="M25 50 L32 58 L28 68"
                          stroke={BOOKY_BRAND.dark}
                          strokeWidth="2"
                          fill="none"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 0.5, delay: 0.4 }}
                        />
                      </motion.g>
                    )}
                    
                    {/* Mystery glow inside */}
                    <motion.ellipse
                      cx="40"
                      cy="58"
                      rx="15"
                      ry="18"
                      fill={stage.gradient.from}
                      animate={{ 
                        opacity: [0.3, 0.6, 0.3],
                        scale: phase === "crack" ? [1, 1.2, 1] : [1, 1.1, 1],
                      }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                  </svg>
                </motion.div>
              )}

              {/* Hatch explosion */}
              {phase === "hatch" && (
                <motion.div
                  key="explosion"
                  className="absolute"
                  initial={{ scale: 0.8, opacity: 1 }}
                  animate={{ scale: 2, opacity: 0 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                >
                  <div 
                    className="w-32 h-32 rounded-full"
                    style={{
                      background: `radial-gradient(circle, ${BOOKY_BRAND.gold} 0%, transparent 70%)`,
                    }}
                  />
                </motion.div>
              )}

              {/* Fox reveal */}
              {["reveal", "celebrate"].includes(phase) && (
                <motion.div
                  key="fox"
                  initial={{ scale: 0, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 300, 
                    damping: 15,
                    delay: 0.1,
                  }}
                  className="absolute"
                >
                  <BookyAvatar stageId={2} size="xl" animate={true} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Text content */}
          <AnimatePresence mode="wait">
            {phase === "celebrate" && (
              <motion.div
                key="text"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="text-center space-y-4"
              >
                {/* Title */}
                <motion.h2
                  className="text-2xl font-serif font-bold"
                  style={{ color: BOOKY_BRAND.cream }}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  Booky vient de naître !
                </motion.h2>

                {/* Subtitle badge */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
                  style={{
                    background: `${BOOKY_BRAND.primary}20`,
                    border: `1px solid ${BOOKY_BRAND.primary}40`,
                  }}
                >
                  <span style={{ color: BOOKY_BRAND.primary }}>✨</span>
                  <span 
                    className="text-sm font-medium"
                    style={{ color: BOOKY_BRAND.primaryLight }}
                  >
                    Stade 2 : Renardeau
                  </span>
                </motion.div>

                {/* Description */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="space-y-2 pt-2"
                >
                  <p 
                    className="text-sm leading-relaxed"
                    style={{ color: BOOKY_BRAND.muted }}
                  >
                    Chaque jour où tu lis, ton renard grandit.
                  </p>
                  <p 
                    className="text-sm leading-relaxed"
                    style={{ color: BOOKY_BRAND.muted }}
                  >
                    Lis <span style={{ color: BOOKY_BRAND.primaryLight, fontWeight: 600 }}>7 jours</span> pour voir Booky évoluer !
                  </p>
                </motion.div>

                {/* CTA Button */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="pt-4"
                >
                  <Button 
                    onClick={onClose}
                    className="px-8 py-3 text-base font-semibold rounded-xl"
                    style={{
                      background: `linear-gradient(135deg, ${BOOKY_BRAND.primary} 0%, ${BOOKY_BRAND.primaryDark} 100%)`,
                      boxShadow: `0 8px 24px -6px ${BOOKY_BRAND.primary}80`,
                    }}
                  >
                    Continuer l'aventure
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Loading indicator during animation */}
          {!["reveal", "celebrate"].includes(phase) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <motion.div
                className="w-2 h-2 rounded-full"
                style={{ background: BOOKY_BRAND.primary }}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
              <span 
                className="text-sm"
                style={{ color: BOOKY_BRAND.muted }}
              >
                {phase === "egg" && "Un mystère s'éveille..."}
                {phase === "shake" && "Quelque chose bouge..."}
                {phase === "crack" && "L'œuf se fissure..."}
                {phase === "hatch" && "Éclosion !"}
              </span>
            </motion.div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default BirthRitual;
