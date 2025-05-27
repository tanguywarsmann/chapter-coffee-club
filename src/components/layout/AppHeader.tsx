
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { User, Home, LogOut, Trophy, BookCheck, Settings, Menu, Shield } from "lucide-react";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import Image from "@/components/ui/image";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { texts } from "@/i18n/texts";

export function AppHeader() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { user, isAdmin } = useAuth();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Logout error:", error);
        toast.error("Erreur lors de la déconnexion");
        return;
      }
      
      localStorage.removeItem("user");
      
      toast.success("Déconnexion réussie");
      
      setTimeout(() => {
        navigate("/");
      }, 100);
    } catch (e) {
      console.error("Exception during logout:", e);
      toast.error("Erreur inattendue lors de la déconnexion");
    }
  };

  const handleNavigation = (path: string) => {
    setIsSheetOpen(false);
    navigate(path);
  };

  // Handle keyboard navigation for menu items
  const handleKeyPress = (event: React.KeyboardEvent, action: () => void) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      action();
    }
  };

  const getUserInitials = () => {
    if (!user?.email) return "U";
    return user.email.charAt(0).toUpperCase();
  };

  const MobileMenu = () => (
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
          // Focus the first navigation item instead of the close button
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
                onClick={() => handleNavigation("/admin")}
                onKeyDown={(e) => handleKeyPress(e, () => handleNavigation("/admin"))}
                tabIndex={0}
                role="button"
                aria-label={`Aller à ${texts.admin}`}
              >
                <Shield className="h-5 w-5 mr-3" aria-hidden="true" />
                {texts.admin}
              </Button>
            </li>
          </ul>
        </nav>
      </SheetContent>
    </Sheet>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-logo-accent/20 bg-logo-background/95 backdrop-blur">
      <div className="container flex h-16 sm:h-14 items-center gap-4">
        {isMobile && <MobileMenu />}
        
        <Link 
          to="/home" 
          className="flex items-center gap-2 transition-transform duration-200 hover:scale-105 focus-visible:ring-2 focus-visible:ring-coffee-dark focus-visible:ring-offset-2 rounded-md"
          aria-label="READ - Retour à l'accueil"
        >
          <Image 
            src="/lovable-uploads/f8f10dfb-9602-4b38-b705-d6e6f42cce5d.png" 
            alt="" 
            className="h-8 w-8"
            aria-hidden="true"
          />
          <span className="text-xl font-medium text-logo-text">READ</span>
        </Link>
        
        <nav className="flex-1 hidden md:block" role="navigation" aria-label="Navigation principale">
          <ul className="flex items-center justify-center gap-6" role="list">
            <li role="listitem">
              <Link 
                to="/home" 
                className="flex items-center text-sm font-medium text-logo-text hover:text-logo-accent transition-colors duration-200 p-2 rounded-md hover:bg-logo-accent/10 focus-visible:ring-2 focus-visible:ring-coffee-dark focus-visible:ring-offset-2"
                aria-label={`Aller à ${texts.home}`}
              >
                <Home className="h-4 w-4 mr-1" aria-hidden="true" />
                {texts.home}
              </Link>
            </li>
            <li role="listitem">
              <Link 
                to="/explore" 
                className="flex items-center text-sm font-medium text-logo-text hover:text-logo-accent transition-colors duration-200 p-2 rounded-md hover:bg-logo-accent/10 focus-visible:ring-2 focus-visible:ring-coffee-dark focus-visible:ring-offset-2"
                aria-label={`Aller à ${texts.explore}`}
              >
                <BookCheck className="h-4 w-4 mr-1" aria-hidden="true" />
                {texts.explore}
              </Link>
            </li>
            <li role="listitem">
              <Link 
                to="/achievements" 
                className="flex items-center text-sm font-medium text-logo-text hover:text-logo-accent transition-colors duration-200 p-2 rounded-md hover:bg-logo-accent/10 focus-visible:ring-2 focus-visible:ring-coffee-dark focus-visible:ring-offset-2"
                aria-label={`Aller à ${texts.achievements}`}
              >
                <Trophy className="h-4 w-4 mr-1" aria-hidden="true" />
                {texts.achievements}
              </Link>
            </li>
            <li role="listitem">
              <Link 
                to="/reading-list" 
                className="flex items-center text-sm font-medium text-logo-text hover:text-logo-accent transition-colors duration-200 p-2 rounded-md hover:bg-logo-accent/10 focus-visible:ring-2 focus-visible:ring-coffee-dark focus-visible:ring-offset-2"
                aria-label={`Aller à ${texts.readingList}`}
              >
                <BookCheck className="h-4 w-4 mr-1" aria-hidden="true" />
                {texts.readingList}
              </Link>
            </li>
            <li role="listitem">
              <Link 
                to="/admin" 
                className="flex items-center text-sm font-medium text-logo-text hover:text-logo-accent transition-colors duration-200 p-2 rounded-md hover:bg-logo-accent/10 focus-visible:ring-2 focus-visible:ring-coffee-dark focus-visible:ring-offset-2"
                aria-label={`Aller à ${texts.admin}`}
              >
                <Shield className="h-4 w-4 mr-1" aria-hidden="true" />
                {texts.admin}
              </Link>
            </li>
          </ul>
        </nav>
        
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:ring-2 hover:ring-logo-accent">
                <Avatar className="h-8 w-8 border border-logo-accent">
                  <AvatarImage src="/avatar.png" alt="Avatar" />
                  <AvatarFallback className="bg-logo-accent text-primary-foreground">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-background border border-border" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.email}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => navigate("/profile")}
                className="cursor-pointer hover:bg-accent focus:bg-accent"
              >
                <User className="mr-2 h-4 w-4" />
                <span>{texts.profile}</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => navigate("/admin")}
                className="cursor-pointer hover:bg-accent focus:bg-accent"
              >
                <Shield className="mr-2 h-4 w-4" />
                <span>{texts.admin}</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => navigate("/settings")}
                className="cursor-pointer hover:bg-accent focus:bg-accent"
              >
                <Settings className="mr-2 h-4 w-4" />
                <span>{texts.settings}</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleLogout}
                className="cursor-pointer hover:bg-accent focus:bg-accent"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Déconnexion</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button variant="default" className="bg-logo-accent hover:bg-logo-accent/90 text-logo-background" asChild>
            <Link to="/">Se connecter</Link>
          </Button>
        )}
      </div>
    </header>
  );
}
