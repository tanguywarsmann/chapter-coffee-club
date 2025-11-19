import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { getUserStats, UserStats } from '@/services/reading/statsService';

export const useUserStats = (
  userId: string,
  options?: UseQueryOptions<UserStats, unknown, UserStats, readonly ["user-stats", string]>
) =>
  useQuery({
    queryKey: ['user-stats', userId],
    queryFn: () => getUserStats(userId),
    enabled: !!userId,
    staleTime: 60_000, // 1 min
    ...options,
  });
