
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface ValidationModalProps {
  bookTitle: string;
  segment: number;
  isOpen: boolean;
  isValidating: boolean;
  onClose: () => void;
  onValidate: () => void;
}

export function ValidationModal({ 
  bookTitle,
  segment,
  isOpen,
  isValidating,
  onClose,
  onValidate
}: ValidationModalProps) {
  const [hasRead, setHasRead] = useState(false);
  
  const handleSubmit = () => {
    if (!hasRead) return;
    onValidate();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md border-coffee-medium">
        <DialogHeader>
          <DialogTitle className="text-center text-coffee-darker font-serif">
            Validation de lecture : pages {(segment-1)*30+1}-{segment*30}
          </DialogTitle>
          <DialogDescription className="text-center text-sm text-muted-foreground">
            Confirmez votre lecture de "{bookTitle}"
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="flex items-start space-x-2">
            <Checkbox 
              id="hasRead" 
              checked={hasRead}
              onCheckedChange={(checked) => setHasRead(checked as boolean)}
            />
            <div className="grid gap-1.5 leading-none">
              <Label
                htmlFor="hasRead"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                J'ai lu ces pages et je souhaite valider cette étape
              </Label>
            </div>
          </div>
        </div>
        
        <DialogFooter className="sm:justify-center gap-2">
          <Button variant="outline" onClick={onClose} className="border-coffee-medium">
            Annuler
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!hasRead || isValidating}
            className="bg-coffee-dark hover:bg-coffee-darker"
          >
            {isValidating ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Validation...</>
            ) : (
              "Valider cette étape"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
