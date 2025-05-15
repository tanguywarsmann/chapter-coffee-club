
import { supabase } from "@/integrations/supabase/client";
import { ReadingProgress, ReadingValidation } from "@/types/reading";
import { Database } from "@/integrations/supabase/types";
import { getBookById } from "@/services/books/bookQueries";

type ReadingProgressRecord = Database['public']['Tables']['reading_progress']['Row'];
type BookRecord = Database['public']['Tables']['books']['Row'];
type ReadingValidationRecord = Database['public']['Tables']['reading_validations']['Row'];

// Cache pour les données de progression de lecture
const progressCache = new Map<string, { 
  data: ReadingProgress[], 
  timestamp: number 
}>();
const CACHE_DURATION = 30000; // 30 secondes (réduit de 60000)

interface EnrichedReadingProgress extends ReadingProgress {
  book_title: string;
  book_author: string;
  book_slug: string;
  book_cover: string | null;
  total_chapters: number;
  validations: ReadingValidation[];
}

type ReadingStatus = 'to_read' | 'in_progress' | 'completed';

// Définition des statuts valides pour la lecture
const validStatuses: ReadingStatus[] = ['to_read', 'in_progress', 'completed'];

/**
 * Nettoie le cache de progression pour un utilisateur ou tout le cache
 * @param userId Identifiant de l'utilisateur (optionnel)
 */
export const clearProgressCache = async (userId?: string): Promise<void> => {
  console.log(`🗑️ Clearing progress cache${userId ? ` for user ${userId}` : ' (all users)'}`);
  if (userId) {
    progressCache.delete(userId);
  } else {
    progressCache.clear();
  }
};

/**
 * Récupère la progression de lecture d'un utilisateur
 * @param userId Identifiant de l'utilisateur
 * @returns Liste des progressions de lecture
 */
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
    const enrichedProgress: EnrichedReadingProgress[] = await Promise.all(
      data.map(async (item: ReadingProgressRecord) => {
        const book = await getBookById(item.book_id);
        return {
          ...item,
          total_chapters: book?.totalChapters ?? book?.expectedSegments ?? 1,
          book_title: book?.title ?? "Titre inconnu",
          book_author: book?.author ?? "Auteur inconnu",
          book_slug: book?.slug ?? "slug inconnu",
          book_cover: book?.cover_url ?? book?.coverImage ?? "",
          validations: [],
        };
      })
    );

    return enrichedProgress;
  } catch (error) {
    console.error("Erreur dans getUserReadingProgress:", error);
    return [];
  }
};

/**
 * Récupère la progression de lecture d'un livre pour un utilisateur
 * @param userId Identifiant de l'utilisateur
 * @param bookId Identifiant du livre
 * @returns Progression de lecture ou null
 */
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
      total_chapters: book?.totalChapters ?? book?.expectedSegments ?? 1,
      book_title: book?.title ?? "Titre inconnu",
      book_author: book?.author ?? "Auteur inconnu",
      book_slug: book?.slug ?? "slug inconnu",
      book_cover: book?.cover_url ?? book?.coverImage ?? "",
      validations: [],
    };
  } catch (error) {
    console.error("Erreur dans getBookReadingProgress:", error);
    return null;
  }
};
