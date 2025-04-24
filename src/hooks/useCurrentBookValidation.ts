
import { Book } from "@/types/book";
import { useBookValidation } from "./useBookValidation";

export const useCurrentBookValidation = (
  userId: string | null,
  book: Book | null,
  onProgressUpdate?: (bookId: string) => void
) => {
  return useBookValidation(book, userId, onProgressUpdate);
};
