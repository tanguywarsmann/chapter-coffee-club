
import { Book } from "@/types/book";
import { unavailableBooksCache } from "@/utils/unavailableBooksCache";

export const useBookStabilization = () => {
  const stabilizeBooks = (books: Book[]) => {
    console.log("[DEBUG] stabilizeBooks appelé avec", books?.length || 0, "livres");
    
    if (!books || !Array.isArray(books)) {
      console.warn("[ATTENTION] stabilizeBooks reçoit des données invalides:", books);
      return [];
    }
    
    const result = books.map(book => {
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
    
    console.log("[DEBUG] stabilizeBooks résultat:", result?.length || 0, "livres après stabilisation");
    return result;
  };

  return {
    stabilizeBooks
  };
};
