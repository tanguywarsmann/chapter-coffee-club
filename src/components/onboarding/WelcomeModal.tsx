
import { useEffect, useState, lazy, Suspense } from "react";
import { isInIframe } from "@/utils/environment";
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
    if (open) {
      try {
        setTimeout(() => {
          try {
            setIsInIframeState(isInIframe());
          } catch (e) {
            console.error("Error detecting iframe context:", e);
            setIsInIframeState(true);
          }
        }, 0);
      } catch (e) {
        console.error("Error in iframe detection setup:", e);
        setError(e instanceof Error ? e : new Error(String(e)));
        setIsInIframeState(false);
      }
    }
  }, [open]);

  // Simple loading fallback
  const LoadingFallback = () => (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white p-4 rounded-md">
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-t-transparent border-coffee-medium mx-auto mb-2"></div>
        <p className="text-sm">Chargement...</p>
      </div>
    </div>
  );

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
    <Suspense fallback={<LoadingFallback />}>
      {isInIframeState 
        ? <WelcomeModalIframe open={open} onClose={onClose} />
        : <WelcomeModalWithNavigate open={open} onClose={onClose} />
      }
    </Suspense>
  );
}

export default { WelcomeModal };
