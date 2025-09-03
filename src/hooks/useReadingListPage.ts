import { useEffect, useState, useCallback } from "react";
import { fetchReadingProgress } from "@/services/reading/readingListService";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Book } from "@/types/book";

type RLState = {
  toReadCount: number;
  inProgressCount: number;
  completedCount: number;
  isLoading: boolean;
  isLoadingReadingList: boolean;
  hasInitialFetch: boolean;
  isDataReady: boolean;
  toRead: Book[];
  inProgress: Book[];
  completed: Book[];
};

export const useReadingListPage = () => {
  const navigate = useNavigate();
  const { user, session } = useAuth();
  const [state, setState] = useState<RLState>({
    toReadCount: 0,
    inProgressCount: 0,
    completedCount: 0,
    isLoading: true,
    isLoadingReadingList: false,
    hasInitialFetch: false,
    isDataReady: false,
    toRead: [],
    inProgress: [],
    completed: [],
  });

  const navigateToBook = useCallback((bookId: string) => {
    navigate(`/books/${bookId}`);
  }, [navigate]);

  useEffect(() => {
    if (!user?.id) {
      console.log("⚪ [ReadingList] no user, finishing empty");
      setState(s => ({ ...s, isLoading: false, isLoadingReadingList: false, hasInitialFetch: true, isDataReady: true }));
      return;
    }

    let cancelled = false;
    const run = async () => {
      try {
        setState(s => ({ ...s, isLoading: true, isLoadingReadingList: true }));
        console.log("[useReadingListPage] User:", user, " Session:", session);
        const payload = await fetchReadingProgress(user.id);

        if (cancelled) return;

        // Convert to Book format for display avec calcul des segments validés
        const convertToBooks = async (rows: any[]): Promise<Book[]> => {
          return Promise.all(rows.map(async (row: any) => {
            // Calculer les segments validés comme sur la page d'accueil
            const { getValidatedSegmentCount } = await import("@/services/reading/validatedSegmentCount");
            const validatedSegments = await getValidatedSegmentCount(user.id, row.book_id);
            const expectedSegments = row.books?.expected_segments || row.books?.total_chapters || 10;
            const progressPercent = Math.round((validatedSegments / (expectedSegments || 1)) * 100);
            
            console.log("📋 ReadingList progress calculation:", {
              title: row.books?.title,
              book_id: row.book_id,
              userId: user.id,
              validatedSegments,
              expectedSegments,
              progressPercent
            });
            
            return {
              id: row.books?.id || row.book_id,
              title: row.books?.title || 'Titre inconnu',
              author: row.books?.author || 'Auteur inconnu',
              description: row.books?.description || '',
              coverImage: row.books?.cover_url || '',
              cover_url: row.books?.cover_url || '',
              pages: row.books?.total_pages || 0,
              categories: row.books?.tags || [],
              tags: row.books?.tags || [],
              totalChapters: expectedSegments,
              chaptersRead: validatedSegments, // Ajouter les segments validés
              currentSegment: validatedSegments,
              progressPercent: progressPercent, // Ajouter le pourcentage calculé
              language: 'fr',
              publicationYear: new Date().getFullYear(),
              slug: row.books?.slug || row.books?.id || row.book_id,
              isCompleted: row.is_completed || false,
              expectedSegments: expectedSegments,
            };
          }));
        };

        // Attendre les résultats des conversions asynchrones
        const [toReadBooks, inProgressBooks, completedBooks] = await Promise.all([
          convertToBooks(payload.toRead),
          convertToBooks(payload.inProgress),
          convertToBooks(payload.completed)
        ]);

        setState(s => ({
          ...s,
          toReadCount: payload.toReadCount,
          inProgressCount: payload.inProgressCount,
          completedCount: payload.completedCount,
          toRead: toReadBooks,
          inProgress: inProgressBooks,
          completed: completedBooks,
          isLoading: false,
          isLoadingReadingList: false,
          hasInitialFetch: true,
          isDataReady: true,
        }));
      } catch (e) {
        console.error("[useReadingListPage] fatal:", e);
        if (cancelled) return;
        setState(s => ({
          ...s,
          isLoading: false,
          isLoadingReadingList: false,
          hasInitialFetch: true,
          isDataReady: true,
        }));
      }
    };

    run();
    return () => { cancelled = true; };
  }, [user?.id]);

  return {
    books: {
      toRead: state.toRead,
      inProgress: state.inProgress,
      completed: state.completed
    },
    loading: {
      isLoading: state.isLoading,
      isLoadingReadingList: state.isLoadingReadingList,
      isDataReady: state.isDataReady,
      isFetching: false
    },
    navigateToBook,
  };
};