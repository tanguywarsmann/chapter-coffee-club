import { motion } from "framer-motion";
import { getStageById, BOOKY_BRAND, type BookyStage } from "@/lib/bookyStages";

interface BookyAvatarProps {
  stageId: number;
  size?: "sm" | "md" | "lg" | "xl";
  animate?: boolean;
  className?: string;
}

const SIZES = {
  sm: { container: 48, fox: 32, egg: 28 },
  md: { container: 80, fox: 56, egg: 48 },
  lg: { container: 120, fox: 84, egg: 72 },
  xl: { container: 180, fox: 130, egg: 110 },
};

export function BookyAvatar({ stageId, size = "md", animate = true, className = "" }: BookyAvatarProps) {
  const stage = getStageById(stageId);
  const dimensions = SIZES[size];

  return (
    <div 
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: dimensions.container, height: dimensions.container }}
    >
      {/* Glow effect */}
      {animate && stageId >= 3 && (
        <motion.div
          className="absolute inset-0 rounded-full blur-xl opacity-40"
          style={{ background: stage.glowColor }}
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {stageId === 1 ? (
        <EggAvatar stage={stage} size={dimensions.egg} animate={animate} />
      ) : (
        <FoxAvatar stage={stage} size={dimensions.fox} animate={animate} />
      )}
    </div>
  );
}

// ===== EGG AVATAR (Stage 1) =====
function EggAvatar({ stage, size, animate }: { stage: BookyStage; size: number; animate: boolean }) {
  return (
    <motion.div
      className="relative"
      animate={animate ? { 
        rotate: [-2, 2, -2],
        y: [0, -3, 0],
      } : {}}
      transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
    >
      {/* Egg shadow */}
      <div 
        className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full blur-md opacity-30"
        style={{ 
          width: size * 0.6, 
          height: size * 0.15,
          background: BOOKY_BRAND.dark,
        }}
      />
      
      {/* Egg SVG */}
      <svg 
        width={size} 
        height={size * 1.3} 
        viewBox="0 0 80 104" 
        fill="none"
      >
        {/* Egg body */}
        <ellipse 
          cx="40" 
          cy="58" 
          rx="36" 
          ry="44" 
          fill={`url(#eggGradient-${stage.id})`}
        />
        
        {/* Highlight */}
        <ellipse 
          cx="28" 
          cy="42" 
          rx="12" 
          ry="18" 
          fill="white" 
          opacity="0.25"
        />
        
        {/* Mysterious glow spots */}
        <motion.ellipse
          cx="40"
          cy="58"
          rx="8"
          ry="10"
          fill={BOOKY_BRAND.primary}
          animate={animate ? { opacity: [0.2, 0.5, 0.2] } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        />
        
        {/* Pattern marks */}
        <circle cx="30" cy="68" r="4" fill={BOOKY_BRAND.primaryDark} opacity="0.3" />
        <circle cx="50" cy="48" r="3" fill={BOOKY_BRAND.primaryDark} opacity="0.25" />
        <circle cx="48" cy="72" r="5" fill={BOOKY_BRAND.primaryDark} opacity="0.2" />
        
        {/* Question mark */}
        <motion.text
          x="40"
          y="64"
          textAnchor="middle"
          fontSize="24"
          fontWeight="bold"
          fill={BOOKY_BRAND.dark}
          opacity="0.6"
          animate={animate ? { opacity: [0.4, 0.7, 0.4] } : {}}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          ?
        </motion.text>
        
        <defs>
          <linearGradient id={`eggGradient-${stage.id}`} x1="40" y1="14" x2="40" y2="102" gradientUnits="userSpaceOnUse">
            <stop stopColor={stage.gradient.from} />
            <stop offset="1" stopColor={stage.gradient.to} />
          </linearGradient>
        </defs>
      </svg>
    </motion.div>
  );
}

// ===== FOX AVATAR (Stages 2-5) =====
function FoxAvatar({ stage, size, animate }: { stage: BookyStage; size: number; animate: boolean }) {
  const scale = size / 100;
  
  return (
    <motion.div
      className="relative"
      animate={animate ? { y: [0, -4, 0] } : {}}
      transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
    >
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 100 100" 
        fill="none"
      >
        <defs>
          <linearGradient id={`foxBody-${stage.id}`} x1="50" y1="20" x2="50" y2="95" gradientUnits="userSpaceOnUse">
            <stop stopColor={stage.gradient.from} />
            <stop offset="1" stopColor={stage.gradient.to} />
          </linearGradient>
          <linearGradient id={`foxEar-${stage.id}`} x1="0" y1="0" x2="0" y2="1">
            <stop stopColor={stage.gradient.from} />
            <stop offset="1" stopColor={stage.gradient.to} />
          </linearGradient>
        </defs>

        {/* Shadow */}
        <ellipse 
          cx="50" 
          cy="94" 
          rx="25" 
          ry="4" 
          fill={BOOKY_BRAND.dark}
          opacity="0.2"
        />

        {/* Multiple tails for legendary */}
        {stage.hasMultipleTails && (
          <>
            <motion.path
              d="M25 75 Q10 65 15 50 Q18 58 28 68"
              fill={`url(#foxBody-${stage.id})`}
              animate={animate ? { rotate: [-5, 5, -5] } : {}}
              transition={{ duration: 1.5, repeat: Infinity }}
              style={{ transformOrigin: '28px 68px' }}
            />
            <motion.path
              d="M75 75 Q90 65 85 50 Q82 58 72 68"
              fill={`url(#foxBody-${stage.id})`}
              animate={animate ? { rotate: [5, -5, 5] } : {}}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
              style={{ transformOrigin: '72px 68px' }}
            />
          </>
        )}

        {/* Main tail */}
        <motion.path
          d="M50 85 Q35 75 30 55 Q40 65 50 75 Q60 65 70 55 Q65 75 50 85"
          fill={`url(#foxBody-${stage.id})`}
          animate={animate ? { rotate: [-3, 3, -3] } : {}}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ transformOrigin: '50px 75px' }}
        />
        
        {/* Tail tip (white) */}
        <path
          d="M50 85 Q42 80 40 72 Q50 78 60 72 Q58 80 50 85"
          fill={BOOKY_BRAND.cream}
        />

        {/* Body */}
        <ellipse 
          cx="50" 
          cy="65" 
          rx="22" 
          ry="18" 
          fill={`url(#foxBody-${stage.id})`}
        />
        
        {/* Belly */}
        <ellipse 
          cx="50" 
          cy="70" 
          rx="12" 
          ry="10" 
          fill={BOOKY_BRAND.cream}
        />

        {/* Head */}
        <circle 
          cx="50" 
          cy="40" 
          r="22" 
          fill={`url(#foxBody-${stage.id})`}
        />

        {/* Left ear */}
        <motion.path
          d="M32 28 L28 8 L42 22 Z"
          fill={`url(#foxEar-${stage.id})`}
          animate={animate ? { rotate: [-5, 5, -5] } : {}}
          transition={{ duration: 1.5, repeat: Infinity }}
          style={{ transformOrigin: '35px 22px' }}
        />
        <path d="M33 24 L31 14 L38 21 Z" fill={BOOKY_BRAND.cream} opacity="0.8" />
        
        {/* Right ear */}
        <motion.path
          d="M68 28 L72 8 L58 22 Z"
          fill={`url(#foxEar-${stage.id})`}
          animate={animate ? { rotate: [5, -5, 5] } : {}}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.1 }}
          style={{ transformOrigin: '65px 22px' }}
        />
        <path d="M67 24 L69 14 L62 21 Z" fill={BOOKY_BRAND.cream} opacity="0.8" />

        {/* Face mask (white) */}
        <path
          d="M50 32 Q38 38 36 48 Q42 52 50 55 Q58 52 64 48 Q62 38 50 32"
          fill={BOOKY_BRAND.cream}
        />

        {/* Eyes */}
        <g>
          {/* Left eye */}
          <ellipse cx="42" cy="40" rx="5" ry="6" fill={BOOKY_BRAND.dark} />
          <ellipse cx="43" cy="39" rx="2" ry="2.5" fill="white" />
          
          {/* Right eye */}
          <ellipse cx="58" cy="40" rx="5" ry="6" fill={BOOKY_BRAND.dark} />
          <ellipse cx="59" cy="39" rx="2" ry="2.5" fill="white" />
        </g>

        {/* Nose */}
        <ellipse cx="50" cy="50" rx="4" ry="3" fill={BOOKY_BRAND.dark} />
        
        {/* Mouth */}
        <path
          d="M50 53 Q46 56 44 55 M50 53 Q54 56 56 55"
          stroke={BOOKY_BRAND.dark}
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
        />

        {/* Cheek blush */}
        <circle cx="34" cy="46" r="4" fill={BOOKY_BRAND.primary} opacity="0.3" />
        <circle cx="66" cy="46" r="4" fill={BOOKY_BRAND.primary} opacity="0.3" />

        {/* Glasses for stage 4+ */}
        {stage.hasGlasses && (
          <g>
            <circle cx="42" cy="40" r="8" fill="none" stroke={BOOKY_BRAND.gold} strokeWidth="1.5" />
            <circle cx="58" cy="40" r="8" fill="none" stroke={BOOKY_BRAND.gold} strokeWidth="1.5" />
            <path d="M50 40 L50 40" stroke={BOOKY_BRAND.gold} strokeWidth="1.5" />
            <line x1="34" y1="38" x2="28" y2="36" stroke={BOOKY_BRAND.gold} strokeWidth="1.5" />
            <line x1="66" y1="38" x2="72" y2="36" stroke={BOOKY_BRAND.gold} strokeWidth="1.5" />
          </g>
        )}

        {/* Crown for legendary */}
        {stage.hasCrown && (
          <motion.g
            animate={animate ? { y: [0, -2, 0] } : {}}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <path
              d="M35 18 L40 8 L45 14 L50 4 L55 14 L60 8 L65 18 L60 20 L40 20 Z"
              fill={BOOKY_BRAND.gold}
            />
            <circle cx="50" cy="6" r="2" fill={BOOKY_BRAND.goldLight} />
            <circle cx="40" cy="10" r="1.5" fill={BOOKY_BRAND.goldLight} />
            <circle cx="60" cy="10" r="1.5" fill={BOOKY_BRAND.goldLight} />
          </motion.g>
        )}
      </svg>

      {/* Floating book for stage 4+ */}
      {stage.hasBook && (
        <motion.div
          className="absolute -right-2 bottom-2"
          animate={animate ? { 
            y: [0, -4, 0],
            rotate: [-5, 5, -5],
          } : {}}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ width: size * 0.3, height: size * 0.25 }}
        >
          <svg viewBox="0 0 30 25" fill="none" className="w-full h-full">
            <rect x="2" y="2" width="26" height="21" rx="2" fill={BOOKY_BRAND.primaryDark} />
            <rect x="4" y="4" width="22" height="17" rx="1" fill={BOOKY_BRAND.cream} />
            <line x1="15" y1="6" x2="15" y2="19" stroke={BOOKY_BRAND.muted} strokeWidth="0.5" />
          </svg>
        </motion.div>
      )}

      {/* Sparkles for stage 3+ */}
      {stage.hasSparkles && animate && (
        <>
          <Sparkle x={-8} y={10} delay={0} size={scale * 8} color={stage.particleColor} />
          <Sparkle x={size + 4} y={15} delay={0.5} size={scale * 6} color={stage.particleColor} />
          <Sparkle x={size / 2} y={-8} delay={1} size={scale * 7} color={stage.particleColor} />
        </>
      )}
    </motion.div>
  );
}

// ===== SPARKLE COMPONENT =====
function Sparkle({ x, y, delay, size, color }: { x: number; y: number; delay: number; size: number; color: string }) {
  return (
    <motion.div
      className="absolute"
      style={{ left: x, top: y }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ 
        opacity: [0, 1, 0],
        scale: [0.5, 1, 0.5],
        rotate: [0, 180, 360],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        delay,
        ease: "easeInOut",
      }}
    >
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path
          d="M12 0L14 10L24 12L14 14L12 24L10 14L0 12L10 10L12 0Z"
          fill={color}
        />
      </svg>
    </motion.div>
  );
}

export default BookyAvatar;
