
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

console.log(">>> Début HomeContent.tsx - Contexte", {
  isInIframe: window.self !== window.top,
  isPreview: window.location.hostname.includes("lovable.app"),
  userAgent: navigator.userAgent,
});

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
  console.log("HomeContent START");

  try {
    console.log("Rendering HomeContent", { 
      readingProgressCount: readingProgress?.length || 0,
      isLoading
    });
  } catch (e) {
    console.error("Erreur dans le logging initial:", e);
  }

  // Vérifier si readingProgress est défini avant de l'utiliser
  let isMobile;
  try {
    if (!readingProgress) {
      console.warn("readingProgress est undefined dans HomeContent");
      return <div>Chargement des données de lecture...</div>;
    }
    
    isMobile = useIsMobile();
    console.log("useIsMobile hook successful", { isMobile });
  } catch (e) {
    console.error("Erreur dans useIsMobile ou la vérification de readingProgress:", e);
    return <div>Erreur dans HomeContent: impossible de déterminer la vue</div>;
  }

  try {
    const activities = getUserActivities();
    console.log("getUserActivities successful", { activitiesCount: activities.length });
    
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
  } catch (e) {
    console.error("Erreur dans le rendu du composant HomeContent:", e);
    return (
      <div className="p-4 border border-red-300 bg-red-50 rounded-md">
        <h3 className="text-red-700 font-medium">Erreur dans HomeContent</h3>
        <p className="text-red-600">{e instanceof Error ? e.message : String(e)}</p>
      </div>
    );
  }
}
