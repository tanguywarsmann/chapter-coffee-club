
import { useCallback, useState } from "react";
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
  const [showWelcome, setShowWelcome] = useState(() => {
    const onboardingFlag = localStorage.getItem("onboardingDone");
    return !onboardingFlag;
  });

  const { searchResults, setSearchResults, handleSearch } = useHomeSearch();
  const { currentReading, isLoadingCurrentBook } = useCurrentReading();
  const { currentBook, inProgressBooks, isLoading, handleProgressUpdate } = useInProgressBooks();
  const navigate = useNavigate();

  const handleContinueReading = useCallback(() => {
    if (currentReading) {
      if (currentReading.isUnavailable) {
        toast.error("Ce livre n'est pas disponible actuellement");
        return;
      }
      navigate(`/books/${currentReading.id}?segment=${Math.floor(currentReading.chaptersRead)}`);
    }
  }, [currentReading, navigate]);

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
            <SearchBar onSearch={handleSearch} />
          </div>

          <MainContent
            searchResults={searchResults}
            onResetSearch={() => setSearchResults(null)}
            currentReading={currentReading}
            isLoadingCurrentBook={isLoadingCurrentBook}
            currentBook={currentBook}
            inProgressBooks={inProgressBooks}
            isLoading={isLoading}
            onProgressUpdate={handleProgressUpdate}
            onContinueReading={handleContinueReading}
          />
        </main>
      </div>
    </AuthGuard>
  );
}
