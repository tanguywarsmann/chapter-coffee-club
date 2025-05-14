
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const deleteBook = async (bookId: string): Promise<boolean> => {
  try {
    if (!bookId) {
      toast({
        title: "Erreur de suppression",
        description: "Identifiant du livre non fourni",
        variant: "destructive",
      });
      return false;
    }

    // First delete related questions if any
    const { error: questionsError } = await supabase
      .from("reading_questions")
      .delete()
      .eq("book_slug", bookId);

    if (questionsError) {
      console.error("Erreur lors de la suppression des questions:", questionsError);
      throw questionsError;
    }

    // Then delete validations related to the book
    const { error: validationsError } = await supabase
      .from("reading_validations")
      .delete()
      .eq("book_id", bookId);

    if (validationsError) {
      console.error("Erreur lors de la suppression des validations:", validationsError);
      throw validationsError;
    }

    // Finally delete the book
    const { error: bookError } = await supabase
      .from("books")
      .delete()
      .eq("id", bookId);

    if (bookError) {
      console.error("Erreur lors de la suppression du livre:", bookError);
      throw bookError;
    }

    toast({
      title: "Livre supprimé",
      description: "Le livre a été supprimé avec succès",
      variant: "default",
    });
    return true;
  } catch (error: any) {
    console.error("Erreur lors de la suppression du livre:", error);
    toast({
      title: "Erreur de suppression",
      description: error.message || "Impossible de supprimer ce livre",
      variant: "destructive",
    });
    return false;
  }
};
