import { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2, Trash, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { deleteBook } from "@/services/books/deleteBook";
import { Book } from "@/types/book";

interface DeleteBookDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookId: string;
  bookTitle: string;
  onDeleted: () => void;
}

export function DeleteBookDialog({
  open,
  onOpenChange,
  bookId,
  bookTitle,
  onDeleted,
}: DeleteBookDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [hasRelatedQuestions, setHasRelatedQuestions] = useState(false);
  const [questionsCount, setQuestionsCount] = useState(0);

  // Check if book has related questions when dialog opens
  useEffect(() => {
    if (open) {
      checkForRelatedQuestions();
    }
  }, [open, bookId]);

  const checkForRelatedQuestions = async () => {
    try {
      const { data, error, count } = await supabase
        .from("reading_questions")
        .select("id", { count: 'exact' })
        .eq("book_slug", bookId);

      if (error) {
        throw error;
      }

      const hasQuestions = !!count && count > 0;
      setHasRelatedQuestions(hasQuestions);
      setQuestionsCount(count || 0);
    } catch (error) {
      console.error("Erreur lors de la vérification des questions:", error);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const success = await deleteBook(bookId);
      
      if (success) {
        toast.success(`"${bookTitle}" et ses données associées ont été supprimés avec succès.`, {
          description: "Livre supprimé"
        });
        console.log("Update triggered from DeleteBookDialog");
        onDeleted();
        onOpenChange(false);
      }
    } catch (error: any) {
      console.error("Erreur lors de la suppression:", error);
      toast.error(error.message || "Impossible de supprimer ce livre", {
        description: "Erreur de suppression"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Trash className="h-5 w-5 text-destructive" />
            Supprimer "{bookTitle}"
          </AlertDialogTitle>
          <AlertDialogDescription>
            Cette action est irréversible. Le livre sera supprimé définitivement de la base de données.
            {hasRelatedQuestions && (
              <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />
                <span className="text-amber-800">
                  Ce livre contient {questionsCount} question{questionsCount > 1 ? 's' : ''} de validation qui {questionsCount > 1 ? 'seront également supprimées' : 'sera également supprimée'}.
                </span>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Suppression...
              </>
            ) : (
              hasRelatedQuestions ? "Supprimer tout" : "Supprimer définitivement"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
