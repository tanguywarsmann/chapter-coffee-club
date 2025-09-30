
import { useState, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Book } from "@/types/book";
import { fetchBooksForStatus } from "@/services/reading/readingListService";
import { cacheBooksByStatus, getCachedBooksByStatus, clearBooksByStatusCache } from "./useReadingListCache";
import { useStableCallback } from "./useStableCallback";
import { withErrorHandling } from "@/utils/errorBoundaryUtils";
import { useLogger } from "@/utils/logger";

/**
 * Hook spécialisé pour la gestion des livres par statut
 */
export const useReadingListBooks = (readingList: any, userId: string) => {
  const logger = useLogger('useReadingListBooks');
  const queryClient = useQueryClient();
  const [books, setBooks] = useState<{
    toRead: Book[];
    inProgress: Book[];
    completed: Book[];
  }>({
    toRead: [],
    inProgress: [],
    completed: []
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const isFetchingRef = useRef(false);

  // Fonction pour récupérer les livres par statut
  const getBooksByStatus = useStableCallback(
    withErrorHandling(async (status: string): Promise<Book[]> => {
      if (!userId || !readingList) return [];
      
      logger.debug("Fetching books by status", { status, userId });
      
      // Completed = always fetch from server (potentially most volatile)
      if (status === "completed") {
        const booksFetched = await fetchBooksForStatus(readingList, status, userId);
        cacheBooksByStatus(status, booksFetched);
        queryClient.setQueryData(["books_by_status", userId, status], booksFetched);
        return booksFetched;
      }
      
      // Try in-memory cache first
      const cached = getCachedBooksByStatus(status);
      if (cached && cached.length > 0) {
        logger.debug("Using cached books", { status, count: cached.length });
        return cached;
      }
      
      // Fallback to React Query cache
      const rqCached = queryClient.getQueryData<Book[]>([
        "books_by_status", userId, status
      ]);
      if (rqCached && rqCached.length > 0) {
        cacheBooksByStatus(status, rqCached);
        return rqCached;
      }
      
      // Else, fetch and cache
      const booksFetched = await fetchBooksForStatus(readingList, status, userId);
      cacheBooksByStatus(status, booksFetched);
      queryClient.setQueryData(["books_by_status", userId, status], booksFetched);
      return booksFetched;
    }, 'useReadingListBooks.getBooksByStatus')
  );

  // Effet principal pour charger les catégories de livres
  useEffect(() => {
    if (!userId || !readingList || isFetchingRef.current) return;
    if (books.inProgress.length > 0) return;
    
    const fetchBooks = async () => {
      try {
        isFetchingRef.current = true;
        setIsLoading(true);
        setError(null);
        
        logger.debug("Starting books fetch");
        
        // Fetch en parallèle avec limitation
        const [toRead, inProgress, completed] = await Promise.all([
          getBooksByStatus("to_read"),
          getBooksByStatus("in_progress"),
          getBooksByStatus("completed"),
        ]);
        
        setBooks({ toRead, inProgress, completed });
        
        // Cache batch update
        cacheBooksByStatus("to_read", toRead);
        cacheBooksByStatus("in_progress", inProgress);
        cacheBooksByStatus("completed", completed);
        
        logger.info("Books loaded successfully", {
          toRead: toRead.length,
          inProgress: inProgress.length,
          completed: completed.length
        });
        
      } catch (err) {
        logger.error("Failed to fetch books", err as Error);
        setError(err as Error);
        toast.error("Erreur lors du chargement de vos livres");
      } finally {
        setIsLoading(false);
        isFetchingRef.current = false;
      }
    };
    
    fetchBooks();
  }, [userId, readingList, getBooksByStatus, books.inProgress.length, logger]);

  const updateBooks = useStableCallback((toRead: Book[], inProgress: Book[], completed: Book[]) => {
    setBooks({ toRead, inProgress, completed });
  });

  const forceRefresh = useStableCallback(() => {
    logger.info("Force refreshing books");
    clearBooksByStatusCache();
    queryClient.invalidateQueries({ queryKey: ["reading_list"] });
    queryClient.invalidateQueries({ queryKey: ["books_by_status"] });
  });

  return {
    books,
    isLoading,
    error,
    getBooksByStatus,
    updateBooks,
    forceRefresh
  };
};
