
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface SearchBarProps {
  onSearch: (query: string) => void;
}

export function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <Input
        type="search"
        placeholder="Rechercher un livre par titre, auteur..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="pr-12 border-coffee-medium focus-visible:ring-coffee-dark"
      />
      <Button 
        type="submit" 
        size="icon" 
        className="absolute right-1 top-1 h-8 w-8 bg-coffee-dark hover:bg-coffee-darker"
      >
        <Search className="h-4 w-4" />
        <span className="sr-only">Rechercher</span>
      </Button>
    </form>
  );
}
