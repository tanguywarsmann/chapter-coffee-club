import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AppHeader } from "@/components/layout/AppHeader";
import { SearchBar } from "@/components/books/SearchBar";
import { WelcomeModal } from "@/components/onboarding/WelcomeModal";
import { useAuth } from "@/contexts/AuthContext";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { useReadingList } from "@/hooks/useReadingList";
import { Book } from "@/types/book";
import { toast } from "sonner";
import { getBooksInProgressFromAPI, syncBookWithAPI } from "@/services/reading";
import { getPopularBooks, getRecentlyAddedBooks, getRecommendedBooks } from "@/mock/books";
import { SearchResults } from "@/components/home/SearchResults";
import { StatsCards } from "@/components/home/StatsCards";
import { HomeContent } from "@/components/home/HomeContent";

export default function Home() {
  const [searchResults, setSearchResults] = useState<Book[] | null>(null);
  const [inProgressBooks, setInProgressBooks] = useState<Book[]>([]);
  const [currentBook, setCurrentBook] = useState<Book | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const isMounted = useRef(true);
  const hasFetchedBooks = useRef(false);
  
  const [showWelcome, setShowWelcome] = useState(() => {
    const onboardingFlag = localStorage.getItem("onboardingDone");
    return !onboardingFlag;
  });

  const { getBooksByStatus } = useReadingList();
  const [currentReading, setCurrentReading] = useState<Book | null>(null);
  const [isLoadingCurrentBook, setIsLoadingCurrentBook] = useState(true);

  useEffect(() => {
    const fetchCurrentReading = async () => {
      if (!user?.id) return;

      try {
        setIsLoadingCurrentBook(true);
        const inProgressBooks = await getBooksByStatus("in_progress");
        
        if (!isMounted.current) return;
        
        // Get the most recently updated book
        if (inProgressBooks && inProgressBooks.length > 0) {
          setCurrentReading(inProgressBooks[0]);
        }
      } catch (error) {
        console.error("Error fetching current reading:", error);
        if (isMounted.current) {
          toast.error("Impossible de charger votre lecture en cours");
        }
      } finally {
        if (isMounted.current) {
          setIsLoadingCurrentBook(false);
        }
      }
    };

    fetchCurrentReading();
  }, [user?.id, getBooksByStatus]);

  const handleContinueReading = useCallback(() => {
    if (currentReading) {
      navigate(`/books/${currentReading.id}?segment=${Math.floor(currentReading.chaptersRead)}`);
    }
  }, [currentReading, navigate]);

  const fetchInProgressBooks = useCallback(async () => {
    // Don't fetch if no user or already fetched
    if (!user?.id || hasFetchedBooks.current || !isMounted.current) {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const books = await getBooksInProgressFromAPI(user.id);
      
      if (!isMounted.current) return;
      
      setInProgressBooks(books);
      
      // Set current book to the first in-progress book if available
      if (books && books.length > 0) {
        setCurrentBook(books[0]);
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
      }
    }
  }, [user?.id]);

  useEffect(() => {
    // Set mounted flag
    isMounted.current = true;
    hasFetchedBooks.current = false;
    
    // Fetch books if user is available
    if (user?.id) {
      fetchInProgressBooks();
    } else {
      // Reset loading state if no user
      setIsLoading(false);
    }
    
    // Cleanup
    return () => {
      isMounted.current = false;
    };
  }, [user, fetchInProgressBooks]);

  const handleSearch = (query: string) => {
    if (!query.trim()) {
      return;
    }
    
    const allBooks = [
      ...getPopularBooks(),
      ...getRecentlyAddedBooks(),
      ...getRecommendedBooks()
    ];
    
    const filtered = allBooks.filter(book => 
      book.title.toLowerCase().includes(query.toLowerCase()) || 
      book.author.toLowerCase().includes(query.toLowerCase())
    );
    
    setSearchResults(filtered);
    if (filtered.length === 0) {
      toast.info("Aucun livre ne correspond à votre recherche");
    }
  };

  const handleProgressUpdate = async (bookId: string) => {
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
      
      const books = await getBooksInProgressFromAPI(user.id);
      
      if (!isMounted.current) return;
      
      setInProgressBooks(books);
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

          {searchResults ? (
            <SearchResults 
              searchResults={searchResults} 
              onReset={() => setSearchResults(null)} 
            />
          ) : (
            <>
              <StatsCards />
              <HomeContent
                currentReading={currentReading}
                isLoadingCurrentBook={isLoadingCurrentBook}
                currentBook={currentBook}
                inProgressBooks={inProgressBooks}
                isLoading={isLoading}
                onProgressUpdate={handleProgressUpdate}
                onContinueReading={handleContinueReading}
              />
            </>
          )}
        </main>
      </div>
    </AuthGuard>
  );
}
