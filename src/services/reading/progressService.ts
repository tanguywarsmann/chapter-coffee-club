
import { supabase } from "@/integrations/supabase/client";
import { BookWithProgress, ReadingProgressRow, ReadingProgress } from "@/types/reading";
import { Database } from "@/integrations/supabase/types";
import { getBookById } from "@/services/books/bookQueries";
import { PAGES_PER_SEGMENT, WORDS_PER_SEGMENT } from "@/utils/constants";
import { Book } from "@/types/reading";

type ReadingProgressRecord = Database['public']['Tables']['reading_progress']['Row'];
type BookRecord = Database['public']['Tables']['books']['Row'];
type ReadingValidationRecord = Database['public']['Tables']['reading_validations']['Row'];
type ProgressRow = Database["public"]["Tables"]["reading_progress"]["Row"];
type ReadingProgressStatus = "to_read" | "in_progress" | "completed";

// Cache pour les données de progression de lecture
const progressCache = new Map<string, { 
  data: ReadingProgress[], 
  timestamp: number 
}>();
const CACHE_DURATION = 30000; // 30 secondes

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
 * Récupère le nombre réel de segments validés pour un livre et un utilisateur
 * @param userId Identifiant de l'utilisateur
 * @param bookId Identifiant du livre
 * @returns Nombre de segments validés
 */
async function getValidatedSegmentCount(userId: string, bookId: string): Promise<number> {
  try {
    // Compter les segments validés dans reading_validations
    const { count, error } = await supabase
      .from('reading_validations')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('book_id', bookId);
    
    if (error) {
      console.error('[getValidatedSegmentCount] Error:', error);
      return 0;
    }
    
    return count || 0;
  } catch (error) {
    console.error('[getValidatedSegmentCount] Exception:', error);
    return 0;
  }
}

/**
 * Calcule les champs dérivés pour une progression de lecture
 * @param b Base book data
 * @param p Reading progress data (optional)
 * @returns Objet avec champs dérivés ajoutés
 */
async function addDerivedFields(b: any, p?: any): Promise<BookWithProgress> {
  const { total_pages, current_page, expected_segments, total_chapters } = b;
  
  // Détecter l'unité : mots si current_page > total_pages * 2
  const isWordMode = current_page > total_pages * 2;

  // Calculer les segments estimés à partir de la progression actuelle
  const segmentsRead = isWordMode
    ? Math.floor(current_page / WORDS_PER_SEGMENT)
    : Math.floor(current_page / PAGES_PER_SEGMENT);

  // Récupérer le nombre réel de segments validés depuis la base de données
  const validatedSegments = await getValidatedSegmentCount(p?.user_id || b.user_id, b.id || b.book_id);
  
  console.log(`[progress] Segments validés: ${validatedSegments}, segments estimés: ${segmentsRead}`);

  const expectedSegments = b.expected_segments ?? total_chapters ?? 1;
  const totalSegments = expectedSegments;

  // Utiliser le minimum entre les segments calculés et les segments réellement validés
  const clampedSegments = Math.min(
    Math.min(segmentsRead, validatedSegments), 
    totalSegments
  );
  
  return {
    ...b,
    ...p,  // Include all reading progress fields (status, updated_at, etc.)
    
    // Derived fields
    coverImage: b.cover_url,         // alias for cover_url
    expectedSegments,                // camelCase alias
    totalSegments,
    chaptersRead: clampedSegments,
    progressPercent: Math.round((clampedSegments / (totalSegments || 1)) * 100),
    nextSegmentPage: isWordMode
      ? (clampedSegments + 1) * WORDS_PER_SEGMENT
      : (clampedSegments + 1) * PAGES_PER_SEGMENT,
    currentSegment: clampedSegments,
      
    // Legacy aliases for compatibility
    book_id: b.id,
    book_title: b.title,
    book_author: b.author,
    book_cover: b.cover_url,
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
    // Tentative de récupération avancée avec jointure
    const { data, error } = await supabase
      .from("reading_progress")
      .select(`
        *,
        books:book_id (*)
      `)
      .eq("user_id", userId);

    if (error) {
      console.error("Erreur dans getUserReadingProgress (jointure):", error);
      // Fallback à la méthode antérieure en cas d'échec
      return getUserReadingProgressLegacy(userId);
    }

    if (!data || data.length === 0) return [];

    // Transformer les données jointes en format BookWithProgress
    // Modifié: Utilisation de Promise.all pour gérer les promesses de addDerivedFields
    const enrichedProgress = await Promise.all(data.map(async (item: any) => {
      const book = item.books;
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
    }));

    return enrichedProgress;
  } catch (error) {
    console.error("Erreur dans getUserReadingProgress:", error);
    return [];
  }
};

/**
 * Méthode legacy pour récupérer la progression (fallback)
 */
const getUserReadingProgressLegacy = async (userId: string): Promise<ReadingProgress[]> => {
  try {
    const { data, error } = await supabase
      .from("reading_progress")
      .select("*")
      .eq("user_id", userId);

    if (error || !data) return [];

    // Récupération et enrichissement des données avec total_chapters
    // Modifié: Utilisation de Promise.all pour gérer les promesses de addDerivedFields
    const enrichedProgress = await Promise.all(
      data.map(async (item: ReadingProgressRecord) => {
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
        
        // Ajouter les champs dérivés - maintenant avec await
        return await addDerivedFields(baseProgress);
      })
    );

    return enrichedProgress;
  } catch (error) {
    console.error("Erreur dans getUserReadingProgressLegacy:", error);
    return [];
  }
};

/**
 * Récupère la progression de lecture d'un livre pour un utilisateur
 * @param userId Identifiant de l'utilisateur
 * @param bookId Identifiant du livre
 * @returns Progression de lecture ou null
 */
export const getBookReadingProgress = async (userId: string, bookId: string): Promise<BookWithProgress | null> => {
  if (!userId) return null;

  const validUuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!validUuidPattern.test(userId)) return null;

  try {
    // Tentative de récupération avec jointure
    const { data, error } = await supabase
      .from("reading_progress")
      .select(`
        *,
        books:book_id (*)
      `)
      .eq("user_id", userId)
      .eq("book_id", bookId)
      .maybeSingle();

    if (error) {
      console.error("Erreur dans getBookReadingProgress (jointure):", error);
      // Fallback à la méthode antérieure
      return getBookReadingProgressLegacy(userId, bookId);
    }

    if (!data) return null;

    const book = data.books;
    if (!book) {
      const fetchedBook = await getBookById(bookId);
      if (!fetchedBook) return null;
      
      // If we have progress but no book via join, use fetched book
      const baseProgress = {
        ...data,
        ...fetchedBook,
        total_chapters: fetchedBook?.total_chapters ?? fetchedBook?.expected_segments ?? 1,
        book_title: fetchedBook?.title ?? "Titre inconnu",
        book_author: fetchedBook?.author ?? "Auteur inconnu",
        book_slug: fetchedBook?.slug ?? "slug inconnu",
        book_cover: fetchedBook?.cover_url ?? "",
      };
      
      // Modifié: Utilisation de await pour addDerivedFields
      return await addDerivedFields(baseProgress);
    }
    
    // If we have the joined book data
    const baseProgress = {
      ...data,
      ...book,
      total_chapters: book?.total_chapters ?? book?.expected_segments ?? 1,
      book_title: book?.title ?? "Titre inconnu",
      book_author: book?.author ?? "Auteur inconnu",
      book_slug: book?.slug ?? "slug inconnu", 
      book_cover: book?.cover_url ?? "",
      validations: [],
    };
    
    // Modifié: Utilisation de await pour addDerivedFields
    return await addDerivedFields(baseProgress);
  } catch (error) {
    console.error("Erreur dans getBookReadingProgress:", error);
    return null;
  }
};

/**
 * Méthode legacy pour récupérer la progression d'un livre (fallback)
 */
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

    // Modifié: Utilisation de await pour addDerivedFields
    return await addDerivedFields(baseProgress);
  } catch (error) {
    console.debug("Erreur dans getBookReadingProgressLegacy:", error);
    return null;
  }
};

/**
 * Récupère les livres selon leur statut
 * @param userId Identifiant de l'utilisateur
 * @param status Statut des livres à récupérer
 * @returns Liste des livres avec progression
 */
export const getBooksByStatus = async (userId: string, status: "to_read" | "in_progress" | "completed"): Promise<BookWithProgress[]> => {
  if (!userId) return [];

  try {
    const { data, error } = await supabase
      .from("reading_progress")
      .select(`
        *,
        books:book_id (*)
      `)
      .eq("user_id", userId)
      .eq("status", status);

    if (error) {
      console.error("Erreur dans getBooksByStatus:", error);
      return [];
    }

    if (!data || data.length === 0) return [];

    // Modifié: Utilisation de Promise.all pour gérer les promesses de addDerivedFields
    const enrichedBooks = await Promise.all(data.map(async (item: any) => {
      const book = item.books;
      const baseProgress = {
        ...item,
        ...book,
        total_chapters: book?.total_chapters ?? book?.expectedSegments ?? 1,
        book_title: book?.title ?? "Titre inconnu",
        book_author: book?.author ?? "Auteur inconnu",
        book_slug: book?.slug ?? "slug inconnu",
        book_cover: book?.cover_url ?? "",
      };
      
      return await addDerivedFields(baseProgress);
    }));

    return enrichedBooks;
  } catch (error) {
    console.debug("Erreur dans getBooksByStatus:", error);
    return [];
  }
};

