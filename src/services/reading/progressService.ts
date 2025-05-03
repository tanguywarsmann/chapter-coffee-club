import { supabase } from "@/integrations/supabase/client";
import { ReadingProgress } from "@/types/reading";
import { getBookById } from "@/services/bookService"; // Assure-toi que cette fonction existe

export const getUserReadingProgress = async (userId: string): Promise<ReadingProgress[]> => {
  if (!userId) return [];

  const validUuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!validUuidPattern.test(userId)) return [];

  try {
    const { data, error } = await supabase
      .from("reading_progress")
      .select("*")
      .eq("user_id", userId);

    if (error || !data) return [];

    // Récupération et enrichissement des données avec total_chapters
    const enrichedProgress = await Promise.all(
      data.map(async (item) => {
        const book = await getBookById(item.book_id); // Récupération du livre associé
        return {
          ...item,
          total_chapters: book?.total_chapters ?? book?.expected_segments ?? 1, // 👈 Ajout ici
          validations: [],
        };
      })
    );

    return enrichedProgress;
  } catch (error) {
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

    const book = await getBookById(bookId);

    return {
      ...data,
      total_chapters: book?.total_chapters ?? book?.expected_segments ?? 1,
      validations: [],
    };
  } catch (error) {
    return null;
  }
};
