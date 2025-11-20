import { useState, useRef, useEffect, useCallback } from "react";
import { BookWithProgress } from "@/types/reading";
import { getUserReadingProgress, clearProgressCache } from "@/services/reading/progressService";
import { progressCache, CACHE_DURATION } from "@/services/reading/progressCache";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { logger } from "@/utils/logger";
import { handleSupabaseError } from "@/services/supabaseErrorHandler";

const getCachedProgressForUser = (userId?: string | null): BookWithProgress[] | null => {
  if (!userId) return null;
  const cached = progressCache.get(userId);
  if (!cached) return null;
  if (Date.now() - cached.timestamp > CACHE_DURATION) {
    progressCache.delete(userId);
    return null;
  }
  return cached.data as BookWithProgress[];
};

interface UseReadingProgressOptions {
  deferMs?: number;
}

export const useReadingProgress = (options: UseReadingProgressOptions = {}) => {
  const { deferMs = 0 } = options;
  const { user, isInitialized, isLoading: isAuthLoading } = useAuth();
  const initialCachedProgress = getCachedProgressForUser(user?.id);
  const [readingProgress, setReadingProgress] = useState<BookWithProgress[]>(initialCachedProgress ?? []);
  const [isLoading, setIsLoading] = useState(() => (deferMs > 0 ? false : !initialCachedProgress));
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const isMounted = useRef(true);
  const hasFetched = useRef(false);
  const isFetching = useRef(false);
  const lastFetchTimestamp = useRef(0);
  const retryCountRef = useRef(0); // ✅ Use ref instead of state to avoid re-renders
  const timeoutRefs = useRef<number[]>([]); // ✅ Track timeouts for cleanup
  const deferredFetchRef = useRef<number | null>(null);
  const hasWarmDataRef = useRef<boolean>(!!(initialCachedProgress && initialCachedProgress.length > 0));
  const MIN_FETCH_INTERVAL = 500; // Interval minimal entre deux fetchs (en ms)

  useEffect(() => {
    isMounted.current = true;

    if (user?.id) {
      hasFetched.current = false;
      retryCountRef.current = 0; // ✅ Reset retry count on user change

      const cached = getCachedProgressForUser(user.id);
      if (cached) {
        setReadingProgress(cached);
        setIsLoading(false);
        hasWarmDataRef.current = cached.length > 0;
      } else if (!isFetching.current) {
        setIsLoading(deferMs > 0 ? false : true);
        hasWarmDataRef.current = false;
      }
    } else {
      setReadingProgress([]);
      setIsLoading(false);
      hasWarmDataRef.current = false;
    }

    return () => {
      isMounted.current = false;
      // ✅ Cleanup all pending timeouts
      timeoutRefs.current.forEach(clearTimeout);
      timeoutRefs.current = [];
      if (deferredFetchRef.current !== null) {
        clearTimeout(deferredFetchRef.current);
        deferredFetchRef.current = null;
      }
    };
  }, [user, deferMs]);

  const fetchProgress = useCallback(async (forceRefresh = false) => {
    logger.debug("=== FETCH PROGRESS START ===", { userId: user?.id, forceRefresh });

    if (!user?.id || !isInitialized || isAuthLoading || !isMounted.current || isFetching.current) {
      logger.debug("Early return - conditions not met");
      return;
    }

    const now = Date.now();
    if (!forceRefresh && now - lastFetchTimestamp.current < MIN_FETCH_INTERVAL) {
      logger.debug("Early return - too soon since last fetch");
      return;
    }

    lastFetchTimestamp.current = now;

    try {
      isFetching.current = true;
      const shouldShowLoader = forceRefresh || !hasWarmDataRef.current;
      if (shouldShowLoader) {
        setIsLoading(true);
      }
      setError(null);

      if (forceRefresh) {
        logger.debug("Clearing progress cache...");
        await clearProgressCache(user.id);
      }

      logger.debug("Fetching user reading progress...");
      const progress = await getUserReadingProgress(user.id);

      if (!isMounted.current) return;

      const inProgress = progress.filter(p => p.status === "in_progress");
      logger.debug("Filtered in-progress items:", inProgress.length);

      setReadingProgress(inProgress);
      hasWarmDataRef.current = inProgress.length > 0;
      hasFetched.current = true;

      // ✅ Reset retry count on success using ref
      retryCountRef.current = 0;

      logger.debug("=== FETCH PROGRESS SUCCESS ===");
    } catch (err) {
      logger.error("FETCH PROGRESS ERROR:", err);

      if (isMounted.current) {
        // Utiliser le gestionnaire d'erreur centralisé
        const errorInfo = handleSupabaseError('useReadingProgress', err);
        setError(errorInfo.userMessage);

        // Si auth expirée, ne pas toast (géré par AuthContext)
        if (!errorInfo.isAuthExpired) {
          // Only show toast for first few retry attempts
          if (retryCountRef.current < 3) {
            toast.error("Erreur lors du chargement de vos lectures en cours", {
              description: errorInfo.shouldRetry ? "Nous réessayerons automatiquement" : errorInfo.userMessage,
              duration: 3000
            });
          }
        }

        // ✅ Auto-retry logic with exponential backoff using ref
        if (retryCountRef.current < 5 && isMounted.current && errorInfo.shouldRetry) {
          const timeout = Math.min(1000 * Math.pow(2, retryCountRef.current), 30000);
          retryCountRef.current++;

          // ✅ Store timeout ID for cleanup
          const timeoutId = window.setTimeout(() => {
            if (isMounted.current) {
              fetchProgress();
            }
          }, timeout);

          timeoutRefs.current.push(timeoutId);
        }
      }
    } finally {
      logger.debug("=== FETCH PROGRESS END ===");
      if (isMounted.current) {
        setIsLoading(false);
        isFetching.current = false;
      }
    }
  }, [user, isInitialized, isAuthLoading]); // ✅ user + auth checks as dependencies

  // ✅ Effect pour charger les données au montage ou changement d'utilisateur
  useEffect(() => {
    if (user?.id && !hasFetched.current && !isFetching.current && isInitialized && !isAuthLoading) {
      if (deferMs > 0 && !hasWarmDataRef.current) {
        if (deferredFetchRef.current) {
          clearTimeout(deferredFetchRef.current);
        }
        deferredFetchRef.current = window.setTimeout(() => {
          deferredFetchRef.current = null;
          fetchProgress();
        }, deferMs);
      } else {
        fetchProgress();
      }
    } else if (!user?.id) {
      setIsLoading(false);
    }

    return () => {
      if (deferredFetchRef.current !== null) {
        clearTimeout(deferredFetchRef.current);
        deferredFetchRef.current = null;
      }
    };
  }, [user, fetchProgress, isInitialized, isAuthLoading, deferMs]); // ✅ fetchProgress is stable now

  // ✅ Effect pour réagir au déclencheur de rafraîchissement
  useEffect(() => {
    if (refreshTrigger > 0 && user?.id && isInitialized && !isAuthLoading) {
      fetchProgress(true); // Force refresh
    }
  }, [refreshTrigger, user?.id, fetchProgress, isInitialized, isAuthLoading]); // ✅ fetchProgress is stable

  // Fonction pour forcer un rafraîchissement depuis l'extérieur
  const forceRefresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  // Force clear cache and refetch - exposed publicly for external triggers
  const forceClearAndRefresh = useCallback(async () => {
    if (!user?.id) return;
    
    console.log("🔄 FORCE CLEAR AND REFRESH - clearing all caches");
    
    try {
      // Clear progress cache
      await clearProgressCache(user.id);
      
      // Reset internal states
      hasFetched.current = false;
      setRefreshTrigger(prev => prev + 1);
      
      // Force immediate fetch
      await fetchProgress(true);
      
      toast.success("Données rafraîchies", { duration: 2000 });
    } catch (error) {
      console.error("Erreur lors du rafraîchissement forcé:", error);
      toast.error("Erreur lors du rafraîchissement");
    }
  }, [user?.id, fetchProgress]);

  const handleProgressUpdate = useCallback(async (bookId: string) => {
    if (!user?.id) {
      toast.error("Vous devez être connecté pour mettre à jour votre progression", {
        duration: 5000
      });
      return;
    }

    try {
      // Vider le cache avant de récupérer les nouvelles données
      await clearProgressCache(user.id);
      
      setIsLoading(true);
      await fetchProgress(true); // Force refresh
      toast.success("Progression mise à jour", {
        duration: 2000
      });
    } catch (error) {
      console.error("⚠️ Erreur lors de la mise à jour de la progression :", error);
      if (isMounted.current) {
        toast.error("Erreur lors de la mise à jour de votre progression", {
          description: "Veuillez réessayer ultérieurement",
          duration: 5000
        });
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, [user?.id, fetchProgress]);

  return {
    readingProgress,
    isLoading,
    error,
    handleProgressUpdate,
    refetch: fetchProgress,
    forceRefresh, // Exposer la fonction pour forcer un rafraîchissement
    forceClearAndRefresh // Nouvelle fonction pour le rafraîchissement complet
  };
};
