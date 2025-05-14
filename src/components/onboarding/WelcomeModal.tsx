
import { useEffect, useState } from "react";
import { WelcomeModalWithNavigate } from "./WelcomeModalWithNavigate";
import { WelcomeModalIframe } from "./WelcomeModalIframe";

interface WelcomeModalProps {
  open: boolean;
  onClose: (skipFlag?: boolean) => void;
}

export function WelcomeModal({ open, onClose }: WelcomeModalProps) {
  const [isInIframe, setIsInIframe] = useState<boolean | null>(null);

  useEffect(() => {
    try {
      setIsInIframe(window.self !== window.top);
    } catch {
      // Si une erreur est levée lors de l'accès à window.self ou window.top
      // (généralement à cause des restrictions de sécurité), on est dans une iframe
      setIsInIframe(true);
    }
  }, []);

  if (isInIframe === null) return null; // Attend d'avoir détecté le contexte
  
  return isInIframe 
    ? <WelcomeModalIframe open={open} onClose={onClose} />
    : <WelcomeModalWithNavigate open={open} onClose={onClose} />;
}
