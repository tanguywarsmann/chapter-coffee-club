
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface WelcomeModalProps {
  open: boolean;
  onClose: () => void;
}

export function WelcomeModal({ open, onClose }: WelcomeModalProps) {
  const navigate = useNavigate();

  const handleStart = () => {
    localStorage.setItem("onboardingDone", "true");
    onClose();
    navigate("/explore");
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md text-center border-coffee-light">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl text-coffee-darker">
            Bienvenue sur READ
          </DialogTitle>
        </DialogHeader>
        <div className="py-6 text-lg text-coffee-dark">
          Ici, tu cultives<br />
          <span className="font-medium">ta concentration, ta régularité,<br />et ton amour des livres.</span>
        </div>
        <DialogFooter className="flex flex-col gap-3">
          <Button 
            onClick={handleStart}
            className="bg-coffee-dark hover:bg-coffee-darker min-w-[200px] text-lg"
            autoFocus
          >
            Commencer mon premier livre
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
