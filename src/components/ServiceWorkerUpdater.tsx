import { useRegisterSW } from 'virtual:pwa-register/react';
import { toast } from 'sonner';

export const ServiceWorkerUpdater = () => {
  const { updateServiceWorker } = useRegisterSW({
    onNeedRefresh() {
      toast.info('Mise à jour VREAD disponible', {
        description: 'Rechargez pour appliquer la nouvelle version.',
        action: { label: 'Recharger', onClick: () => updateServiceWorker(true) },
        duration: 10000,
      });
    },
    onRegistered(registration) {
      // check d'update immédiat pour réduire la fenêtre d'obsolescence
      if (registration) setTimeout(() => registration.update(), 1000);
    },
  });
  return null;
};