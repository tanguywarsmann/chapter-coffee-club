
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ReadingList } from "@/types/reading";
import { Book } from "@/types/book";
import { getBookById } from "@/services/books/bookQueries"; // Changed from mock to real data source
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
          return [];
        }

        console.log("Reading progress data from Supabase:", readingProgressData);
        return readingProgressData || [];
      } catch (error) {
        console.error("Exception while fetching reading list:", error);
        return [];
      }
    },
    enabled: !!user,
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
    if (!readingList || !user) return [];
    
    try {
      // Filter reading list entries by status
      const filteredList = Array.isArray(readingList) 
        ? readingList.filter((item: any) => item.user_id === user.id && item.status === status)
        : [];
      
      // Fetch book details for each reading list entry
      const books = await Promise.all(
        filteredList.map(async (item: any) => {
          try {
            // Fetch book from Supabase instead of mock data
            const book = await getBookById(item.book_id);
            if (!book) {
              console.warn(`Book not found for ID: ${item.book_id}`);
              return null;
            }
            
            // Add reading progress information to the book
            return {
              ...book,
              chaptersRead: Math.floor(item.current_page / 30), // Approximate chapters based on pages
              totalChapters: Math.ceil(book.pages / 30), // Approximate total chapters
              isCompleted: item.status === "completed"
            };
          } catch (error) {
            console.error(`Erreur lors de la récupération du livre ${item.book_id}:`, error);
            return null;
          }
        })
      );
      
      // Filter out null entries
      return books.filter((book): book is Book => book !== null);
    } catch (error) {
      console.error(`Erreur lors du traitement des livres ${status}:`, error);
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
