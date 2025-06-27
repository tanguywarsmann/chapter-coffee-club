
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { HeaderLogo } from "./header/HeaderLogo";

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-logo-accent/20 bg-logo-background/95 backdrop-blur">
      <div className="container flex h-16 sm:h-14 items-center justify-between">
        <HeaderLogo />
        
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
