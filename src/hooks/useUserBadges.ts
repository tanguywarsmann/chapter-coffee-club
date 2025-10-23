import { useQuery } from '@tanstack/react-query';
import { getUserBadges } from '@/services/badgeService';

export const useUserBadges = (userId: string) =>
  useQuery({
    queryKey: ['user-badges', userId],
    queryFn: () => getUserBadges(userId),
    enabled: !!userId,
    staleTime: 30_000, // 30 seconds
  });
