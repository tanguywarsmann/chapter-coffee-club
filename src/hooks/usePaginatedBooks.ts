import { useState, useMemo } from 'react';
import { Book } from '@/types/book';

interface UsePaginatedBooksOptions {
  initialPageSize?: number;
  pageSize?: number;
}

export const usePaginatedBooks = (
  books: Book[], 
  options: UsePaginatedBooksOptions = {}
) => {
  const { initialPageSize = 12, pageSize = 8 } = options;
  const [currentPage, setCurrentPage] = useState(1);

  const paginatedBooks = useMemo(() => {
    const totalToShow = initialPageSize + (currentPage - 1) * pageSize;
    return books.slice(0, totalToShow);
  }, [books, currentPage, initialPageSize, pageSize]);

  const hasMore = paginatedBooks.length < books.length;
  const totalPages = Math.ceil((books.length - initialPageSize) / pageSize) + 1;

  const loadMore = () => {
    if (hasMore) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const reset = () => {
    setCurrentPage(1);
  };

  return {
    paginatedBooks,
    hasMore,
    isLoading: false, // Can be enhanced with actual loading state
    loadMore,
    reset,
    currentPage,
    totalPages,
    totalItems: books.length,
    showingItems: paginatedBooks.length
  };
};