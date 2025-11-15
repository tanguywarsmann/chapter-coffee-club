import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useMousePosition } from '@/hooks/useMousePosition';

interface Particle {
  x: number;
  y: number;
  id: number;
}

export function CursorTrail() {
  const mousePosition = useMousePosition();
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const isMobile = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
    if (isMobile) return;

    const interval = setInterval(() => {
      setParticles((prev) => {
        const newParticle = {
          x: mousePosition.x,
          y: mousePosition.y,
          id: Date.now(),
        };
        return [...prev.slice(-5), newParticle];
      });
    }, 50);

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      setIsHovering(target.closest('.book-card, .activity-card') !== null);
    };

    document.addEventListener('mouseover', handleMouseOver);

    return () => {
      clearInterval(interval);
      document.removeEventListener('mouseover', handleMouseOver);
    };
  }, [mousePosition]);

  if (window.matchMedia('(hover: none) and (pointer: coarse)').matches) {
    return null;
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {particles.map((particle, index) => (
        <motion.div
          key={particle.id}
          initial={{ opacity: 0.4, scale: isHovering ? 1.5 : 1 }}
          animate={{ 
            opacity: 0, 
            scale: 0,
            x: particle.x - 6,
            y: particle.y - 6,
          }}
          transition={{
            duration: 0.8,
            delay: index * 0.05,
            ease: 'easeOut',
          }}
          className="absolute w-3 h-3 rounded-full"
          style={{
            background: 'radial-gradient(circle, hsl(var(--brand-400)) 0%, hsl(var(--brand-600)) 100%)',
            filter: 'blur(8px)',
          }}
        />
      ))}
    </div>
  );
}
