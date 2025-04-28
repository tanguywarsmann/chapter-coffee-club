
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
    readingList,
    hasFetchedInitialData 
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
    console.log("[DEBUG] handleFetchBooks appelé - userId:", userId);
    
    await fetchBooks(
      setToReadBooks,
      setInProgressBooks,
      setCompletedBooks,
      isLoadingReadingList
    );
    
    // Log après l'exécution de fetchBooks pour voir si les setters ont été appelés
    console.log("[DEBUG] Post-fetchBooks - État des setters appelés");
  }, [
    fetchBooks, 
    isLoadingReadingList,
    userId // Ajout explicite de userId comme dépendance
  ]);

  // Effet de montage pour la première récupération de données
  useEffect(() => {
    console.log("[DEBUG] Effet de montage initial useReadingListPage - userId:", userId);
    
    if (userId) {
      console.log("[DEBUG] Lancement de la récupération initiale des livres");
      handleFetchBooks();
    }
  }, [userId, handleFetchBooks]);

  // Effet pour les changements de readingList
  useEffect(() => {
    if (userId && readingList) {
      console.log("[DEBUG] Mise à jour de la liste de lecture détectée");
      handleFetchBooks();
    }
  }, [userId, readingList, handleFetchBooks]);

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
