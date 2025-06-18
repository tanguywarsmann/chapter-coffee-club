
import { useState, useCallback, useRef } from 'react';
import { useStableCallback } from './useStableCallback';
import { usePerformanceTracker } from '@/utils/performanceAudit';
import { withErrorHandling } from '@/utils/errorBoundaryUtils';

/**
 * Hook consolidé pour la validation de lecture
 * Remplace la logique fragmentée entre plusieurs hooks
 */
export const useReadingValidation = (
  bookId: string,
  userId: string | null,
  currentSegment: number
) => {
  const { trackRender, trackApiCall, trackError } = usePerformanceTracker('useReadingValidation');
  const [validationState, setValidationState] = useState({
    isValidating: false,
    segment: null as number | null,
    error: null as string | null
  });
  
  const validationInProgress = useRef(false);

  // Fonction de validation stabilisée
  const validateSegment = useStableCallback(
    withErrorHandling(async (segment: number) => {
      if (!userId || !bookId || validationInProgress.current) {
        return;
      }

      try {
        validationInProgress.current = true;
        trackApiCall();
        
        setValidationState(prev => ({
          ...prev,
          isValidating: true,
          segment,
          error: null
        }));

        // TODO: Implémenter la logique de validation réelle
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulation
        
        setValidationState(prev => ({
          ...prev,
          isValidating: false,
          error: null
        }));
        
      } catch (error) {
        trackError(error as Error);
        setValidationState(prev => ({
          ...prev,
          isValidating: false,
          error: (error as Error).message
        }));
      } finally {
        validationInProgress.current = false;
      }
    }, 'useReadingValidation.validateSegment')
  );

  const resetValidation = useStableCallback(() => {
    setValidationState({
      isValidating: false,
      segment: null,
      error: null
    });
    validationInProgress.current = false;
  });

  // Calculer le prochain segment disponible
  const nextSegment = currentSegment + 1;
  
  const startValidation = useStableCallback(() => {
    validateSegment(nextSegment);
  });

  trackRender();

  return {
    ...validationState,
    nextSegment,
    validateSegment,
    startValidation,
    resetValidation
  };
};
