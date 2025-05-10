
import { supabase } from "@/integrations/supabase/client";
import { ReadingProgress, ReadingValidation } from "@/types/reading";

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
        validations:reading_validations(*)
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

    // Liste des statuts valides pour éviter les erreurs de type
    const validStatuses = ['to_read', 'in_progress', 'completed'] as const;
    type ValidStatus = typeof validStatuses[number];

    // Transformer les données pour correspondre à l'attendu par l'application
    const enrichedProgresses: ReadingProgress[] = progressData.map(item => {
      const book = item.books;
      const validations = Array.isArray(item.validations) ? item.validations : [];

      // Calcul des pages
      const totalPages = item.total_pages || book?.total_chapters || book?.expected_segments || 1;
      const currentPage = item.current_page || 0;

      // Déterminer le statut à partir de la progression en pages
      let updatedStatus: ValidStatus = 'to_read';

      if (validations.length > 0) {
        // Si au moins une validation existe, le livre est au minimum en cours
        updatedStatus = 'in_progress';
        
        // Si toutes les validations sont présentes, le livre est terminé
        if (validations.length >= totalPages) {
          updatedStatus = 'completed';
        }
      } else if (currentPage > 0 && currentPage < totalPages) {
        updatedStatus = 'in_progress';
      } else if (currentPage >= totalPages) {
        updatedStatus = 'completed';
      }

      // Mettre à jour le statut en base si nécessaire
      if (updatedStatus !== item.status) {
        updateProgressStatus(item.id, updatedStatus).catch(console.error);
      }

      return {
        ...item,
        book_title: book?.title ?? "Titre inconnu",
        book_author: book?.author ?? "Auteur inconnu",
        book_slug: book?.slug ?? "",
        book_cover: book?.cover_url ?? null,
        total_chapters: totalPages,
        expected_segments: book?.expected_segments,
        validations: validations as ReadingValidation[],
        status: updatedStatus,
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

const updateProgressStatus = async (progressId: string, newStatus: 'to_read' | 'in_progress' | 'completed'): Promise<void> => {
  try {
    await supabase
      .from("reading_progress")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", progressId);
  } catch (error) {
    console.error("Error updating progress status:", error);
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
    // Liste des statuts valides
    const validStatuses = ['to_read', 'in_progress', 'completed'] as const;
    type ValidStatus = typeof validStatuses[number];
    
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
        validations:reading_validations(*)
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
    
    // Recalculer le statut en fonction des validations
    const totalExpectedSegments = book?.total_chapters ?? book?.expected_segments ?? 1;
    let updatedStatus: ValidStatus = 'to_read';
    
    if (validations.length > 0) {
      // Au moins une validation = in_progress
      updatedStatus = 'in_progress';
      // Toutes les validations = completed
      if (validations.length >= totalExpectedSegments) {
        updatedStatus = 'completed';
      }
    } else {
      // Aucune validation, vérifier le statut actuel
      if (typeof data.status === 'string' && validStatuses.includes(data.status as ValidStatus)) {
        updatedStatus = data.status as ValidStatus;
      } else {
        updatedStatus = 'to_read';
      }
    }
    
    // Si le statut calculé est différent, on met à jour en base
    if (updatedStatus !== data.status) {
      updateProgressStatus(data.id, updatedStatus).catch(console.error);
    }
    
    const enrichedProgress: ReadingProgress = {
      ...data,
      book_title: book?.title ?? "Titre inconnu",
      book_author: book?.author ?? "Auteur inconnu",
      book_slug: book?.slug ?? "",
      book_cover: book?.cover_url ?? null,
      total_chapters: book?.total_chapters ?? book?.expected_segments ?? 1,
      validations: validations as ReadingValidation[],
      status: updatedStatus
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
