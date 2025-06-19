
import React, { memo, useEffect } from 'react';
import { ReadingProgress } from "./ReadingProgress";
import { ReadingProgress as ReadingProgressType } from "@/types/reading";
import { texts } from "@/i18n/texts";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { fixInconsistentReadingStatus } from "@/services/reading/dataConsistencyService";
import { toast } from "sonner";

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
  const navigate = useNavigate();
  const { user } = useAuth();

  // Correction automatique des données incohérentes au chargement
  useEffect(() => {
    if (user?.id && readingProgress && readingProgress.length > 0) {
      const fixData = async () => {
        try {
          const result = await fixInconsistentReadingStatus(user.id);
          if (result.success && result.corrected > 0) {
            console.log(`[HomeContent] ${result.corrected} données corrigées`);
            // Pas de toast pour éviter de perturber l'UX
          }
        } catch (error) {
          console.error('[HomeContent] Erreur correction données:', error);
        }
      };
      
      // Délai pour éviter de ralentir le chargement initial
      setTimeout(fixData, 2000);
    }
  }, [user?.id, readingProgress]);

  if (!readingProgress || !Array.isArray(readingProgress)) {
    return <div>{texts.loading}...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Core reading progress - always shown */}
      <ReadingProgress progressItems={readingProgress} isLoading={isLoading} />

      {/* Mobile-optimized stats button */}
      <div className="text-center p-4">
        <Button 
          className="w-full bg-coffee-dark text-white hover:bg-coffee-darker rounded-xl text-base font-semibold px-6 py-3 transition-all duration-200 shadow-sm hover:shadow-md"
          onClick={() => navigate("/achievements")}
        >
          {texts.viewYourReadingStats} →
        </Button>
      </div>
    </div>
  );
});

export default HomeContent;
