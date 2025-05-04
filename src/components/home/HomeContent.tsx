import React, { useEffect, useState } from 'react'; // <-- Ajout de useEffect et useState
import { Book } from "@/types/book";
import { GoalsPreview } from "./GoalsPreview";
import { ReadingProgress } from "./ReadingProgress";
import { ActivityFeed } from "./ActivityFeed";
import { useIsMobile } from "@/hooks/use-mobile";
import { ReadingProgress as ReadingProgressType } from "@/types/reading";
import { getUserActivities } from "@/mock/activities";
import { useAuth } from "@/contexts/AuthContext"; // <-- Import du contexte utilisateur
import { getFollowerCounts } from "@/services/user/profileService"; // <-- Import de la fonction

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
  const isMobile = useIsMobile();
  const { user } = useAuth();

  // États pour stocker les nombres réels
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  // Récupération dynamique des chiffres d'abonnement
  useEffect(() => {
    const fetchCounts = async () => {
      if (user?.id) {
        const counts = await getFollowerCounts(user.id);
        setFollowerCount(counts.followers);
        setFollowingCount(counts.following);
      }
    };

    fetchCounts();
  }, [user?.id]);

  return (
    <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4">
      <div className="space-y-6 md:col-span-2 lg:col-span-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <GoalsPreview 
              followerCount={followerCount} 
              followingCount={followingCount} 
            />
          </div>
        </div>
        
        <ReadingProgress 
          key={`reading-progress-${readingProgress.length}`}
          progressItems={readingProgress}
          isLoading={isLoading} 
        />
      </div>
      <div className={`${isMobile ? 'mt-6 md:mt-0' : ''}`}>
        <ActivityFeed activities={getUserActivities()} />
      </div>
    </div>
  );
}
