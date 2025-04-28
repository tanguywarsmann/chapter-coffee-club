import { useState, useRef, useEffect } from "react";
import { Book } from "@/types/book";
import { ReadingProgress } from "@/types/reading";
import { useBookStabilization } from "./useBookStabilization";
import { bookFailureCache } from "@/utils/bookFailureCache";
import { unavailableBooksCache } from "@/utils/unavailableBooksCache";
import { SortOption } from "@/components/reading/BookSortSelect";

interface UseBookFetchingProps {
  user: { id: string } | null;
  readingList: ReadingProgress[] | null;
  getBooksByStatus: (status: string) => Promise<Book[]>;
  sortBooks: (books: Book[], sortOption: SortOption) => Book[];
  sortBy: SortOption;
}

export const useBookFetching = ({
  user,
  readingList,
  getBooksByStatus,
  sortBooks,
  sortBy
}: UseBookFetchingProps) => {
  console.log("[DEBUG] useBookFetching initialisation avec userId:", user?.id);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const isFetchingRef = useRef(false);
  const { stabilizeBooks } = useBookStabilization();
  
  const [toReadBooks, setToReadBooks] = useState<Book[]>([]);
  const [inProgressBooks, setInProgressBooks] = useState<Book[]>([]);
  const [completedBooks, setCompletedBooks] = useState<Book[]>([]);
  
  useEffect(() => {
    console.log("[DEBUG] Dépendance modifiée - userId:", user?.id);
    console.log("[DEBUG] Dépendance modifiée - readingList:", readingList?.length ?? 0, "éléments");
  }, [user?.id, readingList]);

  const fetchBooks = async (
    setToReadBooks: (books: Book[]) => void,
    setInProgressBooks: (books: Book[]) => void,
    setCompletedBooks: (books: Book[]) => void,
    hasFetchedInitialData: () => boolean,
    isLoadingReadingList: boolean
  ) => {
    console.log("[DEBUG] fetchBooks appelé - userId:", user?.id);
    
    if (!user?.id || !readingList || isFetchingRef.current) {
      console.log("[DEBUG] Fetch ignoré - conditions non remplies:", {
        "userId présent": !!user?.id,
        "readingList disponible": !!readingList,
        "fetch déjà en cours": isFetchingRef.current
      });
      return;
    }
    
    if (hasFetchedInitialData() && !isLoadingReadingList) {
      console.log("[DEBUG] Données initiales déjà récupérées et readingList non en chargement");
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setIsFetching(true);
    isFetchingRef.current = true;
    
    try {
      console.log("[DEBUG] Début récupération des livres pour userId:", user.id);
      
      const failedIds = bookFailureCache.getAll();
      failedIds.forEach(id => unavailableBooksCache.add(id));
      
      if (!readingList || !Array.isArray(readingList) || readingList.length === 0) {
        setToReadBooks([]);
        setInProgressBooks([]);
        setCompletedBooks([]);
        setIsLoading(false);
        setIsFetching(false);
        console.log("[DEBUG] Aucune lecture trouvée dans readingList");
        return;
      }
      
      const [toReadResult, inProgressResult, completedResult] = await Promise.all([
        getBooksByStatus("to_read"),
        getBooksByStatus("in_progress"),
        getBooksByStatus("completed")
      ]);
      
      console.log("[DEBUG] RÉPONSES BRUTES DE SUPABASE:");
      console.log("[DEBUG] toReadResult brut:", JSON.stringify(toReadResult));
      console.log("[DEBUG] inProgressResult brut:", JSON.stringify(inProgressResult));
      console.log("[DEBUG] completedResult brut:", JSON.stringify(completedResult));
      
      console.log("[DEBUG] Livres récupérés:", {
        toRead: toReadResult?.length || 0,
        inProgress: inProgressResult?.length || 0,
        completed: completedResult?.length || 0
      });
      
      console.log("[DEBUG] Détail des livres à lire:", toReadResult);
      console.log("[DEBUG] Détail des livres en cours:", inProgressResult);
      console.log("[DEBUG] Détail des livres terminés:", completedResult);
      
      console.log("[DEBUG] AVANT STABILISATION:", {
        toRead: toReadResult ? [...toReadResult] : [],
        inProgress: inProgressResult ? [...inProgressResult] : [],
        completed: completedResult ? [...completedResult] : []
      });
      
      const stabilizedToRead = stabilizeBooks(toReadResult || []);
      const stabilizedInProgress = stabilizeBooks(inProgressResult || []);
      const stabilizedCompleted = stabilizeBooks(completedResult || []);
      
      console.log("[DEBUG] APRÈS STABILISATION:", {
        toRead: stabilizedToRead,
        inProgress: stabilizedInProgress,
        completed: stabilizedCompleted
      });
      
      const sortedToRead = sortBooks(stabilizedToRead, sortBy);
      const sortedInProgress = sortBooks(stabilizedInProgress, sortBy);
      const sortedCompleted = sortBooks(stabilizedCompleted, sortBy);

      console.log("[DEBUG] APRÈS TRI:", {
        toRead: sortedToRead.length,
        inProgress: sortedInProgress.length,
        completed: sortedCompleted.length
      });
      
      setToReadBooks(sortedToRead);
      setInProgressBooks(sortedInProgress);
      setCompletedBooks(sortedCompleted);
      
      console.log("[DEBUG] useBookFetching RÉSULTAT FINAL qui va être retourné:", {
        toReadBooks: sortedToRead.length,
        inProgressBooks: sortedInProgress.length,
        completedBooks: sortedCompleted.length,
        livresOK: sortedToRead.length > 0 || sortedInProgress.length > 0 || sortedCompleted.length > 0
      });
      
    } catch (err) {
      console.error("[ERREUR] Échec de récupération des livres:", err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
      setIsFetching(false);
      isFetchingRef.current = false;
    }
  };

  console.log("[DEBUG] État final de useBookFetching:", { 
    isLoading, 
    isFetching, 
    hasError: !!error,
    toReadLength: toReadBooks.length,
    inProgressLength: inProgressBooks.length,
    completedLength: completedBooks.length 
  });

  return {
    isLoading,
    isFetching,
    error,
    fetchBooks,
    toRead: toReadBooks,
    inProgress: inProgressBooks,
    completed: completedBooks
  };
};
