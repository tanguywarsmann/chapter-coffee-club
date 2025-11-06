
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Supprime un livre et toutes ses données associées
 * @param bookId Identifiant du livre à supprimer
 * @returns Succès de l'opération
 */
export const deleteBook = async (bookId: string): Promise<boolean> => {
  try {
    if (!bookId) {
      toast.error("Identifiant du livre non fourni", {
        description: "Erreur de suppression"
      });
      return false;
    }

    // Supprimer d'abord les questions liées
    const { error: questionsError } = await supabase
      .from("reading_questions")
      .delete()
      .eq("book_slug", bookId);

    if (questionsError) {
      console.error("Erreur lors de la suppression des questions:", questionsError);
      throw questionsError;
    }

    // Puis supprimer les validations liées au livre
    const { error: validationsError } = await supabase
      .from("reading_validations")
      .delete()
      .eq("book_id", bookId);

    if (validationsError) {
      console.error("Erreur lors de la suppression des validations:", validationsError);
      throw validationsError;
    }

    // Enfin supprimer le livre
    const { error: bookError } = await supabase
      .from("books")
      .delete()
      .eq("id", bookId);

    if (bookError) {
      console.error("Erreur lors de la suppression du livre:", bookError);
      throw bookError;
    }

    toast.success("Livre supprimé avec succès");
    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Impossible de supprimer ce livre";
    console.error("Erreur lors de la suppression du livre:", error);
    toast.error(errorMessage, {
      description: "Erreur de suppression"
    });
    return false;
  }
};
