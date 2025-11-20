import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from "@/components/ui/sheet";
import { Menu, LogOut, User as UserIcon, Shield } from "lucide-react";
import { useTranslation } from "@/i18n/LanguageContext";
import { buildNav } from "./nav.config";
import { cn } from "@/lib/utils";
import { LanguageToggle } from "../LanguageToggle";
import { useAuth } from "@/contexts/AuthContext";
import { useStatusBar } from "@/hooks/useStatusBar";
import { Style } from "@capacitor/status-bar";
import { EnhancedAvatar } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

interface MobileMenuProps {
  isAdmin?: boolean;
  isPremium?: boolean;
}

export const MobileMenu = ({ isAdmin, isPremium }: MobileMenuProps) => {
  const { t } = useTranslation();
  const items = buildNav({ isAdmin, isPremium, t });
  const navigate = useNavigate();
  const location = useLocation();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { setStatusBarColor, setStatusBarStyle } = useStatusBar();

  // Handle status bar color changes based on menu state
  useEffect(() => {
    if (isSheetOpen) {
      // Menu open: Light background (#FBF6F1), Dark text
      setStatusBarColor('#FFFFFF'); 
      setStatusBarStyle(Style.Light);
    } else {
      // Menu closed: Brand dark background (#B26E45), Light text
      setStatusBarColor('#B26E45');
      setStatusBarStyle(Style.Dark);
    }
  }, [isSheetOpen, setStatusBarColor, setStatusBarStyle]);

  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleNavigation = (path: string) => {
    setIsSheetOpen(false);
    scrollToTop();
    navigate(path);
  };

  const handleLogout = async () => {
    try {
      setIsSheetOpen(false);
      scrollToTop();
      await signOut();
      toast.success("Déconnexion réussie");
      setTimeout(() => navigate("/"), 100);
    } catch (e) {
      toast.error("Erreur lors de la déconnexion");
    }
  };

  return (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden text-primary hover:bg-logo-accent/20 focus-visible:ring-2 focus-visible:ring-white/50"
          aria-label={t.nav.menu}
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">{t.nav.menu}</span>
        </Button>
      </SheetTrigger>
      <SheetContent 
        side="left" 
        className="w-[85vw] sm:w-[350px] flex flex-col p-0 border-r border-border bg-background"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {/* Header Section */}
        <div className="p-6 bg-logo-background/5 border-b border-border/40">
          <SheetHeader className="text-left">
            <SheetTitle className="text-h4 font-serif text-primary flex items-center gap-2">
              VREAD
            </SheetTitle>
            {user && (
              <div className="flex items-center gap-3 mt-4 animate-in fade-in slide-in-from-left-4 duration-500">
                <EnhancedAvatar
                  src="/avatar.png"
                  fallbackText={user.email || "U"}
                  className="h-12 w-12 border-2 border-background shadow-sm ring-2 ring-logo-background/10"
                />
                <div className="flex flex-col overflow-hidden">
                  <span className="text-body-sm font-medium truncate text-foreground">{user.email}</span>
                  {isPremium && (
                    <span className="text-[10px] font-bold text-logo-background uppercase tracking-wider bg-logo-background/10 px-2 py-0.5 rounded-full w-fit mt-1">
                      Premium
                    </span>
                  )}
                </div>
              </div>
            )}
          </SheetHeader>
        </div>
        
        {/* Scrollable Navigation */}
        <div className="flex-1 overflow-y-auto py-4 px-3">
          <nav className="space-y-1">
            {items.map(({ to, label, icon: Icon }) => {
              const isActive = location.pathname === to;
              return (
                <Button
                  key={to}
                  variant="ghost"
                  className={cn(
                    "w-full justify-start h-12 text-body-sm font-medium px-4 mb-1 transition-all duration-200",
                    isActive 
                      ? "bg-logo-background/10 text-logo-background shadow-sm" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50 hover:pl-5"
                  )}
                  onClick={() => handleNavigation(to)}
                >
                  {Icon && <Icon className={cn("mr-3 h-5 w-5 transition-colors", isActive ? "text-logo-background" : "text-muted-foreground/70")} />}
                  {label}
                </Button>
              );
            })}
          </nav>

          {user && (
            <>
              <Separator className="my-4 mx-4 w-auto opacity-50" />
              <div className="space-y-1 px-3">
                <p className="px-4 text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Compte</p>
                <Button
                  variant="ghost"
                  className="w-full justify-start h-10 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/30 px-4"
                  onClick={() => handleNavigation("/profile")}
                >
                  <UserIcon className="mr-3 h-4 w-4" />
                  Profil
                </Button>
                {isAdmin && (
                  <Button
                    variant="ghost"
                    className="w-full justify-start h-10 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/30 px-4"
                    onClick={() => handleNavigation("/admin")}
                  >
                    <Shield className="mr-3 h-4 w-4" />
                    Admin
                  </Button>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t bg-muted/10 space-y-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-medium text-muted-foreground">{t.language.switch}</span>
            <LanguageToggle />
          </div>
          
          {user ? (
            <Button 
              variant="outline" 
              className="w-full border-destructive/20 text-destructive hover:bg-destructive/5 hover:text-destructive h-10"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Déconnexion
            </Button>
          ) : (
             <Button 
              className="w-full bg-logo-background hover:bg-logo-background/90 text-white h-10 shadow-md"
              onClick={() => handleNavigation("/")}
            >
              {t.auth.signIn}
            </Button>
          )}
          
          <div className="text-center">
            <span className="text-[10px] text-muted-foreground/50 font-mono">v1.0.0</span>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
