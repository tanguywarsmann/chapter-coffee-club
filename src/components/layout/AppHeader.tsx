import { NotificationsBell } from "@/components/notifications/NotificationsBell";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { useStatusBar } from "@/hooks/useStatusBar";
import { useTranslation } from "@/i18n/LanguageContext";
import { Style } from "@capacitor/status-bar";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { AvatarDropdown } from "./header/AvatarDropdown";
import { DesktopNav } from "./header/DesktopNav";
import { HeaderLogo } from "./header/HeaderLogo";
import { MobileMenu } from "./header/MobileMenu";
import { LanguageToggle } from "./LanguageToggle";

export function AppHeader() {
  const isMobile = useIsMobile();
  const { user, isAdmin, isPremium } = useAuth();
  const { t, language, setLanguage } = useTranslation();

  // Initialize StatusBar with brand color
  const { setStatusBarColor, setStatusBarStyle } = useStatusBar();

  useEffect(() => {
    setStatusBarColor('#B26E45'); // Brand color
    setStatusBarStyle(Style.Dark); // Light text
  }, [setStatusBarColor, setStatusBarStyle]);

  const headerClassName = isMobile
    ? "sticky top-0 z-50 w-full border-b border-logo-accent/10 bg-logo-background/70 backdrop-blur supports-[backdrop-filter]:bg-logo-background/40 pt-[env(safe-area-inset-top)]"
    : "sticky top-0 z-50 w-full border-b border-logo-accent/20 bg-logo-background/95 backdrop-blur supports-[backdrop-filter]:bg-logo-background/60 pt-[env(safe-area-inset-top)]";

  const mobileLanguageButton = (
    <button
      type="button"
      onClick={() => setLanguage(language === "fr" ? "en" : "fr")}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-base shadow-inner transition hover:bg-white/20"
      aria-label={t.language.switch}
    >
      <span aria-hidden="true">{language === "fr" ? "🇫🇷" : "🇬🇧"}</span>
    </button>
  );

  return (
    <header className={headerClassName} role="banner">
      <div className="mx-auto flex h-16 w-full max-w-none items-center justify-between gap-3 px-4 sm:h-14">
        {isMobile ? (
          <>
            <div role="navigation" aria-label="Menu mobile" className="flex items-center">
              <MobileMenu isAdmin={isAdmin} isPremium={isPremium} />
            </div>
            <div className="flex flex-1 justify-center">
              <HeaderLogo />
            </div>
            <div className="flex items-center gap-1">
              {mobileLanguageButton}
              {user ? (
                <div
                  role="navigation"
                  aria-label="Menu utilisateur"
                  className="flex items-center gap-1 rounded-full border border-white/10 bg-white/10 px-1 py-1 shadow-inner"
                >
                  <NotificationsBell />
                  <AvatarDropdown />
                </div>
              ) : (
                <Button
                  size="sm"
                  variant="default"
                  className="h-9 rounded-full bg-logo-accent px-4 text-sm text-logo-background hover:bg-logo-accent/90"
                  asChild
                >
                  <Link to="/auth" aria-label="Se connecter à votre compte VREAD">
                    {t.auth.signIn}
                  </Link>
                </Button>
              )}
            </div>
          </>
        ) : (
          <>
            <HeaderLogo />
            <nav role="navigation" aria-label="Navigation principale" className="hidden md:block">
              <DesktopNav isAdmin={isAdmin} isPremium={isPremium} />
            </nav>
            {user ? (
              <div role="navigation" aria-label="Menu utilisateur" className="flex items-center gap-2">
                <div className="hidden md:block">
                  <LanguageToggle />
                </div>
                <NotificationsBell />
                {user.email === "tanguy.warsmann@gmail.com" && (
                  <button
                    onClick={() => window.location.reload()}
                    className="px-2 py-1 text-xs bg-destructive text-destructive-foreground rounded hover:bg-destructive/90"
                    title="Force reload de l'app"
                    aria-label="Recharger l'application"
                  >
                    🔄
                  </button>
                )}
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
                    to="/auth"
                    aria-label="Se connecter à votre compte VREAD"
                  >
                    {t.auth.signIn}
                  </Link>
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </header>
  );
}
