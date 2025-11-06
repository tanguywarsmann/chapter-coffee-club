
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Loader2, Sparkles } from "lucide-react";
import { LockTimer } from "./LockTimer";

interface ValidationModalProps {
  bookTitle: string;
  segment: number;
  isOpen: boolean;
  isValidating: boolean;
  isLocked?: boolean;
  remainingLockTime?: number | null;
  jokersUsed?: number;
  jokersAllowed?: number;
  onClose: () => void;
  onValidate: () => void;
  onLockExpire?: () => void;
}

export function ValidationModal({ 
  bookTitle,
  segment,
  isOpen,
  isValidating,
  isLocked = false,
  remainingLockTime = null,
  jokersUsed = 0,
  jokersAllowed = 0,
  onClose,
  onValidate,
  onLockExpire
}: ValidationModalProps) {
  const [hasRead, setHasRead] = useState(false);
  
  const handleSubmit = () => {
    if (!hasRead) return;
    onValidate();
  };

  // ✅ Phase 1.1: Reset hasRead when modal closes
  const handleModalChange = (open: boolean) => {
    if (!open) {
      setHasRead(false);
      onClose();
    }
  };

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={handleModalChange}
      aria-labelledby="validation-modal-title"
      aria-describedby="validation-modal-description"
    >
      <DialogContent 
        className="sm:max-w-md border-coffee-medium"
        role="dialog"
        aria-modal="true"
      >
        <DialogHeader>
          <DialogTitle 
            id="validation-modal-title"
            className="text-center text-coffee-darker font-serif"
          >
            Validation de lecture : pages {(segment-1)*30+1}-{segment*30}
          </DialogTitle>
          <DialogDescription 
            id="validation-modal-description"
            className="text-center text-body-sm text-foreground/80"
          >
            Confirmez votre lecture de "{bookTitle}"
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          {/* Jokers info - affiche toujours 0/0 si jokersAllowed = 0 (UI gating) */}
          <div className="bg-muted/50 p-3 rounded-lg border border-coffee-light">
            <div className="flex items-center gap-2 text-body-sm text-muted-foreground">
              <Sparkles className="h-4 w-4" />
              <span 
                className={jokersUsed >= jokersAllowed ? "text-muted-foreground line-through" : ""}
                data-testid="jokers-remaining"
              >
                Jokers disponibles : {Math.max(0, jokersAllowed - jokersUsed)} / {jokersAllowed}
              </span>
            </div>
            {jokersAllowed === 0 && (
              <p className="text-caption text-muted-foreground mt-1">
                Jokers disponibles à partir de 3 segments
              </p>
            )}
            {jokersAllowed > 0 && jokersUsed >= jokersAllowed && (
              <p className="text-caption text-muted-foreground mt-1">
                Tous vos jokers ont été utilisés pour ce livre
              </p>
            )}
          </div>

          {isLocked && remainingLockTime && remainingLockTime > 0 ? (
            <div role="status" aria-live="polite">
              <LockTimer 
                remainingSeconds={remainingLockTime} 
                onExpire={() => onLockExpire?.()}
              />
            </div>
          ) : (
            <div className="flex items-start space-x-2">
              <Checkbox 
                id="hasRead" 
                checked={hasRead}
                onCheckedChange={(checked) => setHasRead(checked as boolean)}
                aria-describedby="checkbox-description"
                className="transition-all duration-200 data-[state=checked]:scale-110"
              />
              <div className="grid gap-1.5 leading-none">
                <Label
                  htmlFor="hasRead"
                  className="text-body-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-foreground"
                >
                  J'ai lu ces pages
                </Label>
                <p 
                  id="checkbox-description"
                  className="text-caption text-foreground/70"
                >
                  Confirmez votre lecture avant de valider
                </p>
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter className="sm:justify-center gap-2">
          <Button 
            variant="outline" 
            onClick={onClose} 
            className="border-coffee-medium text-foreground hover:bg-muted"
            aria-label="Annuler la validation de lecture"
          >
            Annuler
          </Button>
          {!isLocked && (
            <Button 
              onClick={handleSubmit} 
              disabled={!hasRead || isValidating}
              className="bg-coffee-dark hover:bg-coffee-darker text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label={isValidating ? "Validation en cours" : "Valider cette étape de lecture"}
              aria-describedby={!hasRead ? "validation-requirement" : undefined}
            >
              {isValidating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden="true" />
                  <span>Validation...</span>
                </>
              ) : (
                "Valider cette étape"
              )}
            </Button>
          )}
          {!hasRead && (
            <div 
              id="validation-requirement" 
              className="sr-only"
              aria-live="polite"
            >
              Vous devez cocher la case pour valider votre lecture
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
