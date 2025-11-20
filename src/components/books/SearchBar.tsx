
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2 } from "lucide-react";

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  isSearching?: boolean;
  value?: string;
  onValueChange?: (value: string) => void;
}

export function SearchBar({
  onSearch,
  placeholder = "Rechercher un livre par titre, auteur...",
  isSearching = false,
  value,
  onValueChange,
}: SearchBarProps) {
  const isControlled = value !== undefined;
  const [internalQuery, setInternalQuery] = useState(value ?? "");

  useEffect(() => {
    if (isControlled) {
      setInternalQuery(value ?? "");
    }
  }, [isControlled, value]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const currentValue = isControlled ? value ?? "" : internalQuery;
    onSearch(currentValue.trim());
  };

  const handleChange = (nextValue: string) => {
    if (!isControlled) {
      setInternalQuery(nextValue);
    }
    onValueChange?.(nextValue);
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <Input
        type="search"
        placeholder={placeholder}
        value={isControlled ? value ?? "" : internalQuery}
        onChange={(e) => handleChange(e.target.value)}
        className="pr-12 border-coffee-light focus-visible:ring-coffee-dark bg-white h-12 text-md"
      />
      <Button 
        type="submit" 
        size="icon" 
        className="absolute right-1 top-1 h-10 w-10 bg-coffee-dark hover:bg-coffee-darker"
        disabled={isSearching}
      >
        {isSearching ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Search className="h-5 w-5" />
        )}
        <span className="sr-only">{isSearching ? "Recherche en cours..." : "Rechercher"}</span>
      </Button>
    </form>
  );
}
