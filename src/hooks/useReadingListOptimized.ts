
import { useEffect, useRef, useCallback, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { bookFailureCache } from "@/utils/bookFailureCache";
import { fetchReadingProgress, addBookToReadingList, fetchBooksForStatus } from "@/services/reading/readingListService";
import { useReadingListState } from "./useReadingListState";
import { Book } from "@/types/book";
import { cacheBooksByStatus, getCachedBooksByStatus, clearBooksByStatusCache } from "./useReadingListCache";
import { safeFetchBooksForStatus } from "./useReadingListHelpers";
import { usePerformanceTracker } from "@/utils/performanceAudit";
import { useStableCallback } from "./useStableCallback";
import { withErrorHandling } from "@/utils/errorBoundaryUtils";
import { useDebounce } from "./useDebounce";

/**
 * VERSION OPTIMISÉE de useReadingList
 * 
 * Corrections apportées :
 * - Réduction des re-rendus excessifs
 * - Meilleure gestion du cache
 * - Debouncing des requêtes
 * - Gestion d'erreur robuste
 * - Mémorisation des callbacks
 */
export const useReadingListOptimized = () => {
  const { trackRender, trackApiCall, trackError } = usePerformanceTracker('useReadingListOptimized');
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const hasFetchedOnMount = useRef(false);
  const errorCount = useRef(0);
  const isFetchingRef = useRef(false);

  // Debounce user id pour éviter les requêtes excessives
  const debouncedUserId = useDebounce(user?.id, 300);

  const {
    books,
    sortState,
    loading: { isLoading, setIsLoading, isFetching, setIsFetching },
    error: { current: error, setError },
    updateBooks,
    isMounted
  } = useReadingListState();

  // Query optimisée avec mémorisation
  const queryConfig = useMemo(() => ({
    queryKey: ["reading_list", debouncedUserId],
    queryFn: () => {
      trackApiCall();
      return fetchReadingProgress(debouncedUserId || "");
    },
    enabled: !!debouncedUserId,
    staleTime: 300000, // 5 minutes
    refetchOnMount: !hasFetchedOnMount.current,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    retry: 2,
    gcTime: 600000, // 10 minutes
  }), [debouncedUserId, trackApiCall]);

  const { 
    data: readingList, 
    isLoading: isLoadingReadingList, 
    error: readingListError, 
    isSuccess, 
    refetch 
  } = useQuery(queryConfig);

  // Effet optimisé pour le montage
  useEffect(() => {
    if (isSuccess && !hasFetchedOnMount.current) {
      hasFetchedOnMount.current = true;
    }
  }, [isSuccess]);

  // Effet optimisé pour le changement d'utilisateur
  useEffect(() => {
    if (debouncedUserId) {
      clearBooksByStatusCache();
      queryClient.invalidateQueries({ queryKey: ["reading_list"] });
    } else {
      queryClient.resetQueries({ queryKey: ["reading_list"] });
      errorCount.current = 0;
      hasFetchedOnMount.current = false;
      clearBooksByStatusCache();
    }
  }, [debouncedUserId, queryClient]);

  // Fonction optimisée pour récupérer les livres par statut
  const getBooksByStatus = useStableCallback(
    withErrorHandling(async (status: string): Promise<Book[]> => {
      if (!debouncedUserId || !readingList) return [];
      
      trackApiCall();
      
      // Completed = always fetch from server (potentially most volatile)
      if (status === "completed") {
        const booksFetched = await safeFetchBooksForStatus(readingList, status, debouncedUserId);
        cacheBooksByStatus(status, booksFetched);
        queryClient.setQueryData(["books_by_status", debouncedUserId, status], booksFetched);
        return booksFetched;
      }
      
      // Try in-memory cache first
      const cached = getCachedBooksByStatus(status);
      if (cached && cached.length > 0) return cached;
      
      // Fallback to React Query cache
      const rqCached = queryClient.getQueryData<Book[]>([
        "books_by_status", debouncedUserId, status
      ]);
      if (rqCached && rqCached.length > 0) {
        cacheBooksByStatus(status, rqCached);
        return rqCached;
      }
      
      // Else, fetch and cache
      const booksFetched = await safeFetchBooksForStatus(readingList, status, debouncedUserId);
      cacheBooksByStatus(status, booksFetched);
      queryClient.setQueryData(["books_by_status", debouncedUserId, status], booksFetched);
      return booksFetched;
    }, 'useReadingListOptimized.getBooksByStatus')
  );

  // Fonction d'ajout optimisée
  const addToReadingList = useStableCallback(
    withErrorHandling(async (book: Book): Promise<boolean> => {
      if (!debouncedUserId) {
        toast.error("Vous devez être connecté pour ajouter un livre à votre liste");
        return false;
      }
      if (!book?.id) {
        toast.error("Erreur: livre invalide");
        return false;
      }
      
      trackApiCall();
      
      try {
        const result = await addBookToReadingList(book);
        if (result) {
          // Invalidation sélective pour de meilleures performances
          await Promise.all([
            queryClient.invalidateQueries({ queryKey: ["reading_list"] }),
            queryClient.invalidateQueries({ queryKey: ["books_by_status"] })
          ]);
          refetch();
          toast.success(`"${book.title}" ajouté à votre liste de lecture`);
          return true;
        } else {
          toast.error(`Impossible d'ajouter "${book.title}" à votre liste`);
          return false;
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Une erreur est survenue";
        trackError(error as Error);
        toast.error(`Erreur: ${errorMessage}`);
        return false;
      }
    }, 'useReadingListOptimized.addToReadingList')
  );

  // Effet principal optimisé pour charger les catégories de livres
  useEffect(() => {
    if (!debouncedUserId || !readingList || isFetchingRef.current || isFetching) return;
    if (books.inProgress.length > 0 && hasFetchedOnMount.current && isSuccess) {
      return;
    }
    
    const fetchBooks = async () => {
      try {
        isFetchingRef.current = true;
        setIsFetching(true);
        setIsLoading(true);
        setError(null);
        
        trackApiCall();
        
        // Fetch en parallèle avec limitation
        const [toRead, inProgress, completed] = await Promise.all([
          getBooksByStatus("to_read"),
          getBooksByStatus("in_progress"),
          getBooksByStatus("completed"),
        ]);
        
        if (isMounted.current) {
          updateBooks(toRead, inProgress, completed);
          // Cache batch update
          cacheBooksByStatus("to_read", toRead);
          cacheBooksByStatus("in_progress", inProgress);
          cacheBooksByStatus("completed", completed);
        }
      } catch (err) {
        trackError(err as Error);
        if (isMounted.current) {
          setError(err as Error);
          if (errorCount.current < 2) {
            toast.error("Erreur lors du chargement de vos livres");
            errorCount.current++;
          }
        }
      } finally {
        if (isMounted.current) {
          setIsLoading(false);
          setIsFetching(false);
        }
        isFetchingRef.current = false;
      }
    };
    
    fetchBooks();
  }, [
    debouncedUserId, 
    readingList, 
    isSuccess, 
    getBooksByStatus, 
    books.inProgress.length, 
    isFetching, 
    setIsFetching, 
    setIsLoading, 
    setError, 
    updateBooks, 
    isMounted,
    trackApiCall,
    trackError
  ]);

  // Gestion d'erreur optimisée
  if (readingListError && errorCount.current === 0) {
    trackError(readingListError as Error);
    toast.error("Impossible de récupérer votre liste de lecture", {
      id: "reading-list-error"
    });
    errorCount.current++;
  }

  // Refresh optimisé
  const forceRefresh = useStableCallback(() => {
    clearBooksByStatusCache();
    queryClient.invalidateQueries({ queryKey: ["reading_list"] });
    queryClient.invalidateQueries({ queryKey: ["books_by_status"] });
    refetch();
  });

  // Sync optimisé des livres complétés
  const syncCompletedBooks = useStableCallback(
    withErrorHandling(async () => {
      if (!debouncedUserId || !readingList) return;
      
      trackApiCall();
      clearBooksByStatusCache();
      
      try {
        queryClient.removeQueries({ queryKey: ["books_by_status", debouncedUserId, "completed"] });
        const completedBooks = await safeFetchBooksForStatus(readingList, "completed", debouncedUserId);
        if (isMounted.current) {
          updateBooks(books.toRead, books.inProgress, completedBooks);
        }
      } catch (error) {
        trackError(error as Error);
      }
    }, 'useReadingListOptimized.syncCompletedBooks')
  );

  trackRender();

  // Mémoriser la valeur de retour
  return useMemo(() => ({
    ...books,
    isLoadingReadingList,
    readingListError,
    sortBy: sortState.sortBy,
    setSortBy: sortState.setSortBy,
    isLoading,
    error,
    readingList,
    userId: debouncedUserId,
    getFailedBookIds: () => bookFailureCache.getAll(),
    hasFetchedInitialData: () => hasFetchedOnMount.current,
    getBooksByStatus,
    addToReadingList,
    forceRefresh,
    syncCompletedBooks,
  }), [
    books,
    isLoadingReadingList,
    readingListError,
    sortState.sortBy,
    sortState.setSortBy,
    isLoading,
    error,
    readingList,
    debouncedUserId,
    getBooksByStatus,
    addToReadingList,
    forceRefresh,
    syncCompletedBooks,
  ]);
};
