
import { useCallback, useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AppHeader } from "@/components/layout/AppHeader";
import { useAuth } from "@/contexts/AuthContext";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { MainContent } from "@/components/home/MainContent";
import { useHomeSearch } from "@/hooks/useHomeSearch";
import { useCurrentReading } from "@/hooks/useCurrentReading";
import { useReadingProgress } from "@/hooks/useReadingProgress";
import { texts } from "@/i18n/texts";
import { useLogger } from "@/utils/logger";

export default function Home() {
  const logger = useLogger('Home');
  const initialRender = useRef(true);
  
  // Log mount for debugging
  useEffect(() => {
    logger.info("Component mounted", { pathname: window.location.pathname });
    return () => {
      logger.info("Component unmounting");
    };
  }, [logger]);
  

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
      logger.info("Initial render completed", {
        pathname: window.location.pathname,
        hasSearchResults: !!searchResults,
        isRedirecting
      });
      
      // Clear any search results on first mount to prevent automatic redirects
      if (searchResults) {
        logger.info("Clearing search results on initial render to prevent auto-redirect");
        setSearchResults(null);
      }
    }
  }, [searchResults, setSearchResults, isRedirecting, logger]);

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
        toast.error("Ce livre est actuellement indisponible", {
          id: "book-unavailable" // Avoid duplicate toasts
        });
        return;
      }
      navigate(`/books/${currentReading.id}?segment=${Math.floor(currentReading.chaptersRead)}`);
    }
  }, [currentReading, navigate]);

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
    onContinueReading: handleContinueReading,
    onSearch: handleSearch
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
    handleContinueReading,
    handleSearch
  ]);

  return (
    <AuthGuard>
      <div className="relative isolate w-screen left-1/2 right-1/2 -translate-x-1/2 min-h-screen bg-gradient-to-br from-[hsl(30,35%,96%)] to-[hsl(35,30%,88%)] transition-all duration-300">
        <AppHeader />
        
        <main className="max-w-4xl mx-auto px-4 py-6 md:py-8 animate-fade-in focus:outline-none" tabIndex={-1}>
          <h1 className="sr-only">{texts.home} - VREAD</h1>
          
          <MainContent {...mainContentProps} />
        </main>
      </div>
    </AuthGuard>
  );
}
