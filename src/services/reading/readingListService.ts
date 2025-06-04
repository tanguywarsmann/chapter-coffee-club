import { Book } from "@/types/book";
import { ReadingProgress, ReadingValidation } from "@/types/reading";
import { supabase } from "@/integrations/supabase/client";
import { bookFailureCache } from "@/utils/bookFailureCache";
import { createFallbackBook } from "@/utils/createFallbackBook";
import { Database } from "@/integrations/supabase/types";

type ReadingProgressInsert = Database['public']['Tables']['reading_progress']['Insert'];
type ReadingProgressRecord = Database['public']['Tables']['reading_progress']['Row'];
type BookRecord = Database['public']['Tables']['books']['Row'];

/**
 * Ajoute un livre à la liste de lecture avec gestion d'erreur améliorée
 */
export const addBookToReadingList = async (userId: string, book: Book): Promise<ReadingProgress | null> => {
  if (!userId || !book?.id) {
    console.error("[ERROR] addBookToReadingList: Paramètres manquants", { userId: !!userId, bookId: book?.id });
    return null;
  }

  try {
    console.log(`[DEBUG] Ajout du livre "${book.title}" (${book.id}) pour l'utilisateur ${userId}`);
    
    // Vérifier si le livre existe déjà dans la liste
    const { data: existingProgress, error: checkError } = await supabase
      .from("reading_progress")
      .select("*")
      .eq("user_id", userId)
      .eq("book_id", book.id)
      .maybeSingle();
    
    if (checkError) {
      console.error("[ERROR] Erreur lors de la vérification:", checkError);
      throw checkError;
    }
    
    if (existingProgress) {
      console.log(`[DEBUG] Le livre est déjà dans la liste (status: ${existingProgress.status})`);
      return existingProgress as ReadingProgress;
    }
    
    // Vérifier que le livre existe dans la base de données
    const { data: bookExists, error: bookError } = await supabase
      .from("books")
      .select("id, title, total_pages")
      .eq("id", book.id)
      .maybeSingle();
      
    if (bookError) {
      console.error("[ERROR] Erreur lors de la vérification du livre:", bookError);
      throw bookError;
    }
    
    if (!bookExists) {
      console.error(`[ERROR] Le livre ${book.id} n'existe pas dans la base de données`);
      throw new Error(`Le livre "${book.title}" n'existe pas dans la base de données`);
    }
    
    // Créer l'entrée de progression
    const newProgress: ReadingProgressInsert = {
      user_id: userId,
      book_id: book.id,
      total_pages: bookExists.total_pages || book.pages || 0,
      current_page: 0,
      status: "to_read",
      started_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      streak_current: 0,
      streak_best: 0
    };
    
    console.log(`[DEBUG] Insertion de la progression:`, newProgress);
    
    const { data: insertedProgress, error: insertError } = await supabase
      .from("reading_progress")
      .insert(newProgress)
      .select("*")
      .single();
    
    if (insertError) {
      console.error("[ERROR] Erreur lors de l'insertion:", insertError);
      throw insertError;
    }
    
    console.log(`[DEBUG] Livre ajouté avec succès:`, insertedProgress);
    return insertedProgress as ReadingProgress;
    
  } catch (error) {
    console.error("[ERROR] Exception dans addBookToReadingList:", error);
    throw error;
  }
};

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

export const fetchBooksForStatus = async (
  readingList: ReadingProgress[],
  status: string,
  userId: string
): Promise<Book[]> => {
  console.log(`[DEBUG] getBooksByStatus démarré avec status=${status}, userId=${userId}`);
  
  if (!readingList?.length) {
    console.log(`[DEBUG] readingList vide pour status=${status}`);
    return [];
  }

  const filteredList = readingList.filter(
    item => item.user_id === userId && item.status === status
  );

  if (filteredList.length === 0) {
    console.log(`[DEBUG] Aucun livre trouvé avec status=${status}`);
    return [];
  }

  const books: Book[] = [];
  
  try {
    // Récupérer les IDs de livres
    const bookIds = [...new Set(filteredList.map(item => item.book_id))];
    
    // Récupérer tous les livres en une seule requête
    const { data: booksData, error: booksError } = await supabase
      .from("books")
      .select("id, title, author, slug, cover_url, expected_segments, total_chapters, total_pages, created_at, description, is_published, tags")
      .in("id", bookIds);

    if (booksError) {
      console.error("Error fetching books:", booksError);
    }

    // Créer une map pour un accès rapide
    const booksMap: Record<string, BookRecord> = {};
    if (booksData) {
      booksData.forEach(book => {
        booksMap[book.id] = book;
      });
    }

    // Récupérer les validations
    const { data: validationsData, error: validationsError } = await supabase
      .from("reading_validations")
      .select("*")
      .eq("user_id", userId)
      .in("book_id", bookIds);

    if (validationsError) {
      console.error("Error fetching validations:", validationsError);
    }

    // Grouper les validations par book_id
    const validationsMap: Record<string, ReadingValidation[]> = {};
    if (validationsData) {
      validationsData.forEach(validation => {
        if (!validationsMap[validation.book_id]) {
          validationsMap[validation.book_id] = [];
        }
        validationsMap[validation.book_id].push(validation);
      });
    }

    // Convertir en objets Book
    for (const item of filteredList) {
      try {
        const bookData = booksMap[item.book_id];
        const validations = validationsMap[item.book_id] || [];
        
        if (!bookData) {
          console.error(`[ERROR] Livre id=${item.book_id} non trouvé`);
          bookFailureCache.add(item.book_id);
          books.push(createFallbackBook(item, "Livre indisponible"));
          continue;
        }

        const chaptersRead = validations.length;
        const totalChapters = bookData.total_chapters || bookData.expected_segments || 1;

        const bookMeta = {
          id: item.book_id,
          title: bookData.title || "Titre inconnu",
          author: bookData.author || "Auteur inconnu",
          coverImage: bookData.cover_url || undefined,
          description: bookData.description || "",
          totalChapters: totalChapters,
          chaptersRead: chaptersRead,
          isCompleted: item.status === "completed",
          language: "",
          categories: bookData.tags || [],
          pages: bookData.total_pages || 0,
          publicationYear: 0,
          slug: bookData.slug,
          book_title: bookData.title || "Titre inconnu",
          book_author: bookData.author || "Auteur inconnu",
          book_slug: bookData.slug || "",
          book_cover: bookData.cover_url || null,
          total_chapters: totalChapters,
          created_at: bookData.created_at || new Date().toISOString(),
          is_published: bookData.is_published !== undefined ? bookData.is_published : true,
          tags: bookData.tags || [],
        };

        const enriched = { ...bookMeta, ...item };
        books.push(enriched as Book);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
        console.error(`[ERROR] Exception lors du traitement du livre id=${item.book_id}:`, error);
        bookFailureCache.add(item.book_id);
        books.push(createFallbackBook(item, errorMessage));
      }
    }

    console.log(`[DEBUG] Résultat final pour status=${status}: ${books.length} livres`);
    return books;
  } catch (error) {
    console.error(`[ERROR] Exception générale dans fetchBooksForStatus:`, error);
    return filteredList.map(item => createFallbackBook(item, "Erreur lors de la récupération"));
  }
};
