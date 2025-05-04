
import { useState, useRef, useEffect, useCallback } from "react";
import { ReadingProgress } from "@/types/reading";
import { getUserReadingProgress } from "@/services/progressService";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export const useReadingProgress = () => {
  const { user } = useAuth();
  const [readingProgress, setReadingProgress] = useState<ReadingProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  
  const isMounted = useRef(true);
  const hasFetched = useRef(false);
  const isFetching = useRef(false);

  useEffect(() => {
    isMounted.current = true;

    if (user?.id) {
      hasFetched.current = false;
    }

    return () => {
      isMounted.current = false;
    };
  }, [user]);

  const fetchProgress = useCallback(async () => {
    if (!user?.id || hasFetched.current || !isMounted.current || isFetching.current) {
      return;
    }

    try {
      isFetching.current = true;
      setIsLoading(true);
      setError(null);

      const progress = await getUserReadingProgress(user.id);

      if (!isMounted.current) return;

      const inProgress = progress.filter(p => p.status === "in_progress");

      setReadingProgress(inProgress);
      hasFetched.current = true;
      
      // Reset retry count on success
      if (retryCount > 0) {
        setRetryCount(0);
      }
    } catch (err) {
      console.error("Erreur lors du chargement de la progression :", err);
      
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

  useEffect(() => {
    if (user?.id && !hasFetched.current && !isFetching.current) {
      fetchProgress();
    } else if (!user?.id) {
      setIsLoading(false);
    }
  }, [user, fetchProgress]);

  const handleProgressUpdate = useCallback(async (bookId: string) => {
    if (!user?.id) {
      toast.error("Vous devez être connecté pour mettre à jour votre progression", {
        duration: 5000
      });
      return;
    }

    try {
      setIsLoading(true);
      await fetchProgress(); // Refresh la progression complète
      toast.success("Progression mise à jour", {
        duration: 2000
      });
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la progression :", error);
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
    refetch: fetchProgress
  };
};
