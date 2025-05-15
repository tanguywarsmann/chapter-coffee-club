
import { useState, useRef, useEffect, useCallback } from "react";
import { ExtendedReadingProgress } from "@/services/reading/progressService";
import { getUserReadingProgress, clearProgressCache } from "@/services/reading/progressService";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export const useReadingProgress = () => {
  const { user } = useAuth();
  const [readingProgress, setReadingProgress] = useState<ExtendedReadingProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0); // Nouveau déclencheur pour forcer un refresh
  
  const isMounted = useRef(true);
  const hasFetched = useRef(false);
  const isFetching = useRef(false);
  const lastFetchTimestamp = useRef(0);
  const MIN_FETCH_INTERVAL = 500; // Interval minimal entre deux fetchs (en ms)

  useEffect(() => {
    console.log("🔄 useReadingProgress monté ou user changé");
    isMounted.current = true;

    if (user?.id) {
      hasFetched.current = false;
    }

    return () => {
      isMounted.current = false;
    };
  }, [user]);

  const fetchProgress = useCallback(async (forceRefresh = false) => {
    if (!user?.id || !isMounted.current || isFetching.current) {
      console.log("⏭️ Fetch annulé:", { 
        userId: user?.id, 
        isMounted: isMounted.current, 
        isFetching: isFetching.current 
      });
      return;
    }

    const now = Date.now();
    if (!forceRefresh && now - lastFetchTimestamp.current < MIN_FETCH_INTERVAL) {
      console.log("⏭️ Fetch ignoré (trop récent):", {
        timeSinceLastFetch: now - lastFetchTimestamp.current,
        minInterval: MIN_FETCH_INTERVAL
      });
      return;
    }
    
    lastFetchTimestamp.current = now;

    try {
      console.log("🔄 Fetching reading progress for user:", user.id);
      isFetching.current = true;
      setIsLoading(true);
      setError(null);

      if (forceRefresh) {
        console.log("🔄 Forçage du rafraîchissement du cache");
        await clearProgressCache(user.id);
      }

      const progress = await getUserReadingProgress(user.id);

      if (!isMounted.current) return;

      console.log("📚 Retrieved", progress.length, "enriched reading progresses");
      const inProgress = progress.filter(p => p.status === "in_progress");
      console.log("📊 Progression en cours:", inProgress.length, "livres");

      setReadingProgress(inProgress);
      hasFetched.current = true;
      
      // Reset retry count on success
      if (retryCount > 0) {
        setRetryCount(0);
      }
    } catch (err) {
      console.error("⚠️ Erreur lors du chargement de la progression :", err);
      
      if (isMounted.current) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        setError(errorMessage);
        
        // Only show toast for first few retry attempts
        if (retryCount < 3) {
          toast.error("Erreur lors du chargement de vos lectures en cours", {
            description: "Nous réessayerons automatiquement",
            duration: 3000
          });
        }
        
        // Auto-retry logic with exponential backoff
        if (retryCount < 5 && isMounted.current) {
          const timeout = Math.min(1000 * Math.pow(2, retryCount), 30000);
          setTimeout(() => {
            if (isMounted.current) {
              setRetryCount(prev => prev + 1);
              fetchProgress();
            }
          }, timeout);
        }
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
        isFetching.current = false;
      }
    }
  }, [user, retryCount]);

  // Effect pour charger les données au montage ou changement d'utilisateur
  useEffect(() => {
    try {
      if (user?.id && !hasFetched.current && !isFetching.current) {
        fetchProgress();
      } else if (!user?.id) {
        setIsLoading(false);
      }
    } catch (e) {
      console.error("Erreur dans useEffect [useReadingProgress]", e);
    }
  }, [user, fetchProgress]);

  // Effect additionnel pour réagir au déclencheur de rafraîchissement
  useEffect(() => {
    if (refreshTrigger > 0 && user?.id) {
      console.log("🔄 Déclenchement du rafraîchissement via refreshTrigger");
      fetchProgress(true); // Force refresh
    }
  }, [refreshTrigger, fetchProgress, user?.id]);

  // Fonction pour forcer un rafraîchissement depuis l'extérieur
  const forceRefresh = useCallback(() => {
    console.log("🔄 Force refresh requested");
    setRefreshTrigger(prev => prev + 1);
  }, []);

  const handleProgressUpdate = useCallback(async (bookId: string) => {
    if (!user?.id) {
      toast.error("Vous devez être connecté pour mettre à jour votre progression", {
        duration: 5000
      });
      return;
    }

    try {
      // Vider le cache avant de récupérer les nouvelles données
      console.log("🗑️ Vidage du cache avant mise à jour de la progression");
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
    forceRefresh // Exposer la fonction pour forcer un rafraîchissement
  };
};
