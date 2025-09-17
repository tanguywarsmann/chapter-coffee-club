
import { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useConfetti } from "@/hooks/useConfetti";
import { CheckCircle } from "lucide-react";

interface SuccessMessageProps {
  isOpen: boolean;
  onClose?: () => void;
  segment: number;
}

export function SuccessMessage({ isOpen, onClose, segment }: SuccessMessageProps) {
  const { showConfetti } = useConfetti();
  
  useEffect(() => {
    if (isOpen) {
      console.log("🎉 Success modal opened - triggering confetti");
      showConfetti();
    }
  }, [isOpen, showConfetti]);

  const nextSegment = segment + 1;
  
  return (
    <Dialog open={isOpen} onOpenChange={() => onClose && onClose()}>
      <DialogContent className="sm:max-w-md border-coffee-medium">
        <DialogHeader className="pb-2">
          <div className="flex flex-col items-center justify-center">
            <CheckCircle className="w-16 h-16 text-green-500 mb-2 animate-scale-in" />
            <DialogTitle className="text-h4 text-center font-serif text-coffee-darker">
              Parfait !
            </DialogTitle>
          </div>
        </DialogHeader>
        
        <div className="py-4 text-center">
          <p className="text-coffee-dark mb-2">
            Votre lecture a été validée avec succès.
          </p>
          <p className="text-muted-foreground">
            Rendez-vous dans 30 pages pour valider la suite de votre lecture.
          </p>
          <p className="text-body-sm mt-2 font-medium">
            Prochain segment à valider : {nextSegment}
          </p>
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
