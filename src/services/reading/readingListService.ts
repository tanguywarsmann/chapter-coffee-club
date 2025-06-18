import { Book } from '@/types/book';
import { supabase } from '../supabase';
import { trackReadingListAdd } from '../analytics/readingListAnalytics';
import {
  AlreadyInListError,
  BookNotFoundError,
  InvalidBookError,
} from '@/utils/readingListErrors';
import { assertValidBook } from '@/utils/bookValidation';

/**
 * Service pour gérer la Reading List de l'utilisateur
 * Centralise les opérations d'ajout, suppression et récupération des livres
 */

export const addBookToReadingList = async (book: Book): Promise<boolean> => {
  // Validation précoce avec notre système centralisé
  assertValidBook(book as unknown);

  try {
    const user = supabase.auth.user();

    if (!user) {
      console.error("Utilisateur non authentifié");
      trackReadingListAdd(book.id, 'auth_required', { bookTitle: book.title });
      return false;
    }

    // Vérifier si le livre existe déjà dans la liste de lecture de l'utilisateur
    const { data: existingBook, error: selectError } = await supabase
      .from('reading_list')
      .select('*')
      .eq('user_id', user.id)
      .eq('book_id', book.id)
      .single();

    if (selectError && selectError.message.includes('single row')) {
      console.warn("Aucun livre existant trouvé, mais ce n'est pas une erreur.");
    }

    if (existingBook) {
      console.warn(`Le livre ${book.title} existe déjà dans la liste de lecture.`);
      trackReadingListAdd(book.id, 'already_exists', { bookTitle: book.title });
      throw new AlreadyInListError(book.title);
    }

    // Ajouter le livre à la reading list
    const { data, error } = await supabase
      .from('reading_list')
      .insert([{ user_id: user.id, book_id: book.id, book_title: book.title }])
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
      throw error; // Relancer pour gestion spécifique dans BookCard
    } else if (error instanceof InvalidBookError) {
      trackReadingListAdd(book.id, 'invalid_book', { bookTitle: book.title, errorCode: error.code });
    }

    return false;
  }
};
