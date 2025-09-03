
import { Book } from '@/types/book';
import { supabase } from '@/integrations/supabase/client';
import { trackReadingListAdd } from '../analytics/readingListAnalytics';
import {
  AlreadyInListError,
  BookNotFoundError,
  InvalidBookError,
} from '@/utils/readingListErrors';
import { assertValidBook } from '@/utils/bookValidation';
import { getValidatedSegmentCount } from './validatedSegmentCount';

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
    
    return items.map((item: any) => ({
      id: item.books?.id || item.book_id,
      title: item.books?.title || 'Titre inconnu',
      author: item.books?.author || 'Auteur inconnu',
      description: item.books?.description || '',
      coverImage: item.books?.cover_url || '',
      cover_url: item.books?.cover_url || '',
      pages: item.books?.total_pages || 0,
      categories: item.books?.tags || [],
      tags: item.books?.tags || [],
      totalChapters: item.books?.expected_segments || 0,
      language: 'fr',
      publicationYear: new Date().getFullYear(),
      slug: item.books?.slug || item.books?.id || item.book_id,
      isCompleted: status === 'completed',
      expectedSegments: item.books?.expected_segments || 0,
    }));
  }

  // Fallback pour l'ancien format si nécessaire
  return [];
};
