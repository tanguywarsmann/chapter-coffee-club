
import { Book } from '@/types/book';
import { supabase } from '@/integrations/supabase/client';
import { trackReadingListAdd } from '../analytics/readingListAnalytics';
import {
  AlreadyInListError,
  BookNotFoundError,
  InvalidBookError,
} from '@/utils/readingListErrors';
import { assertValidBook } from '@/utils/bookValidation';
import { getValidatedSegmentCount, getAllValidatedSegmentCounts } from './validatedSegmentCount';

type ProgressRow = {
  id: string;
  user_id: string;
  book_id: string;
  current_page: number;
  total_pages: number;
  status: 'to_read' | 'in_progress' | 'completed';
  updated_at?: string | null;
  started_at?: string | null;
  books?: any; // jointure books_public
};

type ReadingListPayload = {
  toRead: ProgressRow[];
  inProgress: ProgressRow[];
  completed: ProgressRow[];
  toReadCount: number;
  inProgressCount: number;
  completedCount: number;
};

function mapRows(rows: ProgressRow[]): ReadingListPayload {
  const completed = rows.filter(r => r.status === 'completed');
  const inProgress = rows.filter(r => r.status === 'in_progress');
  const toRead = rows.filter(r => r.status === 'to_read');

  return {
    toRead,
    inProgress,
    completed,
    toReadCount: toRead.length,
    inProgressCount: inProgress.length,
    completedCount: completed.length,
  };
}

/**
 * Service pour gérer la Reading List de l'utilisateur
 * Centralise les opérations d'ajout, suppression et récupération des livres
 */

export const addBookToReadingList = async (book: Book): Promise<boolean> => {
  // Validation précoce avec notre système centralisé
  assertValidBook(book as unknown);

  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.error("Utilisateur non authentifié");
      trackReadingListAdd(book.id, 'auth_required', { bookTitle: book.title });
      return false;
    }

    // Vérifier si le livre existe déjà dans la liste de lecture de l'utilisateur
    const { data: existingBook, error: selectError } = await supabase
      .from('reading_progress')
      .select('*')
      .eq('user_id', user.id)
      .eq('book_id', book.id)
      .maybeSingle();

    if (selectError) {
      console.error("Erreur lors de la vérification:", selectError);
      trackReadingListAdd(book.id, 'error', { bookTitle: book.title, errorCode: selectError.code });
      return false;
    }

    if (existingBook) {
      console.warn(`Le livre ${book.title} existe déjà dans la liste de lecture.`);
      trackReadingListAdd(book.id, 'already_exists', { bookTitle: book.title });
      throw new AlreadyInListError(book.title);
    }

    // Ajouter le livre à la reading list
    const { data, error } = await supabase
      .from('reading_progress')
      .insert([{ 
        user_id: user.id, 
        book_id: book.id, 
        status: 'to_read',
        current_page: 0,
        total_pages: book.pages || 0
      }])
      .select()
      .single();

    if (error) {
      console.error("Erreur lors de l'ajout du livre à la reading list:", error);
      trackReadingListAdd(book.id, 'error', { bookTitle: book.title, errorCode: error.code });
      return false;
    }

    console.log(`Livre ajouté à la reading list: ${book.title}`);
    trackReadingListAdd(book.id, 'success', { bookTitle: book.title, userId: user.id });
    return true;
  } catch (error) {
    console.error("Erreur inattendue lors de l'ajout du livre:", error);

    if (error instanceof AlreadyInListError) {
      throw error;
    } else if (error instanceof InvalidBookError) {
      trackReadingListAdd(book.id, 'invalid_book', { bookTitle: book.title, errorCode: error.code });
    }

    return false;
  }
};

/**
 * Lit la progression depuis reading_progress pour l'utilisateur courant,
 * joint books_public pour récupérer la cover et le slug.
 */
export async function fetchReadingProgress(userId: string): Promise<ReadingListPayload> {
  console.log("[fetchReadingProgress] start for", userId);

  const { data, error } = await supabase
    .from("reading_progress")
    .select(
      `
      id,
      user_id,
      book_id,
      current_page,
      total_pages,
      status,
      updated_at,
      started_at,
      books:books_public(
        id, slug, title, author, cover_url, total_chapters, expected_segments
      )
    `
    )
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("[fetchReadingProgress] error:", error);
    return mapRows([]);
  }

  return mapRows(data ?? []);
}

/**
 * Récupère les livres selon leur statut - compatible avec la nouvelle structure
 */
export const fetchBooksForStatus = async (readingListData: any, status: string, userId: string): Promise<Book[]> => {
  if (!readingListData || !userId) return [];

  // Si readingListData est déjà le résultat de fetchReadingProgress
  if (readingListData.toRead && readingListData.inProgress && readingListData.completed) {
    const statusMap = {
      'to_read': readingListData.toRead,
      'in_progress': readingListData.inProgress,
      'completed': readingListData.completed
    };
    
    const items = statusMap[status as keyof typeof statusMap] || [];

    // FIX N+1: Fetch ALL validated segment counts in ONE query
    const bookIds = items.map(item => item.book_id);
    const validatedCounts = await getAllValidatedSegmentCounts(userId, bookIds);
    console.log(`✅ Fetched validation counts for ${bookIds.length} books in ONE query (N+1 fixed)`);

    return Promise.all(items.map(async (item: any) => {
      // Debug détaillé pour identifier le problème
      console.log("🔍 ReadingList item debug:", {
        item: item,
        userId: userId,
        book_id: item.book_id,
        books: item.books
      });

      // FIX N+1: Use precomputed count instead of fetching per-book
      const validatedSegments = validatedCounts[item.book_id] || 0;
      const expectedSegments = item.books?.expected_segments || item.books?.total_chapters || 10;
      const progressPercent = Math.round((validatedSegments / (expectedSegments || 1)) * 100);
      
      console.log("📋 ReadingList book calculation:", {
        title: item.books?.title,
        book_id: item.book_id,
        userId: userId,
        validatedSegments,
        expectedSegments,
        progressPercent,
        status: item.status
      });
      
      return {
        id: item.books?.id || item.book_id,
        title: item.books?.title || 'Titre inconnu',
        author: item.books?.author || 'Auteur inconnu',
        description: item.books?.description || '',
        coverImage: item.books?.cover_url || '',
        cover_url: item.books?.cover_url || '',
        pages: item.books?.total_pages || 0,
        categories: item.books?.tags || [],
        tags: item.books?.tags || [],
        totalChapters: expectedSegments,
        chaptersRead: validatedSegments, // Ajouter les segments validés
        currentSegment: validatedSegments,
        progressPercent: progressPercent,
        expectedSegments: expectedSegments,
        language: 'fr',
        publicationYear: new Date().getFullYear(),
        slug: item.books?.slug || item.books?.id || item.book_id,
        isCompleted: status === 'completed',
      };
    }));
  }

  // Fallback pour l'ancien format si nécessaire
  return [];
};

/**
 * Supprime un livre du statut "to_read"
 * @returns La ligne supprimée pour permettre l'undo, ou null si échec
 */
export const removeFromToRead = async (bookId: string): Promise<ProgressRow | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Utilisateur non authentifié");
    }

    // Récupérer la ligne avant suppression (pour undo)
    const { data: existingRow, error: selectError } = await supabase
      .from('reading_progress')
      .select('*')
      .eq('user_id', user.id)
      .eq('book_id', bookId)
      .eq('status', 'to_read')
      .maybeSingle();

    if (selectError) {
      console.error("Erreur lors de la récupération:", selectError);
      throw new Error("Impossible de vérifier le statut du livre");
    }

    if (!existingRow) {
      throw new Error("Livre non trouvé dans « À lire »");
    }

    // Supprimer la ligne
    const { error: deleteError } = await supabase
      .from('reading_progress')
      .delete()
      .eq('id', existingRow.id);

    if (deleteError) {
      console.error("Erreur lors de la suppression:", deleteError);
      throw new Error("Impossible de retirer le livre");
    }

    console.log(`Livre retiré de "À lire": ${bookId}`);
    return existingRow;
  } catch (error) {
    console.error("Erreur dans removeFromToRead:", error);
    throw error;
  }
};

/**
 * Restaure un livre dans "to_read" (pour undo)
 */
export const restoreToRead = async (row: ProgressRow): Promise<void> => {
  try {
    const { error } = await supabase
      .from('reading_progress')
      .insert([{
        id: row.id,
        user_id: row.user_id,
        book_id: row.book_id,
        current_page: row.current_page,
        total_pages: row.total_pages,
        status: row.status,
        started_at: row.started_at,
        updated_at: row.updated_at
      }]);

    if (error) {
      console.error("Erreur lors de la restauration:", error);
      throw new Error("Impossible de restaurer le livre");
    }

    console.log("Livre restauré dans « À lire »");
  } catch (error) {
    console.error("Erreur dans restoreToRead:", error);
    throw error;
  }
};
