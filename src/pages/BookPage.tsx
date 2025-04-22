
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppHeader } from "@/components/layout/AppHeader";
import { BookDetail } from "@/components/books/BookDetail";
import { getBookById } from "@/services/books/bookQueries"; // Import from Supabase service
import { toast } from "sonner";
import { syncBookWithAPI } from "@/services/reading";
import { Book } from "@/types/book";
import { supabase } from "@/integrations/supabase/client";

export default function BookPage() {
  const { id } = useParams<{ id: string }>();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Get the user ID from Supabase auth session
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      
      if (data?.user?.id) {
        console.log("User authenticated in BookPage:", data.user.id);
        setUserId(data.user.id);
      } else {
        console.warn("No authenticated user found in BookPage");
        toast.warning("Vous n'êtes pas connecté. Certaines fonctionnalités seront limitées.");
      }
    };

    getUser();
  }, []);
  
  useEffect(() => {
    // Fetch book data
    const fetchBook = async () => {
      if (!id) {
        navigate("/home");
        return;
      }

      try {
        setLoading(true);
        console.log("Fetching book with ID:", id);
        const fetchedBook = await getBookById(id);
        
        if (!fetchedBook) {
          console.error("Book not found with ID:", id);
          toast.error("Ce livre n'existe pas dans notre base de données");
          navigate("/home");
          return;
        }

        console.log("Book fetched successfully:", fetchedBook);
        setBook(fetchedBook);
        
        // Sync book with reading progress if user is authenticated
        if (userId) {
          try {
            console.log("Syncing book with user progress for userId:", userId, "bookId:", id);
            const syncedBook = await syncBookWithAPI(userId, id);
            if (syncedBook) {
              setBook(syncedBook);
            }
          } catch (error) {
            console.error("Error syncing book with API:", error);
            toast.error("Erreur lors de la synchronisation des données de lecture");
          }
        }
      } catch (error) {
        console.error("Error fetching book:", error);
        toast.error("Erreur lors du chargement du livre");
        navigate("/home");
      } finally {
        setLoading(false);
      }
    };
    
    fetchBook();
  }, [id, navigate, userId]);

  const handleChapterComplete = async (bookId: string) => {
    if (!book || !userId) {
      toast.error("Vous devez être connecté pour valider un chapitre");
      return;
    }
    
    // Since the validation is now handled by the API, we just need to refresh the book data
    try {
      const updatedBook = await syncBookWithAPI(userId, bookId);
      if (updatedBook) {
        setBook(updatedBook);
        toast.success("Mise à jour du livre réussie");
      }
    } catch (error) {
      console.error("Error updating book after chapter completion:", error);
      toast.error("Erreur lors de la mise à jour du livre");
    }
  };

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center">Chargement...</div>;
  if (!book) return null;

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      
      <main className="container py-6">
        <BookDetail book={book} onChapterComplete={handleChapterComplete} />
      </main>
    </div>
  );
}
