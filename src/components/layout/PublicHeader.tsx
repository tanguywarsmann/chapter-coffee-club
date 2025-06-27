
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Image from "@/components/ui/image";

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-logo-accent/20 bg-logo-background/95 backdrop-blur supports-[backdrop-filter]:bg-logo-background/60">
      <div className="container flex h-16 sm:h-14 items-center justify-between">
        <Link 
          to="/" 
          className="flex items-center gap-2 transition-transform duration-200 hover:scale-105 focus-visible:ring-2 focus-visible:ring-coffee-dark focus-visible:ring-offset-2 rounded-md"
          aria-label="READ - Retour à l'accueil"
        >
          <Image 
            src="/READ-logo.png" 
            alt="READ Logo" 
            className="h-8 w-8"
          />
          <span className="text-xl font-medium text-logo-text">READ</span>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-6">
          <Link 
            to="/blog" 
            className="text-white/80 hover:text-white transition-colors"
          >
            Blog
          </Link>
        </nav>
        
        <Button 
          variant="default" 
          className="bg-logo-accent hover:bg-logo-accent/90 text-logo-background" 
          asChild
        >
          <Link to="/auth">Se connecter</Link>
        </Button>
      </div>
    </header>
  );
}
