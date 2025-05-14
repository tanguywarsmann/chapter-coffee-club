
import { Book } from "@/types/book";
import { ReadingProgress } from "@/types/reading";
import { supabase } from "@/integrations/supabase/client";
import { bookFailureCache } from "@/utils/bookFailureCache";
import { createFallbackBook } from "@/utils/createFallbackBook";
import { Database } from "@/integrations/supabase/types";

type ReadingProgressInsert = Database['public']['Tables']['reading_progress']['Insert'];
type ReadingProgressRecord = Database['public']['Tables']['reading_progress']['Row'];
type BookRecord = Database['public']['Tables']['books']['Row'];

const BATCH_SIZE = 3;

/**
 * Ajoute un livre à la liste de lecture d'un utilisateur
 * @param userId ID de l'utilisateur
 * @param book Livre à ajouter
 * @returns Progression de lecture ou null
 */
export const addBookToReadingList = async (userId: string, book: Book): Promise<ReadingProgress | null> => {
  if (!userId || !book?.id) {
    console.error("[ERROR] addBookToReadingList: userId ou book.id manquant");
    return null;
  }

  try {
    console.log(`[DEBUG] Ajout du livre "${book.title}" (${book.id}) à la liste de lecture de l'utilisateur ${userId}`);
    
    // Vérifier si une entrée existe déjà pour ce livre et cet utilisateur
    const { data: existingProgress, error: checkError } = await supabase
      .from("reading_progress")
      .select("*")
      .eq("user_id", userId)
      .eq("book_id", book.id)
      .maybeSingle();
    
    if (checkError) {
      console.error("[ERROR] Erreur lors de la vérification du livre dans la liste:", checkError);
      throw checkError;
    }
    
    // Si une entrée existe déjà, retourner cette entrée sans rien faire
    if (existingProgress) {
      console.log(`[DEBUG] Le livre est déjà dans la liste de lecture (status: ${existingProgress.status})`);
      return existingProgress as ReadingProgress;
    }
    
    // Créer une nouvelle entrée dans reading_progress
    const newProgress: ReadingProgressInsert = {
      user_id: userId,
      book_id: book.id,
      total_pages: book.pages || 0,
      current_page: 0,
      status: "to_read",
      started_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      streak_current: 0,
      streak_best: 0
    };
    
    const { data: insertedProgress, error: insertError } = await supabase
      .from("reading_progress")
      .insert(newProgress)
      .select("*")
      .single();
    
    if (insertError) {
      console.error("[ERROR] Erreur lors de l'ajout du livre à la liste:", insertError);
      throw insertError;
    }
    
    console.log(`[DEBUG] Livre ajouté avec succès à la liste de lecture:`, insertedProgress);
    return insertedProgress as ReadingProgress;
  } catch (error) {
    console.error("[ERROR] Exception dans addBookToReadingList:", error);
    throw error;
  }
};

/**
 * Récupère la progression de lecture pour un utilisateur
 * @param userId ID de l'utilisateur
 * @returns Liste des progressions de lecture
 */
export const fetchReadingProgress = async (userId: string): Promise<ReadingProgress[]> => {
  if (!userId) {
    return [];
  }

  try {
    const { data: readingProgressData, error } = await supabase
      .from("reading_progress")
      .select("*")
      .eq("user_id", userId);

    if (error) {
      throw error;
    }

    return readingProgressData as ReadingProgress[] || [];
  } catch (error) {
    console.error("[ERROR] Exception dans fetchReadingProgress:", error);
    throw error;
  }
};

/**
 * Récupère les livres pour un statut spécifique
 * @param readingList Liste des progressions de lecture
 * @param status Statut à filtrer
 * @param userId ID de l'utilisateur
 * @returns Liste des livres correspondant au statut
 */
export const fetchBooksForStatus = async (
  readingList: ReadingProgress[],
  status: string,
  userId: string
): Promise<Book[]> => {
  console.log(`[DEBUG] getBooksByStatus démarré avec status=${status}, userId=${userId}`);
  
  if (!readingList?.length) {
    console.log(`[DEBUG] readingList vide ou invalide pour status=${status}`);
    return [];
  }

  const filteredList = readingList.filter(
    item => item.user_id === userId && item.status === status
  );

  console.log(`[DEBUG] filteredList pour status=${status}:`, JSON.stringify(filteredList));
  
  if (filteredList.length === 0) {
    console.log(`[DEBUG] Aucun livre trouvé avec status=${status} pour userId=${userId}`);
    return [];
  }

  const books: Book[] = [];
  
  try {
    // 1. Récupérer les IDs de livres pour les requêtes suivantes
    const bookIds = [...new Set(filteredList.map(item => item.book_id))];
    
    // 2. Récupérer tous les livres correspondants en une seule requête
    const { data: booksData, error: booksError } = await supabase
      .from("books")
      .select("id, title, author, slug, cover_url, expected_segments, total_chapters, total_pages")
      .in("id", bookIds);

    if (booksError) {
      console.error("Error fetching books:", booksError);
      // Continue with what we have
    }

    // Créer une map pour un accès rapide aux données des livres
    const booksMap: Record<string, BookRecord> = {};
    if (booksData) {
      booksData.forEach(book => {
        booksMap[book.id] = book;
      });
    }

    // 3. Récupérer toutes les validations pour cet utilisateur et ces livres
    const { data: validationsData, error: validationsError } = await supabase
      .from("reading_validations")
      .select("*")
      .eq("user_id", userId)
      .in("book_id", bookIds);

    if (validationsError) {
      console.error("Error fetching validations:", validationsError);
      // Continue with what we have
    }

    // Grouper les validations par book_id pour un accès facile
    const validationsMap: Record<string, ReadingValidation[]> = {};
    if (validationsData) {
      validationsData.forEach(validation => {
        if (!validationsMap[validation.book_id]) {
          validationsMap[validation.book_id] = [];
        }
        validationsMap[validation.book_id].push(validation);
      });
    }

    // 4. Convertir les données enrichies en objets Book
    for (const item of filteredList) {
      try {
        const bookData = booksMap[item.book_id];
        const validations = validationsMap[item.book_id] || [];
        
        if (!bookData && bookFailureCache.has(item.book_id)) {
          console.log(`[DEBUG] book_id=${item.book_id} dans le cache d'échec, création d'un fallback`);
          books.push(createFallbackBook(item, "Livre précédemment indisponible"));
          continue;
        }

        if (!bookData) {
          console.error(`[ERREUR] Livre id=${item.book_id} non trouvé dans la base de données`);
          bookFailureCache.add(item.book_id);
          books.push(createFallbackBook(item, "Livre indisponible"));
          continue;
        }

        // Calculer les segments/chapitres réellement lus basés sur les validations
        const chaptersRead = validations.length;
        const totalChapters = bookData.total_chapters || bookData.expected_segments || 1;

        console.log(`[DEBUG] Livre récupéré avec succès: id=${item.book_id}, title=${bookData.title}, 
                  chaptersRead=${chaptersRead}, totalChapters=${totalChapters}`);
        
        books.push({
          id: item.book_id,
          title: bookData.title || "Titre inconnu",
          author: bookData.author || "Auteur inconnu",
          coverImage: bookData.cover_url || undefined,
          description: "", // Could be fetched if needed
          totalChapters: totalChapters,
          chaptersRead: chaptersRead,
          isCompleted: item.status === "completed",
          language: "", // Not available in the current query
          categories: [],
          pages: bookData.total_pages || 0,
          publicationYear: 0, // Not available in the current query
          slug: bookData.slug,
          book_title: bookData.title || "Titre inconnu",
          book_author: bookData.author || "Auteur inconnu",
          book_slug: bookData.slug || "",
          book_cover: bookData.cover_url || null,
          total_chapters: totalChapters
        } as Book);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
        console.error(`[ERREUR] Exception lors du traitement du livre id=${item.book_id}:`, error);
        bookFailureCache.add(item.book_id);
        books.push(createFallbackBook(item, errorMessage));
      }
    }

    console.log(`[DEBUG] Résultat final pour status=${status}: ${books.length} livres enrichis récupérés`);
    return books;
  } catch (error) {
    console.error(`[ERREUR] Exception générale dans fetchBooksForStatus:`, error);
    // Return what we've got so far or fallbacks for remaining items
    if (books.length === 0) {
      // Create fallbacks for all filtered items if no books were successfully processed
      return filteredList.map(item => createFallbackBook(item, "Erreur lors de la récupération des livres"));
    }
    return books;
  }
};
