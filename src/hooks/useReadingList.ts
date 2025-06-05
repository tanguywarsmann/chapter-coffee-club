import { useEffect, useRef, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { bookFailureCache } from "@/utils/bookFailureCache";
import { fetchReadingProgress, fetchBooksForStatus, addBookToReadingList } from "@/services/reading/readingListService";
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

  // Query pour récupérer la liste de lecture
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
    staleTime: 300000, // 5 minutes
    refetchOnMount: !hasFetchedOnMount.current,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    retry: 2,
    gcTime: 600000, // 10 minutes
  });

  useEffect(() => {
    if (isSuccess && !hasFetchedOnMount.current) {
      hasFetchedOnMount.current = true;
    }
  }, [isSuccess]);

  useEffect(() => {
    if (user?.id) {
      queryClient.invalidateQueries({ queryKey: ["reading_list"] });
    } else {
      queryClient.resetQueries({ queryKey: ["reading_list"] });
      errorCount.current = 0;
      hasFetchedOnMount.current = false;
    }
  }, [user?.id, queryClient]);

  const getBooksByStatus = useCallback(async (status: string): Promise<Book[]> => {
    if (!user?.id || !readingList) return [];
    
    // Toujours refetch depuis la base pour les livres terminés pour éviter les incohérences
    if (status === 'completed') {
      console.log(`[DEBUG] Force refresh pour les livres terminés`);
      try {
        const results = await fetchBooksForStatus(readingList, status, user.id);
        
        // Mettre en cache
        queryClient.setQueryData(
          ["books_by_status", user.id, status], 
          results
        );
        
        return results;
      } catch (error) {
        console.error(`Error fetching books for status ${status}:`, error);
        return [];
      }
    }
    
    // Pour les autres statuts, vérifier le cache d'abord
    if (status === 'to_read' && books.toRead.length > 0) return books.toRead;
    if (status === 'in_progress' && books.inProgress.length > 0) return books.inProgress;
    
    // Utiliser le cache de React Query
    const cachedResult = queryClient.getQueryData<Book[]>([
      "books_by_status", 
      user.id, 
      status
    ]);
    
    if (cachedResult) {
      return cachedResult;
    }
    
    try {
      const results = await fetchBooksForStatus(readingList, status, user.id);
      
      // Mettre en cache
      queryClient.setQueryData(
        ["books_by_status", user.id, status], 
        results
      );
      
      return results;
    } catch (error) {
      console.error(`Error fetching books for status ${status}:`, error);
      return [];
    }
  }, [user?.id, readingList, books, queryClient]);

  // Fonction d'ajout à la liste de lecture améliorée
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
      console.log(`[DEBUG] Tentative d'ajout du livre "${book.title}" (${book.id})`);
      
      const result = await addBookToReadingList(user.id, book);
      
      if (result) {
        console.log(`[DEBUG] Livre ajouté avec succès:`, result);
        
        // Invalider et refetch les données
        await queryClient.invalidateQueries({ queryKey: ["reading_list"] });
        await queryClient.invalidateQueries({ queryKey: ["books_by_status"] });
        
        // Force le refetch
        refetch();
        
        toast.success(`"${book.title}" ajouté à votre liste de lecture`);
        return true;
      } else {
        toast.error(`Impossible d'ajouter "${book.title}" à votre liste`);
        return false;
      }
    } catch (error) {
      console.error("[ERROR] Erreur lors de l'ajout à la liste de lecture:", error);
      
      const errorMessage = error instanceof Error ? error.message : "Une erreur est survenue";
      toast.error(`Erreur: ${errorMessage}`);
      return false;
    }
  };

  // Fetch des livres optimisé
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

        const [toReadResult, inProgressResult, completedResult] = await Promise.all([
          getBooksByStatus("to_read"),
          getBooksByStatus("in_progress"),
          getBooksByStatus("completed")
        ]);

        if (isMounted.current) {
          updateBooks(toReadResult, inProgressResult, completedResult);
          
          // Cache les résultats
          queryClient.setQueryData(["books_by_status", user.id, "to_read"], toReadResult);
          queryClient.setQueryData(["books_by_status", user.id, "in_progress"], inProgressResult);
          queryClient.setQueryData(["books_by_status", user.id, "completed"], completedResult);
        }
      } catch (err) {
        console.error("[ERROR] Erreur lors de la récupération des livres:", err);
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
  }, [user?.id, readingList, isSuccess, getBooksByStatus, books.inProgress.length, isFetching, setIsFetching, setIsLoading, setError, updateBooks, isMounted, queryClient]);

  if (readingListError && errorCount.current === 0) {
    toast.error("Impossible de récupérer votre liste de lecture", {
      id: "reading-list-error"
    });
    errorCount.current++;
    console.error("Reading list query failed:", readingListError);
  }

  const forceRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["reading_list"] });
    queryClient.invalidateQueries({ queryKey: ["books_by_status"] });
    refetch();
  }, [queryClient, refetch]);

  // Nouvelle fonction pour forcer la synchronisation des livres terminés
  const syncCompletedBooks = useCallback(async () => {
    if (!user?.id || !readingList) return;
    
    console.log(`[DEBUG] Synchronisation forcée des livres terminés`);
    
    try {
      // Invalider le cache pour les livres terminés
      queryClient.removeQueries({ queryKey: ["books_by_status", user.id, "completed"] });
      
      // Refetch depuis la base
      const completedBooks = await fetchBooksForStatus(readingList, "completed", user.id);
      
      // Mettre à jour l'état local
      if (isMounted.current) {
        updateBooks(books.toRead, books.inProgress, completedBooks);
      }
      
      console.log(`[DEBUG] Synchronisation terminée: ${completedBooks.length} livres terminés`);
    } catch (error) {
      console.error("[ERROR] Erreur lors de la synchronisation des livres terminés:", error);
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
    syncCompletedBooks  // Nouvelle fonction exposée
  };
};
