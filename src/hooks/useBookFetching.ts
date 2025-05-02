
import { useState, useEffect, useCallback } from "react";
import { Book } from "@/types/book";
import { getAllBooks } from "@/services/books/bookQueries";

// Add a parameter to filter out unpublished books (default to true)
export const useBookFetching = (includeUnpublished = false) => {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  const fetchBooks = useCallback(async () => {
    setIsLoading(true);
    setIsFetching(true);
    setError(null);

    try {
      const fetchedBooks = await getAllBooks(includeUnpublished);
      
      // Handle empty state
      if (fetchedBooks.length === 0) {
        console.log("No books found");
      }
      
      setBooks(fetchedBooks);
      setHasLoaded(true);
    } catch (err) {
      console.error("Error fetching books:", err);
      setError("Failed to load books. Please try again later.");
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
