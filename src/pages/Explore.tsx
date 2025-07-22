
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AppHeader } from "@/components/layout/AppHeader";
import { SearchBar } from "@/components/books/SearchBar";
import { BookGrid } from "@/components/books/BookGrid";
import { getAllBooks, getBooksByCategory, getAvailableCategories } from "@/services/books/bookQueries";
import { toast } from "sonner";
import { Book } from "@/types/book";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Sparkles } from "lucide-react";
import { WelcomeModal } from "@/components/onboarding/WelcomeModal";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { BookEmptyState } from "@/components/reading/BookEmptyState";
import { TagSlider } from "@/components/books/TagSlider";

export default function Explore() {
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const isMounted = useRef(true);
  const [showWelcome, setShowWelcome] = useState(() => {
    const onboardingFlag = localStorage.getItem("onboardingDone");
    return !onboardingFlag;
  });

  const fetchBooksAndCategories = useCallback(async () => {
    if (!isMounted.current) return;
    
    setLoading(true);
    setError(null);

    try {
      const [allBooks, availableCategories] = await Promise.all([
        getAllBooks(),
        getAvailableCategories()
      ]);
      
      if (!isMounted.current) return;

      if (allBooks.length === 0) {
        setError("Aucun livre disponible pour le moment");
      }
      
      setBooks(allBooks);
      setFilteredBooks(allBooks);
      setCategories(availableCategories);
    } catch (error) {
      console.error("Error loading books or categories:", error);
      if (isMounted.current) {
        setError("Erreur lors du chargement des livres");
        toast.error("Erreur lors du chargement des livres");
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    isMounted.current = true;
    fetchBooksAndCategories();
    return () => {
      isMounted.current = false;
    };
  }, [fetchBooksAndCategories]);

  const handleCategoryFilter = async (category: string | null) => {
    if (!isMounted.current) return;
    
    setSelectedCategory(category);
    setLoading(true);
    
    try {
      if (category) {
        const filteredBooks = await getBooksByCategory(category);
        if (!isMounted.current) return;
        setFilteredBooks(filteredBooks);
        if (filteredBooks.length === 0) {
          toast.info(`Aucun livre trouvé dans la catégorie "${category}"`);
        }
      } else {
        setFilteredBooks(books);
      }
    } catch (error) {
      console.error("Error filtering by category:", error);
      if (isMounted.current) {
        toast.error(`Erreur lors du filtrage par catégorie "${category}"`);
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  const handleSearch = (query: string) => {
    if (!query.trim()) {
      setFilteredBooks(books);
      return;
    }

    const results = books.filter(book => 
      book.title.toLowerCase().includes(query.toLowerCase()) ||
      book.author.toLowerCase().includes(query.toLowerCase()) ||
      book.categories.some(category => category.toLowerCase().includes(query.toLowerCase()))
    );

    setFilteredBooks(results);

    if (results.length === 0) {
      toast.info("Aucun livre trouvé pour cette recherche.");
    }
  };

  const suggestedBook = books.length > 0 ? books[Math.floor(Math.random() * books.length)] : null;

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <AppHeader />
        <WelcomeModal open={showWelcome} onClose={() => setShowWelcome(false)} />
        <main className="container py-6 space-y-6">
          <div className="space-y-4">
            <h1 className="text-3xl font-serif font-medium text-coffee-darker">Découvrir de nouveaux livres</h1>

            <div className="max-w-xl lg:max-w-6xl">
              <SearchBar 
                onSearch={handleSearch} 
                placeholder="Rechercher par titre, auteur ou thématique..."
              />
            </div>

            <TagSlider
              tags={categories}
              selectedTag={selectedCategory}
              onSelectTag={handleCategoryFilter}
            />
          </div>

          {loading ? (
            <div className="py-20 flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-coffee-dark mx-auto mb-4" />
                <p className="text-muted-foreground">Chargement des livres...</p>
              </div>
            </div>
          ) : error ? (
            <BookEmptyState 
              hasError={true}
              title="Erreur"
              description={error}
            />
          ) : (
            <div className="space-y-12">
              <BookGrid 
                books={filteredBooks} 
                title="Livres disponibles" 
                showAddButton={true}
              />

              {suggestedBook && (
                <Card className="border-coffee-light bg-white overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      <div className="md:w-1/3 lg:w-1/4">
                        {suggestedBook.coverImage ? (
                          <img 
                            src={suggestedBook.coverImage} 
                            alt={suggestedBook.title} 
                            className="w-full h-full object-cover aspect-[3/4]" 
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/placeholder.svg';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full aspect-[3/4] flex items-center justify-center bg-coffee-medium">
                            <span className="text-white font-serif italic text-4xl">
                              {suggestedBook.title.substring(0, 1)}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="p-6 md:w-2/3 lg:w-3/4">
                        <div className="flex items-center gap-2 mb-3">
                          <Sparkles className="h-5 w-5 text-coffee-dark" />
                          <h2 className="text-xl font-serif font-medium text-coffee-darker">Suggestion pour vous</h2>
                        </div>
                        <h3 className="text-2xl font-medium text-coffee-darker mb-2">{suggestedBook.title}</h3>
                        <p className="text-muted-foreground mb-4">
                          Par {suggestedBook.author} • {suggestedBook.pages} page{suggestedBook.pages > 1 ? "s" : ""} • {suggestedBook.publicationYear || "N/A"}
                        </p>
                        <p className="mb-4 text-coffee-darker">
                          Un livre qui pourrait vous plaire, basé sur vos lectures précédentes.
                        </p>
                        <div className="flex flex-wrap gap-1 mb-4">
                          {suggestedBook.categories.map((category, index) => (
                            <span key={index} className="px-2 py-1 bg-coffee-light/30 text-coffee-darker rounded-full text-xs">
                              {category}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </main>
      </div>
    </AuthGuard>
  );
}
