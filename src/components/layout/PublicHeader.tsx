
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Image from "@/components/ui/image";

export function PublicHeader() {
  return (
    <header 
      className="sticky top-0 z-50 w-full border-b border-logo-accent/20 bg-logo-background/95 backdrop-blur supports-[backdrop-filter]:bg-logo-background/60"
      role="banner"
    >
      <div className="container flex h-16 sm:h-14 items-center justify-between">
        <Link 
          to="/" 
          className="flex items-center gap-2 transition-transform duration-200 hover:scale-105 focus-visible:ring-2 focus-visible:ring-coffee-dark focus-visible:ring-offset-2 rounded-md focus:outline-none"
          aria-label="READ - Retour à l'accueil"
        >
          <Image 
            src="/lovable-uploads/f8f10dfb-9602-4b38-b705-d6e6f42cce5d.png" 
            alt="" 
            className="h-8 w-8"
            role="img"
            aria-hidden="true"
          />
          <span className="text-xl font-medium text-logo-text">READ</span>
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
        </nav>
        
        <Button 
          variant="default" 
          className="bg-logo-accent hover:bg-logo-accent/90 text-logo-background focus:ring-2 focus:ring-logo-accent focus:ring-offset-2" 
          asChild
        >
          <Link 
            to="/auth"
            aria-label="Se connecter à votre compte READ"
          >
            Se connecter
          </Link>
        </Button>
      </div>
    </header>
  );
}
