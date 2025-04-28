
import { Book } from "@/types/book";
import { unavailableBooksCache } from "@/utils/unavailableBooksCache";

export const useBookStabilization = () => {
  const stabilizeBooks = (books: Book[]) => {
    console.log("[DEBUG] stabilizeBooks appelé avec", books?.length || 0, "livres");
    
    if (!books || !Array.isArray(books)) {
      console.warn("[ATTENTION] stabilizeBooks reçoit des données invalides:", books);
      return [];
    }
    
    // Log détaillé du contenu AVANT stabilisation
    if (books && books.length > 0) {
      console.log("[DEBUG] Premier livre AVANT stabilisation:", JSON.stringify(books[0]));
      console.log("[DEBUG] Propriété isUnavailable présente sur les livres:", books.some(b => b.isUnavailable === true));
      console.log("[DEBUG] Livres potentiellement cachés par le cache:", books.filter(b => unavailableBooksCache.has(b.id)).length);
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
    
    // Log détaillé du contenu APRÈS stabilisation
    if (result && result.length > 0) {
      console.log("[DEBUG] Premier livre APRÈS stabilisation:", JSON.stringify(result[0]));
      console.log("[DEBUG] Livres marqués comme indisponibles après stabilisation:", result.filter(b => b.isUnavailable === true).length);
    }
    
    console.log("[DEBUG] stabilizeBooks résultat:", result?.length || 0, "livres après stabilisation");
    return result;
  };

  return {
    stabilizeBooks
  };
};
