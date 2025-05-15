
import { GoalsPreview } from "./GoalsPreview";
import { ReadingProgress } from "./ReadingProgress";
import { ActivityFeed } from "./ActivityFeed";
import { ReadingProgress as ReadingProgressType } from "@/types/reading";
import { getUserActivities } from "@/mock/activities";
import { FollowerStats } from "./FollowerStats";
import { RecommendedUsers } from "./RecommendedUsers";
import SimilarReaders from "./SimilarReaders";
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

  let mobileState;
  try {
    mobileState = isMobile();
    console.log("useIsMobile helper successful", { isMobile: mobileState });
  } catch (e) {
    console.error("Erreur dans l'évaluation du mode mobile :", e);
    return <div>Erreur : impossible de déterminer le mode d'affichage</div>;
  }

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

  if (!readingProgress || !Array.isArray(readingProgress)) {
    return <div>Chargement des données de lecture...</div>;
  }

  return (
    <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4">
      <div className="space-y-6 md:col-span-2 lg:col-span-3">
        {(() => {
          try {
            return <ReadingProgress progressItems={readingProgress} isLoading={isLoading} />;
          } catch (e) {
            console.error("Erreur dans ReadingProgress :", e);
            return (
              <div className="p-4 border border-dashed border-red-300 text-sm text-muted-foreground rounded-md">
                Erreur dans le composant ReadingProgress
              </div>
            );
          }
        })()}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            {(() => {
              try {
                return <GoalsPreview />;
              } catch (e) {
                console.error("Erreur dans GoalsPreview :", e);
                return <div>Erreur GoalsPreview</div>;
              }
            })()}
            {(() => {
              try {
                return <FollowerStats />;
              } catch (e) {
                console.error("Erreur dans FollowerStats :", e);
                return <div>Erreur FollowerStats</div>;
              }
            })()}
          </div>
          <div className="space-y-6">
            {(() => {
              try {
                return <RecommendedUsers />;
              } catch (e) {
                console.error("Erreur dans RecommendedUsers :", e);
                return (
                  <div className="p-4 border border-dashed border-gray-300 text-sm text-muted-foreground rounded-md">
                    Erreur lors du chargement des lecteurs recommandés
                  </div>
                );
              }
            })()}
            {(() => {
              try {
                return <SimilarReaders />;
              } catch (e) {
                console.error("Erreur dans SimilarReaders :", e);
                return (
                  <div className="p-4 border border-dashed border-gray-300 text-sm text-muted-foreground rounded-md">
                    Erreur lors du chargement des lecteurs similaires
                  </div>
                );
              }
            })()}
          </div>
        </div>
      </div>

      <div className={`${mobileState ? "mt-6 md:mt-0" : ""}`}>
        {activities.length > 0 ? (
          (() => {
            try {
              return <ActivityFeed activities={activities} />;
            } catch (e) {
              console.error("Erreur dans ActivityFeed :", e);
              return <div>Erreur lors du chargement des activités</div>;
            }
          })()
        ) : (
          <div>Données d'activité non disponibles</div>
        )}
      </div>
    </div>
  );
}
