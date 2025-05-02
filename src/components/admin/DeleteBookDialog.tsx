
import { useState } from "react";
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
import { Button } from "@/components/ui/button";
import { Loader2, Trash, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

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

  // Check if book has related questions when dialog opens
  const checkForRelatedQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from("reading_questions")
        .select("id")
        .eq("book_slug", bookId)
        .limit(1);

      if (error) {
        throw error;
      }

      setHasRelatedQuestions(data && data.length > 0);
    } catch (error) {
      console.error("Erreur lors de la vérification des questions:", error);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      // First delete related questions if any
      if (hasRelatedQuestions) {
        const { error: questionsError } = await supabase
          .from("reading_questions")
          .delete()
          .eq("book_slug", bookId);

        if (questionsError) {
          throw questionsError;
        }
      }

      // Then delete validations related to the book
      const { error: validationsError } = await supabase
        .from("reading_validations")
        .delete()
        .eq("book_id", bookId);

      if (validationsError) {
        throw validationsError;
      }

      // Finally delete the book
      const { error: bookError } = await supabase
        .from("books")
        .delete()
        .eq("id", bookId);

      if (bookError) {
        throw bookError;
      }

      toast({
        title: "Livre supprimé",
        description: `"${bookTitle}" et ses données associées ont été supprimés avec succès.`,
      });

      onDeleted();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Erreur lors de la suppression:", error);
      toast({
        title: "Erreur de suppression",
        description: error.message || "Impossible de supprimer ce livre",
        variant: "destructive",
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
                  Ce livre contient des questions de validation qui seront également supprimées.
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
              "Supprimer définitivement"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
