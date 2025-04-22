
import { InsertableBook } from "./types";
import { insertBooks } from "./bookMutations";
import { allClassicBooks } from "./data";

export const insertClassicBooks = async () => {
  await insertBooks(allClassicBooks);
};

// Expose the function to the browser window
declare global {
  interface Window {
    bookService: {
      insertClassicBooks: () => Promise<void>;
    };
  }
}

// Initialize the window.bookService object if it doesn't exist
if (typeof window !== 'undefined') {
  window.bookService = window.bookService || { insertClassicBooks: insertClassicBooks };
  window.bookService.insertClassicBooks = insertClassicBooks;
}
