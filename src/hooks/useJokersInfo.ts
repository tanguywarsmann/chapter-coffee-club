import useSWR, { mutate } from 'swr';
import { getJokersInfo } from '@/utils/jokerUtils';

interface JokersInfo {
  jokersAllowed: number;
  jokersUsed: number;
  jokersRemaining: number;
}

/**
 * Hook SWR pour gérer les informations des jokers avec cache synchronisé
 */
export const useJokersInfo = (
  bookId: string | null,
  expectedSegments: number | null,
  progressId: string | null,
  refreshTrigger?: number // Trigger pour forcer le refresh
) => {
  const key = bookId && expectedSegments && progressId 
    ? ['jokers-info', bookId, progressId, refreshTrigger] 
    : null;

  const { data, error, mutate: mutateSelf, isLoading } = useSWR(
    key,
    async () => {
      if (!expectedSegments || !progressId) return null;
      
      const info = await getJokersInfo(expectedSegments, progressId);
      return {
        jokersAllowed: info.jokersAllowed,
        jokersUsed: info.jokersUsed,
        jokersRemaining: info.jokersAllowed - info.jokersUsed
      };
    },
    {
      refreshInterval: 0, // Pas de refresh automatique
      revalidateOnFocus: false,
      dedupingInterval: 1000 // Éviter les appels multiples
    }
  );

  /**
   * Invalide le cache des jokers pour ce livre
   */
  const invalidateJokersCache = async () => {
    if (bookId) {
      await mutate(['jokers-info', bookId], undefined, { revalidate: true });
      await mutateSelf();
    }
  };

  /**
   * Met à jour directement le cache avec de nouvelles valeurs
   */
  const updateJokersCache = (newData: Partial<JokersInfo>) => {
    if (data) {
      const updatedData = { ...data, ...newData };
      mutateSelf(updatedData, false);
    }
  };

  return {
    jokersInfo: data,
    isLoading,
    error,
    invalidateJokersCache,
    updateJokersCache,
    refetch: mutateSelf
  };
};

/**
 * Fonction utilitaire pour invalider globalement le cache des jokers
 */
export const invalidateAllJokersCache = async (bookId: string) => {
  await mutate(
    (key) => Array.isArray(key) && key[0] === 'jokers-info' && key[1] === bookId,
    undefined,
    { revalidate: true }
  );
};