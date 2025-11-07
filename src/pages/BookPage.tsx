
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
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
import { useExpectedSegments } from "@/hooks/useExpectedSegments";
import { uiCanSurfaceJoker } from "@/utils/jokerUiGate";
import { useTranslation } from "@/i18n/LanguageContext";

export default function BookPage() {
  const { id } = useParams<{ id: string }>();
  const [book, setBook] = useState<BookWithProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { t } = useTranslation();
  const isMounted = useRef(true);
  
  // Debug pour le gating UI des jokers
  const expectedSegments = useExpectedSegments(book);
  const canShowJoker = uiCanSurfaceJoker(expectedSegments);
  
  useEffect(() => {
    if (book) {
      console.info("[BOOK/JOKER UI]", {
        bookTitle: book.title,
        expectedSegments,
        canShowJoker,
      });
    }
  }, [book?.title, expectedSegments, canShowJoker]);
  
  // État pour les messages d'alerte
  const [accessDeniedMessage, setAccessDeniedMessage] = useState<string | null>(null);

  useEffect(() => {
    // Vérifier si on vient d'une redirection avec message d'erreur
    if (location.state?.accessDenied && location.state?.message) {
      setAccessDeniedMessage(location.state.message);
      // Nettoyer le state pour éviter que le message persiste
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    isMounted.current = true;
    
    const fetchBook = async () => {
      if (!id) {
        setError("Aucun identifiant de livre fourni");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Récupérer le livre basique d'abord
        const fetchedBook = await getBookById(id);
        
        if (!isMounted.current) return;
        
        if (!fetchedBook) {
          setError(`Le livre avec l'identifiant "${id}" n'existe pas`);
          setLoading(false);
          return;
        }
        
        // Ensure categories and tags are properly set to avoid undefined errors
        const safeBook = {
          ...fetchedBook,
          categories: fetchedBook.categories || fetchedBook.tags || [],
          tags: fetchedBook.tags || fetchedBook.categories || []
        };
        
        // Convertir en BookWithProgress pour compatibilité
        const bookAsWithProgress: BookWithProgress = {
          ...safeBook,
          progressPercent: 0,
          currentSegment: 1,
          totalSegments: safeBook.totalChapters || safeBook.expectedSegments || safeBook.total_chapters || 1,
          nextSegmentPage: 1,
          chaptersRead: 0,
          expectedSegments: safeBook.expectedSegments || safeBook.total_chapters || 1,
          
          // Propriétés ProgressRow requises avec des valeurs par défaut
          book_id: safeBook.id,
          current_page: 0,
          started_at: new Date().toISOString(),
          status: "to_read" as const,
          streak_best: 0,
          streak_current: 0,
          total_pages: safeBook.total_pages || safeBook.pages || 0,
          updated_at: new Date().toISOString(),
          user_id: user?.id || ""
        };
        
        setBook(bookAsWithProgress);
        
        // Essayer de récupérer avec progression si utilisateur connecté
        if (user?.id) {
          try {
            const bookWithProgress = await getBookReadingProgress(user.id, id);
            
            if (!isMounted.current) return;
            
            if (bookWithProgress) {
              // Ensure safe categories
              const safeProgressBook = {
                ...bookWithProgress,
                categories: bookWithProgress.categories || bookWithProgress.tags || [],
                tags: bookWithProgress.tags || bookWithProgress.categories || []
              };
              setBook(safeProgressBook);
            } else {
              // Synchroniser avec l'API
              const syncedBook = await syncBookWithAPI(user.id, id);
              
              if (!isMounted.current) return;
              
              if (syncedBook) {
                const safeSyncedBook = {
                  ...syncedBook,
                  categories: syncedBook.categories || syncedBook.tags || [],
                  tags: syncedBook.tags || syncedBook.categories || [],
                  isCompleted: syncedBook.progressPercent >= 100
                } as BookWithProgress;
                setBook(safeSyncedBook);
              }
            }
          } catch (syncError) {
            // Ne pas afficher d'erreur pour la sync, le livre de base fonctionne
          }
        }
        
      } catch (fetchError) {
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
  }, [id, user?.id]); // FIX P1-3: Retirer navigate des deps

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

      const updatedProgress = await getBookReadingProgress(user.id, bookId);
      if (!isMounted.current) return;

      if (updatedProgress) {
        setBook(updatedProgress);
        // Pas de toast success ici - remplacé par un encart intégré
      } else {
        const updatedBook = await syncBookWithAPI(user.id, bookId);
        if (!isMounted.current) return;
        if (updatedBook) {
          setBook(updatedBook as BookWithProgress);
          // Pas de toast success ici - remplacé par un encart intégré
        } else {
          toast.error("Impossible de mettre à jour le livre");
        }
      }
    } catch (error) {
      toast.error("Erreur lors de la validation : " + (error as Error).message);
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <AppHeader />
        <main className="mx-auto w-full px-4 max-w-none py-6">
          {loading ? (
            <div className="min-h-[60vh] flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-coffee-dark mx-auto mb-4" />
                <p className="text-muted-foreground">Chargement du livre...</p>
              </div>
            </div>
          ) : error ? (
            <div className="min-h-[60vh] flex items-center justify-center">
              <div className="text-center max-w-none">
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
            <div className="space-y-6">
              {/* Message d'alerte si accès refusé au salon */}
              {accessDeniedMessage && (
                <div className="max-w-4xl mx-auto">
                  <div className="bg-coffee-lightest border border-coffee-light rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <span className="text-orange-500">⚠️</span>
                      <p className="text-coffee-dark font-medium">{accessDeniedMessage}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <BookDetail book={book} onChapterComplete={handleChapterComplete} />
              {book.progressPercent >= 100 && (
                <div className="max-w-4xl mx-auto">
                  <div className="bg-coffee-lightest/50 border border-coffee-light rounded-lg p-6 text-center">
                    <div className="flex items-center justify-center gap-3 mb-4">
                      <span className="text-2xl">🎉</span>
                      <h3 className="text-xl font-semibold text-coffee-darker">
                        Félicitations ! Vous avez terminé ce livre
                      </h3>
                    </div>
                    <p className="text-muted-foreground mb-4">
                      Rejoignez la discussion avec d'autres lecteurs qui ont également terminé "{book.title}"
                    </p>
                    <Link 
                      to={`/finished-chat/${book.slug || id}`}
                      className="inline-flex items-center gap-2 bg-coffee-dark hover:bg-coffee-darker text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                      <span>💬</span>
                      Accéder au salon de discussion
                    </Link>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="min-h-[60vh] flex items-center justify-center">
              <div className="text-center max-w-none">
                <h2 className="text-xl font-medium text-coffee-darker mb-2">{t.common.bookNotAvailable}</h2>
                <p className="text-muted-foreground mb-4">{t.common.bookNotAvailableDescription}</p>
                <button 
                  className="text-coffee-dark hover:text-coffee-darker underline"
                  onClick={() => navigate("/explore")}
                >
                  {t.common.discoverOtherBooks}
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </AuthGuard>
  );
}
