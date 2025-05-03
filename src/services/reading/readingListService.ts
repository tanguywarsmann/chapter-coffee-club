
import { Book } from "@/types/book";
import { ReadingProgress } from "@/types/reading";
import { supabase } from "@/integrations/supabase/client";
import { bookFailureCache } from "@/utils/bookFailureCache";
import { createFallbackBook } from "@/utils/createFallbackBook";
import { getBookById } from "@/services/books/bookQueries";

const BATCH_SIZE = 3;
const TIMEOUT_MS = 5000;

const fetchBookWithTimeout = async (bookId: string): Promise<Book | null> => {
  try {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(`Fetch for book ${bookId} timed out`)), TIMEOUT_MS);
    });

    const book = await Promise.race([
      getBookById(bookId),
      timeoutPromise
    ]) as Book | null;

    return book;
  } catch (error) {
    return null;
  }
};

export const fetchReadingProgress = async (userId: string): Promise<ReadingProgress[]> => {
  if (!userId) {
    return [];
  }

  try {
    const { data: readingProgressData, error } = await supabase
      .from("reading_progress")
      .select("*")
      .eq("user_id", userId);

    if (error) {
      throw error;
    }

    return readingProgressData || [];
  } catch (error) {
    throw error;
  }
};

export const fetchBooksForStatus = async (
  readingList: ReadingProgress[],
  status: string,
  userId: string
): Promise<Book[]> => {
  console.log(`[DEBUG] getBooksByStatus démarré avec status=${status}, userId=${userId}`);
  
  if (!readingList?.length) {
    console.log(`[DEBUG] readingList vide ou invalide pour status=${status}`);
    return [];
  }

  const filteredList = readingList.filter(
    item => item.user_id === userId && item.status === status
  );

  console.log(`[DEBUG] filteredList pour status=${status}:`, JSON.stringify(filteredList));
  
  if (filteredList.length === 0) {
    console.log(`[DEBUG] Aucun livre trouvé avec status=${status} pour userId=${userId}`);
    return [];
  }

  const books: Book[] = [];
  const batches = [];

  for (let i = 0; i < filteredList.length; i += BATCH_SIZE) {
    batches.push(filteredList.slice(i, i + BATCH_SIZE));
  }

  console.log(`[DEBUG] Préparation de ${batches.length} batches pour récupérer ${filteredList.length} livres`);

  for (const batch of batches) {
    const batchPromises = batch.map(async (item) => {
      console.log(`[DEBUG] Préparation requête Supabase pour book_id=${item.book_id}`);
      
      if (bookFailureCache.has(item.book_id)) {
        console.log(`[DEBUG] book_id=${item.book_id} dans le cache d'échec, création d'un fallback`);
        return createFallbackBook(item, "Livre précédemment indisponible");
      }

      try {
        // Log juste avant l'appel à Supabase
        console.log(`[DEBUG] Exécution requête Supabase: getBookById("${item.book_id}")`);
        
        const book = await fetchBookWithTimeout(item.book_id);
        
        if (!book) {
          console.error(`[ERREUR] Échec récupération livre id=${item.book_id}: livre non trouvé ou null`);
          bookFailureCache.add(item.book_id);
          return createFallbackBook(item, "Livre indisponible");
        }

        console.log(`[DEBUG] Livre récupéré avec succès: id=${item.book_id}, title=${book.title}`);
        
        return {
          ...book,
          chaptersRead: Math.floor(item.current_page / 30),
          totalChapters: Math.ceil(book.total_pages / 30) || 1,
          isCompleted: item.status === "completed"
        } as Book;
      } catch (error) {
        console.error(`[ERREUR] Exception lors de la récupération du livre id=${item.book_id}:`, error);
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

  console.log(`[DEBUG] Résultat final pour status=${status}: ${books.length} livres récupérés`);
  return books;
};
