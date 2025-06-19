
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Home, Trophy, BookCheck, Menu, Users, BookOpen } from "lucide-react";
import { texts } from "@/i18n/texts";

interface MobileMenuProps {
  isAdmin?: boolean;
}

export const MobileMenu = ({ isAdmin }: MobileMenuProps) => {
  const navigate = useNavigate();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleNavigation = (path: string) => {
    setIsSheetOpen(false);
    navigate(path);
  };

  const handleKeyPress = (event: React.KeyboardEvent, action: () => void) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      action();
    }
  };

  return (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden focus-visible:ring-2 focus-visible:ring-coffee-dark focus-visible:ring-offset-2"
          aria-label={texts.menu}
          aria-expanded={isSheetOpen}
          aria-controls="mobile-menu"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">{texts.menu}</span>
        </Button>
      </SheetTrigger>
      <SheetContent 
        side="left" 
        className="w-72 overflow-y-auto focus-visible:outline-none"
        id="mobile-menu"
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          const currentTarget = e.currentTarget as HTMLElement;
          const firstNavItem = currentTarget.querySelector('[role="button"]');
          if (firstNavItem) {
            (firstNavItem as HTMLElement).focus();
          }
        }}
      >
        <SheetHeader className="pb-4">
          <SheetTitle className="text-left text-lg">{texts.menu || "Menu"}</SheetTitle>
        </SheetHeader>
        <nav className="mt-4" role="navigation" aria-label="Navigation principale">
          <ul className="space-y-1" role="list">
            <li role="listitem">
              <Button 
                variant="ghost" 
                className="mobile-nav-item focus-visible:ring-2 focus-visible:ring-coffee-dark focus-visible:ring-offset-2" 
                onClick={() => handleNavigation("/home")}
                onKeyDown={(e) => handleKeyPress(e, () => handleNavigation("/home"))}
                tabIndex={0}
                role="button"
                aria-label={`Aller à ${texts.home}`}
              >
                <Home className="h-5 w-5 mr-3" aria-hidden="true" />
                {texts.home}
              </Button>
            </li>
            <li role="listitem">
              <Button 
                variant="ghost" 
                className="mobile-nav-item focus-visible:ring-2 focus-visible:ring-coffee-dark focus-visible:ring-offset-2" 
                onClick={() => handleNavigation("/explore")}
                onKeyDown={(e) => handleKeyPress(e, () => handleNavigation("/explore"))}
                tabIndex={0}
                role="button"
                aria-label={`Aller à ${texts.explore}`}
              >
                <BookCheck className="h-5 w-5 mr-3" aria-hidden="true" />
                {texts.explore}
              </Button>
            </li>
            <li role="listitem">
              <Button 
                variant="ghost" 
                className="mobile-nav-item focus-visible:ring-2 focus-visible:ring-coffee-dark focus-visible:ring-offset-2" 
                onClick={() => handleNavigation("/achievements")}
                onKeyDown={(e) => handleKeyPress(e, () => handleNavigation("/achievements"))}
                tabIndex={0}
                role="button"
                aria-label={`Aller à ${texts.achievements}`}
              >
                <Trophy className="h-5 w-5 mr-3" aria-hidden="true" />
                {texts.achievements}
              </Button>
            </li>
            <li role="listitem">
              <Button 
                variant="ghost" 
                className="mobile-nav-item focus-visible:ring-2 focus-visible:ring-coffee-dark focus-visible:ring-offset-2" 
                onClick={() => handleNavigation("/reading-list")}
                onKeyDown={(e) => handleKeyPress(e, () => handleNavigation("/reading-list"))}
                tabIndex={0}
                role="button"
                aria-label={`Aller à ${texts.readingList}`}
              >
                <BookCheck className="h-5 w-5 mr-3" aria-hidden="true" />
                {texts.readingList}
              </Button>
            </li>
            <li role="listitem">
              <Button 
                variant="ghost" 
                className="mobile-nav-item focus-visible:ring-2 focus-visible:ring-coffee-dark focus-visible:ring-offset-2" 
                onClick={() => handleNavigation("/blog")}
                onKeyDown={(e) => handleKeyPress(e, () => handleNavigation("/blog"))}
                tabIndex={0}
                role="button"
                aria-label="Aller au Blog"
              >
                <BookOpen className="h-5 w-5 mr-3" aria-hidden="true" />
                Blog
              </Button>
            </li>
            <li role="listitem">
              <Button 
                variant="ghost" 
                className="mobile-nav-item focus-visible:ring-2 focus-visible:ring-coffee-dark focus-visible:ring-offset-2" 
                onClick={() => handleNavigation("/discover")}
                onKeyDown={(e) => handleKeyPress(e, () => handleNavigation("/discover"))}
                tabIndex={0}
                role="button"
                aria-label={`Aller à ${texts.discover}`}
              >
                <Users className="h-5 w-5 mr-3" aria-hidden="true" />
                {texts.discover}
              </Button>
            </li>
          </ul>
        </nav>
      </SheetContent>
    </Sheet>
  );
};
