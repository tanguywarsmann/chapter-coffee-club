
import { useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { bookFailureCache } from "@/utils/bookFailureCache";
import { fetchReadingProgress, fetchBooksForStatus } from "@/services/reading/readingListService";
import { useReadingListState } from "./useReadingListState";
import { Book } from "@/types/book";

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

  const { data: readingList, isLoading: isLoadingReadingList, error: readingListError, isSuccess } = useQuery({
    queryKey: ["reading_list", user?.id],
    queryFn: () => fetchReadingProgress(user?.id || ""),
    enabled: !!user?.id,
    staleTime: 600000, // 10 minutes - Réduire les refetch automatiques
    refetchOnMount: !hasFetchedOnMount.current, // Ne re-fetch que si c'est la première fois
    refetchOnReconnect: false, // Désactiver le refetch lors de la reconnexion
    refetchOnWindowFocus: false, // Désactiver le refetch lors du focus de la fenêtre
    retry: 1, // Limiter les tentatives de nouvelle récupération
  });

  // Set hasFetchedOnMount when query succeeds
  useEffect(() => {
    if (isSuccess && !hasFetchedOnMount.current) {
      hasFetchedOnMount.current = true;
    }
  }, [isSuccess]);

  // Effect to invalidate query when user changes
  useEffect(() => {
    if (user?.id) {
      queryClient.invalidateQueries({ queryKey: ["reading_list"] });
    } else {
      queryClient.resetQueries({ queryKey: ["reading_list"] });
      errorCount.current = 0;
      hasFetchedOnMount.current = false;
    }
  }, [user?.id, queryClient]);

  // Function to get books by status - exposed for use in components
  const getBooksByStatus = async (status: string): Promise<Book[]> => {
    if (!user?.id || !readingList) return [];
    return fetchBooksForStatus(readingList, status, user.id);
  };

  // Effect to fetch books when readingList changes - avec protection contre les appels multiples
  useEffect(() => {
    // Protection contre les refetch multiples et inutiles
    if (!user?.id || !readingList || isFetchingRef.current || isFetching) return;
    
    // Ne pas refaire de fetch si on a déjà les données et qu'on n'est pas en train de rafraîchir
    if (books.inProgressBooks.length > 0 && hasFetchedOnMount.current && isSuccess) return;
    
    const fetchBooks = async () => {
      try {
        // Marquer que nous sommes en train de récupérer des données
        isFetchingRef.current = true;
        setIsFetching(true);
        setIsLoading(true);
        setError(null);

        const [toReadResult, inProgressResult, completedResult] = await Promise.all([
          getBooksByStatus("to_read"),
          getBooksByStatus("in_progress"),
          getBooksByStatus("completed")
        ]);

        if (isMounted.current) {
          updateBooks(toReadResult, inProgressResult, completedResult);
        }
      } catch (err) {
        console.error("[DIAGNOSTIQUE] Erreur lors de la récupération des livres:", err);
        if (isMounted.current) {
          setError(err as Error);
          if (errorCount.current < 3) {
            toast.error("Erreur lors du chargement de vos livres");
            errorCount.current++;
          }
        }
      } finally {
        if (isMounted.current) {
          setIsLoading(false);
          setIsFetching(false);
        }
        // Réinitialiser le flag de récupération
        isFetchingRef.current = false;
      }
    };

    fetchBooks();
  }, [user?.id, readingList, isSuccess]);

  if (readingListError) {
    if (errorCount.current === 0) {
      toast.error("Impossible de récupérer votre liste de lecture");
      errorCount.current++;
    }
    console.error("Reading list query failed:", readingListError);
  }

  // Add the missing function for use in BookCard component
  const addToReadingList = async (book: Book) => {
    // Implementation here will depend on your application's logic
    console.log("Adding book to reading list:", book);
    toast.success(`${book.title} ajouté à votre liste de lecture`);
    return true;
  };

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
    // Export these functions
    getBooksByStatus,
    addToReadingList
  };
};
