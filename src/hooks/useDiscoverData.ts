import { useQueries } from '@tanstack/react-query';
import { getInProgressBooks, getNewestBooks, getFavoriteBooks } from '@/services/discoverService';

export const useDiscoverData = (userId: string | null) => {
  return useQueries({
    queries: [
      { 
        queryKey: ['in-progress', userId], 
        queryFn: () => userId ? getInProgressBooks(userId) : Promise.resolve({ data: [] }),
        enabled: !!userId
      },
      { 
        queryKey: ['newest-books'], 
        queryFn: () => getNewestBooks()
      },
      { 
        queryKey: ['favorites', userId], 
        queryFn: () => userId ? getFavoriteBooks(userId) : Promise.resolve({ data: [] }),
        enabled: !!userId
      },
    ],
  });
};