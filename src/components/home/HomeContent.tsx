
import React, { memo } from 'react';
import { ReadingProgress } from "./ReadingProgress";
import { ReadingProgress as ReadingProgressType } from "@/types/reading";
import { texts } from "@/i18n/texts";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

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

