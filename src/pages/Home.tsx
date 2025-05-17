
import { useCallback, useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AppHeader } from "@/components/layout/AppHeader";
import { SearchBar } from "@/components/books/SearchBar";
import { WelcomeModal } from "@/components/onboarding/WelcomeModal";
import { useAuth } from "@/contexts/AuthContext";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { MainContent } from "@/components/home/MainContent";
import { useHomeSearch } from "@/hooks/useHomeSearch";
import { useCurrentReading } from "@/hooks/useCurrentReading";
import { useReadingProgress } from "@/hooks/useReadingProgress";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Home() {
  // Cache render count instead of logging to optimize performance
  const renderCount = useRef(0);
  const isMobile = useIsMobile();
  
  // Memoized state for welcome message
  const [showWelcome, setShowWelcome] = useState(() => {
    return !localStorage.getItem("onboardingDone");
  });

  const { 
    searchResults, 
    setSearchResults, 
    handleSearch, 
    isSearching, 
    isRedirecting 
  } = useHomeSearch();
  
  // Only fetch current reading data when needed
  const { 
    currentReading, 
    isLoadingCurrentBook 
  } = useCurrentReading();
  
  // Conditionally fetch reading progress based on mobile state
  const { 
    readingProgress, 
    isLoading, 
    handleProgressUpdate 
  } = useReadingProgress();
  
  const navigate = useNavigate();

  // Memoize this function to avoid unnecessary re-renders
  const handleContinueReading = useCallback(() => {
    if (currentReading) {
      if (currentReading.isUnavailable) {
        toast.error("This book is currently unavailable", {
          id: "book-unavailable" // Avoid duplicate toasts
        });
        return;
      }
      navigate(`/books/${currentReading.id}?segment=${Math.floor(currentReading.chaptersRead)}`);
    }
  }, [currentReading, navigate]);

  // Memoize search state to avoid unnecessary renders
  const showSearchResults = useMemo(() => !!searchResults, [searchResults]);
  
  // Memoize props passed to MainContent to ensure stability
  const mainContentProps = useMemo(() => ({
    searchResults,
    onResetSearch: () => setSearchResults(null),
    currentReading,
    isLoadingCurrentBook,
    readingProgress,
    isLoading,
    isSearching,
    isRedirecting,
    onProgressUpdate: handleProgressUpdate,
    onContinueReading: handleContinueReading
  }), [
    searchResults, 
    setSearchResults, 
    currentReading, 
    isLoadingCurrentBook,
    readingProgress, 
    isLoading,
    isSearching,
    isRedirecting,
    handleProgressUpdate, 
    handleContinueReading
  ]);

  // Only increment render counter in dev for debugging
  if (process.env.NODE_ENV === 'development') {
    renderCount.current++;
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-logo-background text-logo-text transition-all duration-300">
        <AppHeader />
        <WelcomeModal 
          open={showWelcome} 
          onClose={() => setShowWelcome(false)}
        />
        
        <main className={`container ${isMobile ? 'py-2' : 'py-4 sm:py-6'} space-y-4 sm:space-y-8 animate-fade-in focus:outline-none`} tabIndex={-1}>
          <div className="max-w-2xl mx-auto px-2 sm:px-0">
            <h1 className="sr-only">Home - READ</h1>
            <SearchBar 
              onSearch={handleSearch}
              isSearching={isSearching} 
            />
          </div>

          <MainContent 
            searchResults={searchResults}
            onResetSearch={() => setSearchResults(null)}
            currentReading={currentReading}
            isLoadingCurrentBook={isLoadingCurrentBook}
            readingProgress={readingProgress}
            isLoading={isLoading}
            isSearching={isSearching}
            isRedirecting={isRedirecting}
            onProgressUpdate={handleProgressUpdate}
            onContinueReading={handleContinueReading}
          />
        </main>
      </div>
    </AuthGuard>
  );
}
