
import { useState, useRef, useEffect } from "react";
import { ReadingProgress } from "@/types/reading";
import { getUserReadingProgress } from "@/services/progressService";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export const useReadingProgress = () => {
  const { user } = useAuth();
  const [readingProgress, setReadingProgress] = useState<ReadingProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
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

  const fetchProgress = async () => {
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
    } catch (err) {
      console.error("Erreur lors du chargement de la progression :", err);
      if (isMounted.current) {
        setError("Erreur lors du chargement de vos lectures");
        toast.error("Erreur lors du chargement de vos lectures en cours");
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
        isFetching.current = false;
      }
    }
  };

  useEffect(() => {
    if (user?.id && !hasFetched.current && !isFetching.current) {
      fetchProgress();
    } else if (!user?.id) {
      setIsLoading(false);
    }
  }, [user]);

  const handleProgressUpdate = async (bookId: string) => {
    if (!user?.id) {
      toast.error("Vous devez être connecté pour mettre à jour votre progression");
      return;
    }

    try {
      setIsLoading(true);

      await fetchProgress(); // Refresh la progression complète
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la progression :", error);
      if (isMounted.current) {
        toast.error("Erreur lors de la mise à jour de votre progression");
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  };

  return {
    readingProgress,
    isLoading,
    error,
    handleProgressUpdate,
  };
};
