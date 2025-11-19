
import { supabase } from "@/integrations/supabase/client";
import { Book } from "@/types/book";
import { ReadingProgress, BookWithProgress } from "@/types/reading";
import { getBookById as getMockBookById } from "@/mock/books";
import { getBookById } from "@/services/books/bookQueries";
import { getUserReadingProgress, getBookReadingProgress } from "./progressService";
import { Database } from "@/integrations/supabase/types";

type ReadingProgressInsert = Database['public']['Tables']['reading_progress']['Insert'];

/**
 * Initialise la lecture d'un livre pour un utilisateur
 * @param userId ID de l'utilisateur
 * @param book Livre à initialiser
 * @returns Progression de lecture ou null
 */
export const initializeBookReading = async (userId: string, book: Book): Promise<ReadingProgress | null> => {
  if (!userId || typeof userId !== 'string') return null;

  const validUuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!validUuidPattern.test(userId)) return null;

  const newProgress: ReadingProgressInsert = {
    user_id: userId,
    book_id: book.id,
    total_pages: book.pages,
    current_page: 0,
    status: 'to_read',
    started_at: new Date().toISOString(),
    streak_current: 0,
    streak_best: 0
  };

  try {
    const { data, error } = await supabase
      .from('reading_progress')
      .insert(newProgress)
      .select()
      .single();

    if (error) {
      console.error("Erreur lors de l'initialisation de la lecture:", error);
      return null;
    }

    return { ...data, validations: [] } as unknown as ReadingProgress;
  } catch (error) {
    console.error("Exception lors de l'initialisation de la lecture:", error);
    return null;
  }
};

/**
 * Initialise la lecture d'un nouveau livre pour un utilisateur
 * @param userId ID de l'utilisateur
 * @param bookId ID du livre
 * @returns Progression de lecture ou null
 */
export const initializeNewBookReading = async (userId: string, bookId: string): Promise<ReadingProgress | null> => {
  if (!userId) return null;

  const validUuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!validUuidPattern.test(userId)) return null;

  try {
    const existingProgress = await getBookReadingProgress(userId, bookId);
    if (existingProgress) return existingProgress;

    const book = await getBookById(bookId);
    if (!book) return null;

    return await initializeBookReading(userId, book);
  } catch (error) {
    console.error("Exception lors de l'initialisation de la lecture:", error);
    return null;
  }
};

/**
 * Récupère les livres en cours de lecture depuis l'API
 * @param userId ID de l'utilisateur
 * @returns Liste des livres en cours
 */
export const getBooksInProgressFromAPI = async (userId: string): Promise<BookWithProgress[]> => {
  const userProgress = await getUserReadingProgress(userId);

  return userProgress.map(progress => ({
    ...progress,
    chaptersRead: progress.chaptersRead,
    progressPercent: progress.progressPercent,
    nextSegmentPage: progress.nextSegmentPage,
    isCompleted: progress.progressPercent >= 100
  } as BookWithProgress));
};

/**
 * Récupère les livres terminés depuis l'API
 * @param userId ID de l'utilisateur
 * @returns Liste des livres terminés
 */
export const getCompletedBooksFromAPI = async (userId: string): Promise<BookWithProgress[]> => {
  const books = await getBooksInProgressFromAPI(userId);
  return books.filter(book => book.isCompleted);
};

/**
 * Synchronise un livre avec l'API
 * @param userId ID de l'utilisateur
 * @param bookId ID du livre
 * @returns Livre synchronisé ou null
 */
export const syncBookWithAPI = async (userId: string, bookId: string): Promise<BookWithProgress | null> => {
  try {
    const progress = await getBookReadingProgress(userId, bookId);
    const book = await getBookById(bookId);

    if (!book) {
      console.error('Book not found in Supabase:', bookId);
      return null;
    }

    if (!progress) {
      await initializeBookReading(userId, book);
      // Return a default BookWithProgress even if no progress exists
      return {
        ...book,
        chaptersRead: 0,
        progressPercent: 0,
        nextSegmentPage: 30,
        isCompleted: false
      } as unknown as BookWithProgress;
    }

    return {
      ...book,
      chaptersRead: progress.chaptersRead,
      progressPercent: progress.progressPercent,
      nextSegmentPage: progress.nextSegmentPage,
      isCompleted: progress.progressPercent >= 100
    } as unknown as BookWithProgress;
  } catch (error) {
    console.error(`Error syncing book ${bookId}:`, error);
    return null;
  }
};

/**
 * Initialise la progression de lecture d'un utilisateur
 * @param userId ID de l'utilisateur
 */
export const initializeUserReadingProgress = async (userId: string): Promise<void> => {
  const existingProgress = await getUserReadingProgress(userId);

  const mockBooks = getMockBookById("");

  if (Array.isArray(mockBooks)) {
    mockBooks
      .filter(book => book.chaptersRead > 0)
      .forEach(async (book) => {
        const hasProgress = existingProgress.some(p => p.book_id === book.id);
        if (!hasProgress) {
          await initializeBookReading(userId, book);
        }
      });
  }
};
