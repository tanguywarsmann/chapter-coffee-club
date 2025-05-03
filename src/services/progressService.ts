
import { supabase } from "@/integrations/supabase/client";
import { ReadingProgress } from "@/types/reading";
import { getBookById } from "@/services/bookService"; // Make sure this import exists

export const getUserReadingProgress = async (userId: string): Promise<ReadingProgress[]> => {
  if (!userId) return [];

  const validUuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!validUuidPattern.test(userId)) return [];

  try {
    const { data: progressData, error } = await supabase
      .from("reading_progress")
      .select("*")
      .eq("user_id", userId);

    if (error || !progressData) return [];

    // Get all book IDs from progress data
    const bookIds = [...new Set(progressData.map(item => item.book_id))];

    // Fetch all books in one query for better performance
    const { data: booksData, error: booksError } = await supabase
      .from("books")
      .select("id, title, author, slug, cover_url, expected_segments, total_chapters")
      .in("id", bookIds);

    if (booksError) {
      console.error("Error fetching books:", booksError);
    }

    // Create a map of books for quick lookups
    const booksMap = (booksData || []).reduce((map, book) => {
      map[book.id] = book;
      return map;
    }, {});

    // Enrich progress data with book information
    const enrichedProgress = progressData.map((item) => {
      const book = booksMap[item.book_id];
      
      return {
        ...item,
        book_title: book?.title ?? "Titre inconnu",
        book_author: book?.author ?? "Auteur inconnu",
        book_slug: book?.slug ?? "",
        book_cover: book?.cover_url ?? null,
        total_chapters: book?.total_chapters ?? book?.expected_segments ?? 1,
        validations: [],
      };
    });

    return enrichedProgress;
  } catch (error) {
    console.error("Error in getUserReadingProgress:", error);
    return [];
  }
};

export const getBookReadingProgress = async (userId: string, bookId: string): Promise<ReadingProgress | null> => {
  if (!userId) return null;

  const validUuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!validUuidPattern.test(userId)) return null;

  try {
    const { data, error } = await supabase
      .from("reading_progress")
      .select("*")
      .eq("user_id", userId)
      .eq("book_id", bookId)
      .maybeSingle();

    if (error || !data) return null;

    // Get book information
    const { data: bookData, error: bookError } = await supabase
      .from("books")
      .select("title, author, slug, cover_url, expected_segments, total_chapters")
      .eq("id", bookId)
      .maybeSingle();

    if (bookError) {
      console.error("Error fetching book:", bookError);
    }

    return {
      ...data,
      book_title: bookData?.title ?? "Titre inconnu",
      book_author: bookData?.author ?? "Auteur inconnu",
      book_slug: bookData?.slug ?? "",
      book_cover: bookData?.cover_url ?? null,
      total_chapters: bookData?.total_chapters ?? bookData?.expected_segments ?? 1,
      validations: [],
    };
  } catch (error) {
    console.error("Error in getBookReadingProgress:", error);
    return null;
  }
};
