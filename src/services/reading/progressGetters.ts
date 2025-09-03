
import { supabase } from "@/integrations/supabase/client";
import { getBookById } from "@/services/books/bookQueries";
import { addDerivedFields } from "./addDerivedFields";
import { progressCache, CACHE_DURATION } from "./progressCache";
import { BookWithProgress, ReadingProgressRow, ReadingProgress } from "@/types/reading";

/**
 * Get user reading progress (with public API)
 */
export const getUserReadingProgress = async (userId: string): Promise<ReadingProgress[]> => {
  if (!userId) return [];
  const validUuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!validUuidPattern.test(userId)) return [];

  // Check cache first
  const cached = progressCache.get(userId);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    // Advanced fetch with join
    const { data, error } = await supabase
      .from("reading_progress")
      .select(`
        *,
        books:books_public(
          id, slug, title, author, cover_url, total_chapters, expected_segments
        )
      `)
      .eq("user_id", userId);
    if (error) {
      console.error("Erreur dans getUserReadingProgress (jointure):", error);
      return getUserReadingProgressLegacy(userId);
    }
    if (!data || data.length === 0) return [];
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
      return await addDerivedFields(baseProgress);
    }));
    progressCache.set(userId, { data: enriched, timestamp: Date.now() });
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
    const { data, error } = await supabase
      .from("reading_progress")
      .select(`
        *,
        books:books_public(
          id, slug, title, author, cover_url, total_chapters, expected_segments
        )
      `)
      .eq("user_id", userId)
      .eq("book_id", bookId)
      .maybeSingle();
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
        books:books_public(
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
