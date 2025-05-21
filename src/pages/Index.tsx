
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const navigate = useNavigate();
  const navigationAttempted = useRef(false);
  const { isLoading, isInitialized, user } = useAuth();
  const [redirectTimeout, setRedirectTimeout] = useState(false);

  // Log the auth state on each render for debugging
  console.info("[INDEX] Auth state:", {
    isLoading,
    isInitialized,
    hasUser: !!user,
    userId: user?.id,
    navigationAttempted: navigationAttempted.current
  });

  useEffect(() => {
    // Safety timeout to show a message if redirection takes too long
    const timer = setTimeout(() => {
      setRedirectTimeout(true);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Only redirect when auth state is fully determined and only once
    if (!navigationAttempted.current && !isLoading && isInitialized) {
      navigationAttempted.current = true;
      
      if (user) {
        console.info("[INDEX] INITIAL REDIRECT TO HOME (user authenticated)");
        // Use a timeout to ensure the component is fully mounted
        setTimeout(() => {
          navigate("/home");
        }, 50);
      } else {
        console.info("[INDEX] INITIAL REDIRECT TO AUTH (no user)");
        // Use a timeout to ensure the component is fully mounted
        setTimeout(() => {
          navigate("/auth");
        }, 50);
      }
    }
  }, [navigate, isLoading, isInitialized, user]);
  
  // Safety timeout of 5 seconds to force navigation if stuck
  useEffect(() => {
    const safetyTimer = setTimeout(() => {
      if (!navigationAttempted.current) {
        console.warn("[INDEX] Safety timer triggered - forcing navigation");
        navigationAttempted.current = true;
        
        // Also check user status for safety redirect
        if (user) {
          navigate("/home");
        } else {
          navigate("/auth");
        }
      }
    }, 5000);
    
    return () => clearTimeout(safetyTimer);
  }, [navigate, user]);

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
