
import { useState, useCallback } from "react";
import { Book } from "@/types/book";
import { SortOption } from "@/components/reading/BookSortSelect";

export function useBookSorting() {
  const [sortBy, setSortBy] = useState<SortOption>("date");

  const sortBooks = useCallback((books: Book[], sortOption: SortOption) => {
    if (!books || !Array.isArray(books)) {
      console.warn("Attempted to sort non-array books:", books);
      return [];
    }
    
    return [...books].sort((a, b) => {
      switch(sortOption) {
        case "author":
          return (a.author || "").localeCompare(b.author || "");
        case "pages":
          return (b.pages || 0) - (a.pages || 0);
        case "date":
        default:
          return b.id.localeCompare(a.id);
      }
    });
  }, []);

  return {
    sortBy,
    setSortBy,
    sortBooks
  };
}
