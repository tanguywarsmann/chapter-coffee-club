
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BadgeCard } from "@/components/achievements/BadgeCard";
import { Badge } from "@/types/badge";
import confetti from 'canvas-confetti';
import { useEffect, useRef } from "react";

interface MonthlyRewardModalProps {
  badge: Badge | null;
  isOpen: boolean;
  onClose: () => void;
}

export function MonthlyRewardModal({ 
  badge, 
  isOpen, 
  onClose 
}: MonthlyRewardModalProps) {
  const confettiRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (isOpen && badge) {
      // Lance une animation festive quand le modal s'ouvre
      const duration = 5 * 1000;
      const animationEnd = Date.now() + duration;
      
      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;
      
      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();
        
        if (timeLeft <= 0) {
          return clearInterval(interval);
        }
        
        confetti({
          particleCount: 3,
          angle: randomInRange(60, 120),
          spread: randomInRange(50, 70),
          origin: { y: 0.6 },
          colors: ['#FFD700', '#FFA500', '#FF4500']
        });
        
        confetti({
          particleCount: 2,
          angle: randomInRange(60, 120),
          spread: randomInRange(50, 70),
          origin: { y: 0.6 },
          shapes: ['star'],
          colors: ['#FFD700', '#FFA500']
        });
      }, 250);
      
      return () => clearInterval(interval);
    }
  }, [isOpen, badge]);

  if (!badge) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md border-amber-300 animate-enter bg-gradient-to-b from-amber-50 to-white">
        <div ref={confettiRef} className="absolute inset-0 pointer-events-none" />
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-serif text-amber-800">
            🎁 Cadeau Mystère du Mois 🎁
          </DialogTitle>
          <DialogDescription className="text-center text-amber-700">
            Bravo ! Tu as validé plus de 10 segments ce mois-ci !
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-8 flex flex-col items-center space-y-8">
          <div className="relative animate-bounce duration-1000">
            <div className="absolute inset-0 bg-amber-300 rounded-full opacity-20 animate-ping" />
            <BadgeCard badge={badge} className="scale-150 animate-scale-in relative z-10" />
          </div>
          
          <p className="text-center text-lg text-amber-700 font-medium">
            {badge.name}
          </p>
          
          <p className="text-center text-sm text-amber-600">
            {badge.description}
          </p>
          
          <Button 
            onClick={onClose}
            className="mt-4 bg-amber-500 hover:bg-amber-600 text-white px-8 py-6 text-lg"
          >
            Génial, merci !
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
