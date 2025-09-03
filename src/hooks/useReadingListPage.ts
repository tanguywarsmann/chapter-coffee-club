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

        // Convert to Book format for display
        const convertToBooks = (rows: any[]): Book[] => rows.map((row: any) => ({
          id: row.books?.id || row.book_id,
          title: row.books?.title || 'Titre inconnu',
          author: row.books?.author || 'Auteur inconnu',
          description: row.books?.description || '',
          coverImage: row.books?.cover_url || '',
          cover_url: row.books?.cover_url || '',
          pages: row.books?.total_pages || 0,
          categories: row.books?.tags || [],
          tags: row.books?.tags || [],
          totalChapters: row.books?.expected_segments || 0,
          language: 'fr',
          publicationYear: new Date().getFullYear(),
          slug: row.books?.slug || row.books?.id || row.book_id,
          isCompleted: row.is_completed || false,
          expectedSegments: row.books?.expected_segments || 0,
        }));

        setState(s => ({
          ...s,
          toReadCount: payload.toReadCount,
          inProgressCount: payload.inProgressCount,
          completedCount: payload.completedCount,
          toRead: convertToBooks(payload.toRead),
          inProgress: convertToBooks(payload.inProgress),
          completed: convertToBooks(payload.completed),
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