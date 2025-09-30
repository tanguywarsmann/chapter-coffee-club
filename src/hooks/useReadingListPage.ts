import { useEffect, useState, useCallback } from "react";
import { fetchReadingProgress, fetchBooksForStatus } from "@/services/reading/readingListService";
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
        
        // Récupérer les données brutes de progression
        const payload = await fetchReadingProgress(user.id);

        if (cancelled) return;

        // Utiliser le service qui calcule correctement les segments validés et la progression
        const toReadBooks = await fetchBooksForStatus(payload, 'to_read', user.id);
        const inProgressBooks = await fetchBooksForStatus(payload, 'in_progress', user.id);
        const completedBooks = await fetchBooksForStatus(payload, 'completed', user.id);

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