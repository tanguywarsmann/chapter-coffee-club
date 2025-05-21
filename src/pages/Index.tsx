
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();
  const navigationAttempted = useRef(false);

  useEffect(() => {
    // Prevent redirect loops by only attempting navigation once
    if (!navigationAttempted.current) {
      navigationAttempted.current = true;
      // Use a timeout to ensure the component is fully mounted
      setTimeout(() => {
        navigate("/home");
      }, 50);
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-coffee-dark mx-auto"></div>
        <p className="mt-2 text-coffee-dark">Chargement de READ...</p>
      </div>
    </div>
  );
};

export default Index;
