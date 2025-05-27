
import React, { memo } from 'react';
import { GoalsPreview } from "./GoalsPreview";
import { ReadingProgress } from "./ReadingProgress";
import { ActivityFeed } from "./ActivityFeed";
import { ReadingProgress as ReadingProgressType } from "@/types/reading";
import { getUserActivities } from "@/mock/activities";
import { FollowerStats } from "./FollowerStats";
import { RecommendedUsers } from "./RecommendedUsers";
import SimilarReaders from "@/components/home/SimilarReaders";
import { useIsMobile } from "@/hooks/use-mobile";
import { texts } from "@/i18n/texts";

interface HomeContentProps {
  readingProgress: ReadingProgressType[];
  isLoading: boolean;
  onProgressUpdate: (bookId: string) => void;
}

// Memoize the component to prevent unnecessary re-renders
export const HomeContent = memo(function HomeContent({
  readingProgress,
  isLoading,
  onProgressUpdate,
}: HomeContentProps) {
  const isMobile = useIsMobile();

  // Load activities only if needed (non-mobile or empty placeholder)
  const activities = React.useMemo(() => {
    if (isMobile) return [];
    
    try {
      return getUserActivities();
    } catch (e) {
      console.error("Error loading activities:", e);
      return [];
    }
  }, [isMobile]);

  if (!readingProgress || !Array.isArray(readingProgress)) {
    return <div>{texts.loading}...</div>;
  }

  return (
    <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4">
      <div className="space-y-6 md:col-span-2 lg:col-span-3">
        {/* Always render reading progress as it's a core feature */}
        <ReadingProgress progressItems={readingProgress} isLoading={isLoading} />

        {/* Conditionally render secondary content based on screen size */}
        {!isMobile && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <GoalsPreview />
              <FollowerStats />
            </div>
            <div className="space-y-6">
              <RecommendedUsers />
              <SimilarReaders />
            </div>
          </div>
        )}
        
        {/* Simple alternative for mobile */}
        {isMobile && (
          <div className="text-center p-4 border border-coffee-light rounded-md">
            <button 
              className="text-sm text-coffee-dark hover:text-coffee-darker"
              onClick={() => window.location.href = "/profile"}
            >
              {texts.viewYourReadingStats} →
            </button>
          </div>
        )}
      </div>

      {/* Activity feed with conditional rendering */}
      {(!isMobile && activities.length > 0) && (
        <div>
          <ActivityFeed activities={activities} />
        </div>
      )}
    </div>
  );
});

export default HomeContent;
