
import { useState, useCallback } from 'react';
import confetti from 'canvas-confetti';

export function useConfetti() {
  const [isActive, setIsActive] = useState(false);

  const showConfetti = useCallback(() => {
    console.log("🎉 CONFETTI TRIGGERED! Making sure it's visible...");
    setIsActive(true);
    
    // Force le style container pour s'assurer que c'est visible
    const existingCanvas = document.querySelector('canvas[style*="position: fixed"]');
    if (existingCanvas) {
      (existingCanvas as HTMLElement).style.zIndex = '999999';
      (existingCanvas as HTMLElement).style.pointerEvents = 'none';
    }
    
    // Confettis très visibles et nombreux
    const count = 200;
    const defaults = {
      origin: { y: 0.7 },
      zIndex: 999999,
      disableForReducedMotion: false
    };

    function fire(particleRatio: number, opts: any) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio)
      });
    }

    // Explosion de confettis en plusieurs vagues
    fire(0.25, {
      spread: 26,
      startVelocity: 55,
      colors: ['#FFD700', '#FFA500', '#FF6347', '#FF1493', '#9370DB']
    });

    fire(0.2, {
      spread: 60,
      colors: ['#00FF00', '#00CED1', '#1E90FF', '#FF69B4', '#FFD700']
    });

    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
      colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8']
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
      colors: ['#A0522D', '#8B4513', '#D2B48C', '#F0E6C9']
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 45,
      colors: ['#FF0080', '#00FF80', '#8000FF', '#FF8000']
    });
    
    setTimeout(() => setIsActive(false), 3000);
  }, []);

  return { showConfetti, isActive };
}
