
import { supabase } from "@/integrations/supabase/client";
import { Book } from "@/types/book";
import { ReadingProgress } from "@/types/reading";
import { getBookById } from "@/mock/books";
import { getUserReadingProgress, getBookReadingProgress } from "./progressService";

// Create/initialize reading_progress for a book/user
export const initializeBookReading = async (userId: string, book: Book): Promise<ReadingProgress | null> => {
  // Ensure userId is properly formatted
  if (!userId || typeof userId !== 'string') {
    console.error('Invalid user ID format:', userId);
    return null;
  }
  
  // Check if userId is a JSON string and extract the actual ID
  let cleanUserId = userId;
  try {
    if (userId.startsWith('{') && userId.includes('}')) {
      const parsedUser = JSON.parse(userId);
      if (parsedUser.email) {
        // If we have a JSON object with email, we need to get the actual user ID
        // For now, we'll use a temporary ID based on the email
        cleanUserId = parsedUser.email.replace(/[^a-zA-Z0-9]/g, '');
        console.log('Using email-based ID:', cleanUserId);
      }
    }
  } catch (e) {
    console.error('Error parsing user ID:', e);
  }

  // First check if a reading progress already exists
  console.log('Checking for existing progress with userId:', cleanUserId, 'bookId:', book.id);
  const existingProgress = await getBookReadingProgress(cleanUserId, book.id);
  if (existingProgress) {
    console.log('Reading progress already exists for:', book.id);
    return existingProgress;
  }

  // If no progress exists, create a new one
  const newProgress = {
    user_id: cleanUserId,
    book_id: book.id,
    total_pages: book.pages,
    current_page: 0,
    status: 'to_read' as const,
    started_at: new Date().toISOString(),
    streak_current: 0,
    streak_best: 0
  };

  console.log('Creating new reading progress:', newProgress);

  try {
    const { data, error } = await supabase
      .from('reading_progress')
      .insert(newProgress)
      .select()
      .single();

    if (error) {
      console.error('Error initializing reading progress:', error);
      return null;
    }

    console.log('Successfully created reading progress:', data);
    return { ...data, validations: [] };
  } catch (error) {
    console.error('Exception during reading progress initialization:', error);
    return null;
  }
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

// Utility to initialize reading progress for a new book
export const initializeNewBookReading = async (userId: string, bookId: string): Promise<ReadingProgress | null> => {
  console.log('Initializing new book reading with userId:', userId, 'bookId:', bookId);
  
  if (!userId) {
    console.error('Missing user ID for book initialization');
    return null;
  }
  
  const book = getBookById(bookId);
  if (!book) {
    console.error('Book not found:', bookId);
    return null;
  }

  return initializeBookReading(userId, book);
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
