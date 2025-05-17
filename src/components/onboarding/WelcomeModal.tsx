
import { useEffect, useState, lazy, Suspense } from "react";
import { isInIframe, isPreview } from "@/utils/environment";

// Chargement différé des composants de modal
const WelcomeModalWithNavigate = lazy(() => import("./WelcomeModalWithNavigate").then(module => ({
  default: module.WelcomeModalWithNavigate
})));
const WelcomeModalIframe = lazy(() => import("./WelcomeModalIframe").then(module => ({
  default: module.WelcomeModalIframe
})));

interface WelcomeModalProps {
  open: boolean;
  onClose: (skipFlag?: boolean) => void;
}

// Fallback minimal pour le modal en chargement
const ModalLoadingFallback = () => null;

export function WelcomeModal({ open, onClose }: WelcomeModalProps) {
  const [isInIframeState, setIsInIframeState] = useState<boolean | null>(null);

  useEffect(() => {
    try {
      setIsInIframeState(isInIframe());
    } catch (e) {
      console.error("Erreur lors de la détection du contexte iframe:", e);
      // Si une erreur est levée, on suppose qu'on est dans une iframe
      setIsInIframeState(true);
    }
  }, []);

  if (isInIframeState === null) return null; // Attend d'avoir détecté le contexte
  
  return (
    <Suspense fallback={<ModalLoadingFallback />}>
      {isInIframeState 
        ? <WelcomeModalIframe open={open} onClose={onClose} />
        : <WelcomeModalWithNavigate open={open} onClose={onClose} />
      }
    </Suspense>
  );
}
