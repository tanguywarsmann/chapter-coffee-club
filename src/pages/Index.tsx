
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const navigate = useNavigate();
  const navigationAttempted = useRef(false);
  const { isLoading, isInitialized } = useAuth();
  const [redirectTimeout, setRedirectTimeout] = useState(false);

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
      console.info("INITIAL REDIRECT TO HOME");
      
      // Use a timeout to ensure the component is fully mounted
      setTimeout(() => {
        navigate("/home");
      }, 50);
    }
  }, [navigate, isLoading, isInitialized]);
  
  // Safety timeout of 5 seconds to force navigation if stuck
  useEffect(() => {
    const safetyTimer = setTimeout(() => {
      if (!navigationAttempted.current) {
        console.warn("Index safety timer triggered - forcing navigation");
        navigationAttempted.current = true;
        navigate("/home");
      }
    }, 5000);
    
    return () => clearTimeout(safetyTimer);
  }, [navigate]);

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
