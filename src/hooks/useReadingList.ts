
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
    queryKey: ["reading_list", user?.id],
    queryFn: async () => {
      // Strict defensive check - stop immediately if no user
      if (!user || !user.id) {
        if (process.env.NODE_ENV === 'development') {
          console.log("No user found, returning empty reading list");
        }
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

        // Utiliser un log conditionnel pour éviter de spammer en production
        if (process.env.NODE_ENV === 'development') {
          console.log("Reading progress data from Supabase:", readingProgressData?.length || 0);
        }
        return readingProgressData || [];
      } catch (error) {
        console.error("Exception while fetching reading list:", error);
        throw error; // Re-throw to be caught by React Query's error handling
      }
    },
    enabled: !!user?.id, // Only run query when user ID is available
    staleTime: 600000, // Increase staleTime to 10 minutes to reduce unnecessary refetches
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
      
      queryClient.invalidateQueries({ queryKey: ["reading_list", userId] });
      
      toast.success(`${book.title} ajouté à votre liste de lecture`);
    } catch (error) {
      console.error('Error adding book to reading list:', error);
      toast.error("Une erreur est survenue lors de l'ajout du livre: " + 
                 (error instanceof Error ? error.message : String(error)));
    }
  };

  const getBooksByStatus = async (status: ReadingList["status"]) => {
    // Strong defensive check - return empty array immediately if no user or readingList
    if (!user?.id || !readingList) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`No user or reading list available for status: ${status}`);
      }
      return [];
    }
    
    try {
      // Filter reading list entries by status
      const filteredList = Array.isArray(readingList) 
        ? readingList.filter((item: any) => item.user_id === user.id && item.status === status)
        : [];
      
      if (process.env.NODE_ENV === 'development') {
        // Log only once per status to avoid console spam
        console.log(`Filtered list for status ${status}:`, filteredList.length);
      }
      
      if (filteredList.length === 0) {
        return [];
      }
      
      // Use Promise.all with proper error handling
      const booksPromises = filteredList.map(async (item: any) => {
        try {
          // Fetch book details with timeout protection
          const bookPromise = getBookById(item.book_id);
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout fetching book')), 8000)
          );
          
          const book = await Promise.race([bookPromise, timeoutPromise]) as Book | null;
          
          if (!book) {
            console.warn(`Book not found for ID: ${item.book_id}, creating fallback entry`);
            
            // Return a fallback book object with the data we do have
            const fallbackBook: Book = {
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
            
            return fallbackBook;
          }
          
          // Add reading progress information to the book
          return {
            ...book,
            chaptersRead: Math.floor(item.current_page / 30),
            totalChapters: Math.ceil(book.pages / 30) || 1,
            isCompleted: item.status === "completed"
          } as Book;
        } catch (error) {
          console.error(`Error processing book ${item.book_id}:`, error);
          
          // Return a fallback book object on error
          const errorBook: Book = {
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
          
          return errorBook;
        }
      });
      
      // Wait for all promises to resolve or reject
      const books = await Promise.all(booksPromises);
      return books;
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
    userId: user?.id // Safe access with optional chaining
  };
};
