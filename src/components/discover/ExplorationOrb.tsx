import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import { useConfetti } from '@/components/confetti/ConfettiProvider';

export function ExplorationOrb() {
  const [progress, setProgress] = useState(0);
  const [pulseSpeed, setPulseSpeed] = useState(1);
  const { showConfetti } = useConfetti();

  useEffect(() => {
    const handleScroll = () => {
      setProgress((prev) => Math.min(prev + 1, 100));
      setPulseSpeed(2);
      setTimeout(() => setPulseSpeed(1), 300);
    };

    const handleHover = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('.book-card, .activity-card')) {
        setProgress((prev) => Math.min(prev + 3, 100));
        setPulseSpeed(2.5);
        setTimeout(() => setPulseSpeed(1), 300);
      }
    };

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('.book-card, .activity-card')) {
        setProgress((prev) => Math.min(prev + 5, 100));
        setPulseSpeed(3);
        setTimeout(() => setPulseSpeed(1), 300);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('mouseover', handleHover);
    document.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mouseover', handleHover);
      document.removeEventListener('click', handleClick);
    };
  }, []);

  useEffect(() => {
    if (progress >= 100) {
      showConfetti({ burst: 'big' });
      setTimeout(() => setProgress(0), 2000);
    }
  }, [progress, showConfetti]);

  const circumference = 2 * Math.PI * 36;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <motion.div
      className="fixed bottom-8 right-8 z-40"
      animate={{ 
        scale: [1, pulseSpeed * 0.1 + 1, 1],
      }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative w-20 h-20 cursor-pointer group">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
          <circle
            cx="40"
            cy="40"
            r="36"
            fill="none"
            stroke="hsl(var(--brand-200))"
            strokeWidth="6"
            opacity="0.3"
          />
          <motion.circle
            cx="40"
            cy="40"
            r="36"
            fill="none"
            stroke="hsl(var(--brand-500))"
            strokeWidth="6"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </svg>
        
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            {progress >= 100 ? (
              <Trophy className="w-6 h-6 text-white animate-bounce" />
            ) : (
              <span className="text-sm font-bold text-white">{progress}%</span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
