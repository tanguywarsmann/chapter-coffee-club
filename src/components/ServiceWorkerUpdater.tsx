import { useEffect } from 'react';
import { toast } from 'sonner';

export const ServiceWorkerUpdater = () => {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      const handleSWMessage = (event: MessageEvent) => {
        if (event.data?.type === 'SW_UPDATED') {
          toast.info('Mise à jour VREAD disponible', {
            description: 'Rechargez pour appliquer la nouvelle version.',
            action: {
              label: 'Recharger',
              onClick: () => window.location.reload(),
            },
            duration: 10000,
          });
        }
        
        if (event.data?.type === 'FORCE_RELOAD') {
          toast.warning('Nouvelle version détectée', {
            description: event.data.message || 'Rechargement automatique dans 3 secondes...',
            duration: 3000,
          });
          
          setTimeout(() => {
            window.location.reload();
          }, 3000);
        }
      };

      navigator.serviceWorker.addEventListener('message', handleSWMessage);
      
      // Vérifier immédiatement s'il y a des mises à jour
      navigator.serviceWorker.ready.then(registration => {
        if (registration.active) {
          registration.active.postMessage({ type: 'CHECK_UPDATES' });
        }
      });

      return () => {
        navigator.serviceWorker.removeEventListener('message', handleSWMessage);
      };
    }
  }, []);

  return null;
};