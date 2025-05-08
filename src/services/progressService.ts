
import { supabase } from "@/integrations/supabase/client";
import { ReadingProgress, ReadingValidation } from "@/types/reading";
import { memo } from "react";

// Cache pour les données de progression de lecture
const progressCache = new Map<string, { 
  data: ReadingProgress[], 
  timestamp: number 
}>();
const CACHE_DURATION = 60000; // 1 minute en millisecondes

export const getUserReadingProgress = async (userId: string): Promise<ReadingProgress[]> => {
  if (!userId) return [];

  const validUuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!validUuidPattern.test(userId)) return [];

  // Vérifier le cache
  const cacheKey = `progress_${userId}`;
  const cached = progressCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
    return cached.data;
  }

  try {
    console.log("Fetching reading progress for user:", userId);
    
    // Requête optimisée: une seule requête pour obtenir tous les progrès de lecture,
    // les livres associés et les validations correspondantes
    const { data: progressData, error: progressError } = await supabase
      .from("reading_progress")
      .select(`
        *,
        books:book_id (
          id, 
          title, 
          author, 
          slug, 
          cover_url, 
          expected_segments, 
          total_chapters
        ),
        validations:reading_validations (*)
      `)
      .eq("user_id", userId);

    if (progressError) {
      console.error("Error fetching reading progress:", progressError);
      return [];
    }

    if (!progressData || progressData.length === 0) {
      console.log("No reading progress found for user:", userId);
      return [];
    }

    // Transformer les données pour correspondre à l'attendu par l'application
    const enrichedProgresses: ReadingProgress[] = progressData.map(item => {
      const book = item.books;
      // S'assurer que validations est toujours un tableau
      const validations = Array.isArray(item.validations) ? item.validations : [];
      
      return {
        ...item,
        book_title: book?.title ?? "Titre inconnu",
        book_author: book?.author ?? "Auteur inconnu",
        book_slug: book?.slug ?? "",
        book_cover: book?.cover_url ?? null,
        total_chapters: book?.total_chapters ?? book?.expected_segments ?? 1,
        validations: validations as ReadingValidation[]
      };
    });

    // Mettre en cache les données récupérées
    progressCache.set(cacheKey, { 
      data: enrichedProgresses, 
      timestamp: Date.now() 
    });

    console.log(`Retrieved ${enrichedProgresses.length} enriched reading progresses`);
    return enrichedProgresses;
  } catch (error) {
    console.error("Error in getUserReadingProgress:", error);
    return [];
  }
};

export const getBookReadingProgress = async (userId: string, bookId: string): Promise<ReadingProgress | null> => {
  if (!userId) return null;

  const validUuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!validUuidPattern.test(userId)) return null;

  // Vérifier d'abord le cache global
  const cacheKey = `progress_${userId}`;
  const cached = progressCache.get(cacheKey);
  
  if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
    // Chercher dans le cache pour ce livre spécifique
    const bookProgress = cached.data.find(p => p.book_id === bookId);
    if (bookProgress) {
      return bookProgress;
    }
  }

  try {
    // Requête optimisée pour obtenir progress + book + validations en une seule requête
    const { data, error } = await supabase
      .from("reading_progress")
      .select(`
        *,
        books:book_id (
          title, 
          author, 
          slug, 
          cover_url, 
          expected_segments, 
          total_chapters
        ),
        validations:reading_validations (*)
      `)
      .eq("user_id", userId)
      .eq("book_id", bookId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching book reading progress:", error);
      return null;
    }

    // If no progress record exists yet, return null (first time viewing the book)
    if (!data) {
      console.log(`No reading progress found for user ${userId} and book ${bookId}`);
      return null;
    }

    // Construire l'objet de progression enrichi
    const book = data.books;
    // S'assurer que validations est toujours un tableau
    const validations = Array.isArray(data.validations) ? data.validations : [];
    
    const enrichedProgress: ReadingProgress = {
      ...data,
      book_title: book?.title ?? "Titre inconnu",
      book_author: book?.author ?? "Auteur inconnu",
      book_slug: book?.slug ?? "",
      book_cover: book?.cover_url ?? null,
      total_chapters: book?.total_chapters ?? book?.expected_segments ?? 1,
      validations: validations as ReadingValidation[]
    };

    return enrichedProgress;
  } catch (error) {
    console.error("Error in getBookReadingProgress:", error);
    return null;
  }
};

// Fonction pour effacer le cache de progression
export const clearProgressCache = (userId?: string, bookId?: string) => {
  if (userId) {
    const cacheKey = `progress_${userId}`;
    progressCache.delete(cacheKey);
  } else {
    // Si aucun userId n'est spécifié, vider tout le cache
    progressCache.clear();
  }
};
