
import { Book } from "@/types/book";
import { unavailableBooksCache } from "@/utils/unavailableBooksCache";

export const useBookStabilization = () => {
  const stabilizeBooks = (books: Book[]) => {
    return books.map(book => {
      if (book.isUnavailable || unavailableBooksCache.has(book.id)) {
        unavailableBooksCache.add(book.id);
        return {
          ...book,
          isUnavailable: true,
          isStableUnavailable: true
        };
      }
      return book;
    });
  };

  return {
    stabilizeBooks
  };
};
