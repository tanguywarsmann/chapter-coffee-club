
import { Book } from "@/types/book";
import { ReadingProgress } from "@/types/reading";
import { supabase } from "@/integrations/supabase/client";
import { bookFailureCache } from "@/utils/bookFailureCache";
import { createFallbackBook } from "@/utils/createFallbackBook";
import { fetchBookWithTimeout } from "@/services/books/bookQueries";

const BATCH_SIZE = 3;

export const fetchReadingProgress = async (userId: string): Promise<ReadingProgress[]> => {
  if (!userId) {
    console.warn("Attempted to fetch reading list without a user ID");
    return [];
  }

  try {
    console.log("[DIAGNOSTIQUE] Récupération de la liste de lecture pour l'utilisateur:", userId);
    
    const { data: readingProgressData, error } = await supabase
      .from("reading_progress")
      .select("*")
      .eq("user_id", userId);

    if (error) {
      console.error("Error fetching reading list from Supabase:", error);
      throw error;
    }

    console.log("[DIAGNOSTIQUE] Données récupérées de reading_progress:", readingProgressData);
    return readingProgressData || [];
  } catch (error) {
    console.error("Exception while fetching reading list:", error);
    throw error;
  }
};

export const fetchBooksForStatus = async (
  readingList: ReadingProgress[],
  status: string,
  userId: string
): Promise<Book[]> => {
  if (!readingList?.length) return [];

  const filteredList = readingList.filter(
    item => item.user_id === userId && item.status === status
  );

  if (filteredList.length === 0) return [];

  const books: Book[] = [];
  const batches = [];

  // Create batches of book IDs to fetch
  for (let i = 0; i < filteredList.length; i += BATCH_SIZE) {
    batches.push(filteredList.slice(i, i + BATCH_SIZE));
  }

  // Process each batch
  for (const batch of batches) {
    const batchPromises = batch.map(async (item) => {
      if (bookFailureCache.has(item.book_id)) {
        console.log(`Using cached fallback for known failed book ID: ${item.book_id}`);
        return createFallbackBook(item, "Livre précédemment indisponible");
      }

      try {
        const book = await fetchBookWithTimeout(item.book_id);
        if (!book) {
          bookFailureCache.add(item.book_id);
          return createFallbackBook(item, "Livre indisponible");
        }

        return {
          ...book,
          chaptersRead: Math.floor(item.current_page / 30),
          totalChapters: Math.ceil(book.pages / 30) || 1,
          isCompleted: item.status === "completed"
        } as Book;
      } catch (error) {
        bookFailureCache.add(item.book_id);
        return createFallbackBook(item, error instanceof Error ? error.message : "Erreur inconnue");
      }
    });

    const batchResults = await Promise.allSettled(batchPromises);
    batchResults.forEach((result) => {
      if (result.status === 'fulfilled') {
        books.push(result.value);
      }
    });

    if (batches.length > 1) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  return books;
};
