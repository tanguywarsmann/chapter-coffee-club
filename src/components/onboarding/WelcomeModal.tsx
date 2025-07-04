
import { useEffect, useState, lazy, Suspense } from "react";
import { isInIframe, isPreview } from "@/utils/environment";
import { useIsMobile } from "@/hooks/use-mobile";

// Lazy loading modal components for code splitting
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

export function WelcomeModal({ open, onClose }: WelcomeModalProps) {
  const [isInIframeState, setIsInIframeState] = useState<boolean | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    // Only run this effect if the modal is actually open to save resources
    if (open) {
      try {
        // Use a timeout to ensure this effect doesn't block rendering
        setTimeout(() => {
          try {
            setIsInIframeState(isInIframe());
          } catch (e) {
            console.error("Error detecting iframe context:", e);
            // If an error is thrown, assume we're in an iframe
            setIsInIframeState(true);
          }
        }, 0);
      } catch (e) {
        console.error("Error in iframe detection setup:", e);
        setError(e instanceof Error ? e : new Error(String(e)));
        // Default to non-iframe to ensure something renders
        setIsInIframeState(false);
      }
    }
  }, [open]);

  // Extremely lightweight loading state
  const ModalLoadingFallback = () => {
    if (!open) return null;
    return isMobile ? 
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
        <div className="bg-white p-4 rounded-md">Chargement...</div>
      </div> : null;
  };

  // If we hit an error, render a basic version that won't break
  if (error) {
    console.warn("WelcomeModal encountered an error, falling back to basic version:", error);
    return open ? (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg max-w-md w-full">
          <h2 className="text-xl font-semibold mb-4">Bienvenue sur READ</h2>
          <p className="mb-4">Reprends goût à la lecture, page après page.</p>
          <button 
            className="w-full bg-coffee-dark text-white py-2 rounded-md"
            onClick={() => onClose(false)}
          >
            Commencer
          </button>
        </div>
      </div>
    ) : null;
  }

  // Return null if not open or if iframe detection hasn't completed
  if (!open || isInIframeState === null) return null;
  
  return (
    <Suspense fallback={<ModalLoadingFallback />}>
      {isInIframeState 
        ? <WelcomeModalIframe open={open} onClose={onClose} />
        : <WelcomeModalWithNavigate open={open} onClose={onClose} />
      }
    </Suspense>
  );
}

export default { WelcomeModal };
