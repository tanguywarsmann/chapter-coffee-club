
import { supabase } from "@/integrations/supabase/client";
import { ReadingProgress } from "@/types/reading";
import { Database } from "@/integrations/supabase/types";
import { getBookById } from "@/services/books/bookQueries";
import { PAGES_PER_SEGMENT, WORDS_PER_SEGMENT } from "@/utils/constants";

type ReadingProgressRecord = Database['public']['Tables']['reading_progress']['Row'];
type BookRecord = Database['public']['Tables']['books']['Row'];
type ReadingValidationRecord = Database['public']['Tables']['reading_validations']['Row'];

// Type sans champs dérivés pour l'entrée de addDerivedFields
type BaseReadingProgress = Omit<ReadingProgress, 'progressPercent' | 'chaptersRead' | 'nextSegmentPage'>;

// Cache pour les données de progression de lecture
const progressCache = new Map<string, { 
  data: ReadingProgress[], 
  timestamp: number 
}>();
const CACHE_DURATION = 30000; // 30 secondes (réduit de 60000)

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
 * Calcule les champs dérivés pour une progression de lecture
 * @param item Progression de lecture à enrichir
 * @returns Progression de lecture avec champs dérivés
 */
function addDerivedFields(item: BaseReadingProgress): ReadingProgress {
  const { total_pages, current_page, expected_segments } = item;

  // Détecter l'unité : mots si current_page > total_pages * 2
  const isWordMode = current_page > total_pages * 2;

  const segmentsRead = isWordMode
    ? Math.floor(current_page / WORDS_PER_SEGMENT)
    : Math.floor(current_page / PAGES_PER_SEGMENT);

  const totalSegments =
    expected_segments ??
    Math.ceil(total_pages / PAGES_PER_SEGMENT);

  const clampedSegments = Math.min(segmentsRead, totalSegments);

  return {
    ...item,
    chaptersRead: clampedSegments,
    progressPercent: Math.round(
      (clampedSegments / totalSegments) * 100
    ),
    nextSegmentPage:
      isWordMode
        ? current_page + WORDS_PER_SEGMENT
        : current_page + PAGES_PER_SEGMENT,
  };
}

/**
 * Récupère la progression de lecture d'un utilisateur
 * @param userId Identifiant de l'utilisateur
 * @returns Liste des progressions de lecture avec champs dérivés
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
    const enrichedProgress = await Promise.all(
      data.map(async (item: ReadingProgressRecord) => {
        const book = await getBookById(item.book_id);
        const baseProgress = {
          ...item,
          total_chapters: book?.totalChapters ?? book?.expectedSegments ?? 1,
          book_title: book?.title ?? "Titre inconnu",
          book_author: book?.author ?? "Auteur inconnu",
          book_slug: book?.slug ?? "slug inconnu",
          book_cover: book?.cover_url ?? book?.coverImage ?? "",
          validations: [],
        };
        
        // Ajouter les champs dérivés
        return addDerivedFields(baseProgress);
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

    const baseProgress = {
      ...data,
      total_chapters: book?.totalChapters ?? book?.expectedSegments ?? 1,
      book_title: book?.title ?? "Titre inconnu",
      book_author: book?.author ?? "Auteur inconnu",
      book_slug: book?.slug ?? "slug inconnu",
      book_cover: book?.cover_url ?? book?.coverImage ?? "",
      validations: [],
    };

    // Ajouter les champs dérivés
    return addDerivedFields(baseProgress);
  } catch (error) {
    console.error("Erreur dans getBookReadingProgress:", error);
    return null;
  }
};
