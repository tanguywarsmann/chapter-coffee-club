import { useState } from 'react';
import { toast } from 'sonner';
import { removeFromToRead, restoreToRead } from '@/services/reading/readingListService';
import { useQueryClient } from '@tanstack/react-query';

interface RemovedBook {
  id: string;
  title: string;
  row: any;
}

export const useRemoveFromToRead = () => {
  const [removingBookId, setRemovingBookId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const handleRemove = async (bookId: string, bookTitle: string) => {
    if (removingBookId) return; // Prevent double-click

    setRemovingBookId(bookId);

    try {
      // Call service to delete
      const deletedRow = await removeFromToRead(bookId);

      if (!deletedRow) {
        throw new Error("Suppression échouée");
      }

      // Invalidate queries to refresh UI
      queryClient.invalidateQueries({ queryKey: ['reading-list'] });
      queryClient.invalidateQueries({ queryKey: ['reading-progress'] });

      // Show success toast with undo action
      toast.success(`"${bookTitle}" retiré de « À lire »`, {
        action: {
          label: 'Annuler',
          onClick: async () => {
            try {
              await restoreToRead(deletedRow);
              queryClient.invalidateQueries({ queryKey: ['reading-list'] });
              queryClient.invalidateQueries({ queryKey: ['reading-progress'] });
              toast.success(`"${bookTitle}" restauré`);
            } catch (error) {
              console.error('Erreur lors de la restauration:', error);
              toast.error('Impossible de restaurer le livre');
            }
          }
        },
        duration: 5000
      });
    } catch (error: any) {
      console.error('Erreur lors de la suppression:', error);
      toast.error(error.message || 'Impossible de retirer le livre');
    } finally {
      setRemovingBookId(null);
    }
  };

  return {
    handleRemove,
    removingBookId
  };
};
