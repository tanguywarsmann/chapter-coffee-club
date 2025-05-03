
import { supabase } from "@/integrations/supabase/client";
import { ReadingProgress, ReadingValidation } from "@/types/reading";

export const getUserReadingProgress = async (userId: string): Promise<ReadingProgress[]> => {
  if (!userId) return [];

  const validUuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!validUuidPattern.test(userId)) return [];

  try {
    console.log("Fetching reading progress for user:", userId);
    
    // 1. Récupérer toutes les progressions de lecture
    const { data: progressData, error: progressError } = await supabase
      .from("reading_progress")
      .select("*")
      .eq("user_id", userId);

    if (progressError) {
      console.error("Error fetching reading progress:", progressError);
      return [];
    }

    if (!progressData || progressData.length === 0) {
      console.log("No reading progress found for user:", userId);
      return [];
    }

    // 2. Récupérer les IDs de livres pour les requêtes suivantes
    const bookIds = [...new Set(progressData.map(item => item.book_id))];
    
    // 3. Récupérer tous les livres correspondants en une seule requête
    const { data: booksData, error: booksError } = await supabase
      .from("books")
      .select("id, title, author, slug, cover_url, expected_segments, total_chapters")
      .in("id", bookIds);

    if (booksError) {
      console.error("Error fetching books:", booksError);
    }

    // Créer une map pour un accès rapide aux données des livres
    const booksMap = (booksData || []).reduce((map, book) => {
      map[book.id] = book;
      return map;
    }, {});

    // 4. Récupérer toutes les validations pour cet utilisateur et ces livres
    const { data: validationsData, error: validationsError } = await supabase
      .from("reading_validations")
      .select("*")
      .eq("user_id", userId)
      .in("book_id", bookIds);

    if (validationsError) {
      console.error("Error fetching validations:", validationsError);
    }

    // Grouper les validations par book_id pour un accès facile
    const validationsMap = (validationsData || []).reduce((map, validation) => {
      if (!map[validation.book_id]) {
        map[validation.book_id] = [];
      }
      map[validation.book_id].push(validation);
      return map;
    }, {});

    // 5. Enrichir chaque item de progression avec les données du livre et les validations
    const enrichedProgresses = progressData.map(progress => {
      const book = booksMap[progress.book_id];
      const validations = validationsMap[progress.book_id] || [];
      
      return {
        ...progress,
        book_title: book?.title ?? "Titre inconnu",
        book_author: book?.author ?? "Auteur inconnu",
        book_slug: book?.slug ?? "",
        book_cover: book?.cover_url ?? null,
        total_chapters: book?.total_chapters ?? book?.expected_segments ?? 1,
        validations: validations
      };
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

  try {
    // 1. Récupérer la progression de lecture spécifique
    const { data: progress, error: progressError } = await supabase
      .from("reading_progress")
      .select("*")
      .eq("user_id", userId)
      .eq("book_id", bookId)
      .maybeSingle();

    if (progressError) {
      console.error("Error fetching book reading progress:", progressError);
      return null;
    }

    // If no progress record exists yet, return null (first time viewing the book)
    if (!progress) {
      console.log(`No reading progress found for user ${userId} and book ${bookId}`);
      return null;
    }

    // 2. Récupérer les informations du livre
    const { data: book, error: bookError } = await supabase
      .from("books")
      .select("title, author, slug, cover_url, expected_segments, total_chapters")
      .eq("id", bookId)
      .maybeSingle();

    if (bookError) {
      console.error("Error fetching book:", bookError);
    }

    // 3. Récupérer les validations pour ce livre et cet utilisateur
    const { data: validations, error: validationsError } = await supabase
      .from("reading_validations")
      .select("*")
      .eq("user_id", userId)
      .eq("book_id", bookId);

    if (validationsError) {
      console.error("Error fetching validations:", validationsError);
    }

    // 4. Construire l'objet enrichi
    return {
      ...progress,
      book_title: book?.title ?? "Titre inconnu",
      book_author: book?.author ?? "Auteur inconnu",
      book_slug: book?.slug ?? "",
      book_cover: book?.cover_url ?? null,
      total_chapters: book?.total_chapters ?? book?.expected_segments ?? 1,
      validations: validations || []
    };
  } catch (error) {
    console.error("Error in getBookReadingProgress:", error);
    return null;
  }
};
