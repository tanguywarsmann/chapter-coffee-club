
import { Book } from "@/types/book";

type BooksByStatusCache = {
  [status: string]: Book[] | undefined;
};
// Simple client-side cache, cleared at refresh/user change.
export const booksByStatusCache: BooksByStatusCache = {};

export function cacheBooksByStatus(status: string, books: Book[]) {
  booksByStatusCache[status] = books;
}

export function getCachedBooksByStatus(status: string): Book[] | undefined {
  return booksByStatusCache[status];
}

export function clearBooksByStatusCache() {
  Object.keys(booksByStatusCache).forEach(key => {
    delete booksByStatusCache[key];
  });
}
