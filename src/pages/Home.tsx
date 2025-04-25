
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AppHeader } from "@/components/layout/AppHeader";
import { SearchBar } from "@/components/books/SearchBar";
import { WelcomeModal } from "@/components/onboarding/WelcomeModal";
import { useAuth } from "@/contexts/AuthContext";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { useReadingList } from "@/hooks/useReadingList";
import { MainContent } from "@/components/home/MainContent";
import { useHomeSearch } from "@/hooks/useHomeSearch";

export default function Home() {
  const [showWelcome, setShowWelcome] = useState(() => {
    const onboardingFlag = localStorage.getItem("onboardingDone");
    return !onboardingFlag;
  });

  const { searchResults, setSearchResults, handleSearch } = useHomeSearch();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isMounted = useRef(true);
  const hasFetchedBooks = useRef(false);
  const { getBooksByStatus } = useReadingList();
  const [currentReading, setCurrentReading] = useState<Book | null>(null);
  const [isLoadingCurrentBook, setIsLoadingCurrentBook] = useState(true);

  // Use separate refs to prevent infinite fetching loops
  const fetchingCurrentReading = useRef(false);

  // FIX: Use a ref to prevent infinite fetching loop
  const fetchingInProgress = useRef(false);
  const [currentBook, setCurrentBook] = useState<Book | null>(null);
  const [inProgressBooks, setInProgressBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCurrentReading = async () => {
      if (!user?.id || fetchingCurrentReading.current) return;
      
      try {
        fetchingCurrentReading.current = true;
        setIsLoadingCurrentBook(true);
        const inProgressBooks = await getBooksByStatus("in_progress");
        
        if (!isMounted.current) return;
        
        if (inProgressBooks && inProgressBooks.length > 0) {
          const availableBooks = inProgressBooks.filter(book => !book.isUnavailable);
          if (availableBooks.length > 0) {
            setCurrentReading(availableBooks[0]);
          } else if (inProgressBooks.length > 0) {
            const stableUnavailableBook = {
              ...inProgressBooks[0],
              isStableUnavailable: true
            };
            setCurrentReading(stableUnavailableBook);
          } else {
            setCurrentReading(null);
          }
        } else {
          setCurrentReading(null);
        }
      } catch (error) {
        console.error("Error fetching current reading:", error);
        if (isMounted.current) {
          toast.error("Impossible de charger votre lecture en cours");
        }
      } finally {
        if (isMounted.current) {
          setIsLoadingCurrentBook(false);
          fetchingCurrentReading.current = false;
        }
      }
    };

    if (user?.id && isMounted.current) {
      fetchCurrentReading();
    } else {
      setIsLoadingCurrentBook(false);
    }
  }, [user?.id, getBooksByStatus]);

  useEffect(() => {
    isMounted.current = true;
    
    if (user?.id) {
      hasFetchedBooks.current = false;
    }
    
    return () => {
      isMounted.current = false;
    };
  }, [user]);

  useEffect(() => {
    const fetchInProgressBooks = async () => {
      if (!user?.id || hasFetchedBooks.current || !isMounted.current || fetchingInProgress.current) {
        return;
      }
      
      try {
        fetchingInProgress.current = true;
        setIsLoading(true);
        setError(null);
        
        const books = await getBooksInProgressFromAPI(user.id);
        
        if (!isMounted.current) return;
        
        const stableBooks = books.map(book => {
          if (book.isUnavailable) {
            return {
              ...book,
              isStableUnavailable: true
            };
          }
          return book;
        });
        
        setInProgressBooks(stableBooks);
        
        if (stableBooks && stableBooks.length > 0) {
          const availableBook = stableBooks.find(b => !b.isUnavailable);
          setCurrentBook(availableBook || stableBooks[0]);
        }
        
        hasFetchedBooks.current = true;
      } catch (error) {
        console.error("Error fetching in-progress books:", error);
        if (isMounted.current) {
          setError("Erreur lors du chargement des livres en cours");
          toast.error("Erreur lors du chargement de vos lectures en cours");
        }
      } finally {
        if (isMounted.current) {
          setIsLoading(false);
          fetchingInProgress.current = false;
        }
      }
    };

    if (user?.id && !hasFetchedBooks.current && !fetchingInProgress.current) {
      fetchInProgressBooks();
    } else if (!user?.id) {
      setIsLoading(false);
    }
  }, [user, fetchInProgressBooks]);

  const handleContinueReading = useCallback(() => {
    if (currentReading) {
      if (currentReading.isUnavailable) {
        toast.error("Ce livre n'est pas disponible actuellement");
        return;
      }
      navigate(`/books/${currentReading.id}?segment=${Math.floor(currentReading.chaptersRead)}`);
    }
  }, [currentReading, navigate]);

  const handleProgressUpdate = async (bookId: string) => {
    if (currentBook?.isUnavailable) {
      toast.error("Ce livre n'est pas disponible actuellement");
      return;
    }
    
    if (!user?.id) {
      toast.error("Vous devez être connecté pour mettre à jour votre progression");
      return;
    }
    
    try {
      setIsLoading(true);
      const updatedBook = await syncBookWithAPI(user.id, bookId);
      
      if (!isMounted.current) return;
      
      if (updatedBook) {
        setCurrentBook(updatedBook);
      }
      
      if (!fetchingInProgress.current) {
        const books = await getBooksInProgressFromAPI(user.id);
        
        if (!isMounted.current) return;
        
        setInProgressBooks(books);
      }
    } catch (error) {
      console.error("Error updating progress:", error);
      if (isMounted.current) {
        toast.error("Erreur lors de la mise à jour de la progression");
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  };

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
