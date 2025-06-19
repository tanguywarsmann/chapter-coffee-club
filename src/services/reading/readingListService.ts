
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
 * Récupère les progrès de lecture de l'utilisateur
 */
export const fetchReadingProgress = async (userId: string) => {
  if (!userId) return null;

  const { data, error } = await supabase
    .from('reading_progress')
    .select(`
      *,
      books (
        id,
        title,
        author,
        description,
        cover_url,
        total_pages,
        tags,
        expected_segments,
        total_chapters
      )
    `)
    .eq('user_id', userId);

  if (error) {
    console.error('Erreur lors de la récupération des progrès:', error);
    return null;
  }

  return data;
};

/**
 * Récupère les livres selon leur statut avec calcul correct basé sur les segments validés
 */
export const fetchBooksForStatus = async (readingList: any, status: string, userId: string): Promise<Book[]> => {
  if (!readingList || !userId) return [];

  // Calculer le statut réel basé sur les segments validés
  const booksWithRealStatus = await Promise.all(
    readingList.map(async (progress: any) => {
      const bookId = progress.books?.id || progress.book_id;
      const expectedSegments = progress.books?.expected_segments || progress.books?.total_chapters || 1;
      
      // Récupérer le nombre de segments validés
      const validatedSegments = await getValidatedSegmentCount(userId, bookId);
      
      // Calculer le statut réel
      let realStatus: string;
      if (validatedSegments >= expectedSegments) {
        realStatus = 'completed';
      } else if (validatedSegments > 0) {
        realStatus = 'in_progress';
      } else {
        realStatus = 'to_read';
      }

      return {
        ...progress,
        realStatus,
        validatedSegments,
        expectedSegments,
        books: progress.books
      };
    })
  );

  // Filtrer par le statut demandé (utiliser le statut réel)
  const filteredProgress = booksWithRealStatus.filter((item: any) => item.realStatus === status);
  
  return filteredProgress.map((progress: any) => ({
    id: progress.books?.id || progress.book_id,
    title: progress.books?.title || 'Titre inconnu',
    author: progress.books?.author || 'Auteur inconnu',
    description: progress.books?.description || '',
    coverImage: progress.books?.cover_url || '',
    pages: progress.books?.total_pages || 0,
    categories: progress.books?.tags || [],
    tags: progress.books?.tags || [],
    totalChapters: progress.expectedSegments || 0,
    chaptersRead: progress.validatedSegments || 0,
    isCompleted: progress.realStatus === 'completed',
    language: 'fr',
    publicationYear: new Date().getFullYear(),
    slug: progress.books?.id || progress.book_id,
    book_author: progress.books?.author || 'Auteur inconnu',
    book_slug: progress.books?.id || progress.book_id,
    book_cover: progress.books?.cover_url || null,
    total_chapters: progress.expectedSegments || 0,
    created_at: progress.started_at || new Date().toISOString(),
    is_published: true,
    // Ajouter les champs pour le progrès correct
    progressPercent: Math.round((progress.validatedSegments / (progress.expectedSegments || 1)) * 100),
    expectedSegments: progress.expectedSegments || 0,
    totalSegments: progress.expectedSegments || 0,
  }));
};
