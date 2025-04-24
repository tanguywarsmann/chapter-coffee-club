
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ReadingList } from "@/types/reading";
import { Book } from "@/types/book";
import { getBookById } from "@/services/books/bookQueries";
import { initializeNewBookReading } from "@/services/reading";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export const useReadingList = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: readingList, isLoading: isLoadingReadingList } = useQuery({
    queryKey: ["reading_list"],
    queryFn: async () => {
      // Check first if user is authenticated
      if (!user) {
        console.log("No user found, returning empty reading list");
        return [];
      }

      try {
        // Get reading list directly from Supabase instead of localStorage
        const { data: readingProgressData, error } = await supabase
          .from("reading_progress")
          .select("*")
          .eq("user_id", user.id);

        if (error) {
          console.error("Error fetching reading list from Supabase:", error);
          throw error;
        }

        console.log("Reading progress data from Supabase:", readingProgressData);
        return readingProgressData || [];
      } catch (error) {
        console.error("Exception while fetching reading list:", error);
        throw error; // Re-throw to be caught by React Query's error handling
      }
    },
    enabled: !!user,
    staleTime: 30000, // Add a staleTime to reduce unnecessary refetches
    refetchOnWindowFocus: false, // Disable refetch on window focus to avoid flickering
    retry: 1, // Limit retries to avoid excessive requests on failure
  });

  const addToReadingList = async (book: Book) => {
    if (!user) {
      toast.error("Vous devez être connecté pour ajouter un livre à votre liste");
      console.error("Missing user ID when adding to reading list");
      return;
    }

    const userId = user.id;
    console.log('Adding book to reading list with userId:', userId, 'bookId:', book.id);
    
    // Check if book already exists in reading list
    const { data: existingEntries, error: checkError } = await supabase
      .from("reading_progress")
      .select("*")
      .eq("user_id", userId)
      .eq("book_id", book.id);
    
    if (checkError) {
      toast.error("Erreur lors de la vérification de votre liste de lecture");
      console.error("Error checking reading list:", checkError);
      return;
    }
    
    if (existingEntries && existingEntries.length > 0) {
      toast.error("Ce livre est déjà dans votre liste");
      return;
    }
    
    try {
      toast.info("Initialisation de la lecture en cours...");
      
      const progress = await initializeNewBookReading(userId, book.id);
      if (!progress) {
        toast.error("Erreur lors de l'initialisation de la lecture. Vérifiez votre connexion et réessayez.");
        console.error('Failed to initialize reading progress:', book.id);
        return;
      }
      
      queryClient.invalidateQueries({ queryKey: ["reading_list"] });
      
      toast.success(`${book.title} ajouté à votre liste de lecture`);
      console.log('Successfully added book to reading list:', book.title);
    } catch (error) {
      console.error('Error adding book to reading list:', error);
      toast.error("Une erreur est survenue lors de l'ajout du livre: " + 
                 (error instanceof Error ? error.message : String(error)));
    }
  };

  const getBooksByStatus = async (status: ReadingList["status"]) => {
    if (!readingList || !user) {
      console.log(`No reading list or user found for status: ${status}`);
      return [];
    }
    
    try {
      // Filter reading list entries by status
      const filteredList = Array.isArray(readingList) 
        ? readingList.filter((item: any) => item.user_id === user.id && item.status === status)
        : [];
      
      console.log(`Filtered list for status ${status}:`, filteredList);
      
      if (filteredList.length === 0) {
        console.log(`No books found with status: ${status}`);
        return [];
      }
      
      // Fetch book details for each reading list entry - using Promise.allSettled to ensure all promises complete
      const booksPromises = filteredList.map(async (item: any) => {
        try {
          // Fetch book from Supabase
          console.log(`Fetching book with ID: ${item.book_id}`);
          let book = null;
          
          try {
            book = await getBookById(item.book_id);
          } catch (bookError) {
            console.error(`Error in getBookById for ${item.book_id}:`, bookError);
          }
          
          // Even if the book is not found or incomplete, return basic information
          if (!book) {
            console.warn(`Book not found for ID: ${item.book_id}, creating fallback entry`);
            
            // Return a fallback book object with the data we do have
            return {
              id: item.book_id,
              title: "Livre indisponible",
              author: "Auteur inconnu",
              description: "Les détails de ce livre ne sont pas disponibles pour le moment.",
              chaptersRead: Math.floor(item.current_page / 30),
              totalChapters: Math.ceil(item.total_pages / 30) || 1,
              isCompleted: item.status === "completed",
              language: "fr",
              categories: [],
              pages: item.total_pages || 0,
              publicationYear: 0
            };
          }
          
          // Add reading progress information to the book
          console.log(`Successfully fetched book: ${book.title}`);
          return {
            ...book,
            chaptersRead: Math.floor(item.current_page / 30),
            totalChapters: Math.ceil(book.pages / 30) || 1,
            isCompleted: item.status === "completed"
          };
        } catch (error) {
          console.error(`Error processing book ${item.book_id}:`, error);
          
          // Return a fallback book object on error
          return {
            id: item.book_id,
            title: "Erreur de chargement",
            author: "Contenu indisponible",
            description: "Impossible de charger les détails de ce livre.",
            chaptersRead: 0,
            totalChapters: 1,
            isCompleted: false,
            language: "fr",
            categories: [],
            pages: 0,
            publicationYear: 0
          };
        }
      });
      
      try {
        // Use Promise.allSettled to handle all promises, even if some fail
        const results = await Promise.allSettled(booksPromises);
        const books = results
          .filter((result): result is PromiseFulfilledResult<any> => result.status === 'fulfilled')
          .map(result => result.value);
          
        console.log(`Retrieved ${books.length} books for status ${status}:`, books);
        
        // Always return the array, even if some entries are fallbacks
        return books;
      } catch (promiseError) {
        console.error(`Error in Promise.all for books with status ${status}:`, promiseError);
        return [];
      }
    } catch (error) {
      console.error(`Error processing books with status ${status}:`, error);
      return [];
    }
  };

  return {
    addToReadingList,
    getBooksByStatus,
    readingList,
    isLoadingReadingList,
    userId: user?.id
  };
};
