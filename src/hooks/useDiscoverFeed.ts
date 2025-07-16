import { useQuery } from '@tanstack/react-query';
import { getActivityFeed, getSuggestedReaders } from '@/services/discoverService';

export const useDiscoverFeed = (userId: string) => {
  const feedQuery = useQuery({
    queryKey: ['activity-feed', userId],
    queryFn: () => getActivityFeed(userId),
    enabled: !!userId,
  });

  const suggestionsQuery = useQuery({
    queryKey: ['suggested-readers', userId],
    queryFn: () => getSuggestedReaders(userId),
    enabled: !!userId,
  });

  return {
    feed: feedQuery,
    suggestions: suggestionsQuery,
  };
};