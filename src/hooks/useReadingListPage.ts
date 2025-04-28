
import { useState, useCallback, useEffect } from "react";
import { Book } from "@/types/book";
import { useNavigate } from "react-router-dom";
import { useReadingList } from "@/hooks/useReadingList";
import { useAuth } from "@/contexts/AuthContext";
import { useBookSorting } from "@/hooks/useBookSorting";
import { useBookFetching } from "./useBookFetching";

export const useReadingListPage = () => {
  console.log("[DEBUG] Initialisation useReadingListPage");
  
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?.id;
  
  const { 
    getBooksByStatus, 
    isLoadingReadingList, 
    getFailedBookIds,
    readingList
  } = useReadingList();
  
  const { sortBy, setSortBy, sortBooks } = useBookSorting();
  
  const [toReadBooks, setToReadBooks] = useState<Book[]>([]);
  const [inProgressBooks, setInProgressBooks] = useState<Book[]>([]);
  const [completedBooks, setCompletedBooks] = useState<Book[]>([]);

  const { isLoading, isFetching, error, fetchBooks } = useBookFetching({
    user,
    readingList,
    getBooksByStatus,
    sortBooks,
    sortBy
  });

  // Log après l'appel de useBookFetching pour voir les valeurs retournées
  console.log("[DEBUG] useReadingListPage - valeurs retournées par useBookFetching:", {
    fetchBooks: typeof fetchBooks === 'function',
    isLoading,
    isFetching, 
    hasError: !!error
  });

  const navigateToBook = useCallback((bookId: string) => {
    navigate(`/books/${bookId}`);
  }, [navigate]);

  const handleFetchBooks = useCallback(async () => {
    // N'effectuer le fetch que si aucun chargement n'est en cours et que userId existe
    if (!userId || isFetching || isLoading) {
      console.log("[DEBUG] handleFetchBooks ignoré - chargement déjà en cours ou userId absent");
      return;
    }

    // Si les données sont déjà chargées, ne pas refetch
    if (toReadBooks.length > 0 || inProgressBooks.length > 0 || completedBooks.length > 0) {
      console.log("[DEBUG] handleFetchBooks ignoré - données déjà présentes");
      return;
    }
    
    console.log("[DEBUG] handleFetchBooks vraiment appelé - userId:", userId);
    
    await fetchBooks(
      setToReadBooks,
      setInProgressBooks,
      setCompletedBooks,
      isLoadingReadingList
    );
    
    console.log("[DEBUG] Post-fetchBooks - État des setters appelés");
  }, [
    fetchBooks, 
    isLoadingReadingList,
    userId,
    isFetching,
    isLoading,
    toReadBooks.length,
    inProgressBooks.length,
    completedBooks.length
  ]);

  // Effet de montage pour la première récupération de données
  useEffect(() => {
    console.log("[DEBUG] Effet de montage initial useReadingListPage - userId:", userId);
    
    // Ne déclencher que si userId existe, qu'aucun chargement n'est en cours et qu'il n'y a pas déjà des données
    if (userId && !isLoading && !isFetching && 
       toReadBooks.length === 0 && inProgressBooks.length === 0 && completedBooks.length === 0) {
      console.log("[DEBUG] Lancement de la récupération initiale des livres");
      handleFetchBooks();
    } else {
      console.log("[DEBUG] Récupération initiale ignorée - conditions non remplies");
    }
  }, [userId, handleFetchBooks, isLoading, isFetching, toReadBooks.length, inProgressBooks.length, completedBooks.length]);

  // Effet pour les changements de readingList
  useEffect(() => {
    if (userId && readingList && !isLoading && !isFetching) {
      console.log("[DEBUG] Mise à jour de la liste de lecture détectée");
      // Ne déclencher que si readingList change réellement (il faudrait idéalement comparer les IDs)
      handleFetchBooks();
    }
  }, [userId, readingList, handleFetchBooks, isLoading, isFetching]);

  // Ajout du console.log pour vérifier le contenu final des tableaux
  console.log('[DEBUG] Contenu final dans ReadingListPage', { 
    toRead: toReadBooks,
    inProgress: inProgressBooks,
    completed: completedBooks,
    toReadLength: toReadBooks.length,
    inProgressLength: inProgressBooks.length,
    completedLength: completedBooks.length
  });

  return {
    user,
    books: {
      toRead: toReadBooks,
      inProgress: inProgressBooks,
      completed: completedBooks
    },
    loading: {
      isLoading,
      isLoadingReadingList,
      isFetching
    },
    error,
    sortBy,
    setSortBy,
    navigateToBook,
    fetchBooks: handleFetchBooks
  };
};
