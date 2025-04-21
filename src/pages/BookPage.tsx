import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppHeader } from "@/components/layout/AppHeader";
import { BookDetail } from "@/components/books/BookDetail";
import { getBookById } from "@/services/bookService";
import { toast } from "sonner";
import { syncBookWithAPI } from "@/services/reading";
import { Book } from "@/types/book";

export default function BookPage() {
  const { id } = useParams<{ id: string }>();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  // User information (in a real app, would come from authentication)
  const user = localStorage.getItem("user") || "user123";
  
  useEffect(() => {
    // Check if user is logged in
    if (!user) {
      navigate("/");
      return;
    }
    
    // Fetch book data
    const fetchBook = async () => {
      if (!id) {
        navigate("/home");
        return;
      }

      try {
        const fetchedBook = await getBookById(id);
        
        if (!fetchedBook) {
          toast.error("Ce livre n'existe pas");
          navigate("/home");
          return;
        }

        setBook(fetchedBook);
        
        // Sync book with reading progress
        try {
          const syncedBook = await syncBookWithAPI(user, id);
          if (syncedBook) {
            setBook(syncedBook);
          }
        } catch (error) {
          console.error("Error syncing book with API:", error);
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
    if (!book) return;
    
    // Since the validation is now handled by the API, we just need to refresh the book data
    try {
      const updatedBook = await syncBookWithAPI(user, bookId);
      if (updatedBook) {
        setBook(updatedBook);
      }
    } catch (error) {
      console.error("Error updating book after chapter completion:", error);
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
