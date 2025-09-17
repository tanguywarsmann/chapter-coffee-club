
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { lazy, Suspense } from "react";
import { ONBOARDING_KEY, ONBOARDING_SESSION_LOCK } from "@/constants/onboarding";
import { supabase } from "@/integrations/supabase/client";

// Lazy load the WelcomeModal
const WelcomeModal = lazy(() => import("./WelcomeModal").then(module => ({
  default: module.WelcomeModal
})));

export function UserOnboarding() {
  const { user, isInitialized } = useAuth();
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [initAttempted, setInitAttempted] = useState(false);

  useEffect(() => {
    if (!isInitialized || user) {
      setShowWelcomeModal(false);
      setInitAttempted(true);
      return;
    }

    try {
      const lock = (globalThis as any)[ONBOARDING_SESSION_LOCK];
      const seen = localStorage.getItem(ONBOARDING_KEY) === "true";

      if (!lock && !seen) {
        // Première ouverture garantie pour la session
        (globalThis as any)[ONBOARDING_SESSION_LOCK] = true;
        setShowWelcomeModal(true);
      } else {
        setShowWelcomeModal(false);
      }
      setInitAttempted(true);
    } catch {
      // En cas d'erreur de storage, ouvrir une seule fois grâce au lock mémoire
      if (!(globalThis as any)[ONBOARDING_SESSION_LOCK]) {
        (globalThis as any)[ONBOARDING_SESSION_LOCK] = true;
        setShowWelcomeModal(true);
      } else {
        setShowWelcomeModal(false);
      }
      setInitAttempted(true);
    }
  }, [isInitialized, user]);

  const handleClose = (skip?: boolean) => {
    try {
      if (!skip) {
        localStorage.setItem(ONBOARDING_KEY, "true");
        // Cookie de secours 1 an contre les environnements agressifs
        document.cookie = `${ONBOARDING_KEY}=1; max-age=31536000; samesite=lax; path=/`;
        
        // Optionnel: persister côté Supabase pour multi-device (fire-and-forget)
        if (user) {
          supabase.from("profiles")
            .update({ 
              onboarding_seen_at: new Date().toISOString(), 
              onboarding_version: 2 
            } as any)
            .eq("id", user.id)
            .select()
            .then(() => {});
        }
      }
    } catch {}
    finally {
      setShowWelcomeModal(false);
      (globalThis as any)[ONBOARDING_SESSION_LOCK] = true;
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
