
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface WelcomeModalProps {
  open: boolean;
  onClose: (skipFlag?: boolean) => void; // skipFlag vrai si on ferme sans valider
}

export function WelcomeModal({ open, onClose }: WelcomeModalProps) {
  const navigate = useNavigate();

  const handleStart = () => {
    localStorage.setItem("onboardingDone", "true");
    onClose(false);
    navigate("/explore");
  };

  const handleSkip = () => {
    // Ne pose pas de flag, OK pour revoir plus tard.
    onClose(true);
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose(true)}>
      <DialogContent className="max-w-md w-[95vw] text-center border-coffee-light p-0 rounded-lg overflow-hidden">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl md:text-3xl pt-8 pb-2 text-coffee-darker">
            Bienvenue sur READ <span role="img" aria-label="livre">📚</span>
          </DialogTitle>
        </DialogHeader>
        <div className="px-6 py-4 text-[1.1rem] text-coffee-dark leading-relaxed text-left mx-auto max-w-prose">
          <p className="mb-5">
            <span className="font-medium">READ t’aide à retrouver le plaisir de lire, challenge après challenge.</span>
          </p>
          <p className="mb-3">Voici comment ça fonctionne :</p>
          <ol className="list-decimal list-inside mb-5 pl-1 space-y-0.5">
            <li>Choisis un livre qui t’inspire</li>
            <li>Lis à ton rythme, hors de l’écran</li>
            <li>Valide ton avancée toutes les 30 pages avec une question rapide</li>
          </ol>
          <p>
            Tu suis ta progression, développes ta régularité,<br className="hidden md:inline" />
            et renforces ton focus.
          </p>
        </div>
        <DialogFooter className="flex flex-col gap-2 pb-6 px-6">
          <Button 
            onClick={handleStart}
            className="bg-coffee-dark hover:bg-coffee-darker min-w-[200px] text-lg"
            autoFocus
          >
            Je commence ma lecture
          </Button>
          <button
            type="button"
            onClick={handleSkip}
            className="mt-2 text-sm text-coffee-medium hover:text-coffee-dark underline bg-transparent border-none outline-none"
            tabIndex={-1}
          >
            Plus tard
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
