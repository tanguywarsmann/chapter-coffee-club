
import { useState, useEffect } from "react";
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

export default function Home() {
  const [searchResults, setSearchResults] = useState<Book[] | null>(null);
  const [inProgressBooks, setInProgressBooks] = useState<Book[]>([]);
  const [currentBook, setCurrentBook] = useState<Book | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { user } = useAuth();
  
  const [showWelcome, setShowWelcome] = useState(() => {
    const onboardingFlag = localStorage.getItem("onboardingDone");
    return !onboardingFlag;
  });

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }
    
    const fetchData = async () => {
      try {
        setIsLoading(true);
        console.log("Fetching user data with ID:", user.id);
        
        await initializeUserReadingProgress(user.id);
        
        const booksInProgress = await getBooksInProgressFromAPI(user.id);
        setInProgressBooks(booksInProgress);
        
        if (booksInProgress.length > 0) {
          const notCompletedBooks = booksInProgress.filter(book => !book.isCompleted);
          if (notCompletedBooks.length > 0) {
            setCurrentBook(notCompletedBooks[0]);
          } else {
            setCurrentBook(booksInProgress[0]);
          }
        }
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [navigate, user]);

  const handleSearch = (query: string) => {
    if (!query.trim()) {
      setSearchResults(null);
      return;
    }
    
    const results = getRecommendedBooks().filter(book => 
      book.title.toLowerCase().includes(query.toLowerCase()) ||
      book.author.toLowerCase().includes(query.toLowerCase())
    );
    
    setSearchResults(results);
    
    if (results.length === 0) {
      toast.info("Aucun livre trouvé pour cette recherche.");
    } else {
      toast.success(`${results.length} livre${results.length > 1 ? 's' : ''} trouvé${results.length > 1 ? 's' : ''}.`);
    }
  };

  const handleProgressUpdate = async (bookId: string) => {
    if (!user) {
      toast.error("Vous devez être connecté pour mettre à jour votre progression");
      return;
    }
    
    try {
      const updatedBook = await syncBookWithAPI(user.id, bookId);
      
      if (updatedBook) {
        setCurrentBook(updatedBook);
        
        setInProgressBooks(prev => 
          prev.map(book => book.id === updatedBook.id ? updatedBook : book)
        );
      }
      
      const booksInProgress = await getBooksInProgressFromAPI(user.id);
      setInProgressBooks(booksInProgress);
    } catch (error) {
      console.error("Error updating progress:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-logo-background text-logo-text">
        <AppHeader />
        <main className="container py-6 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <Loader2 className="h-10 w-10 animate-spin text-coffee-dark mb-4" />
            <p className="text-coffee-darker">Chargement de votre bibliothèque...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-logo-background text-logo-text">
      <AppHeader />
      <WelcomeModal 
        open={showWelcome} 
        onClose={(skipFlag?: boolean) => setShowWelcome(false)}
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
              </div>
              <div className={`${isMobile ? 'mt-6 md:mt-0' : ''}`}>
                <ActivityFeed activities={getUserActivities()} />
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
