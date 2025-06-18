
import { useCallback, useRef } from 'react';

/**
 * Hook pour créer des callbacks stables qui ne changent pas entre les rendus
 * Résout les problèmes de re-rendus causés par les callbacks qui changent
 */
export function useStableCallback<T extends (...args: any[]) => any>(callback: T): T {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  return useCallback(((...args) => {
    return callbackRef.current(...args);
  }) as T, []);
}
