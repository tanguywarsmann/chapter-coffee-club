
import { memo } from 'react';
import { SimplifiedLibrary } from "./SimplifiedLibrary";
import { ReadingProgress as ReadingProgressType } from "@/types/reading";

interface HomeContentProps {
  readingProgress: ReadingProgressType[];
  isLoading: boolean;
  onProgressUpdate: (bookId: string) => void;
}

export const HomeContent = memo(function HomeContent({
  readingProgress,
  isLoading,
  onProgressUpdate,
}: HomeContentProps) {
  return (
    <SimplifiedLibrary 
      progressItems={readingProgress} 
      isLoading={isLoading} 
    />
  );
});
