
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { MobileMenu } from "./header/MobileMenu";
import { DesktopNav } from "./header/DesktopNav";
import { AvatarDropdown } from "./header/AvatarDropdown";
import { HeaderLogo } from "./header/HeaderLogo";
import { NotificationsBell } from "@/components/notifications/NotificationsBell";
import { LanguageToggle } from "./LanguageToggle";
import { useTranslation } from "@/i18n/LanguageContext";

export function AppHeader() {
  const isMobile = useIsMobile();
  const { user, isAdmin, isPremium } = useAuth();
  const { t } = useTranslation();

  return (
    <header
      className="sticky top-0 z-50 w-full border-b border-logo-accent/20 bg-logo-background/95 backdrop-blur supports-[backdrop-filter]:bg-logo-background/60"
      role="banner"
    >
      <div className="mx-auto w-full px-4 max-w-none flex h-16 sm:h-14 items-center gap-4">
        {isMobile && (
          <div role="navigation" aria-label="Menu mobile">
            <MobileMenu isAdmin={isAdmin} isPremium={isPremium} />
          </div>
        )}
        
        <HeaderLogo />
        
        <nav role="navigation" aria-label="Navigation principale" className="hidden md:block">
          <DesktopNav isAdmin={isAdmin} isPremium={isPremium} />
        </nav>
        
        {user ? (
          <div role="navigation" aria-label="Menu utilisateur" className="flex items-center gap-2">
            <LanguageToggle />
            <NotificationsBell />
            <AvatarDropdown />
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <Button 
              variant="default" 
              className="bg-logo-accent hover:bg-logo-accent/90 text-logo-background focus:ring-2 focus:ring-logo-accent focus:ring-offset-2" 
              asChild
            >
              <Link 
                to="/"
                aria-label="Se connecter à votre compte VREAD"
              >
                {t.auth.signIn}
              </Link>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
