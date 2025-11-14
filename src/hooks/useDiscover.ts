
import { useQuery } from '@tanstack/react-query';
import { getDiscoverData } from '@/services/user/realDiscoverService';

export const useDiscover = (userId: string | undefined, isInitialized: boolean) => {
  return useQuery({
    queryKey: ['discover', userId],
    queryFn: () => getDiscoverData(userId!),
    enabled: !!userId && isInitialized,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
};
