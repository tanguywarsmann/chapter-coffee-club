
import { Book } from "@/types/book";
import { getBookById } from "@/services/books/bookQueries";
import { createFallbackBook } from "@/utils/createFallbackBook";
import { bookFailureCache } from "@/utils/bookFailureCache";

const TIMEOUT_DURATION = 15000; // 15 seconds

export const useBookFetching = () => {
  const fetchBookWithTimeout = async (bookId: string, item: any): Promise<Book> => {
    // Skip known failed books
    if (bookFailureCache.has(bookId)) {
      console.log(`Skipping known failed book ID: ${bookId}`);
      return createFallbackBook(item, "Livre précédemment indisponible");
    }

    try {
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout fetching book')), TIMEOUT_DURATION)
      );
      
      const book = await Promise.race([getBookById(bookId), timeoutPromise]) as Book | null;
      
      if (!book) {
        bookFailureCache.add(bookId);
        console.warn(`Book not found: ${bookId}, adding to failed books cache`);
        return createFallbackBook(item, "Livre indisponible");
      }

      return {
        ...book,
        chaptersRead: Math.floor(item.current_page / 30),
        totalChapters: Math.ceil(book.pages / 30) || 1,
        isCompleted: item.status === "completed"
      } as Book;
    } catch (error) {
      bookFailureCache.add(bookId);
      const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
      console.error(`Error processing book ${bookId}:`, error);
      return createFallbackBook(item, errorMessage);
    }
  };

  return { fetchBookWithTimeout };
};
