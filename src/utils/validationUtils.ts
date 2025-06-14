
import { toast } from "sonner";
import { Book } from "@/types/book";

export const validateUserAndBook = (userId: string | null, book: Book | null): boolean => {
  if (!userId) {
    toast.error("Vous devez être connecté pour valider votre lecture : Connectez-vous pour enregistrer votre progression.", {
      duration: 5000
    });
    return false;
  }
  
  if (!book) {
    toast.error("Information du livre manquante : Impossible de valider sans les informations du livre", {
      duration: 3000
    });
    return false;
  }
  
  return true;
};

export const checkBookCompletion = (book: Book): boolean => {
  if (book.chaptersRead >= book.totalChapters) {
    toast.success("Vous avez déjà terminé ce livre ! : Votre progression a été entièrement enregistrée.", {
      duration: 3000
    });
    return true;
  }
  return false;
};

export const showValidationError = (error: unknown, action: string) => {
  console.error(`Error ${action}:`, error);
  const errorMessage = error instanceof Error ? error.message : String(error);
  toast.error(`Erreur lors ${action} : ${errorMessage.substring(0, 100)}`, {
    duration: 5000
  });
};
