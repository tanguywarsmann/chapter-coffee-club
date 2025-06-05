
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppHeader } from "@/components/layout/AppHeader";
import { BookDetail } from "@/components/books/BookDetail";
import { getBookById } from "@/services/books/bookQueries";
import { toast } from "sonner";
import { syncBookWithAPI, validateReading } from "@/services/reading";
import { BookWithProgress } from "@/types/reading";
import { useAuth } from "@/contexts/AuthContext";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Loader2 } from "lucide-react";
import { getBookReadingProgress } from "@/services/reading/progressService";

export default function BookPage() {
  const { id } = useParams<{ id: string }>();
  const [book, setBook] = useState<BookWithProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    
    const fetchBook = async () => {
      console.log("[BookPage] Début de fetchBook, ID:", id);
      
      if (!id) {
        console.error("[BookPage] Aucun ID fourni dans les paramètres");
        setError("Aucun identifiant de livre fourni");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        console.log(`[BookPage] Récupération du livre avec ID: "${id}"`);
        
        // Récupérer le livre basique d'abord
        const fetchedBook = await getBookById(id);
        
        if (!isMounted.current) return;
        
        if (!fetchedBook) {
          console.error(`[BookPage] Aucun livre trouvé pour ID: ${id}`);
          setError(`Le livre avec l'identifiant "${id}" n'existe pas`);
          setLoading(false);
          return;
        }
        
        console.log(`[BookPage] Livre trouvé: ${fetchedBook.title} (${fetchedBook.id})`);
        
        // Convertir en BookWithProgress pour compatibilité
        const bookAsWithProgress: BookWithProgress = {
          ...fetchedBook,
          progressPercent: 0,
          currentSegment: 1,
          totalSegments: fetchedBook.totalChapters || fetchedBook.expectedSegments || fetchedBook.total_chapters || 1,
          nextSegmentPage: 1,
          chaptersRead: 0,
          expectedSegments: fetchedBook.expectedSegments || fetchedBook.total_chapters || 1,
          
          // Propriétés ProgressRow requises avec des valeurs par défaut
          book_id: fetchedBook.id,
          current_page: 0,
          started_at: new Date().toISOString(),
          status: "to_read" as const,
          streak_best: 0,
          streak_current: 0,
          total_pages: fetchedBook.total_pages || fetchedBook.pages || 0,
          updated_at: new Date().toISOString(),
          user_id: user?.id || ""
        };
        
        setBook(bookAsWithProgress);
        
        // Essayer de récupérer avec progression si utilisateur connecté
        if (user?.id) {
          try {
            console.log(`[BookPage] Tentative de récupération avec progression pour user: ${user.id}`);
            const bookWithProgress = await getBookReadingProgress(user.id, id);
            
            if (!isMounted.current) return;
            
            if (bookWithProgress) {
              console.log(`[BookPage] Livre avec progression trouvé: ${bookWithProgress.title}`);
              setBook(bookWithProgress);
            } else {
              // Synchroniser avec l'API
              console.log(`[BookPage] Synchronisation avec API pour user: ${user.id}`);
              const syncedBook = await syncBookWithAPI(user.id, id);
              
              if (!isMounted.current) return;
              
              if (syncedBook) {
                console.log(`[BookPage] Livre synchronisé: ${syncedBook.title}`);
                setBook({
                  ...syncedBook,
                  isCompleted: syncedBook.progressPercent >= 100
                } as BookWithProgress);
              }
            }
          } catch (syncError) {
            console.error("[BookPage] Erreur lors de la synchronisation:", syncError);
            // Ne pas afficher d'erreur pour la sync, le livre de base fonctionne
          }
        }
        
      } catch (fetchError) {
        console.error("[BookPage] Erreur lors de la récupération:", fetchError);
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
    
    return () => {
      isMounted.current = false;
    };
  }, [id, navigate, user?.id]);

  const handleChapterComplete = async (bookId: string) => {
    if (!book || !user?.id) {
      toast.error("Vous devez être connecté pour valider un chapitre");
      return;
    }

    try {
      const result = await validateReading({
        user_id: user.id,
        book_id: bookId,
        segment: book.currentSegment ?? 0
      });

      console.log("[BookPage] Résultat validateReading:", result);

      const updatedProgress = await getBookReadingProgress(user.id, bookId);
      if (!isMounted.current) return;

      if (updatedProgress) {
        setBook(updatedProgress);
        toast.success("Segment validé avec succès !");
      } else {
        const updatedBook = await syncBookWithAPI(user.id, bookId);
        if (!isMounted.current) return;
        if (updatedBook) {
          setBook(updatedBook as BookWithProgress);
          toast.success("Lecture synchronisée avec succès !");
        } else {
          toast.error("Impossible de mettre à jour le livre");
        }
      }
    } catch (error) {
      console.error("[BookPage] Erreur validateReading:", error);
      toast.error("Erreur lors de la validation : " + (error as Error).message);
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
