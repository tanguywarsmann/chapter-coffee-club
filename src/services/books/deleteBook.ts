
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

/**
 * Supprime un livre et toutes ses données associées
 * @param bookId Identifiant du livre à supprimer
 * @returns Succès de l'opération
 */
export const deleteBook = async (bookId: string): Promise<boolean> => {
  try {
    if (!bookId) {
      toast({
        title: "Erreur de suppression : Identifiant du livre non fourni",
        variant: "destructive",
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

    toast({
      title: "Livre supprimé avec succès",
      variant: "default",
    });
    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Impossible de supprimer ce livre";
    console.error("Erreur lors de la suppression du livre:", error);
    toast({
      title: `Erreur de suppression : ${errorMessage}`,
      variant: "destructive",
    });
    return false;
  }
};
