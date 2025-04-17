
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppHeader } from "@/components/layout/AppHeader";
import { SearchBar } from "@/components/books/SearchBar";
import { BookGrid } from "@/components/books/BookGrid";
import { mockBooks } from "@/mock/books";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

export default function Explore() {
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [filteredBooks, setFilteredBooks] = useState(mockBooks);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const user = localStorage.getItem("user");
    if (!user) {
      navigate("/");
    }
  }, [navigate]);

  // Filter books by category
  const getBooksByCategory = (categories: string[]) => {
    return mockBooks.filter(book => 
      book.categories.some(category => categories.includes(category))
    );
  };

  // Define themed book sections
  const personalDevelopmentBooks = getBooksByCategory(["Philosophie", "Développement personnel"]);
  const classicShortBooks = mockBooks.filter(book => book.pages <= 200 && book.categories.includes("Classique"));
  const quickImpactBooks = mockBooks.filter(book => book.pages <= 150);
  const enjoyableNovels = getBooksByCategory(["Roman", "Aventure", "Fantastique"]);

  // Logic for personalized suggestion
  const getPersonalizedSuggestion = () => {
    // In a real app, this would use the user's reading history and preferences
    // For now, we'll just return a random book
    const randomIndex = Math.floor(Math.random() * mockBooks.length);
    return mockBooks[randomIndex];
  };

  const suggestedBook = getPersonalizedSuggestion();

  const handleSearch = (query: string) => {
    if (!query.trim()) {
      setShowSearchResults(false);
      return;
    }
    
    const results = mockBooks.filter(book => 
      book.title.toLowerCase().includes(query.toLowerCase()) ||
      book.author.toLowerCase().includes(query.toLowerCase()) ||
      book.categories.some(category => category.toLowerCase().includes(query.toLowerCase()))
    );
    
    setFilteredBooks(results);
    setShowSearchResults(true);
    
    if (results.length === 0) {
      toast.info("Aucun livre trouvé pour cette recherche.");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      
      <main className="container py-6 space-y-10">
        <div className="space-y-4">
          <h1 className="text-3xl font-serif font-medium text-coffee-darker">Découvrir de nouveaux livres</h1>
          
          <div className="max-w-xl">
            <SearchBar 
              onSearch={handleSearch} 
              placeholder="Rechercher par titre, auteur ou thématique..."
            />
          </div>
        </div>
        
        {showSearchResults ? (
          <div className="space-y-8">
            <BookGrid 
              books={filteredBooks} 
              title="Résultats de recherche" 
              showAddButton={true}
            />
            
            <button 
              className="text-coffee-dark hover:text-coffee-darker font-medium"
              onClick={() => setShowSearchResults(false)}
            >
              ← Retour à l'exploration
            </button>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Personal Suggestion Section */}
            <Card className="border-coffee-light bg-white overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-1/3 lg:w-1/4">
                    {suggestedBook.coverImage ? (
                      <img 
                        src={suggestedBook.coverImage} 
                        alt={suggestedBook.title} 
                        className="w-full h-full object-cover aspect-[3/4]" 
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
                      Par {suggestedBook.author} • {suggestedBook.pages} pages • {suggestedBook.publicationYear}
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
                    
                    <button 
                      className="px-4 py-2 bg-coffee-dark text-white rounded-md hover:bg-coffee-darker transition-colors"
                      onClick={() => {
                        toast.success(`${suggestedBook.title} ajouté à votre liste de lecture`);
                      }}
                    >
                      Ajouter à ma liste de lecture
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Themed Sections */}
            <BookGrid 
              books={personalDevelopmentBooks} 
              title="Développement personnel" 
              description="Des lectures pour progresser et mieux se connaître"
              showAddButton={true}
            />
            
            <BookGrid 
              books={classicShortBooks} 
              title="Grands classiques courts" 
              description="Des œuvres intemporelles, accessibles et rapides à lire"
              showAddButton={true}
            />
            
            <BookGrid 
              books={quickImpactBooks} 
              title="Livres à fort impact en moins de 3h de lecture" 
              description="Des lectures courtes mais puissantes pour maximiser votre temps"
              showAddButton={true}
            />
            
            <BookGrid 
              books={enjoyableNovels} 
              title="Romans pour retrouver le plaisir de lire" 
              description="Des histoires captivantes pour redécouvrir la joie de la lecture"
              showAddButton={true}
            />
          </div>
        )}
      </main>
    </div>
  );
}
