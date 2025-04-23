import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppHeader } from "@/components/layout/AppHeader";
import { BookDetail } from "@/components/books/BookDetail";
import { getBookById } from "@/services/books/bookQueries"; // Import from Supabase service
import { toast } from "sonner";
import { syncBookWithAPI } from "@/services/reading";
import { Book } from "@/types/book";
import { useAuth } from "@/contexts/AuthContext";
import { AuthGuard } from "@/components/auth/AuthGuard";

export default function BookPage() {
  const { id } = useParams<{ id: string }>();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();
  
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
        if (user) {
          try {
            console.log("Syncing book with user progress for userId:", user.id, "bookId:", id);
            const syncedBook = await syncBookWithAPI(user.id, id);
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
  }, [id, navigate, user]);

  const handleChapterComplete = async (bookId: string) => {
    if (!book || !user) {
      toast.error("Vous devez être connecté pour valider un chapitre");
      return;
    }
    
    // Since the validation is now handled by the API, we just need to refresh the book data
    try {
      const updatedBook = await syncBookWithAPI(user.id, bookId);
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
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <AppHeader />
        
        <main className="container py-6">
          <BookDetail book={book} onChapterComplete={handleChapterComplete} />
        </main>
      </div>
    </AuthGuard>
  );
}
