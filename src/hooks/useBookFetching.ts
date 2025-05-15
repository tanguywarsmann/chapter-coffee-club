
console.log("Import de useBookFetching.ts OK");

import { useState, useEffect, useCallback } from "react";
import { Book } from "@/types/book";
import { getAllBooks } from "@/services/books/bookQueries";
import { toast } from "sonner";

// Add a parameter to filter out unpublished books (default to true)
export const useBookFetching = (includeUnpublished = false) => {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  const fetchBooks = useCallback(async () => {
    if (isFetching) return; // Éviter les appels simultanés
    
    setIsLoading(true);
    setIsFetching(true);
    setError(null);

    try {
      const fetchedBooks = await getAllBooks(includeUnpublished);
      
      // Handle empty state
      if (fetchedBooks.length === 0) {
        console.log("No books found");
      }
      
      setBooks(fetchedBooks || []);
      setHasLoaded(true);
    } catch (err: any) {
      console.error("Error fetching books:", err);
      setError("Failed to load books. Please try again later.");
      toast.error("Erreur de chargement : Impossible de charger la liste des livres", {
        duration: 5000
      });
    } finally {
      setIsLoading(false);
      setIsFetching(false);
    }
  }, [includeUnpublished]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  return { 
    books, 
    isLoading, 
    error, 
    hasLoaded, 
    refetch: fetchBooks, 
    isFetching 
  };
};
