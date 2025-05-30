
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { WelcomeModal } from "./WelcomeModal";

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
          setShowWelcomeModal(!onboardingDone);
        } catch (e) {
          console.error("Failed localStorage recovery in UserOnboarding:", e);
          // Default to showing welcome modal if we can't determine state
          setShowWelcomeModal(true);
        }
        setInitAttempted(true);
      }
    }, 3000);
    
    // Check if onboarding is required when auth is initialized
    if (isInitialized) {
      try {
        const onboardingDone = localStorage.getItem("onboardingDone");
        setShowWelcomeModal(!onboardingDone);
        setInitAttempted(true);
      } catch (e) {
        console.error("Error checking onboarding status:", e);
        // Default to showing welcome modal on error
        setShowWelcomeModal(true);
        setInitAttempted(true);
      }
    }
    
    return () => clearTimeout(safetyTimer);
  }, [isInitialized, initAttempted]);

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

  // Only show onboarding UI if explicitly set to true
  return showWelcomeModal ? (
    <WelcomeModal 
      open={showWelcomeModal} 
      onClose={handleClose}
    />
  ) : null;
}
