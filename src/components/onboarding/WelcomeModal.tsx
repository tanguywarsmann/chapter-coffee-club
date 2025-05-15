
import { useEffect, useState } from "react";
import { WelcomeModalWithNavigate } from "./WelcomeModalWithNavigate";
import { WelcomeModalIframe } from "./WelcomeModalIframe";
import { isInIframe, isPreview } from "@/utils/environment";

console.log("Chargement de WelcomeModal.tsx", {
  isPreview: isPreview(),
  isInIframe: isInIframe(),
});

interface WelcomeModalProps {
  open: boolean;
  onClose: (skipFlag?: boolean) => void;
}

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
  
  return isInIframeState 
    ? <WelcomeModalIframe open={open} onClose={onClose} />
    : <WelcomeModalWithNavigate open={open} onClose={onClose} />;
}
