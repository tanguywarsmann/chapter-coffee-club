import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppHeader } from "@/components/layout/AppHeader";
import { SearchBar } from "@/components/books/SearchBar";
import { ReadingProgress } from "@/components/home/ReadingProgress";
import { FeaturedBooks } from "@/components/home/FeaturedBooks";
import { ActivityFeed } from "@/components/home/ActivityFeed";
import { 
  getBooksInProgress, 
  getPopularBooks, 
  getRecentlyAddedBooks, 
  getRecommendedBooks 
} from "@/mock/books";
import { getUserActivities, getMockFollowers, getMockFollowing } from "@/mock/activities";
import { Book } from "@/types/book";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { User } from "lucide-react";

export default function Home() {
  const [searchResults, setSearchResults] = useState<Book[] | null>(null);
  const [inProgressBooks, setInProgressBooks] = useState(getBooksInProgress());
  const navigate = useNavigate();
  
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) {
      navigate("/");
    }
  }, [navigate]);

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

  return (
    <div className="min-h-screen bg-logo-background text-logo-text">
      <AppHeader />
      
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
          <div className="grid gap-8 grid-cols-1 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-8">
              <div className="flex gap-4 mb-6">
                <Card className="flex-1 p-4 flex items-center justify-between border-coffee-light">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-coffee-dark" />
                    <div>
                      <p className="text-sm text-muted-foreground">Abonnés</p>
                      <p className="text-2xl font-medium text-coffee-darker">{getMockFollowers().length}</p>
                    </div>
                  </div>
                </Card>
                <Card className="flex-1 p-4 flex items-center justify-between border-coffee-light">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-coffee-dark" />
                    <div>
                      <p className="text-sm text-muted-foreground">Abonnements</p>
                      <p className="text-2xl font-medium text-coffee-darker">{getMockFollowing().length}</p>
                    </div>
                  </div>
                </Card>
              </div>
              <ReadingProgress inProgressBooks={inProgressBooks} />
              <FeaturedBooks 
                recentlyAdded={getRecentlyAddedBooks()}
                popular={getPopularBooks()}
                recommended={getRecommendedBooks()}
              />
            </div>
            <div className="lg:col-span-1">
              <ActivityFeed activities={getUserActivities()} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
