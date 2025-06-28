
import { useEffect, useRef, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { fetchReadingProgress } from "@/services/reading/readingListService";
import { useDebounce } from "./useDebounce";
import { useLogger } from "@/utils/logger";
import { persistentCache } from "@/utils/persistentCache";
import { performanceTracker } from "@/utils/performanceTracker";

/**
 * Hook principal pour la gestion de la lecture utilisateur v0.15
 * Avec cache persistant et optimisations performance
 */
export const useReadingListCore = () => {
  const logger = useLogger('useReadingListCore');
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const hasFetchedOnMount = useRef(false);

  // Debounce user id pour éviter les requêtes excessives
  const debouncedUserId = useDebounce(user?.id, 300);

  // Query optimisée avec cache persistant
  const queryConfig = useMemo(() => ({
    queryKey: ["reading_list", debouncedUserId],
    queryFn: async () => {
      const cacheKey = `reading_list_${debouncedUserId}`;
      const startTime = performance.now();
      
      // Essayer le cache persistant d'abord
      try {
        const cached = await persistentCache.get(cacheKey);
        if (cached) {
          logger.debug("Using persistent cache", { userId: debouncedUserId });
          performanceTracker.trackAPICall('reading_list_cache', performance.now() - startTime);
          return cached;
        }
      } catch (error) {
        logger.warn("Cache read failed, falling back to API", error as Error);
      }
      
      // Fallback API
      logger.debug("Fetching reading progress from API", { userId: debouncedUserId });
      const data = await fetchReadingProgress(debouncedUserId || "");
      
      // Sauver en cache
      try {
        await persistentCache.set(cacheKey, data, 300000); // 5 minutes
      } catch (error) {
        logger.warn("Cache write failed", error as Error);
      }
      
      performanceTracker.trackAPICall('reading_list_api', performance.now() - startTime);
      return data;
    },
    enabled: !!debouncedUserId,
    staleTime: 300000, // 5 minutes
    refetchOnMount: !hasFetchedOnMount.current,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    retry: 2,
    gcTime: 600000, // 10 minutes
  }), [debouncedUserId, logger]);

  const { 
    data: readingList, 
    isLoading: isLoadingReadingList, 
    error: readingListError, 
    isSuccess, 
    refetch 
  } = useQuery(queryConfig);

  // Effet pour le montage
  useEffect(() => {
    if (isSuccess && !hasFetchedOnMount.current) {
      hasFetchedOnMount.current = true;
      logger.info("Initial reading list loaded successfully");
    }
  }, [isSuccess, logger]);

  // Effet optimisé pour le changement d'utilisateur
  useEffect(() => {
    if (debouncedUserId) {
      logger.debug("User changed, invalidating cache", { userId: debouncedUserId });
      queryClient.invalidateQueries({ queryKey: ["reading_list"] });
    } else {
      queryClient.resetQueries({ queryKey: ["reading_list"] });
      persistentCache.clear(); // Nettoyer le cache persistant
      hasFetchedOnMount.current = false;
      logger.debug("User logged out, resetting cache");
    }
  }, [debouncedUserId, queryClient, logger]);

  // Gestion d'erreur optimisée
  useEffect(() => {
    if (readingListError) {
      logger.error("Failed to fetch reading list", readingListError as Error);
      performanceTracker.trackAPICall('reading_list_api', 0, true);
    }
  }, [readingListError, logger]);

  return {
    readingList,
    isLoadingReadingList,
    readingListError,
    isSuccess,
    refetch,
    userId: debouncedUserId,
    hasFetchedInitialData: () => hasFetchedOnMount.current
  };
};
