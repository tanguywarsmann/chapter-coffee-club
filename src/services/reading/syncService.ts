
import { supabase } from "@/integrations/supabase/client";
import { Book } from "@/types/book";
import { ReadingProgress } from "@/types/reading";
import { getBookById } from "@/mock/books";
import { getUserReadingProgress, getBookReadingProgress } from "./progressService";

// Create/initialize reading_progress for a book/user
export const initializeBookReading = async (userId: string, book: Book): Promise<ReadingProgress | null> => {
  const newProgress = {
    user_id: userId,
    book_id: book.id,
    total_pages: book.pages,
    current_page: book.chaptersRead * 30,
    status: book.chaptersRead > 0 ? 'in_progress' : 'to_read'
  };

  const { data, error } = await supabase
    .from('reading_progress')
    .insert({
      ...newProgress,
      status: newProgress.status as "to_read" | "in_progress" | "completed"
    })
    .select()
    .single();

  if (error) {
    console.error('Error initializing reading progress:', error);
    return null;
  }

  return { ...data, validations: [] };
};


// Get user's books in progress
export const getBooksInProgressFromAPI = async (userId: string): Promise<Book[]> => {
  const userProgress = await getUserReadingProgress(userId);
  return userProgress
    .map(progress => {
      const book = getBookById(progress.book_id);
      if (!book) return null;

      const chaptersRead = Math.floor(progress.current_page / 30);
      return {
        ...book,
        chaptersRead,
        isCompleted: chaptersRead >= book.totalChapters
      };
    })
    .filter((book): book is Book => book !== null);
};


// Get user's completed books
export const getCompletedBooksFromAPI = async (userId: string): Promise<Book[]> => {
  const books = await getBooksInProgressFromAPI(userId);
  return books.filter(book => book.isCompleted);
};


// Sync a single book's progress with API (from DB)
export const syncBookWithAPI = async (userId: string, bookId: string): Promise<Book | null> => {
  const progress = await getBookReadingProgress(userId, bookId);
  const book = getBookById(bookId);

  if (!book) return null;

  if (!progress) {
    await initializeBookReading(userId, book);
    return book;
  }

  const chaptersRead = Math.floor(progress.current_page / 30);
  return {
    ...book,
    chaptersRead,
    isCompleted: chaptersRead >= book.totalChapters
  };
};


// Utility to bulk initialize reading_progress for user based on mock data
export const initializeUserReadingProgress = async (userId: string) => {
  const existingProgress = await getUserReadingProgress(userId);

  const mockBooks = getBookById("");

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
