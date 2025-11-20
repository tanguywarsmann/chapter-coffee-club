
import { AuthGuard } from "@/components/auth/AuthGuard";
import { BookDetail } from "@/components/books/BookDetail";
import { AppHeader } from "@/components/layout/AppHeader";
import { useAuth } from "@/contexts/AuthContext";
import { useExpectedSegments } from "@/hooks/useExpectedSegments";
import { useTranslation } from "@/i18n/LanguageContext";
import { BookDetailResult, ensureProgressBookShape, fetchBookDetail } from "@/services/books/bookDetailService";
import { syncBookWithAPI, validateReading } from "@/services/reading";
import { getBookReadingProgress } from "@/services/reading/progressService";
import { BookWithProgress } from "@/types/reading";
import { uiCanSurfaceJoker } from "@/utils/jokerUiGate";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

export default function BookPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [accessDeniedMessage, setAccessDeniedMessage] = useState<string | null>(null);
  const detailQueryKey = ["book-detail", user?.id ?? null, id];

  const bookDetailQuery = useQuery({
    queryKey: detailQueryKey,
    enabled: Boolean(id),
    queryFn: async () => {
      if (!id) {
        throw new Error("Aucun identifiant de livre fourni");
      }
      return fetchBookDetail(id, user?.id ?? null);
    },
    staleTime: 1000 * 60,
    retry: 1,
  });

  const book = bookDetailQuery.data?.book ?? null;
  const progressError = bookDetailQuery.data?.progressError ?? null;
  const shouldShowLoader = bookDetailQuery.isLoading && !book;
  const loadError = !id
    ? "Aucun identifiant de livre fourni"
    : bookDetailQuery.error
      ? (bookDetailQuery.error as Error).message
      : null;

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

  useEffect(() => {
    if (loadError) {
      toast.error(loadError);
    }
  }, [loadError]);

  useEffect(() => {
    // Vérifier si on vient d'une redirection avec message d'erreur
    if (location.state?.accessDenied && location.state?.message) {
      setAccessDeniedMessage(location.state.message);
      // Nettoyer le state pour éviter que le message persiste
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleBackClick = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/explore");
    }
  };

  const handleChapterComplete = async (bookId: string) => {
    if (!book || !user?.id) {
      toast.error("Vous devez être connecté pour valider un chapitre");
      return;
    }

    try {
      await validateReading({
        user_id: user.id,
        book_id: bookId,
        segment: book.currentSegment ?? book.chaptersRead ?? 0
      });

      if (!id) return;

      const updatedProgress = await getBookReadingProgress(user.id, bookId);

      if (updatedProgress) {
        queryClient.setQueryData<BookDetailResult | undefined>(detailQueryKey, (previous) => {
          if (!previous) return previous;
          return {
            ...previous,
            book: ensureProgressBookShape(updatedProgress),
            progressError: null,
          };
        });
        return;
      }

      const updatedBook = await syncBookWithAPI(user.id, bookId);
      if (updatedBook) {
        queryClient.setQueryData<BookDetailResult | undefined>(detailQueryKey, (previous) => {
          if (!previous) return previous;
          return {
            ...previous,
            book: ensureProgressBookShape(updatedBook as BookWithProgress),
            progressError: previous.progressError ?? null,
          };
        });
        return;
      }

      toast.error("Impossible de mettre à jour le livre");
    } catch (error) {
      toast.error("Erreur lors de la validation : " + (error as Error).message);
      queryClient.invalidateQueries({ queryKey: detailQueryKey });
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <AppHeader />
        <main className="mx-auto w-full px-4 max-w-none py-6">
          <div className="max-w-4xl mx-auto mb-6">
            <button
              type="button"
              onClick={handleBackClick}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full border border-border">
                <ArrowLeft className="w-4 h-4" />
              </span>
              <span>Retour</span>
            </button>
          </div>
          {shouldShowLoader ? (
            <div className="min-h-[60vh] flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-coffee-dark mx-auto mb-4" />
                <p className="text-muted-foreground">Chargement du livre...</p>
              </div>
            </div>
          ) : loadError ? (
            <div className="min-h-[60vh] flex items-center justify-center">
              <div className="text-center max-w-none">
                <h2 className="text-xl font-medium text-coffee-darker mb-2">Erreur</h2>
                <p className="text-muted-foreground mb-4">{loadError}</p>
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

              {progressError && (
                <div className="max-w-4xl mx-auto">
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-900">
                    {progressError}
                  </div>
                </div>
              )}

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
