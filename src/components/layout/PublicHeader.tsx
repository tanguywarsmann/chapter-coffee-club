
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import LogoVreadPng from "@/components/brand/LogoVreadPng";

export function PublicHeader() {
  return (
    <header 
      className="sticky top-0 z-50 w-full border-b border-logo-accent/20 bg-logo-background/95 backdrop-blur supports-[backdrop-filter]:bg-logo-background/60"
      role="banner"
    >
      <div className="mx-auto w-full px-4 max-w-none flex h-16 sm:h-14 items-center justify-between">
        <Link 
          to="/" 
          className="flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-coffee-dark focus-visible:ring-offset-2 rounded-md focus:outline-none"
          aria-label="VREAD - Retour à l'accueil"
        >
          <LogoVreadPng size={32} className="h-8 w-8" />
          <span className="text-h4 font-serif text-logo-text">VREAD</span>
        </Link>
        
        <nav 
          className="hidden md:flex items-center space-x-6"
          role="navigation"
          aria-label="Navigation principale"
        >
          <Link 
            to="/blog" 
            className="text-white/80 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-logo-background rounded px-2 py-1"
          >
            Blog
          </Link>
          <Link 
            to="/a-propos" 
            className="text-white/80 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-logo-background rounded px-2 py-1"
          >
            À propos
          </Link>
          <Link 
            to="/presse" 
            className="text-white/80 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-logo-background rounded px-2 py-1"
          >
            Presse
          </Link>
        </nav>
        
        <Button 
          variant="default" 
          className="bg-logo-accent hover:bg-logo-accent/90 text-logo-background focus:ring-2 focus:ring-logo-accent focus:ring-offset-2" 
          asChild
        >
          <Link 
            to="/auth"
            aria-label="Se connecter à votre compte VREAD"
          >
            Se connecter
          </Link>
        </Button>
      </div>
    </header>
  );
}
