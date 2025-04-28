
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
    staleTime: 600000,
    refetchOnMount: true,
    refetchOnReconnect: true,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  // Set hasFetchedOnMount when query succeeds
  useEffect(() => {
    if (isSuccess) {
      hasFetchedOnMount.current = true;
      console.log("[DIAGNOSTIQUE] Flag hasFetchedOnMount set in success effect:", hasFetchedOnMount.current);
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

  // Effect to fetch books when readingList changes
  useEffect(() => {
    const fetchBooks = async () => {
      if (!user?.id || !readingList || isFetching) return;
      
      try {
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
      }
    };

    fetchBooks();
  }, [user?.id, readingList, isFetching]);

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
