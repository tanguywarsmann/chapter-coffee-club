
import { useState, useCallback, useEffect, useRef } from "react";
import { Book } from "@/types/book";
import { useNavigate } from "react-router-dom";
import { useReadingList } from "@/hooks/useReadingList";
import { useAuth } from "@/contexts/AuthContext";
import { useBookSorting } from "@/hooks/useBookSorting";
import { useBookFetching } from "./useBookFetching";

export const useReadingListPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?.id;
  
  const { 
    getBooksByStatus, 
    isLoadingReadingList, 
    readingList
  } = useReadingList();
  
  const { sortBy, setSortBy, sortBooks } = useBookSorting();
  
  const [toReadBooks, setToReadBooks] = useState<Book[]>([]);
  const [inProgressBooks, setInProgressBooks] = useState<Book[]>([]);
  const [completedBooks, setCompletedBooks] = useState<Book[]>([]);
  const [isDataReady, setIsDataReady] = useState<boolean>(false);

  // Add reference to track if initial fetch was triggered
  const initialFetchTriggered = useRef(false);
  // Nouvelle référence pour suivre si le premier useEffect spécifique à userId a été exécuté
  const initialUserIdFetchDone = useRef(false);

  // Utilisons directement useBookFetching avec la bonne signature
  const { 
    isLoading, 
    isFetching, 
    error,
    refetch,
    hasLoaded
  } = useBookFetching();

  // Effet pour suivre l'état des données et mettre à jour isDataReady
  useEffect(() => {
    try {
      if (!isLoading && !isFetching) {
        // Marquer les données comme prêtes seulement quand le chargement est terminé
        // et qu'au moins une des listes contient des données
        const hasData = toReadBooks.length > 0 || inProgressBooks.length > 0 || completedBooks.length > 0;
        setIsDataReady(hasData);
      }
    } catch (e) {
      console.error("Erreur dans useEffect pour isDataReady:", e);
    }
  }, [toReadBooks, inProgressBooks, completedBooks, isLoading, isFetching]);

  const navigateToBook = useCallback((bookId: string) => {
    try {
      if (!bookId) {
        console.warn("navigateToBook appelé avec un bookId vide ou null");
        return;
      }
      if (typeof window !== "undefined") {
        navigate(`/books/${bookId}`);
      }
    } catch (e) {
      console.error("Erreur dans navigateToBook:", e);
    }
  }, [navigate]);

  const handleFetchBooks = useCallback(async () => {
    // N'effectuer le fetch que si aucun chargement n'est en cours et que userId existe
    if (!userId || isFetching || isLoading) {
      return;
    }

    // Si les données sont déjà chargées, ne pas refetch
    if (toReadBooks.length > 0 || inProgressBooks.length > 0 || completedBooks.length > 0) {
      return;
    }
    
    try {
      // Récupérer les livres par statut en utilisant directement getBooksByStatus
      const [toRead, inProgress, completed] = await Promise.all([
        getBooksByStatus('to_read'),
        getBooksByStatus('in_progress'),
        getBooksByStatus('completed')
      ]);
      
      // Appliquer le tri
      setToReadBooks(sortBooks(toRead || [], sortBy));
      setInProgressBooks(sortBooks(inProgress || [], sortBy));
      setCompletedBooks(sortBooks(completed || [], sortBy));
    } catch (error) {
      console.error("Erreur lors de la récupération des livres:", error);
    }
    
  }, [
    getBooksByStatus, 
    userId,
    isFetching,
    isLoading,
    toReadBooks.length,
    inProgressBooks.length,
    completedBooks.length,
    sortBooks,
    sortBy
  ]);

  // NOUVEL EFFET: Surveiller spécifiquement UNIQUEMENT l'apparition d'un userId
  // sans dépendre des listes pour éviter les boucles
  useEffect(() => {
    if (userId && !initialUserIdFetchDone.current) {
      initialUserIdFetchDone.current = true;
      
      // Vérifier si les listes sont vides avant de déclencher le fetch
      if (toReadBooks.length === 0 && inProgressBooks.length === 0 && completedBooks.length === 0) {
        handleFetchBooks();
      }
    }
  }, [userId, handleFetchBooks, toReadBooks.length, inProgressBooks.length, completedBooks.length]);

  // NOUVEL EFFET: Surveiller spécifiquement l'apparition d'un userId
  // et déclencher le fetch initial si nécessaire
  useEffect(() => {
    if (userId && !initialFetchTriggered.current && !isLoading && !isFetching) {
      initialFetchTriggered.current = true;
      handleFetchBooks();
    }
  }, [userId, handleFetchBooks, isLoading, isFetching]);

  // Effet de montage pour la première récupération de données
  useEffect(() => {
    // Ne déclencher que si userId existe, qu'aucun chargement n'est en cours et qu'il n'y a pas déjà des données
    if (userId && !isLoading && !isFetching && 
       toReadBooks.length === 0 && inProgressBooks.length === 0 && completedBooks.length === 0) {
      handleFetchBooks();
    }
  }, [userId, handleFetchBooks, isLoading, isFetching, toReadBooks.length, inProgressBooks.length, completedBooks.length]);

  // Effet pour les changements de readingList
  useEffect(() => {
    if (userId && readingList && !isLoading && !isFetching) {
      // Ne déclencher que si readingList change réellement
      handleFetchBooks();
    }
  }, [userId, readingList, handleFetchBooks, isLoading, isFetching]);

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
      isFetching,
      isDataReady
    },
    error,
    sortBy,
    setSortBy,
    navigateToBook,
    fetchBooks: handleFetchBooks
  };
};
