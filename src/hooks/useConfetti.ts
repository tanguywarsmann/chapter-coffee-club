
import { useState, useCallback } from 'react';
import confetti from 'canvas-confetti';

export function useConfetti() {
  const [isActive, setIsActive] = useState(false);

  const showConfetti = useCallback(() => {
    console.log("🎉 CONFETTI TRIGGERED! Making sure it's visible...");
    setIsActive(true);
    
    // Force canvas positioning and ensure it's on top of everything
    const forceCanvasVisible = () => {
      const canvases = document.querySelectorAll('canvas');
      canvases.forEach((canvas) => {
        const style = (canvas as HTMLElement).style;
        style.position = 'fixed';
        style.top = '0';
        style.left = '0';
        style.width = '100vw';
        style.height = '100vh';
        style.zIndex = '999999';
        style.pointerEvents = 'none';
        style.display = 'block';
        console.log("🎨 Canvas styled:", canvas);
      });
    };
    
    // Apply initial styling
    forceCanvasVisible();
    
    // Confetti configuration with maximum visibility
    const count = 300;
    const defaults = {
      origin: { y: 0.6 },
      zIndex: 999999,
      disableForReducedMotion: false,
      useWorker: false,
      resize: true
    };

    function fire(particleRatio: number, opts: any) {
      console.log("🎆 Firing confetti burst with", Math.floor(count * particleRatio), "particles");
      
      const result = confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio)
      });
      
      // Force canvas visibility after each confetti call
      setTimeout(forceCanvasVisible, 10);
      
      return result;
    }

    // Multiple intense confetti bursts
    fire(0.3, {
      spread: 26,
      startVelocity: 60,
      colors: ['#FFD700', '#FFA500', '#FF6347', '#FF1493', '#9370DB']
    });

    setTimeout(() => {
      fire(0.25, {
        spread: 60,
        colors: ['#00FF00', '#00CED1', '#1E90FF', '#FF69B4', '#FFD700']
      });
    }, 200);

    setTimeout(() => {
      fire(0.4, {
        spread: 100,
        decay: 0.91,
        scalar: 1.2,
        colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8']
      });
    }, 400);

    setTimeout(() => {
      fire(0.15, {
        spread: 120,
        startVelocity: 25,
        decay: 0.92,
        scalar: 1.5,
        colors: ['#A0522D', '#8B4513', '#D2B48C', '#F0E6C9']
      });
    }, 600);

    setTimeout(() => {
      fire(0.2, {
        spread: 160,
        startVelocity: 45,
        colors: ['#FF0080', '#00FF80', '#8000FF', '#FF8000']
      });
    }, 800);
    
    // Keep checking canvas visibility for 2 seconds
    const intervalId = setInterval(forceCanvasVisible, 100);
    
    setTimeout(() => {
      clearInterval(intervalId);
      setIsActive(false);
      console.log("🎉 Confetti animation complete");
    }, 3000);
  }, []);

  return { showConfetti, isActive };
}
