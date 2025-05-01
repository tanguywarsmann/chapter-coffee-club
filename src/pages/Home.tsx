
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
import { useInProgressBooks } from "@/hooks/useInProgressBooks";

export default function Home() {
  // Utiliser une référence pour suivre les montages/démontages
  const mountCount = useRef(0);
  const renderCount = useRef(0);
  
  // Console.log uniquement au premier montage et pour le suivi des rendus
  useEffect(() => {
    mountCount.current++;
    if (process.env.NODE_ENV === 'development') {
      console.log(`[HOME DIAGNOSTIQUE] Home component mounted (count: ${mountCount.current})`);
    }
    return () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('[HOME DIAGNOSTIQUE] Home component unmounted');
      }
    };
  }, []);
  
  // Logger chaque render pour diagnostic
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      renderCount.current++;
      console.log(`[HOME DIAGNOSTIQUE] Home render count: ${renderCount.current}`);
    }
  });
  
  const [showWelcome, setShowWelcome] = useState(() => {
    const onboardingFlag = localStorage.getItem("onboardingDone");
    return !onboardingFlag;
  });

  const { searchResults, setSearchResults, handleSearch, isSearching } = useHomeSearch();
  const { currentReading, isLoadingCurrentBook } = useCurrentReading();
  const { currentBook, inProgressBooks, isLoading, handleProgressUpdate } = useInProgressBooks();
  const navigate = useNavigate();

  // Mémoiser cette fonction pour éviter les re-rendus inutiles
  const handleContinueReading = useCallback(() => {
    if (currentReading) {
      if (currentReading.isUnavailable) {
        toast.error("Ce livre n'est pas disponible actuellement");
        return;
      }
      navigate(`/books/${currentReading.id}?segment=${Math.floor(currentReading.chaptersRead)}`);
    }
  }, [currentReading, navigate]);

  // Mémoiser l'état de recherche pour éviter des rendus inutiles
  const showSearchResults = useMemo(() => !!searchResults, [searchResults]);
  
  // Mémoiser les props passées à MainContent pour assurer la stabilité
  const mainContentProps = useMemo(() => ({
    searchResults,
    onResetSearch: () => setSearchResults(null),
    currentReading,
    isLoadingCurrentBook,
    currentBook,
    inProgressBooks,
    isLoading,
    isSearching,
    onProgressUpdate: handleProgressUpdate,
    onContinueReading: handleContinueReading
  }), [
    searchResults, 
    setSearchResults, 
    currentReading, 
    isLoadingCurrentBook, 
    currentBook, 
    inProgressBooks, 
    isLoading,
    isSearching,
    handleProgressUpdate, 
    handleContinueReading
  ]);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-logo-background text-logo-text">
        <AppHeader />
        <WelcomeModal 
          open={showWelcome} 
          onClose={() => setShowWelcome(false)}
        />
        
        <main className="container py-6 space-y-8">
          <div className="max-w-2xl mx-auto">
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
