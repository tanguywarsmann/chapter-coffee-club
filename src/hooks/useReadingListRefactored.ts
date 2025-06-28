
import { useMemo } from "react";
import { useReadingListCore } from "./useReadingListCore";
import { useReadingListBooks } from "./useReadingListBooks";
import { useReadingListActions } from "./useReadingListActions";
import { useReadingListState } from "./useReadingListState";
import { bookFailureCache } from "@/utils/bookFailureCache";
import { safeFetchBooksForStatus } from "./useReadingListHelpers";
import { useStableCallback } from "./useStableCallback";
import { withErrorHandling } from "@/utils/errorBoundaryUtils";
import { useLogger } from "@/utils/logger";

/**
 * Hook principal refactorisé - remplace useReadingListOptimized
 * 
 * Divise la logique complexe en hooks spécialisés pour une meilleure maintenabilité
 */
export const useReadingListRefactored = () => {
  const logger = useLogger('useReadingListRefactored');
  
  // Hook principal pour les données de base
  const {
    readingList,
    isLoadingReadingList,
    readingListError,
    isSuccess,
    refetch,
    userId,
    hasFetchedInitialData
  } = useReadingListCore();

  // Hook pour la gestion des livres par statut
  const {
    books,
    isLoading,
    error,
    getBooksByStatus,
    updateBooks,
    forceRefresh
  } = useReadingListBooks(readingList, userId);

  // Hook pour les actions
  const {
    addToReadingList
  } = useReadingListActions(userId, refetch);

  // Hook pour l'état de tri
  const { sortState } = useReadingListState();

  // Sync optimisé des livres complétés
  const syncCompletedBooks = useStableCallback(
    withErrorHandling(async () => {
      if (!userId || !readingList) return;
      
      logger.debug("Syncing completed books");
      
      try {
        const completedBooks = await safeFetchBooksForStatus(readingList, "completed", userId);
        updateBooks(books.toRead, books.inProgress, completedBooks);
        logger.info("Completed books synced successfully");
      } catch (error) {
        logger.error("Failed to sync completed books", error as Error);
      }
    }, 'useReadingListRefactored.syncCompletedBooks')
  );

  // Mémoriser la valeur de retour
  return useMemo(() => ({
    ...books,
    isLoadingReadingList,
    readingListError,
    sortBy: sortState.sortBy,
    setSortBy: sortState.setSortBy,
    isLoading,
    error,
    readingList,
    userId,
    getFailedBookIds: () => bookFailureCache.getAll(),
    hasFetchedInitialData,
    getBooksByStatus,
    addToReadingList,
    forceRefresh,
    syncCompletedBooks,
  }), [
    books,
    isLoadingReadingList,
    readingListError,
    sortState.sortBy,
    sortState.setSortBy,
    isLoading,
    error,
    readingList,
    userId,
    hasFetchedInitialData,
    getBooksByStatus,
    addToReadingList,
    forceRefresh,
    syncCompletedBooks,
  ]);
};
