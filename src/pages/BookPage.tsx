
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppHeader } from "@/components/layout/AppHeader";
import { BookDetail } from "@/components/books/BookDetail";
import { getBookById } from "@/mock/books";
import { toast } from "sonner";
import { syncBookWithAPI } from "@/services/readingService";

export default function BookPage() {
  const { id } = useParams<{ id: string }>();
  const [book, setBook] = useState(id ? getBookById(id) : null);
  const navigate = useNavigate();
  
  // User information (in a real app, would come from authentication)
  const user = localStorage.getItem("user") || "user123";
  
  useEffect(() => {
    // Check if user is logged in
    if (!user) {
      navigate("/");
      return;
    }
    
    // Check if book exists
    if (id && !book) {
      toast.error("Ce livre n'existe pas");
      navigate("/home");
      return;
    }
    
    // Sync book with API if it exists
    const updateBook = async () => {
      if (id && book) {
        try {
          const syncedBook = await syncBookWithAPI(user, id);
          if (syncedBook) {
            setBook(syncedBook);
          }
        } catch (error) {
          console.error("Error syncing book with API:", error);
        }
      }
    };
    
    updateBook();
  }, [id, book, navigate, user]);

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
