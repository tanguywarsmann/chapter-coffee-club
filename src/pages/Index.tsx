
import { useEffect, useState } from "react";

const Index = () => {
  const [redirectTimeout, setRedirectTimeout] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setRedirectTimeout(true);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-coffee-dark mx-auto"></div>
        <p className="mt-2 text-coffee-dark">Chargement de VREAD...</p>
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
