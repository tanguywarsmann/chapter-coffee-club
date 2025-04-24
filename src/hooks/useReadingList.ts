
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ReadingList } from "@/types/reading";
import { Book } from "@/types/book";
import { getBookById } from "@/mock/books";
import { initializeNewBookReading } from "@/services/reading";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export const useReadingList = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: readingList } = useQuery({
    queryKey: ["reading_list"],
    queryFn: () => {
      const storedList = localStorage.getItem("reading_list");
      return storedList ? JSON.parse(storedList) : [];
    },
  });

  const addToReadingList = async (book: Book) => {
    if (!user) {
      toast.error("Vous devez être connecté pour ajouter un livre à votre liste");
      console.error("Missing user ID when adding to reading list");
      return;
    }

    const userId = user.id;
    console.log('Adding book to reading list with userId:', userId, 'bookId:', book.id);
    
    const storedList = localStorage.getItem("reading_list");
    const currentList: ReadingList[] = storedList ? JSON.parse(storedList) : [];
    
    const exists = currentList.some(
      item => item.user_id === userId && item.book_id === book.id
    );
    
    if (exists) {
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

      const newEntry: ReadingList = {
        user_id: userId,
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
    if (!readingList || !user) return [];
    
    try {
      return readingList
        .filter((item: ReadingList) => item.user_id === user.id && item.status === status)
        .map((item: ReadingList) => {
          try {
            const book = getBookById(item.book_id);
            return book;
          } catch (error) {
            console.error(`Erreur lors de la récupération du livre ${item.book_id}:`, error);
            return null;
          }
        })
        .filter((book): book is Book => book !== null);
    } catch (error) {
      console.error(`Erreur lors du traitement des livres ${status}:`, error);
      return [];
    }
  };

  return {
    addToReadingList,
    getBooksByStatus,
    readingList,
    userId: user?.id
  };
};
