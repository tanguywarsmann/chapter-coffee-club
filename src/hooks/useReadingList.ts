
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ReadingList } from "@/types/reading";
import { Book } from "@/types/book";
import { getBookById } from "@/mock/books";
import { initializeNewBookReading } from "@/services/reading";
import { toast } from "sonner";

// Helper to ensure userId is properly formatted
const normalizeUserId = (userId: string): string => {
  if (!userId) return "";
  
  try {
    // Check if it's a JSON string
    if (userId.startsWith('{') && userId.includes('}')) {
      const parsedUser = JSON.parse(userId);
      if (parsedUser.id) {
        // If we have a JSON object with id, use the id as the UUID
        return parsedUser.id;
      } else if (parsedUser.email) {
        // Fallback to email if no ID is available
        return parsedUser.email.replace(/[^a-zA-Z0-9]/g, '');
      }
    }
    return userId;
  } catch (e) {
    console.error('Error normalizing user ID in useReadingList:', e);
    return userId;
  }
};

export const useReadingList = (userId: string) => {
  const queryClient = useQueryClient();
  const normalizedUserId = normalizeUserId(userId);

  const { data: readingList } = useQuery({
    queryKey: ["reading_list"],
    queryFn: () => {
      const storedList = localStorage.getItem("reading_list");
      return storedList ? JSON.parse(storedList) : [];
    },
  });

  const addToReadingList = async (book: Book) => {
    if (!normalizedUserId) {
      toast.error("Vous devez être connecté pour ajouter un livre à votre liste");
      console.error("Missing user ID when adding to reading list");
      return;
    }

    console.log('Adding book to reading list with userId:', normalizedUserId, 'bookId:', book.id);
    
    const storedList = localStorage.getItem("reading_list");
    const currentList: ReadingList[] = storedList ? JSON.parse(storedList) : [];
    
    const exists = currentList.some(
      item => item.user_id === normalizedUserId && item.book_id === book.id
    );
    
    if (exists) {
      toast.error("Ce livre est déjà dans votre liste");
      return;
    }
    
    try {
      toast.info("Initialisation de la lecture en cours...");
      
      const progress = await initializeNewBookReading(normalizedUserId, book.id);
      if (!progress) {
        toast.error("Erreur lors de l'initialisation de la lecture. Vérifiez votre connexion et réessayez.");
        console.error('Failed to initialize reading progress:', book.id);
        return;
      }

      const newEntry: ReadingList = {
        user_id: normalizedUserId,
        book_id: book.id,
        status: "to_read",
        added_at: new Date().toISOString()
      };
      
      const updatedList = [...currentList, newEntry];
      localStorage.setItem("reading_list", JSON.stringify(updatedList));
      
      queryClient.invalidateQueries({ queryKey: ["reading_list"] });
      
      toast.success(`${book.title} ajouté à votre liste de lecture`);
      console.log('Successfully added book to reading list:', book.title);
    } catch (error) {
      console.error('Error adding book to reading list:', error);
      toast.error("Une erreur est survenue lors de l'ajout du livre: " + 
                 (error instanceof Error ? error.message : String(error)));
    }
  };

  const getBooksByStatus = (status: ReadingList["status"]) => {
    if (!readingList) return [];
    
    return readingList
      .filter((item: ReadingList) => item.user_id === normalizedUserId && item.status === status)
      .map((item: ReadingList) => getBookById(item.book_id))
      .filter((book): book is Book => book !== null);
  };

  return {
    addToReadingList,
    getBooksByStatus,
    readingList
  };
};
