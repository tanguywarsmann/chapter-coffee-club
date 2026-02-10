
import { supabase } from "@/integrations/supabase/client";
import { getBookById } from "@/services/books/bookQueries";
import { addDerivedFields } from "./addDerivedFields";
import { progressCache, CACHE_DURATION } from "./progressCache";
import { BookWithProgress, ReadingProgressRow, ReadingProgress } from "@/types/reading";

// FIX P0-4: Réduire retries pour éviter blocage trop long
const MAX_RETRIES = 2; // Réduit de 3 à 2 (max ~7s au lieu de ~15s)
const INITIAL_RETRY_DELAY = 1000;
const REQUEST_TIMEOUT = 10000; // 10 seconds timeout

/**
 * Wrapper to add timeout to any promise
 */
async function fetchWithTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = REQUEST_TIMEOUT
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error(`Request timeout after ${timeoutMs}ms`)), timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]);
}

async function fetchWithRetry<T>(
  fn: () => Promise<T>,
  retries = MAX_RETRIES,
  delay = INITIAL_RETRY_DELAY
): Promise<T> {
  try {
    // Add timeout wrapper around the function
    return await fetchWithTimeout(fn());
  } catch (error: any) {
    // Identifier les erreurs réseau retryables
    const isRetryable =
      error?.message?.includes('fetch') ||
      error?.message?.includes('timeout') ||
      error?.code === 'PGRST301' || // Supabase timeout
      error?.code === '429' || // Rate limit
      error?.status === 500 || // Server error
      error?.status === 503; // Service unavailable

    if (retries > 0 && isRetryable) {
      console.log(`[Retry] Attempt ${MAX_RETRIES - retries + 1}/${MAX_RETRIES} after ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return fetchWithRetry(fn, retries - 1, delay * 2); // Exponential backoff
    }

    throw error;
  }
}

// DEBUG flag - set to true ONLY when actively debugging
const DEBUG_PROGRESS = false;

/**
 * Options for pagination in getUserReadingProgress
 */
export interface ProgressQueryOptions {
  limit?: number;
  offset?: number;
}

/**
 * Get user reading progress (with public API and pagination support)
 * @param userId User ID to fetch progress for
 * @param options Optional pagination parameters (limit, offset)
 */
export const getUserReadingProgress = async (
  userId: string,
  options?: ProgressQueryOptions
): Promise<ReadingProgress[]> => {
  if (!userId) {
    return [];
  }

  const validUuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!validUuidPattern.test(userId)) {
    return [];
  }

  // Check cache first (only for non-paginated requests)
  const cacheKey = options?.limit || options?.offset ? `${userId}-${options.limit}-${options.offset}` : userId;
  const cached = progressCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    // FIX P0-2: Wrap Supabase call with retry logic
    const { data, error } = await fetchWithRetry(async () => {
      let query = supabase
        .from("reading_progress")
        .select(`
          *,
          books(
            id, slug, title, author, cover_url, total_chapters, expected_segments
          )
        `)
        .eq("user_id", userId);

      // Apply pagination if specified
      if (options?.limit) {
        query = query.limit(options.limit);
      }
      if (options?.offset) {
        const endRange = options.offset + (options.limit || 10) - 1;
        query = query.range(options.offset, endRange);
      }

      const result = await query;

      if (result.error) {
        throw result.error; // Throw to trigger retry
      }

      return result;
    });

    if (error) {
      console.error("Erreur dans getUserReadingProgress (jointure):", error);
      return getUserReadingProgressLegacy(userId);
    }

    if (!data || data.length === 0) {
      return [];
    }

    // FIX N+1: Fetch ALL validated segment counts in ONE query
    const bookIds = data.map(item => item.book_id);
    const { getAllValidatedSegmentCounts } = await import('./validatedSegmentCount');
    const validatedCounts = await getAllValidatedSegmentCounts(userId, bookIds);

    if (DEBUG_PROGRESS) {
      console.log(`✅ Fetched validation counts for ${bookIds.length} books in ONE query`);
    }

    const enriched = await Promise.all(data.map(async (item: any) => {
      const book = item.books;

      const baseProgress = {
        ...item,
        ...(book as any),
        total_chapters: (book as any)?.total_chapters ?? (book as any)?.expected_segments ?? 1,
        book_title: (book as any)?.title ?? "Titre inconnu",
        book_author: (book as any)?.author ?? "Auteur inconnu",
        book_slug: (book as any)?.slug ?? "slug inconnu",
        book_cover: (book as any)?.cover_url ?? "",
        validations: [],
      };

      // FIX N+1: Pass precomputed count instead of fetching per-book
      const validatedCount = validatedCounts[item.book_id] || 0;
      const enrichedItem = await addDerivedFields(baseProgress, undefined, validatedCount);
      return enrichedItem;
    }));

    // Cache result (using the same cache key as lookup)
    progressCache.set(cacheKey, { data: enriched, timestamp: Date.now() });
    return enriched;
  } catch (error) {
    console.error("Erreur dans getUserReadingProgress:", error);
    return [];
  }
};

// Fallback legacy
const getUserReadingProgressLegacy = async (userId: string): Promise<ReadingProgress[]> => {
  try {
    const { data, error } = await supabase
      .from("reading_progress")
      .select("*")
      .eq("user_id", userId);
    if (error || !data) return [];
    const enriched = await Promise.all(
      data.map(async (item: ReadingProgressRow) => {
        const book = await getBookById(item.book_id);
        const baseProgress = {
          ...item,
          ...book,
          total_chapters: book?.total_chapters ?? book?.expectedSegments ?? 1,
          book_title: book?.title ?? "Titre inconnu",
          book_author: book?.author ?? "Auteur inconnu",
          book_slug: book?.slug ?? "slug inconnu",
          book_cover: book?.cover_url ?? "",
          validations: [],
        };
        return await addDerivedFields(baseProgress);
      })
    );
    return enriched;
  } catch (error) {
    console.error("Erreur dans getUserReadingProgressLegacy:", error);
    return [];
  }
};

export const getBookReadingProgress = async (userId: string, bookId: string): Promise<BookWithProgress | null> => {
  if (!userId) return null;
  const validUuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!validUuidPattern.test(userId)) return null;
  try {
    // FIX P0-2: Wrap Supabase call with retry logic
    const { data, error } = await fetchWithRetry(async () => {
      const result = await supabase
        .from("reading_progress")
        .select(`
          *,
          books(
            id, slug, title, author, cover_url, total_chapters, expected_segments
          )
        `)
        .eq("user_id", userId)
        .eq("book_id", bookId)
        .maybeSingle();

      if (result.error) {
        throw result.error; // Throw to trigger retry
      }

      return result;
    });

    if (error) {
      console.error("Erreur dans getBookReadingProgress (jointure):", error);
      return getBookReadingProgressLegacy(userId, bookId);
    }
    if (!data) return null;
    const book = data.books;
    if (!book) {
      const fetchedBook = await getBookById(bookId);
      if (!fetchedBook) return null;
      const baseProgress = {
        ...data,
        ...fetchedBook,
        total_chapters: fetchedBook?.total_chapters ?? fetchedBook?.expected_segments ?? 1,
        book_title: fetchedBook?.title ?? "Titre inconnu",
        book_author: fetchedBook?.author ?? "Auteur inconnu",
        book_slug: fetchedBook?.slug ?? "slug inconnu",
        book_cover: fetchedBook?.cover_url ?? "",
      };
      return await addDerivedFields(baseProgress);
    }
    const baseProgress = {
      ...data,
      ...(book as any),
      total_chapters: (book as any)?.total_chapters ?? (book as any)?.expected_segments ?? 1,
      book_title: (book as any)?.title ?? "Titre inconnu",
      book_author: (book as any)?.author ?? "Auteur inconnu",
      book_slug: (book as any)?.slug ?? "slug inconnu",
      book_cover: (book as any)?.cover_url ?? "",
      validations: [],
    };
    return await addDerivedFields(baseProgress);
  } catch (error) {
    console.error("Erreur dans getBookReadingProgress:", error);
    return null;
  }
};

const getBookReadingProgressLegacy = async (userId: string, bookId: string): Promise<BookWithProgress | null> => {
  try {
    const { data, error } = await supabase
      .from("reading_progress")
      .select("*")
      .eq("user_id", userId)
      .eq("book_id", bookId)
      .maybeSingle();
    if (error || !data) return null;
    const book = await getBookById(bookId);
    if (!book) return null;
    const baseProgress = {
      ...data,
      ...book,
      total_chapters: book?.total_chapters ?? book?.expectedSegments ?? 1,
      book_title: book?.title ?? "Titre inconnu",
      book_author: book?.author ?? "Auteur inconnu",
      book_slug: book?.slug ?? "slug inconnu",
      book_cover: book?.cover_url ?? "",
      validations: [],
    };
    return await addDerivedFields(baseProgress);
  } catch (error) {
    console.debug("Erreur dans getBookReadingProgressLegacy:", error);
    return null;
  }
};

/**
 * Filter progress by status
 */
/**
 * Get completion date for a book from reading_validations
 */
export const getBookCompletionDate = async (userId: string, bookId: string): Promise<string | null> => {
  if (!userId || !bookId) return null;

  try {
    const { data, error } = await supabase
      .from("reading_validations")
      .select("validated_at")
      .eq("user_id", userId)
      .eq("book_id", bookId)
      .order("validated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) return null;
    return data.validated_at;
  } catch (error) {
    console.error("Erreur dans getBookCompletionDate:", error);
    return null;
  }
};

export const getBooksByStatus = async (userId: string, status: "to_read" | "in_progress" | "completed"): Promise<BookWithProgress[]> => {
  if (!userId) return [];
  try {
    const { data, error } = await supabase
      .from("reading_progress")
      .select(`
        *,
        books(
          id, slug, title, author, cover_url, total_chapters, expected_segments
        )
      `)
      .eq("user_id", userId)
      .eq("status", status);
    if (error) {
      console.error("Erreur dans getBooksByStatus:", error);
      return [];
    }
    if (!data || data.length === 0) return [];
    const enriched = await Promise.all(data.map(async (item: any) => {
      const book = item.books;
      let completionDate = null;

      // For completed books, get the real completion date
      if (status === "completed") {
        completionDate = await getBookCompletionDate(userId, item.book_id);
      }

      const baseProgress = {
        ...item,
        ...(book as any),
        total_chapters: (book as any)?.total_chapters ?? (book as any)?.expected_segments ?? 1,
        book_title: (book as any)?.title ?? "Titre inconnu",
        book_author: (book as any)?.author ?? "Auteur inconnu",
        book_slug: (book as any)?.slug ?? "slug inconnu",
        book_cover: (book as any)?.cover_url ?? "",
        completed_at: completionDate,
      };
      return await addDerivedFields(baseProgress);
    }));

    return enriched;
  } catch (error) {
    console.debug("Erreur dans getBooksByStatus:", error);
    return [];
  }
};
