
import { useEffect, useState, lazy, Suspense } from "react";
import { isInIframe, isPreview } from "@/utils/environment";
import { useIsMobile } from "@/hooks/use-mobile";

// Lazy loading modal components
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
    try {
      setIsInIframeState(isInIframe());
    } catch (e) {
      console.error("Error detecting iframe context:", e);
      // If an error is thrown, assume we're in an iframe
      setIsInIframeState(true);
    }
  }, []);

  // Simple loading state for mobile
  const ModalLoadingFallback = () => {
    if (isMobile) {
      return open ? <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
        <div className="bg-white p-4 rounded-md">Loading...</div>
      </div> : null;
    }
    return null; // Default empty fallback for desktop
  };

  if (isInIframeState === null) return null; // Wait for iframe detection
  
  return (
    <Suspense fallback={<ModalLoadingFallback />}>
      {isInIframeState 
        ? <WelcomeModalIframe open={open} onClose={onClose} />
        : <WelcomeModalWithNavigate open={open} onClose={onClose} />
      }
    </Suspense>
  );
}
