
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const deleteBook = async (bookId: string): Promise<boolean> => {
  try {
    // First delete related questions if any
    const { error: questionsError } = await supabase
      .from("reading_questions")
      .delete()
      .eq("book_slug", bookId);

    if (questionsError) {
      throw questionsError;
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

    return true;
  } catch (error: any) {
    console.error("Error deleting book:", error);
    toast({
      title: "Error deleting book",
      description: error.message || "Could not delete this book",
      variant: "destructive",
    });
    return false;
  }
};
