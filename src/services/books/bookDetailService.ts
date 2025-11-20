import { Book } from "@/types/book";
import { BookWithProgress } from "@/types/reading";
import { getBookById } from "./bookQueries";
import { getBookReadingProgress } from "@/services/reading/progressService";
import { syncBookWithAPI } from "@/services/reading/syncService";

const resolveCollection = (primary?: string[] | null, fallback?: string[] | null): string[] => {
  if (Array.isArray(primary) && primary.length > 0) {
    return primary;
  }
  if (Array.isArray(fallback)) {
    return fallback;
  }
  return [];
};

const createBaseBookWithProgress = (book: Book, userId?: string | null): BookWithProgress => {
  const categories = resolveCollection(book.categories, book.tags);
  const tags = resolveCollection(book.tags, book.categories);
  const totalSegments =
    book.totalSegments ??
    book.totalChapters ??
    book.expectedSegments ??
    book.total_chapters ??
    1;

  return {
    ...book,
    categories,
    tags,
    progressPercent: book.progressPercent ?? 0,
    currentSegment: book.currentSegment ?? 1,
    totalSegments,
    nextSegmentPage: book.nextSegmentPage ?? 1,
    chaptersRead: book.chaptersRead ?? 0,
    expectedSegments: book.expectedSegments ?? book.total_chapters ?? totalSegments,
    book_id: book.id,
    current_page: 0,
    started_at: new Date().toISOString(),
    status: "to_read",
    streak_best: 0,
    streak_current: 0,
    total_pages: book.total_pages ?? book.pages ?? 0,
    updated_at: new Date().toISOString(),
    user_id: userId ?? "",
  };
};

export const ensureProgressBookShape = (book: BookWithProgress): BookWithProgress => {
  const categories = resolveCollection(book.categories, book.tags);
  const tags = resolveCollection(book.tags, book.categories);

  return {
    ...book,
    categories,
    tags,
  };
};

export interface BookDetailResult {
  book: BookWithProgress;
  progressError?: string | null;
}

export const fetchBookDetail = async (
  bookId: string,
  userId?: string | null
): Promise<BookDetailResult> => {
  const baseBook = await getBookById(bookId);

  if (!baseBook) {
    throw new Error(`Le livre avec l'identifiant "${bookId}" n'existe pas`);
  }

  let progressError: string | null = null;

  if (userId) {
    try {
      const progress = await getBookReadingProgress(userId, bookId);
      if (progress) {
        return { book: ensureProgressBookShape(progress), progressError };
      }

      const syncedBook = await syncBookWithAPI(userId, bookId);
      if (syncedBook) {
        return {
          book: ensureProgressBookShape({
            ...syncedBook,
            isCompleted: syncedBook.progressPercent >= 100,
          } as BookWithProgress),
          progressError,
        };
      }
    } catch (error) {
      console.error("[fetchBookDetail] Error loading progress:", error);
      progressError =
        (error as Error)?.message ?? "Impossible de récupérer votre progression pour le moment.";
    }
  }

  return {
    book: createBaseBookWithProgress(baseBook, userId),
    progressError,
  };
};
