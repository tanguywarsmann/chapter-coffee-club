import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, X } from "lucide-react";

interface JokerConfirmationModalProps {
  isOpen: boolean;
  segment: number;
  jokersUsed: number;
  jokersAllowed: number;
  jokersRemaining?: number;
  isUsingJoker?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function JokerConfirmationModal({
  isOpen,
  segment,
  jokersUsed,
  jokersAllowed,
  jokersRemaining: propJokersRemaining,
  isUsingJoker = false,
  onConfirm,
  onCancel
}: JokerConfirmationModalProps) {
  const jokersRemaining = propJokersRemaining ?? Math.max(0, jokersAllowed - jokersUsed);

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-md border-coffee-medium">
        <DialogHeader>
          <DialogTitle className="text-center text-coffee-darker font-serif flex items-center justify-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            Utiliser un Joker ?
          </DialogTitle>
          <DialogDescription className="text-center text-sm text-foreground/80">
            Réponse incorrecte au segment {segment}
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
            <p className="text-sm text-amber-800 mb-2">
              Souhaitez-vous utiliser un Joker pour valider ce segment malgré la réponse incorrecte ?
            </p>
            <div className="flex items-center gap-2 text-xs text-amber-700">
              <Sparkles className="h-3 w-3" />
              <span>Jokers restants : {jokersRemaining} / {jokersAllowed}</span>
            </div>
          </div>
          
          <div className="text-xs text-muted-foreground text-center">
            Si vous refusez, le segment restera non validé et vous pourrez réessayer plus tard.
          </div>
        </div>
        
        <DialogFooter className="sm:justify-center gap-2">
          <Button 
            variant="outline" 
            onClick={onCancel}
            className="border-coffee-medium text-foreground hover:bg-muted"
          >
            <X className="h-4 w-4 mr-2" />
            Annuler
          </Button>
          <Button 
            onClick={onConfirm}
            disabled={jokersRemaining <= 0 || isUsingJoker}
            className="bg-amber-600 hover:bg-amber-700 text-white disabled:opacity-50"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            {isUsingJoker ? "Utilisation..." : "Utiliser un Joker"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}