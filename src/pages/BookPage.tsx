
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppHeader } from "@/components/layout/AppHeader";
import { BookDetail } from "@/components/books/BookDetail";
import { getBookById, mockBooks } from "@/mock/books";
import { toast } from "sonner";

export default function BookPage() {
  const { id } = useParams<{ id: string }>();
  const [book, setBook] = useState(id ? getBookById(id) : null);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if user is logged in
    const user = localStorage.getItem("user");
    if (!user) {
      navigate("/");
      return;
    }
    
    // Check if book exists
    if (id && !book) {
      toast.error("Ce livre n'existe pas");
      navigate("/home");
    }
  }, [id, book, navigate]);

  const handleChapterComplete = (bookId: string) => {
    if (!book) return;
    
    const updatedBook = {
      ...book,
      chaptersRead: book.chaptersRead + 1,
      isCompleted: book.chaptersRead + 1 >= book.totalChapters
    };
    
    setBook(updatedBook);
    
    // Update the book in mockBooks (this would be a server update in a real app)
    const bookIndex = mockBooks.findIndex(b => b.id === bookId);
    if (bookIndex !== -1) {
      mockBooks[bookIndex] = updatedBook;
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
