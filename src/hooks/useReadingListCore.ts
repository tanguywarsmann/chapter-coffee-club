
import { useEffect, useRef, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { fetchReadingProgress } from "@/services/reading/readingListService";
import { useDebounce } from "./useDebounce";
import { useLogger } from "@/utils/logger";

/**
 * Hook principal pour la gestion de la lecture utilisateur
 * Remplace la logique de base de useReadingListOptimized
 */
export const useReadingListCore = () => {
  const logger = useLogger('useReadingListCore');
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const hasFetchedOnMount = useRef(false);

  // Debounce user id pour éviter les requêtes excessives
  const debouncedUserId = useDebounce(user?.id, 300);

  // Query optimisée avec mémorisation
  const queryConfig = useMemo(() => ({
    queryKey: ["reading_list", debouncedUserId],
    queryFn: () => {
      logger.debug("Fetching reading progress", { userId: debouncedUserId });
      return fetchReadingProgress(debouncedUserId || "");
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

  // Effet pour le changement d'utilisateur
  useEffect(() => {
    if (debouncedUserId) {
      logger.debug("User changed, invalidating cache", { userId: debouncedUserId });
      queryClient.invalidateQueries({ queryKey: ["reading_list"] });
    } else {
      queryClient.resetQueries({ queryKey: ["reading_list"] });
      hasFetchedOnMount.current = false;
      logger.debug("User logged out, resetting cache");
    }
  }, [debouncedUserId, queryClient, logger]);

  // Gestion d'erreur
  useEffect(() => {
    if (readingListError) {
      logger.error("Failed to fetch reading list", readingListError as Error);
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
