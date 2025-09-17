
import { useState, useCallback } from 'react';
import confetti from 'canvas-confetti';

export function useConfetti() {
  const [isActive, setIsActive] = useState(false);

  const showConfetti = useCallback(() => {
    console.log("🎉 Confetti called!");
    setIsActive(true);
    
    // Configuration plus visible pour les confettis
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      
      // Lancer les confettis depuis différents endroits
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ['#A0522D', '#8B4513', '#D2B48C', '#F0E6C9', '#FFD700']
      });
      
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ['#A0522D', '#8B4513', '#D2B48C', '#F0E6C9', '#FFD700']
      });
    }, 250);
    
    setTimeout(() => setIsActive(false), duration);
  }, []);

  return { showConfetti, isActive };
}
