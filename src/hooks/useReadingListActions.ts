
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Book } from "@/types/book";
import { addBookToReadingList } from "@/services/reading/readingListService";
import { useStableCallback } from "./useStableCallback";
import { withErrorHandling } from "@/utils/errorBoundaryUtils";
import { useLogger } from "@/utils/logger";

/**
 * Hook spécialisé pour les actions sur la liste de lecture
 */
export const useReadingListActions = (userId: string, refetch: () => void) => {
  const logger = useLogger('useReadingListActions');
  const queryClient = useQueryClient();

  // Fonction d'ajout optimisée
  const addToReadingList = useStableCallback(
    withErrorHandling(async (book: Book): Promise<boolean> => {
      if (!userId) {
        toast.error("Vous devez être connecté pour ajouter un livre à votre liste");
        return false;
      }
      if (!book?.id) {
        toast.error("Erreur: livre invalide");
        return false;
      }
      
      logger.debug("Adding book to reading list", { bookId: book.id, title: book.title });
      
      try {
        const result = await addBookToReadingList(book);
        if (result) {
          // Invalidation sélective pour de meilleures performances
          await Promise.all([
            queryClient.invalidateQueries({ queryKey: ["reading_list"] }),
            queryClient.invalidateQueries({ queryKey: ["books_by_status"] })
          ]);
          refetch();
          toast.success(`"${book.title}" ajouté à votre liste de lecture`);
          logger.info("Book added successfully", { bookId: book.id });
          return true;
        } else {
          toast.error(`Impossible d'ajouter "${book.title}" à votre liste`);
          logger.warn("Failed to add book", { bookId: book.id });
          return false;
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Une erreur est survenue";
        logger.error("Error adding book to reading list", error as Error, { bookId: book.id });
        toast.error(`Erreur: ${errorMessage}`);
        return false;
      }
    }, 'useReadingListActions.addToReadingList')
  );

  return {
    addToReadingList
  };
};
