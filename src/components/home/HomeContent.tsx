
import React from 'react';
import { GoalsPreview } from "./GoalsPreview";
import { ReadingProgress } from "./ReadingProgress";
import { ActivityFeed } from "./ActivityFeed";
import { useIsMobile } from "@/hooks/use-mobile";
import { ReadingProgress as ReadingProgressType } from "@/types/reading";
import { getUserActivities } from "@/mock/activities";
import { FollowerStats } from "./FollowerStats";
import { RecommendedUsers } from "./RecommendedUsers";
import SimilarReaders from "./SimilarReaders";

interface HomeContentProps {
  readingProgress: ReadingProgressType[];
  isLoading: boolean;
  onProgressUpdate: (bookId: string) => void;
}

export function HomeContent({
  readingProgress,
  isLoading,
  onProgressUpdate
}: HomeContentProps) {
  console.log("Rendering HomeContent", { 
    readingProgressCount: readingProgress?.length || 0,
    isLoading
  });

  // Vérifier si readingProgress est défini avant de l'utiliser
  if (!readingProgress) {
    console.warn("readingProgress est undefined dans HomeContent");
    return <div>Chargement des données de lecture...</div>;
  }
  
  const isMobile = useIsMobile();

  return (
    <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4">
      <div className="space-y-6 md:col-span-2 lg:col-span-3">
        {/* Lecture en cours d'abord */}
        <ReadingProgress 
          key={`reading-progress-${readingProgress.length}`}
          progressItems={readingProgress}
          isLoading={isLoading}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <GoalsPreview />
            <FollowerStats />
          </div>
          <div className="space-y-6">
            {/* Lecteurs à découvrir avant les lecteurs similaires */}
            <RecommendedUsers />
            <SimilarReaders />
          </div>
        </div>
      </div>
      <div className={`${isMobile ? 'mt-6 md:mt-0' : ''}`}>
        <ActivityFeed activities={getUserActivities()} />
      </div>
    </div>
  );
}
