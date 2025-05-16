
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppHeader } from "@/components/layout/AppHeader";
import { BookDetail } from "@/components/books/BookDetail";
import { getBookById } from "@/services/books/bookQueries";
import { toast } from "sonner";
import { syncBookWithAPI } from "@/services/reading";
import { Book } from "@/types/book";
import { BookWithProgress } from "@/types/reading"; // Import the new type
import { useAuth } from "@/contexts/AuthContext";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Loader2 } from "lucide-react";
import { getBookReadingProgress } from "@/services/reading/progressService";

export default function BookPage() {
  const { id } = useParams<{ id: string }>();
  const [book, setBook] = useState<BookWithProgress | null>(null); // Update the type
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const isMounted = useRef(true);
  
  useEffect(() => {
    // Set mounted flag
    isMounted.current = true;
    
    // Fetch book data and reading progress
    const fetchBook = async () => {
      if (!id) {
        navigate("/home");
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const fetchedBook = await getBookById(id);
        
        // Safety check to prevent state updates on unmounted component
        if (!isMounted.current) return;
        
        if (!fetchedBook) {
          setError("Ce livre n'existe pas dans notre base de données");
          toast.error("Ce livre n'existe pas dans notre base de données");
          setTimeout(() => {
            if (isMounted.current) {
              navigate("/home");
            }
          }, 2000);
          return;
        }

        // Set initial book data
        setBook(fetchedBook as BookWithProgress);
        
        // Fetch reading progress if user is authenticated
        if (user?.id) {
          try {
            // Get reading progress with pre-calculated values
            const progress = await getBookReadingProgress(user.id, id);
            
            if (!isMounted.current) return;
            
            // Update book with pre-calculated chaptersRead and progressPercent
            if (progress) {
              setBook(prevBook => {
                if (!prevBook) return fetchedBook as BookWithProgress;
                return {
                  ...prevBook,
                  chaptersRead: progress.chaptersRead,
                  progressPercent: progress.progressPercent,
                  isCompleted: progress.progressPercent >= 100
                };
              });
            }
            
            // Also sync with API for good measure
            const syncedBook = await syncBookWithAPI(user.id, id);
            
            if (!isMounted.current) return;
            
            if (syncedBook) {
              // Use the pre-calculated values from progress if available
              setBook(prevBook => {
                if (!prevBook) return syncedBook as BookWithProgress;
                return {
                  ...syncedBook,
                  chaptersRead: progress?.chaptersRead ?? syncedBook.chaptersRead,
                  progressPercent: progress?.progressPercent ?? syncedBook.progressPercent,
                  nextSegmentPage: progress?.nextSegmentPage ?? ((syncedBook.chaptersRead + 1) * 30)
                } as BookWithProgress;
              });
            }
          } catch (syncError) {
            console.error("Error syncing book with API:", syncError);
            if (isMounted.current) {
              toast.error("Erreur lors de la synchronisation des données de lecture");
            }
          }
        }
      } catch (fetchError) {
        console.error("Error fetching book:", fetchError);
        if (isMounted.current) {
          setError("Erreur lors du chargement du livre");
          toast.error("Erreur lors du chargement du livre");
        }
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
      }
    };
    
    fetchBook();
    
    // Cleanup
    return () => {
      isMounted.current = false;
    };
  }, [id, navigate, user]);

  const handleChapterComplete = async (bookId: string) => {
    if (!book || !user?.id) {
      toast.error("Vous devez être connecté pour valider un chapitre");
      return;
    }
    
    try {
      // First get up-to-date reading progress
      const progress = await getBookReadingProgress(user.id, bookId);
      
      if (!isMounted.current) return;
      
      // Update book with pre-calculated values from progress
      if (progress) {
        setBook(prevBook => {
          if (!prevBook) return null;
          return {
            ...prevBook,
            chaptersRead: progress.chaptersRead,
            progressPercent: progress.progressPercent,
            isCompleted: progress.progressPercent >= 100
          } as BookWithProgress;
        });
      }
      
      // Also sync with API
      const updatedBook = await syncBookWithAPI(user.id, bookId);
      
      // Safety check to prevent state updates on unmounted component
      if (!isMounted.current) return;
      
      if (updatedBook) {
        // Use the pre-calculated values from progress if available
        setBook(prevBook => {
          if (!prevBook) return updatedBook as BookWithProgress;
          return {
            ...updatedBook,
            chaptersRead: progress?.chaptersRead ?? updatedBook.chaptersRead,
            progressPercent: progress?.progressPercent ?? 0,
            nextSegmentPage: progress?.nextSegmentPage ?? ((updatedBook.chaptersRead + 1) * 30)
          } as BookWithProgress;
        });
        toast.success("Lecture validée avec succès");
      } else {
        toast.error("Impossible de mettre à jour le livre");
      }
    } catch (error) {
      console.error("Error updating book after chapter completion:", error);
      if (isMounted.current) {
        toast.error("Erreur lors de la mise à jour du livre");
      }
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <AppHeader />
        
        <main className="container py-6">
          {loading ? (
            <div className="min-h-[60vh] flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-coffee-dark mx-auto mb-4" />
                <p className="text-muted-foreground">Chargement du livre...</p>
              </div>
            </div>
          ) : error ? (
            <div className="min-h-[60vh] flex items-center justify-center">
              <div className="text-center max-w-md">
                <h2 className="text-xl font-medium text-coffee-darker mb-2">Erreur</h2>
                <p className="text-muted-foreground mb-4">{error}</p>
                <button 
                  className="text-coffee-dark hover:text-coffee-darker underline"
                  onClick={() => navigate(-1)}
                >
                  Retourner à la page précédente
                </button>
              </div>
            </div>
          ) : book ? (
            <BookDetail book={book} onChapterComplete={handleChapterComplete} />
          ) : (
            <div className="min-h-[60vh] flex items-center justify-center">
              <div className="text-center max-w-md">
                <h2 className="text-xl font-medium text-coffee-darker mb-2">Livre non disponible</h2>
                <p className="text-muted-foreground mb-4">Le livre demandé n'est pas disponible pour le moment.</p>
                <button 
                  className="text-coffee-dark hover:text-coffee-darker underline"
                  onClick={() => navigate("/explore")}
                >
                  Découvrir d'autres livres
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </AuthGuard>
  );
}
