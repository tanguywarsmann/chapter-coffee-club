
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
  const fetchCooldown = useRef<number>(0);
  const FETCH_COOLDOWN_MS = 10000; // 10 secondes de cooldown entre les requêtes
  
  const {
    books,
    sortState,
    loading: { isLoading, setIsLoading, isFetching, setIsFetching },
    error: { current: error, setError },
    updateBooks,
    isMounted
  } = useReadingListState();

  // Utiliser React Query avec des options optimisées
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
    staleTime: 600000, // 10 minutes - Réduire les refetch automatiques
    refetchOnMount: !hasFetchedOnMount.current, // Ne re-fetch que si c'est la première fois
    refetchOnReconnect: false, // Désactiver le refetch lors de la reconnexion
    refetchOnWindowFocus: false, // Désactiver le refetch lors du focus de la fenêtre
    retry: 1, // Limiter les tentatives de nouvelle récupération
    gcTime: 900000, // 15 minutes de cache (remplace cacheTime)
  });

  useEffect(() => {
    if (isSuccess && !hasFetchedOnMount.current) {
      hasFetchedOnMount.current = true;
    }
  }, [isSuccess]);

  useEffect(() => {
    if (user?.id) {
      // N'invalider le cache que lors d'un changement d'utilisateur
      queryClient.invalidateQueries({ queryKey: ["reading_list"] });
    } else {
      queryClient.resetQueries({ queryKey: ["reading_list"] });
      errorCount.current = 0;
      hasFetchedOnMount.current = false;
    }
  }, [user?.id, queryClient]);

  // Optimisé pour utiliser les données mises en cache quand possible
  const getBooksByStatus = useCallback(async (status: string): Promise<Book[]> => {
    if (!user?.id || !readingList) return [];
    
    // Vérifier si les données sont déjà dans books
    if (status === 'to_read' && books.toRead.length > 0) return books.toRead;
    if (status === 'in_progress' && books.inProgress.length > 0) return books.inProgress;
    if (status === 'completed' && books.completed.length > 0) return books.completed;
    
    // Utiliser les données mises en cache par tanstack/react-query
    const cachedResult = queryClient.getQueryData<Book[]>([
      "books_by_status", 
      user.id, 
      status
    ]);
    
    if (cachedResult) {
      return cachedResult;
    }
    
    // Si pas de cache, récupérer les données
    try {
      const results = await fetchBooksForStatus(readingList, status, user.id);
      
      // Mettre en cache les résultats
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

  // Optimiser la logique de fetch pour réduire les appels API
  useEffect(() => {
    if (!user?.id || !readingList || isFetchingRef.current || isFetching) return;
    
    if (
      books.inProgress.length > 0 && 
      hasFetchedOnMount.current && 
      isSuccess &&
      Date.now() < fetchCooldown.current
    ) {
      return;
    }
    
    const fetchBooks = async () => {
      try {
        isFetchingRef.current = true;
        setIsFetching(true);
        setIsLoading(true);
        setError(null);
        
        // Définir cooldown pour éviter les appels API trop fréquents
        fetchCooldown.current = Date.now() + FETCH_COOLDOWN_MS;

        // Utiliser concurrentMap avec une limite de concurrence
        const [toReadResult, inProgressResult, completedResult] = await Promise.all([
          getBooksByStatus("to_read"),
          getBooksByStatus("in_progress"),
          getBooksByStatus("completed")
        ]);

        if (isMounted.current) {
          updateBooks(toReadResult, inProgressResult, completedResult);
          
          // Mettre les données en cache pour les futurs accès
          queryClient.setQueryData(["books_by_status", user.id, "to_read"], toReadResult);
          queryClient.setQueryData(["books_by_status", user.id, "in_progress"], inProgressResult);
          queryClient.setQueryData(["books_by_status", user.id, "completed"], completedResult);
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
        isFetchingRef.current = false;
      }
    };

    fetchBooks();
  }, [user?.id, readingList, isSuccess, getBooksByStatus, books.inProgress.length, isFetching, setIsFetching, setIsLoading, setError, updateBooks, isMounted, queryClient]);

  if (readingListError) {
    if (errorCount.current === 0) {
      toast.error("Impossible de récupérer votre liste de lecture", {
        id: "reading-list-error" // Éviter les toasts dupliqués
      });
      errorCount.current++;
    }
    console.error("Reading list query failed:", readingListError);
  }

  const addToReadingList = async (book: Book): Promise<boolean> => {
    if (!user?.id) {
      toast.error("Vous devez être connecté pour ajouter un livre à votre liste");
      return false;
    }

    try {
      console.log(`[DEBUG] Ajout du livre "${book.title}" à la liste de lecture`);
      const result = await addBookToReadingList(user.id, book);
      
      if (result) {
        // Invalider le cache et forcer le rafraîchissement 
        queryClient.invalidateQueries({ queryKey: ["reading_list"] });
        queryClient.invalidateQueries({ queryKey: ["books_by_status"] });
        refetch();
        toast.success(`${book.title} ajouté à votre liste de lecture`);
        return true;
      } else {
        toast.error(`Impossible d'ajouter ${book.title} à votre liste de lecture`);
        return false;
      }
    } catch (error) {
      console.error("[ERROR] Erreur lors de l'ajout à la liste de lecture:", error);
      toast.error(`Une erreur est survenue: ${error instanceof Error ? error.message : String(error)}`);
      return false;
    }
  };

  // Fonction pour rafraîchir manuellement les données avec un cache-busting
  const forceRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["reading_list"] });
    queryClient.invalidateQueries({ queryKey: ["books_by_status"] });
    fetchCooldown.current = 0; // Reset le cooldown pour permettre un fetch immédiat
    refetch();
  }, [queryClient, refetch]);

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
    forceRefresh
  };
};
