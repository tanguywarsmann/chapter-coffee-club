
import { useState, useEffect, useRef, useCallback } from "react";
import { Book } from "@/types/book";
import { ReadingProgress } from "@/types/reading";
import { getBookReadingProgress } from "@/services/reading/progressService";
import { useReadingProgress } from "@/hooks/useReadingProgress";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

import { handleSupabaseError } from "@/services/supabaseErrorHandler";

export function useBookDetailProgress(initialBook: Book) {
  const [currentBook, setCurrentBook] = useState<Book>(initialBook);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [readingProgress, setReadingProgress] = useState<ReadingProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { refetch: refreshReadingProgress } = useReadingProgress();
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMounted = useRef(true);

  const bookIdentifier = currentBook?.id || currentBook?.slug || '';

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, []);

  const refreshProgressData = useCallback(async () => {
    if (!user?.id || !bookIdentifier) return;

    try {
      setError(null);
      setIsRetrying(true);

      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }

      const progress = await getBookReadingProgress(user.id, bookIdentifier);

      if (!isMounted.current) return;

      if (progress) {
        setReadingProgress(progress);

        const chaptersRead = progress.chaptersRead || 0;
        setCurrentBook(prevBook => ({
          ...prevBook,
          chaptersRead: chaptersRead,
          progressPercent: progress.progressPercent,
          currentSegment: progress.currentSegment
        }));

        setProgressPercent(progress.progressPercent || 0);

        setTimeout(() => {
          if (progressRef.current) {
            progressRef.current.style.transform = 'translateZ(0)';
          }
        }, 0);
      }
    } catch (err) {
      if (!isMounted.current) return;

      const errorInfo = handleSupabaseError('useBookDetailProgress', err);
      setError(errorInfo.userMessage);

      // Toast seulement si c'est pas une erreur auth (auth gérée globalement)
      if (!errorInfo.isAuthExpired) {
        toast.error(errorInfo.userMessage);
      }
    } finally {
      if (isMounted.current) {
        setIsRetrying(false);
      }
    }
  }, [user?.id, bookIdentifier]);

  useEffect(() => {
    const fetchProgress = async () => {
      if (user?.id && bookIdentifier) {
        await refreshProgressData();
      }
    };
    fetchProgress();
  }, [user?.id, bookIdentifier, refreshProgressData]);

  useEffect(() => {
    if (readingProgress) {
      setProgressPercent(readingProgress.progressPercent || 0);
    }
  }, [readingProgress]);

  return {
    currentBook,
    setCurrentBook,
    progressPercent,
    setProgressPercent,
    readingProgress,
    setReadingProgress,
    progressRef,
    refreshReadingProgress,
    refreshProgressData,
    user,
    error,
    isRetrying,
    retry: refreshProgressData,
  };
}
