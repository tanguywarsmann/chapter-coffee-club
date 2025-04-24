
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AppHeader } from "@/components/layout/AppHeader";
import { SearchBar } from "@/components/books/SearchBar";
import { CurrentBook } from "@/components/home/CurrentBook";
import { GoalsPreview } from "@/components/home/GoalsPreview";
import { ActivityFeed } from "@/components/home/ActivityFeed";
import { 
  getPopularBooks, 
  getRecentlyAddedBooks, 
  getRecommendedBooks 
} from "@/mock/books";
import { getUserActivities, getMockFollowers, getMockFollowing } from "@/mock/activities";
import { Book } from "@/types/book";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { User, Loader2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  getBooksInProgressFromAPI, 
  initializeUserReadingProgress, 
  syncBookWithAPI 
} from "@/services/reading";
import { WelcomeModal } from "@/components/onboarding/WelcomeModal";
import { useAuth } from "@/contexts/AuthContext";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { ReadingProgress } from "@/components/home/ReadingProgress";

export default function Home() {
  const [searchResults, setSearchResults] = useState<Book[] | null>(null);
  const [inProgressBooks, setInProgressBooks] = useState<Book[]>([]);
  const [currentBook, setCurrentBook] = useState<Book | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const isMounted = useRef(true);
  const hasFetchedBooks = useRef(false);
  
  const [showWelcome, setShowWelcome] = useState(() => {
    const onboardingFlag = localStorage.getItem("onboardingDone");
    return !onboardingFlag;
  });

  // Memoized function to fetch in-progress books
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
    // Simple search implementation
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
      // Re-fetch the current book to update progress
      const updatedBook = await syncBookWithAPI(user.id, bookId);
      
      if (!isMounted.current) return;
      
      if (updatedBook) {
        setCurrentBook(updatedBook);
      }
      
      // Refresh in-progress books
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
            <div className="space-y-4">
              <h2 className="text-xl font-serif font-medium text-coffee-darker">Résultats de recherche</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {searchResults.map(book => (
                  <div 
                    key={book.id} 
                    className="book-card group cursor-pointer"
                    onClick={() => navigate(`/books/${book.id}`)}
                  >
                    <div className="book-cover bg-coffee-medium">
                      {book.coverImage ? (
                        <img 
                          src={book.coverImage} 
                          alt={book.title} 
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder.svg';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-chocolate-medium">
                          <span className="text-white font-serif italic text-xl">{book.title.substring(0, 1)}</span>
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="font-medium text-coffee-darker line-clamp-1">{book.title}</h3>
                      <p className="text-sm text-muted-foreground">{book.author}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button 
                className="text-coffee-dark hover:text-coffee-darker font-medium"
                onClick={() => setSearchResults(null)}
              >
                Retour à l'accueil
              </button>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap gap-4 mb-6">
                <Card className="flex-1 p-4 flex items-center justify-between border-coffee-light min-w-[140px]">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-coffee-dark" />
                    <div>
                      <p className="text-sm text-muted-foreground">Abonnés</p>
                      <p className="text-2xl font-medium text-coffee-darker">{getMockFollowers().length}</p>
                    </div>
                  </div>
                </Card>
                <Card className="flex-1 p-4 flex items-center justify-between border-coffee-light min-w-[140px]">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-coffee-dark" />
                    <div>
                      <p className="text-sm text-muted-foreground">Abonnements</p>
                      <p className="text-2xl font-medium text-coffee-darker">{getMockFollowing().length}</p>
                    </div>
                  </div>
                </Card>
              </div>
              
              <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4">
                <div className="space-y-6 md:col-span-2 lg:col-span-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <CurrentBook 
                      book={currentBook} 
                      onProgressUpdate={handleProgressUpdate} 
                    />
                    <div className="space-y-6">
                      <GoalsPreview />
                    </div>
                  </div>
                  
                  <ReadingProgress 
                    inProgressBooks={inProgressBooks} 
                    isLoading={isLoading} 
                  />
                </div>
                <div className={`${isMobile ? 'mt-6 md:mt-0' : ''}`}>
                  <ActivityFeed activities={getUserActivities()} />
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </AuthGuard>
  );
}
