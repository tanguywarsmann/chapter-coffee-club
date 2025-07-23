
import { InsertableBook } from "./types";
import { insertBooks } from "./bookMutations";
import { allClassicBooks } from "./data";

/**
 * Insère les livres classiques dans la base de données
 */
export const insertClassicBooks = async (): Promise<void> => {
  await insertBooks(allClassicBooks);
};

// Expose la fonction à l'objet window du navigateur
declare global {
  interface Window {
    bookService: {
      insertClassicBooks: () => Promise<void>;
    };
  }
}

// Initialise l'objet window.bookService s'il n'existe pas
if (typeof window !== 'undefined') {
  window.bookService = window.bookService || { insertClassicBooks: insertClassicBooks };
  window.bookService.insertClassicBooks = insertClassicBooks;
}
