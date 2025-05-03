
import React from 'react';
import { Book } from "@/types/book";
import { GoalsPreview } from "./GoalsPreview";
import { ReadingProgress } from "./ReadingProgress";
import { ActivityFeed } from "./ActivityFeed";
import { useIsMobile } from "@/hooks/use-mobile";
import { ReadingProgress as ReadingProgressType } from "@/types/reading";

interface HomeContentProps {
  readingProgresses: ReadingProgressType[];
  isLoading: boolean;
  onProgressUpdate: (bookId: string) => void;
}

export function HomeContent({
  readingProgresses,
  isLoading,
  onProgressUpdate
}: HomeContentProps) {
  const isMobile = useIsMobile();

  return (
    <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4">
      <div className="space-y-6 md:col-span-2 lg:col-span-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <GoalsPreview />
          </div>
        </div>
        
        <ReadingProgress 
          key={`reading-progress-${readingProgresses.length}`}
          progressItems={readingProgresses}
          isLoading={isLoading} 
        />
      </div>
      <div className={`${isMobile ? 'mt-6 md:mt-0' : ''}`}>
        <ActivityFeed activities={getUserActivities()} />
      </div>
    </div>
  );
}

// Imported here to avoid breaking the component
import { getUserActivities } from "@/mock/activities";
