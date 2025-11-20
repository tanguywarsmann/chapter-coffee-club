import { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchReadingProgress, fetchBooksForStatus } from "@/services/reading/readingListService";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Book } from "@/types/book";

interface ReadingListData {
  books: {
    toRead: Book[];
    inProgress: Book[];
    completed: Book[];
  };
  counts: {
    toRead: number;
    inProgress: number;
    completed: number;
  };
}

const loadReadingList = async (userId: string): Promise<ReadingListData> => {
  const payload = await fetchReadingProgress(userId);

  const [toRead, inProgress, completed] = await Promise.all([
    fetchBooksForStatus(payload, "to_read", userId),
    fetchBooksForStatus(payload, "in_progress", userId),
    fetchBooksForStatus(payload, "completed", userId),
  ]);

  return {
    books: {
      toRead,
      inProgress,
      completed,
    },
    counts: {
      toRead: payload.toReadCount,
      inProgress: payload.inProgressCount,
      completed: payload.completedCount,
    },
  };
};

export const useReadingListPage = () => {
  const navigate = useNavigate();
  const { user, isInitialized, isLoading: isAuthLoading } = useAuth();

  const navigateToBook = useCallback((bookId: string) => {
    navigate(`/books/${bookId}`);
  }, [navigate]);

  const enabled = Boolean(user?.id && isInitialized && !isAuthLoading);

  const readingListQuery = useQuery({
    queryKey: ["reading-list-page", user?.id],
    enabled,
    queryFn: () => loadReadingList(user!.id),
    staleTime: 1000 * 60,
  });

  const books = readingListQuery.data?.books ?? {
    toRead: [],
    inProgress: [],
    completed: [],
  };

  const error = readingListQuery.error ? (readingListQuery.error as Error).message : null;

  return {
    books,
    loading: {
      isLoading: !isInitialized || isAuthLoading || (enabled && readingListQuery.isLoading),
      isFetching: enabled && readingListQuery.isFetching,
    },
    error,
    retry: readingListQuery.refetch,
    navigateToBook,
  };
};
