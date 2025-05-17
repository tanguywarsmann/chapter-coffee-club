
import React from 'react';
import { GoalsPreview } from "./GoalsPreview";
import { ReadingProgress } from "./ReadingProgress";
import { ActivityFeed } from "./ActivityFeed";
import { ReadingProgress as ReadingProgressType } from "@/types/reading";
import { getUserActivities } from "@/mock/activities";
import { FollowerStats } from "./FollowerStats";
import { RecommendedUsers } from "./RecommendedUsers";
import SimilarReaders from "@/components/home/SimilarReaders";
import { useIsMobile } from "@/hooks/use-mobile";

interface HomeContentProps {
  readingProgress: ReadingProgressType[];
  isLoading: boolean;
  onProgressUpdate: (bookId: string) => void;
}

export function HomeContent({
  readingProgress,
  isLoading,
  onProgressUpdate,
}: HomeContentProps) {
  const isMobile = useIsMobile();

  let activities: any[] = [];
  try {
    activities = getUserActivities();
  } catch (e) {
    console.error("Error loading activities:", e);
    activities = [];
  }

  if (!readingProgress || !Array.isArray(readingProgress)) {
    return <div>Loading reading data...</div>;
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
              View your reading stats →
            </button>
          </div>
        )}
      </div>

      {/* Activity feed with conditional rendering */}
      {(!isMobile || activities.length > 0) && (
        <div>
          {activities.length > 0 ? (
            <ActivityFeed activities={activities} />
          ) : (
            <div>No activity data available</div>
          )}
        </div>
      )}
    </div>
  );
}
