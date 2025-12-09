import { motion } from "framer-motion";
import { useMemo } from "react";
import { getStageById } from "@/lib/bookyStages";

interface StageParticlesProps {
  stageId: number;
  count?: number;
  className?: string;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
  type: "circle" | "star" | "sparkle";
}

export function StageParticles({ stageId, count = 8, className = "" }: StageParticlesProps) {
  const stage = getStageById(stageId);
  
  // Only show particles for stage 3+
  if (stageId < 3) return null;

  const particles = useMemo(() => {
    const generated: Particle[] = [];
    for (let i = 0; i < count; i++) {
      generated.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 4 + Math.random() * 6,
        delay: Math.random() * 3,
        duration: 3 + Math.random() * 2,
        type: ["circle", "star", "sparkle"][Math.floor(Math.random() * 3)] as Particle["type"],
      });
    }
    return generated;
  }, [count]);

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 0.8, 0],
            scale: [0.3, 1, 0.3],
            y: [0, -20, 0],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <ParticleShape 
            type={particle.type} 
            size={particle.size} 
            color={stage.particleColor} 
          />
        </motion.div>
      ))}
    </div>
  );
}

function ParticleShape({ type, size, color }: { type: Particle["type"]; size: number; color: string }) {
  switch (type) {
    case "circle":
      return (
        <div
          style={{
            width: size,
            height: size,
            borderRadius: "50%",
            background: color,
            boxShadow: `0 0 ${size}px ${color}`,
          }}
        />
      );
    
    case "star":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <path
            d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"
            fill={color}
          />
        </svg>
      );
    
    case "sparkle":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <path
            d="M12 0L13 11L24 12L13 13L12 24L11 13L0 12L11 11L12 0Z"
            fill={color}
          />
        </svg>
      );
    
    default:
      return null;
  }
}

// ===== CELEBRATION PARTICLES (for rituals) =====
interface CelebrationParticlesProps {
  isActive: boolean;
  color?: string;
  count?: number;
}

export function CelebrationParticles({ isActive, color = "hsl(45, 80%, 55%)", count = 20 }: CelebrationParticlesProps) {
  const particles = useMemo(() => {
    const generated: Array<{
      id: number;
      x: number;
      angle: number;
      distance: number;
      size: number;
      delay: number;
    }> = [];
    
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      generated.push({
        id: i,
        x: 50,
        angle,
        distance: 80 + Math.random() * 60,
        size: 4 + Math.random() * 8,
        delay: Math.random() * 0.3,
      });
    }
    return generated;
  }, [count]);

  if (!isActive) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute left-1/2 top-1/2"
          initial={{ 
            x: 0, 
            y: 0, 
            opacity: 1, 
            scale: 0 
          }}
          animate={{
            x: Math.cos(particle.angle) * particle.distance,
            y: Math.sin(particle.angle) * particle.distance,
            opacity: [1, 1, 0],
            scale: [0, 1.5, 0.5],
            rotate: [0, 360],
          }}
          transition={{
            duration: 1.2,
            delay: particle.delay,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
        >
          <div
            style={{
              width: particle.size,
              height: particle.size,
              borderRadius: "50%",
              background: color,
              boxShadow: `0 0 ${particle.size * 2}px ${color}`,
            }}
          />
        </motion.div>
      ))}
    </div>
  );
}

export default StageParticles;
