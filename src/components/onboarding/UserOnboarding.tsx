
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { lazy, Suspense } from "react";

// Lazy load the WelcomeModal
const WelcomeModal = lazy(() => import("./WelcomeModal").then(module => ({
  default: module.WelcomeModal
})));

export function UserOnboarding() {
  const { user, isInitialized } = useAuth();
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [initAttempted, setInitAttempted] = useState(false);

  useEffect(() => {
    // Safety mechanism to make sure this doesn't permanently fail
    const safetyTimer = setTimeout(() => {
      if (!initAttempted) {
        console.warn("UserOnboarding failed to initialize properly, attempting recovery");
        try {
          const onboardingDone = localStorage.getItem("onboardingDone");
          // Never show onboarding if user is already connected
          setShowWelcomeModal(!onboardingDone && !user);
        } catch (e) {
          console.error("Failed localStorage recovery in UserOnboarding:", e);
          // Default to showing welcome modal only if user is not connected
          setShowWelcomeModal(!user);
        }
        setInitAttempted(true);
      }
    }, 3000);
    
    // Check if onboarding is required when auth is initialized
    if (isInitialized) {
      try {
        const onboardingDone = localStorage.getItem("onboardingDone");
        // Never show onboarding if user is already connected
        setShowWelcomeModal(!onboardingDone && !user);
        setInitAttempted(true);
      } catch (e) {
        console.error("Error checking onboarding status:", e);
        // Default to showing welcome modal only if user is not connected
        setShowWelcomeModal(!user);
        setInitAttempted(true);
      }
    }
    
    return () => clearTimeout(safetyTimer);
  }, [isInitialized, initAttempted, user]);

  const handleClose = (skip?: boolean) => {
    try {
      if (!skip) {
        localStorage.setItem("onboardingDone", "true");
      }
      setShowWelcomeModal(false);
    } catch (e) {
      console.error("Error saving onboarding status:", e);
      // Still close the modal even if storage fails
      setShowWelcomeModal(false);
    }
  };

  // Only show onboarding UI if explicitly set to true with Suspense fallback
  return showWelcomeModal ? (
    <Suspense fallback={
      <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
        <div className="bg-background p-4 rounded-md shadow-lg">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-t-transparent border-coffee-medium mx-auto"></div>
          <p className="mt-2 text-body-sm text-muted-foreground">Chargement...</p>
        </div>
      </div>
    }>
      <WelcomeModal 
        open={showWelcomeModal} 
        onClose={handleClose}
      />
    </Suspense>
  ) : null;
}
