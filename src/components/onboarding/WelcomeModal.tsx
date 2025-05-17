
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
  const isMobile = useIsMobile();

  useEffect(() => {
    // Only run this effect if the modal is actually open to save resources
    if (open) {
      try {
        setIsInIframeState(isInIframe());
      } catch (e) {
        console.error("Error detecting iframe context:", e);
        // If an error is thrown, assume we're in an iframe
        setIsInIframeState(true);
      }
    }
  }, [open]);

  // Extremely lightweight loading state
  const ModalLoadingFallback = () => {
    if (!open) return null;
    return isMobile ? 
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
        <div className="bg-white p-4 rounded-md">Loading...</div>
      </div> : null;
  };

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
