
import { useEffect, useRef, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { bookFailureCache } from "@/utils/bookFailureCache";
import { fetchReadingProgress, addBookToReadingList, fetchBooksForStatus } from "@/services/reading/readingListService";
import { useReadingListState } from "./useReadingListState";
import { Book } from "@/types/book";
import { cacheBooksByStatus, getCachedBooksByStatus, clearBooksByStatusCache } from "./useReadingListCache";
import { safeFetchBooksForStatus } from "./useReadingListHelpers";

// version 0.14 refactored

export const useReadingList = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const hasFetchedOnMount = useRef(false);
  const errorCount = useRef(0);
  const isFetchingRef = useRef(false);

  const {
    books,
    sortState,
    loading: { isLoading, setIsLoading, isFetching, setIsFetching },
    error: { current: error, setError },
    updateBooks,
    isMounted
  } = useReadingListState();

  // Query pour la liste de lecture de l'utilisateur
  const { 
    data: readingList, 
    isLoading: isLoadingReadingList, 
    error: readingListError, 
    isSuccess, 
    refetch 
  } = useQuery({
    queryKey: ["reading_list", user?.id],
    queryFn: () => fetchReadingProgress(user?.id || ""),
    enabled: !!user?.id,
    staleTime: 300000,
    refetchOnMount: !hasFetchedOnMount.current,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    retry: 2,
    gcTime: 600000,
  });

  useEffect(() => {
    if (isSuccess && !hasFetchedOnMount.current) {
      hasFetchedOnMount.current = true;
    }
  }, [isSuccess]);

  useEffect(() => {
    if (user?.id) {
      clearBooksByStatusCache(); // Clear cache when user changes
      queryClient.invalidateQueries({ queryKey: ["reading_list"] });
    } else {
      queryClient.resetQueries({ queryKey: ["reading_list"] });
      errorCount.current = 0;
      hasFetchedOnMount.current = false;
      clearBooksByStatusCache();
    }
  }, [user?.id, queryClient]);

  // Fetch books by status optimisé avec cache
  const getBooksByStatus = useCallback(async (status: string): Promise<Book[]> => {
    if (!user?.id || !readingList) return [];
    // Completed = always fetch from server (potentially most volatile)
    if (status === "completed") {
      const booksFetched = await safeFetchBooksForStatus(readingList, status, user.id);
      cacheBooksByStatus(status, booksFetched);
      queryClient.setQueryData(["books_by_status", user.id, status], booksFetched);
      return booksFetched;
    }
    // Try in-memory cache first
    const cached = getCachedBooksByStatus(status);
    if (cached && cached.length > 0) return cached;
    // Fallback to React Query cache
    const rqCached = queryClient.getQueryData<Book[]>([
      "books_by_status", user.id, status
    ]);
    if (rqCached && rqCached.length > 0) {
      cacheBooksByStatus(status, rqCached);
      return rqCached;
    }
    // Else, fetch and cache
    const booksFetched = await safeFetchBooksForStatus(readingList, status, user.id);
    cacheBooksByStatus(status, booksFetched);
    queryClient.setQueryData(["books_by_status", user.id, status], booksFetched);
    return booksFetched;
  }, [user?.id, readingList, queryClient]);

  // Fonction d'ajout à la liste
  const addToReadingList = async (book: Book): Promise<boolean> => {
    if (!user?.id) {
      toast.error("Vous devez être connecté pour ajouter un livre à votre liste");
      return false;
    }
    if (!book?.id) {
      toast.error("Erreur: livre invalide");
      return false;
    }
    try {
      const result = await addBookToReadingList(book);
      if (result) {
        await queryClient.invalidateQueries({ queryKey: ["reading_list"] });
        await queryClient.invalidateQueries({ queryKey: ["books_by_status"] });
        refetch();
        toast.success(`"${book.title}" ajouté à votre liste de lecture`);
        return true;
      } else {
        toast.error(`Impossible d'ajouter "${book.title}" à votre liste`);
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Une erreur est survenue";
      toast.error(`Erreur: ${errorMessage}`);
      return false;
    }
  };

  // Effect principal pour charger les catégories de livres
  useEffect(() => {
    if (!user?.id || !readingList || isFetchingRef.current || isFetching) return;
    if (books.inProgress.length > 0 && hasFetchedOnMount.current && isSuccess) {
      return;
    }
    const fetchBooks = async () => {
      try {
        isFetchingRef.current = true;
        setIsFetching(true);
        setIsLoading(true);
        setError(null);
        // Fetch each category in parallele
        const [toRead, inProgress, completed] = await Promise.all([
          getBooksByStatus("to_read"),
          getBooksByStatus("in_progress"),
          getBooksByStatus("completed"),
        ]);
        if (isMounted.current) {
          updateBooks(toRead, inProgress, completed);
          cacheBooksByStatus("to_read", toRead);
          cacheBooksByStatus("in_progress", inProgress);
          cacheBooksByStatus("completed", completed);
        }
      } catch (err) {
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
  }, [user?.id, readingList, isSuccess, getBooksByStatus, books.inProgress.length, isFetching, setIsFetching, setIsLoading, setError, updateBooks, isMounted]);

  // Gestion d'erreur sur la query initiale
  if (readingListError && errorCount.current === 0) {
    toast.error("Impossible de récupérer votre liste de lecture", {
      id: "reading-list-error"
    });
    errorCount.current++;
  }

  // Forcer refresh (remise à zéro des caches)
  const forceRefresh = useCallback(() => {
    clearBooksByStatusCache();
    queryClient.invalidateQueries({ queryKey: ["reading_list"] });
    queryClient.invalidateQueries({ queryKey: ["books_by_status"] });
    refetch();
  }, [queryClient, refetch]);

  // Sync completed books (rare)
  const syncCompletedBooks = useCallback(async () => {
    if (!user?.id || !readingList) return;
    clearBooksByStatusCache();
    try {
      queryClient.removeQueries({ queryKey: ["books_by_status", user.id, "completed"] });
      const completedBooks = await safeFetchBooksForStatus(readingList, "completed", user.id);
      if (isMounted.current) {
        updateBooks(books.toRead, books.inProgress, completedBooks);
      }
    } catch (error) {
      // soft
    }
  }, [user?.id, readingList, books.toRead, books.inProgress, updateBooks, isMounted, queryClient]);

  return {
    ...books,
    isLoadingReadingList,
    readingListError,
    sortBy: sortState.sortBy,
    setSortBy: sortState.setSortBy,
    isLoading,
    error,
    readingList,
    userId: user?.id,
    getFailedBookIds: () => bookFailureCache.getAll(),
    hasFetchedInitialData: () => hasFetchedOnMount.current,
    getBooksByStatus,
    addToReadingList,
    forceRefresh,
    syncCompletedBooks,
  };
};
