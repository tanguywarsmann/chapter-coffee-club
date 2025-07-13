import { useQuery } from '@tanstack/react-query';
import { getUserStats, UserStats } from '@/services/reading/statsService';

export const useUserStats = (userId: string) =>
  useQuery({
    queryKey: ['user-stats', userId],
    queryFn: () => getUserStats(userId),
    enabled: !!userId,
    staleTime: 60_000, // 1 min
  });