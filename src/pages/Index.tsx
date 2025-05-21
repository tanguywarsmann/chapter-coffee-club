
import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const navigationAttempted = useRef(false);
  const documentReady = useRef(false);
  const { isLoading, isInitialized, user } = useAuth();
  const [redirectTimeout, setRedirectTimeout] = useState(false);

  // Log the auth and navigation state on each render for debugging
  console.info("[INDEX] Current state:", {
    pathname: location.pathname,
    isLoading,
    isInitialized,
    hasUser: !!user,
    userId: user?.id,
    navigationAttempted: navigationAttempted.current,
    documentReady: documentReady.current,
    readyState: document.readyState
  });

  // Document ready check for PWA
  useEffect(() => {
    const handleDocumentReady = () => {
      console.info("[INDEX] Document fully loaded");
      documentReady.current = true;
    };
    
    if (document.readyState === "complete") {
      documentReady.current = true;
    } else {
      window.addEventListener("load", handleDocumentReady);
      return () => window.removeEventListener("load", handleDocumentReady);
    }
  }, []);

  useEffect(() => {
    // Safety timeout to show a message if redirection takes too long
    const timer = setTimeout(() => {
      setRedirectTimeout(true);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);

  // Main navigation logic - runs when auth state is determined
  useEffect(() => {
    // Only redirect when auth state is fully determined and only once
    if (!navigationAttempted.current && !isLoading && isInitialized) {
      navigationAttempted.current = true;
      
      const performNavigation = () => {
        if (user) {
          console.info("[INDEX] REDIRECTING TO HOME (user authenticated)");
          
          // Try React Router navigation first
          try {
            navigate("/home");
          } catch (err) {
            console.error("[INDEX] React Router navigation failed:", err);
            // Fallback to direct location change
            window.location.replace("/home");
          }
        } else {
          console.info("[INDEX] REDIRECTING TO AUTH (no user)");
          
          // Try React Router navigation first  
          try {
            navigate("/auth");
          } catch (err) {
            console.error("[INDEX] React Router navigation failed:", err);
            // Fallback to direct location change
            window.location.replace("/auth");
          }
        }
      };

      // Use a short timeout to ensure React is ready for navigation
      setTimeout(performNavigation, 50);
    }
  }, [navigate, isLoading, isInitialized, user]);
  
  // Ultimate safety timeout - force navigation after 5 seconds if stuck
  useEffect(() => {
    const safetyTimer = setTimeout(() => {
      if (!navigationAttempted.current) {
        console.warn("[INDEX] Safety timer triggered - forcing direct navigation");
        navigationAttempted.current = true;
        
        // Last resort - direct browser navigation
        if (user) {
          window.location.replace("/home");
        } else {
          window.location.replace("/auth");
        }
      }
    }, 5000);
    
    return () => clearTimeout(safetyTimer);
  }, [user]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-coffee-dark mx-auto"></div>
        <p className="mt-2 text-coffee-dark">Chargement de READ...</p>
        {redirectTimeout && (
          <p className="mt-2 text-xs text-coffee-medium">
            Le chargement prend plus de temps que prévu...
          </p>
        )}
      </div>
    </div>
  );
};

export default Index;
