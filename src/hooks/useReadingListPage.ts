
import { useState, useCallback, useEffect, useRef } from "react";
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

  // Log après l'appel de useBookFetching pour voir les valeurs retournées
  console.log("[DEBUG] useReadingListPage - valeurs retournées par useBookFetching:", {
    refetch: typeof refetch === 'function',
    isLoading,
    isFetching, 
    hasError: !!error
  });

  // Effet pour suivre l'état des données et mettre à jour isDataReady
  useEffect(() => {
    if (!isLoading && !isFetching) {
      // Marquer les données comme prêtes seulement quand le chargement est terminé
      // et qu'au moins une des listes contient des données
      const hasData = toReadBooks.length > 0 || inProgressBooks.length > 0 || completedBooks.length > 0;
      console.log("[DEBUG] Mise à jour isDataReady:", { hasData, isLoading, isFetching });
      setIsDataReady(hasData);
    }
  }, [toReadBooks, inProgressBooks, completedBooks, isLoading, isFetching]);

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
    
    try {
      // Récupérer les livres par statut en utilisant directement getBooksByStatus
      const [toRead, inProgress, completed] = await Promise.all([
        getBooksByStatus('to_read'),
        getBooksByStatus('in_progress'),
        getBooksByStatus('completed')
      ]);
      
      // Appliquer le tri
      setToReadBooks(sortBooks(toRead, sortBy));
      setInProgressBooks(sortBooks(inProgress, sortBy));
      setCompletedBooks(sortBooks(completed, sortBy));
      
      console.log("[DEBUG] Données récupérées et triées");
    } catch (error) {
      console.error("[ERROR] Erreur lors de la récupération des livres:", error);
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
      console.log("[DEBUG] NOUVEAU useEffect - userId détecté pour la première fois:", userId);
      initialUserIdFetchDone.current = true;
      
      // Vérifier si les listes sont vides avant de déclencher le fetch
      if (toReadBooks.length === 0 && inProgressBooks.length === 0 && completedBooks.length === 0) {
        console.log("[DEBUG] NOUVEAU useEffect - listes vides, déclenchement fetchBooks");
        handleFetchBooks();
      } else {
        console.log("[DEBUG] NOUVEAU useEffect - listes non vides, pas de fetch nécessaire");
      }
    }
  }, [userId, handleFetchBooks]); // Ajout de handleFetchBooks à la liste des dépendances

  // NOUVEL EFFET: Surveiller spécifiquement l'apparition d'un userId
  // et déclencher le fetch initial si nécessaire
  useEffect(() => {
    if (userId && !initialFetchTriggered.current && !isLoading && !isFetching) {
      console.log("[DEBUG] userId détecté, déclenchement initial de fetchBooks");
      initialFetchTriggered.current = true;
      handleFetchBooks();
    }
  }, [userId, handleFetchBooks, isLoading, isFetching]);

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
    completedLength: completedBooks.length,
    isDataReady
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
