
import { useState, useCallback } from 'react';
import confetti from 'canvas-confetti';

export function useConfetti() {
  const [isActive, setIsActive] = useState(false);

  const showConfetti = useCallback(() => {
    console.log("🎉 Confetti called!");
    setIsActive(true);
    
    // Configuration discrète et élégante pour les confettis
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#A0522D', '#8B4513', '#D2B48C', '#F0E6C9'],
      gravity: 0.7,
      scalar: 0.7,
      disableForReducedMotion: true
    });
    
    setTimeout(() => setIsActive(false), 2000);
  }, []);

  return { showConfetti, isActive };
}
