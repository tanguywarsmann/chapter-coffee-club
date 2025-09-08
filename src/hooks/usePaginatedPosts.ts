import { useState, useEffect } from 'react';
import { blogService, BlogPost } from '@/services/blogService';

interface UsePaginatedPostsReturn {
  posts: BlogPost[];
  total: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
}

export const usePaginatedPosts = (page: number, pageSize = 20): UsePaginatedPostsReturn => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  useEffect(() => {
    const loadPosts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const { data, count } = await blogService.getPublishedPostsPage(page, pageSize);
        setPosts(data);
        setTotal(count);
      } catch (err) {
        setError('Erreur lors du chargement des articles');
        console.error('Error loading paginated posts:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadPosts();
  }, [page, pageSize]);

  return {
    posts,
    total,
    totalPages,
    isLoading,
    error
  };
};