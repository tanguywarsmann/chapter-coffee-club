
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
  
  // Effet pour tracer chaque changement de dépendance importante
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
      
      console.log("[DEBUG] Livres récupérés:", {
        toRead: toReadResult?.length || 0,
        inProgress: inProgressResult?.length || 0,
        completed: completedResult?.length || 0
      });
      
      setToReadBooks(sortBooks(stabilizeBooks(toReadResult || []), sortBy));
      setInProgressBooks(sortBooks(stabilizeBooks(inProgressResult || []), sortBy));
      setCompletedBooks(sortBooks(stabilizeBooks(completedResult || []), sortBy));
      
    } catch (err) {
      console.error("[ERREUR] Échec de récupération des livres:", err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
      setIsFetching(false);
      isFetchingRef.current = false;
    }
  };

  return {
    isLoading,
    isFetching,
    error,
    fetchBooks
  };
};
