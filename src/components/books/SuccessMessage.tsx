
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useConfetti } from "@/components/confetti/ConfettiProvider";
import { CheckCircle } from "lucide-react";
import { getUserLevel, getXPForNextLevel } from "@/services/user/levelService";

interface SuccessMessageProps {
  isOpen: boolean;
  onClose?: () => void;
  segment: number;
  userId?: string; // ✅ Phase 3.2: Nouveau prop pour afficher XP
}

export function SuccessMessage({ isOpen, onClose, segment, userId }: SuccessMessageProps) {
  const { showConfetti } = useConfetti();
  const [userLevel, setUserLevel] = useState<any>(null);
  
  useEffect(() => {
    if (isOpen) {
      console.log("🎉 Success modal opened - triggering confetti");
      requestAnimationFrame(() => showConfetti({ burst: "big" }));
      
      // ✅ Phase 3.2: Charger les informations de niveau
      if (userId) {
        getUserLevel(userId).then(setUserLevel).catch(console.error);
      }
    }
  }, [isOpen, showConfetti, userId]);

  const nextSegment = segment + 1;
  const xpForNext = userLevel ? getXPForNextLevel(userLevel.level) : 100;
  const progressPercent = userLevel ? Math.min(100, (userLevel.xp / xpForNext) * 100) : 0;
  
  return (
    <Dialog open={isOpen} onOpenChange={() => onClose && onClose()}>
      <DialogContent className="sm:max-w-md border-coffee-medium">
        <DialogHeader className="pb-2">
          <div className="flex flex-col items-center justify-center">
            <CheckCircle className="w-16 h-16 text-green-500 mb-2 animate-scale-in" />
            <DialogTitle className="text-h4 text-center font-serif text-coffee-darker">
              Parfait !
            </DialogTitle>
            <DialogDescription className="sr-only">
              Votre lecture a été validée avec succès
            </DialogDescription>
          </div>
        </DialogHeader>
        
        {/* ✅ Phase 3.2: Contenu amélioré avec XP et progression */}
        <div className="py-4 text-center space-y-4">
          {/* Badge XP */}
          <div className="flex items-center justify-center gap-2">
            <span className="text-3xl font-bold text-green-600">+10 XP</span>
            {userLevel && (
              <span className="text-sm text-muted-foreground">
                • Niveau {userLevel.level}
              </span>
            )}
          </div>
          
          {/* Barre de progression XP */}
          {userLevel && userLevel.level < 5 && (
            <div className="space-y-2 px-4">
              <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-green-500 to-emerald-600 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {userLevel.xp} / {xpForNext} XP pour le niveau {userLevel.level + 1}
              </p>
            </div>
          )}
          
          {/* Message de progression */}
          <div className="text-sm text-muted-foreground mt-4">
            <p className="mb-1">Prochain segment : <strong>{nextSegment}</strong></p>
            <p className="text-xs">Rendez-vous dans 30 pages</p>
          </div>
        </div>
        
        <div className="flex justify-center mt-4">
          <Button 
            onClick={() => onClose && onClose()} 
            className="bg-coffee-dark hover:bg-coffee-darker"
          >
            Continuer ma lecture
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
