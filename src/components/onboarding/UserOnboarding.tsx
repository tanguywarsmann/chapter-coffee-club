
import { useState, useEffect } from "react";
import { WelcomeModal } from "./WelcomeModal";
import { useAuth } from "@/contexts/AuthContext";

export function UserOnboarding() {
  const { user, isInitialized } = useAuth();
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  useEffect(() => {
    // Check if onboarding is required when auth is initialized and user is logged in
    if (isInitialized && user) {
      const onboardingDone = localStorage.getItem("onboardingDone");
      if (!onboardingDone) {
        setShowWelcomeModal(true);
      }
    }
  }, [user, isInitialized]);

  return (
    showWelcomeModal && (
      <WelcomeModal
        open={showWelcomeModal} 
        onClose={(skip) => {
          if (skip) {
            // If skipped, we'll show it again later
            setShowWelcomeModal(false);
          } else {
            // If completed, mark as done in localStorage and close
            localStorage.setItem("onboardingDone", "true");
            setShowWelcomeModal(false);
          }
        }}
      />
    )
  );
}
