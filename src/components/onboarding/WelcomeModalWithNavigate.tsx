
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface WelcomeModalWithNavigateProps {
  open: boolean;
  onClose: (skipFlag?: boolean) => void;
}

export function WelcomeModalWithNavigate({ open, onClose }: WelcomeModalWithNavigateProps) {
let navigate: (to: string) => void;

try {
  navigate = useNavigate();
} catch (error) {
  console.error("useNavigate() a échoué dans WelcomeModalWithNavigate.tsx :", error);
  navigate = () => {}; // fallback no-op pour éviter le crash
}

  const handleStart = () => {
    localStorage.setItem("onboardingDone", "true");
    onClose(false);
    navigate("/auth?mode=signup");
  };

  const handleSkip = () => onClose(true);

  return (
    <Dialog open={open} onOpenChange={() => onClose(true)}>
      <DialogContent className="max-w-md w-[95vw] text-center border-coffee-light p-0 rounded-lg overflow-hidden">
        <DialogHeader>
          <DialogTitle className="font-serif text-h3 md:text-h2 pt-8 pb-2 text-coffee-darker">
            Bienvenue sur READ <span role="img" aria-label="livre">📚</span>
          </DialogTitle>
        </DialogHeader>
        <div className="px-6 py-4 text-[1.1rem] text-coffee-dark leading-relaxed text-left mx-auto max-w-prose">
          <p className="mb-5">
            <span className="font-medium">READ t'aide à retrouver le plaisir de lire, challenge après challenge.</span>
          </p>
          <p className="mb-3">Voici comment ça fonctionne :</p>
          <ol className="list-decimal list-inside mb-5 pl-1 space-y-0.5">
            <li>Choisis un livre qui t'inspire</li>
            <li>Lis à ton rythme, hors de l'écran</li>
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
            className="bg-coffee-dark hover:bg-coffee-darker min-w-[200px] text-h4"
            autoFocus
          >
            Créer mon compte
          </Button>
          <button
            type="button"
            onClick={handleSkip}
            className="mt-2 text-body-sm text-coffee-medium hover:text-coffee-dark underline bg-transparent border-none outline-none"
            tabIndex={-1}
          >
            Plus tard
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
