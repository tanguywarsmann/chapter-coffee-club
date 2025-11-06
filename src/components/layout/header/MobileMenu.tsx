import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { useTranslation } from "@/i18n/LanguageContext";
import { buildNav } from "./nav.config";

interface MobileMenuProps {
  isAdmin?: boolean;
  isPremium?: boolean;
}

export const MobileMenu = ({ isAdmin, isPremium }: MobileMenuProps) => {
  const { t } = useTranslation();
  const items = buildNav({ isAdmin, isPremium, t });
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
          aria-label={t.nav.menu}
          aria-expanded={isSheetOpen}
          aria-controls="mobile-menu"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">{t.nav.menu}</span>
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
          <SheetTitle className="text-left text-h4">{t.nav.menu}</SheetTitle>
        </SheetHeader>
        <nav className="mt-4" role="navigation" aria-label="Navigation principale">
          <ul className="space-y-1" role="list">
            {items.map(({ to, label, icon: Icon, ariaLabel }) => (
              <li role="listitem" key={to}>
                <Button 
                  variant="ghost" 
                  className="mobile-nav-item focus-visible:ring-2 focus-visible:ring-coffee-dark focus-visible:ring-offset-2" 
                  onClick={() => handleNavigation(to)}
                  onKeyDown={(e) => handleKeyPress(e, () => handleNavigation(to))}
                  tabIndex={0}
                  role="button"
                  aria-label={ariaLabel ?? label}
                >
                  {Icon && <Icon className="h-5 w-5 mr-3" aria-hidden="true" />}
                  {label}
                </Button>
              </li>
            ))}
          </ul>
        </nav>
      </SheetContent>
    </Sheet>
  );
};
