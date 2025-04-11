
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppHeader } from "@/components/layout/AppHeader";
import { SearchBar } from "@/components/books/SearchBar";
import { BookGrid } from "@/components/books/BookGrid";
import { mockBooks } from "@/mock/books";
import { toast } from "sonner";

export default function Explore() {
  const [filteredBooks, setFilteredBooks] = useState(mockBooks);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const user = localStorage.getItem("user");
    if (!user) {
      navigate("/");
    }
  }, [navigate]);

  // Extract unique categories from all books
  const allCategories = Array.from(
    new Set(mockBooks.flatMap(book => book.categories))
  ).sort();

  const handleSearch = (query: string) => {
    if (!query.trim()) {
      setFilteredBooks(mockBooks);
      setActiveCategory(null);
      return;
    }
    
    const results = mockBooks.filter(book => 
      book.title.toLowerCase().includes(query.toLowerCase()) ||
      book.author.toLowerCase().includes(query.toLowerCase())
    );
    
    setFilteredBooks(results);
    setActiveCategory(null);
    
    if (results.length === 0) {
      toast.info("Aucun livre trouvé pour cette recherche.");
    }
  };

  const filterByCategory = (category: string) => {
    if (activeCategory === category) {
      // If clicking the already active category, reset filters
      setFilteredBooks(mockBooks);
      setActiveCategory(null);
    } else {
      // Filter by the selected category
      const results = mockBooks.filter(book => 
        book.categories.includes(category)
      );
      setFilteredBooks(results);
      setActiveCategory(category);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      
      <main className="container py-6 space-y-8">
        <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
          <h1 className="text-3xl font-serif font-medium text-coffee-darker">Explorer les livres</h1>
          
          <div className="md:w-1/3">
            <SearchBar onSearch={handleSearch} />
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {allCategories.map(category => (
            <button
              key={category}
              onClick={() => filterByCategory(category)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                activeCategory === category
                  ? 'bg-coffee-dark text-white'
                  : 'bg-muted hover:bg-coffee-light text-coffee-darker'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
        
        <BookGrid 
          books={filteredBooks} 
          title={activeCategory ? `Livres dans la catégorie "${activeCategory}"` : "Tous les livres"}
        />
      </main>
    </div>
  );
}
