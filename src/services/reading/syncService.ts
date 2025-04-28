import { supabase } from "@/integrations/supabase/client";
import { Book } from "@/types/book";
import { ReadingProgress } from "@/types/reading";
import { getBookById as getMockBookById } from "@/mock/books";
import { getBookById } from "@/services/books/bookQueries";
import { getUserReadingProgress, getBookReadingProgress } from "./progressService";

export const initializeBookReading = async (userId: string, book: Book): Promise<ReadingProgress | null> => {
  if (!userId || typeof userId !== 'string') {
    return null;
  }

  const validUuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!validUuidPattern.test(userId)) {
    return null;
  }

  const existingProgress = await getBookReadingProgress(userId, book.id);
  if (existingProgress) {
    return existingProgress;
  }

  const newProgress = {
    user_id: userId,
    book_id: book.id,
    total_pages: book.pages,
    current_page: 0,
    status: 'to_read' as const,
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
      return null;
    }

    return { ...data, validations: [] };
  } catch (error) {
    return null;
  }
};

export const initializeNewBookReading = async (userId: string, bookId: string): Promise<ReadingProgress | null> => {
  if (!userId) {
    return null;
  }

  const validUuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!validUuidPattern.test(userId)) {
    return null;
  }
  
  try {
    const book = await getBookById(bookId);
    if (!book) {
      return null;
    }
    
    return initializeBookReading(userId, book);
  } catch (error) {
    return null;
  }
};

export const getBooksInProgressFromAPI = async (userId: string): Promise<Book[]> => {
  const userProgress = await getUserReadingProgress(userId);
  return Promise.all(userProgress.map(async progress => {
    try {
      const book = await getBookById(progress.book_id);
      if (!book) return null;

      const chaptersRead = Math.floor(progress.current_page / 30);
      return {
        ...book,
        chaptersRead,
        isCompleted: chaptersRead >= book.totalChapters
      };
    } catch (error) {
      console.error(`Error fetching book ${progress.book_id}:`, error);
      return null;
    }
  })).then(books => books.filter((book): book is Book => book !== null));
};

export const getCompletedBooksFromAPI = async (userId: string): Promise<Book[]> => {
  const books = await getBooksInProgressFromAPI(userId);
  return books.filter(book => book.isCompleted);
};

export const syncBookWithAPI = async (userId: string, bookId: string): Promise<Book | null> => {
  try {
    const progress = await getBookReadingProgress(userId, bookId);
    const book = await getBookById(bookId);

    if (!book) {
      console.error('Book not found in Supabase:', bookId);
      return null;
    }

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
  } catch (error) {
    console.error(`Error syncing book ${bookId}:`, error);
    return null;
  }
};

export const initializeUserReadingProgress = async (userId: string) => {
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
