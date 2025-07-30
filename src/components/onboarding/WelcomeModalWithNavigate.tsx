
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

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
      <DialogContent 
        className="max-w-lg w-[95vw] border-coffee-light/30 p-0 rounded-2xl overflow-hidden shadow-xl shadow-black/20 bg-gradient-to-br from-background to-background/95"
        role="dialog"
        aria-labelledby="welcome-title"
        aria-describedby="welcome-description"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="p-6 md:p-10"
        >
          <DialogHeader className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="text-4xl md:text-5xl">
                📚
              </div>
              <DialogTitle 
                id="welcome-title"
                className="font-serif text-2xl md:text-3xl text-coffee-darker font-bold"
              >
                Bienvenue sur READ
              </DialogTitle>
            </div>
          </DialogHeader>

          <div 
            id="welcome-description" 
            className="text-coffee-dark leading-relaxed space-y-6"
          >
            <p className="text-lg font-medium text-center text-coffee-darker">
              READ t'aide à retrouver le plaisir de lire, challenge après challenge.
            </p>
            
            <div>
              <p className="mb-4 font-medium text-coffee-dark">
                Voici comment ça fonctionne :
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-5 h-5 bg-coffee-dark rounded-full flex items-center justify-center mt-0.5">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <span>Choisis un livre qui t'inspire</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-5 h-5 bg-coffee-dark rounded-full flex items-center justify-center mt-0.5">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <span>Lis à ton rythme, hors de l'écran</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-5 h-5 bg-coffee-dark rounded-full flex items-center justify-center mt-0.5">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <span>Valide ton avancée toutes les 30 pages avec une question rapide</span>
                </li>
              </ul>
            </div>

            <p className="text-center text-coffee-medium">
              Tu suis ta progression, développes ta régularité,
              <br className="hidden sm:inline" />
              et renforces ton focus.
            </p>
          </div>

          <DialogFooter className="flex flex-col gap-4 mt-8">
            <Button
              onClick={handleStart}
              className="w-full bg-coffee-dark hover:bg-coffee-darker hover:-translate-y-0.5 
                       transition-all duration-200 text-white font-medium py-3 px-6 
                       focus-visible:ring-2 focus-visible:ring-coffee-dark focus-visible:ring-offset-2
                       shadow-lg hover:shadow-xl"
              autoFocus
              size="lg"
            >
              Créer mon compte
            </Button>
            <button
              type="button"
              onClick={handleSkip}
              className="text-coffee-medium hover:text-coffee-dark hover:underline 
                       transition-colors duration-200 bg-transparent border-none 
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coffee-dark 
                       focus-visible:ring-offset-2 rounded-md p-2"
            >
              Plus tard
            </button>
          </DialogFooter>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
