
import React from "react";
import { GoalsPreview } from "./GoalsPreview";
import { ReadingProgress } from "./ReadingProgress";
import { ActivityFeed } from "./ActivityFeed";
import { ReadingProgress as ReadingProgressType } from "@/types/reading";
import { getUserActivities } from "@/mock/activities";
import { FollowerStats } from "./FollowerStats";
import { RecommendedUsers } from "./RecommendedUsers";
import { isInIframe, isPreview, isMobile } from "@/utils/environment";

console.log("Chargement de HomeContent.tsx", {
  isPreview: isPreview(),
  isInIframe: isInIframe(),
  isMobile: isMobile(),
});

console.log(">>> Début HomeContent.tsx - Contexte", {
  isInIframe: isInIframe(),
  isPreview: isPreview(),
  userAgent: typeof navigator !== "undefined" ? navigator.userAgent : null,
});

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
  console.log(">>> HomeContent START rendu");

  try {
    console.log("Rendering HomeContent", {
      readingProgressCount: readingProgress?.length || 0,
      isLoading,
    });
  } catch (e) {
    console.error("Erreur dans le logging initial:", e);
  }

  // Vérification de l'état mobile
  let mobileState;
  try {
    mobileState = isMobile();
    console.log("useIsMobile helper successful", { isMobile: mobileState });
  } catch (e) {
    console.error("Erreur dans l'évaluation du mode mobile :", e);
    return <div>Erreur : impossible de déterminer le mode d'affichage</div>;
  }

  // Récupération sécurisée des activités
  let activities: any[] = [];
  try {
    activities = getUserActivities();
    console.log("getUserActivities successful", {
      activitiesCount: activities.length,
    });
  } catch (e) {
    console.error("Erreur dans getUserActivities :", e);
    activities = [];
  }

  // Sécurité : fallback si readingProgress est absent
  if (!readingProgress || !Array.isArray(readingProgress)) {
    return <div>Chargement des données de lecture...</div>;
  }

  // Rendu principal
return (
  <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4">
    <div className="space-y-6 md:col-span-2 lg:col-span-3">
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
  {/* <RecommendedUsers /> */}
  <div style={{ padding: 20, background: "#f9f9f9" }}>
    Composant RecommendedUsers désactivé
  </div>
</div>
          {/* SimilarReaders temporairement désactivé */}
        </div>
      </div>
    </div>
    <div className={`${mobileState ? "mt-6 md:mt-0" : ""}`}>
      {activities.length > 0 ? (
        <ActivityFeed activities={activities} />
      ) : (
        <div>Données d'activité non disponibles</div>
      )}
    </div>
  </div>
);
}
