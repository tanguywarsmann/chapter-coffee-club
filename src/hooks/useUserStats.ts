import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { getUserStats, UserStats } from '@/services/reading/statsService';

export const useUserStats = (
  userId: string,
  options?: Partial<Omit<UseQueryOptions<UserStats, unknown, UserStats, readonly ["user-stats", string]>, 'queryKey' | 'queryFn'>>
) =>
  useQuery({
    queryKey: ['user-stats', userId],
    queryFn: () => getUserStats(userId),
    enabled: !!userId,
    staleTime: 60_000, // 1 min
    ...options,
  });
