
import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { BookWithProgress } from "@/types/reading";
import { useAuth } from "@/contexts/AuthContext";
import { useReadingList } from "@/hooks/useReadingList";
import { toast } from "sonner";
import { getBooksByStatus } from "@/services/reading/progressService";

export const useCurrentReading = () => {
  const { user } = useAuth();
  const { inProgress } = useReadingList();
  const [currentReading, setCurrentReading] = useState<BookWithProgress | null>(null);
  const [isLoadingCurrentBook, setIsLoadingCurrentBook] = useState(true);
  const isMounted = useRef(true);
  const fetchingCurrentReading = useRef(false);
  const lastFetchedId = useRef<string | null>(null);
  const lastFetchTime = useRef<number>(0);
  
  // Ne refetch que toutes les 60 secondes maximum (augmenté pour réduire la charge)
  const FETCH_COOLDOWN = 60000; // 60 secondes
  
  // Memo pour éviter des calculs inutiles si inProgress n'a pas changé
  const memoizedCurrentReading = useMemo(() => {
    if (inProgress && inProgress.length > 0) {
      const availableBooks = inProgress.filter(book => !book.isUnavailable);
      if (availableBooks.length > 0) {
        return availableBooks[0];
      } else if (inProgress.length > 0) {
        return {
          ...inProgress[0],
          isStableUnavailable: true
        } as BookWithProgress;
      }
    }
    return null;
  }, [inProgress]);
  
  // Optimisation: n'update le state que si nécessaire
  useEffect(() => {
    if (isMounted.current && memoizedCurrentReading) {
      const currentId = currentReading?.id;
      const newId = memoizedCurrentReading.id;
      
      if (currentId !== newId || !currentReading) {
        setCurrentReading(memoizedCurrentReading as BookWithProgress);
      }
    }
  }, [memoizedCurrentReading, currentReading]);

  // Fonction pour fetch les données, optimisée avec cooldown
  const fetchCurrentReadingData = useCallback(async () => {
    if (!user?.id || fetchingCurrentReading.current) return;

    // Vérifier le cooldown pour éviter les fetch trop fréquents
    const now = Date.now();
    if (now - lastFetchTime.current < FETCH_COOLDOWN) {
      return;
    }

    if (inProgress && inProgress.length > 0 && !fetchingCurrentReading.current) {
      return;
    }

    // Utiliser lastFetchedId au lieu de currentReading pour éviter la boucle infinie
    if (user.id === lastFetchedId.current && lastFetchedId.current) {
      setIsLoadingCurrentBook(false);
      return;
    }

    try {
      fetchingCurrentReading.current = true;
      setIsLoadingCurrentBook(true);
      lastFetchTime.current = now;

      const inProgressBooks = await getBooksByStatus(user.id, "in_progress");

      if (!isMounted.current) return;

      if (inProgressBooks && inProgressBooks.length > 0) {
        const availableBooks = inProgressBooks.filter(book => !book.isUnavailable);
        if (availableBooks.length > 0) {
          setCurrentReading(availableBooks[0] as BookWithProgress);
        } else if (inProgressBooks.length > 0) {
          const stableUnavailableBook = {
            ...inProgressBooks[0],
            isStableUnavailable: true
          };
          setCurrentReading(stableUnavailableBook as BookWithProgress);
        } else {
          setCurrentReading(null);
        }
      } else {
        setCurrentReading(null);
      }

      lastFetchedId.current = user.id;
    } catch (error) {
      // Éviter de montrer des toasts d'erreur répétés
      if (isMounted.current) {
        console.error("Erreur lors du chargement de la lecture en cours:", error);
        toast.error("Impossible de charger votre lecture en cours", {
          id: "current-reading-error", // Permet d'éviter des toasts dupliqués
        });
      }
    } finally {
      if (isMounted.current) {
        setIsLoadingCurrentBook(false);
        fetchingCurrentReading.current = false;
      }
    }
  }, [user?.id, inProgress]); // 🔥 CRITIQUE: Supprimé currentReading pour casser la boucle infinie

  useEffect(() => {
    if (user?.id && isMounted.current) {
      if (!memoizedCurrentReading) {
        fetchCurrentReadingData();
      } else {
        setIsLoadingCurrentBook(false);
      }
    } else {
      setIsLoadingCurrentBook(false);
    }
  }, [user?.id, fetchCurrentReadingData, memoizedCurrentReading]);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  return {
    currentReading,
    isLoadingCurrentBook,
    refetch: fetchCurrentReadingData
  };
};
