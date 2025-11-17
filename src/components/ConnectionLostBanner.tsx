import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export const ConnectionLostBanner = () => {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const handleAuthError = () => {
      if (shown) return;
      
      setShown(true);
      
      toast.error(
        "La connexion à VREAD semble perdue",
        {
          description: "Recharge la page pour continuer",
          duration: Infinity,
          action: {
            label: "Recharger",
            onClick: () => window.location.reload()
          },
          position: "top-center",
        }
      );
    };

    window.addEventListener('auth-expired', handleAuthError);
    return () => window.removeEventListener('auth-expired', handleAuthError);
  }, [shown]);

  return null;
};
