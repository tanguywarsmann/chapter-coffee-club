
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
  const initialRender = useRef(true);
  
  // Log mount for debugging
  useEffect(() => {
    console.info("[HOME] Component mounted, pathname:", window.location.pathname);
    return () => {
      console.info("[HOME] Component unmounting");
    };
  }, []);
  
  // Memoized state for welcome message - only show if not seen before
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

  // Verify if we're properly on /home and not redirected
  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false;
      console.info("[HOME] Initial render completed:", {
        pathname: window.location.pathname,
        hasSearchResults: !!searchResults,
        isRedirecting
      });
      
      // Clear any search results on first mount to prevent automatic redirects
      if (searchResults) {
        console.info("[HOME] Clearing search results on initial render to prevent auto-redirect");
        setSearchResults(null);
      }
    }
  }, [searchResults, setSearchResults, isRedirecting]);

  // Warm the service worker cache if available
  useEffect(() => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'WARM_CACHE'
      });
    }
  }, []);

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

  return (
    <AuthGuard>
      <div className="min-h-screen bg-logo-background text-logo-text transition-all duration-300">
        <AppHeader />
        {showWelcome && (
          <WelcomeModal 
            open={showWelcome} 
            onClose={() => setShowWelcome(false)}
          />
        )}
        
        <main className={`container ${isMobile ? 'py-2' : 'py-4 sm:py-6'} space-y-4 sm:space-y-8 animate-fade-in focus:outline-none`} tabIndex={-1}>
          <div className="max-w-2xl mx-auto px-2 sm:px-0">
            <h1 className="sr-only">Home - READ</h1>
            <SearchBar 
              onSearch={handleSearch}
              isSearching={isSearching} 
            />
          </div>

          <MainContent {...mainContentProps} />
        </main>
      </div>
    </AuthGuard>
  );
}
