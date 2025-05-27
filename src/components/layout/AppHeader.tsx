
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

  const getUserInitials = () => {
    if (!user?.email) return "U";
    return user.email.charAt(0).toUpperCase();
  };

  const MobileMenu = () => (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 overflow-y-auto">
        <SheetHeader className="pb-4">
          <SheetTitle className="text-left text-lg">{texts.menu || "Menu"}</SheetTitle>
        </SheetHeader>
        <nav className="mt-4">
          <ul className="space-y-1">
            <li>
              <Button 
                variant="ghost" 
                className="mobile-nav-item" 
                onClick={() => handleNavigation("/home")}
              >
                <Home className="h-5 w-5 mr-3" />
                {texts.home}
              </Button>
            </li>
            <li>
              <Button 
                variant="ghost" 
                className="mobile-nav-item" 
                onClick={() => handleNavigation("/explore")}
              >
                <BookCheck className="h-5 w-5 mr-3" />
                {texts.explore}
              </Button>
            </li>
            <li>
              <Button 
                variant="ghost" 
                className="mobile-nav-item" 
                onClick={() => handleNavigation("/achievements")}
              >
                <Trophy className="h-5 w-5 mr-3" />
                {texts.achievements}
              </Button>
            </li>
            <li>
              <Button 
                variant="ghost" 
                className="mobile-nav-item" 
                onClick={() => handleNavigation("/reading-list")}
              >
                <BookCheck className="h-5 w-5 mr-3" />
                {texts.readingList}
              </Button>
            </li>
            <li>
              <Button 
                variant="ghost" 
                className="mobile-nav-item" 
                onClick={() => handleNavigation("/admin")}
              >
                <Shield className="h-5 w-5 mr-3" />
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
        
        <Link to="/home" className="flex items-center gap-2 transition-transform duration-200 hover:scale-105">
          <Image 
            src="/lovable-uploads/f8f10dfb-9602-4b38-b705-d6e6f42cce5d.png" 
            alt="READ Logo" 
            className="h-8 w-8"
          />
          <span className="text-xl font-medium text-logo-text">READ</span>
        </Link>
        
        <nav className="flex-1 hidden md:block">
          <ul className="flex items-center justify-center gap-6">
            <li>
              <Link 
                to="/home" 
                className="flex items-center text-sm font-medium text-logo-text hover:text-logo-accent transition-colors duration-200 p-2 rounded-md hover:bg-logo-accent/10"
              >
                <Home className="h-4 w-4 mr-1" />
                {texts.home}
              </Link>
            </li>
            <li>
              <Link 
                to="/explore" 
                className="flex items-center text-sm font-medium text-logo-text hover:text-logo-accent transition-colors duration-200 p-2 rounded-md hover:bg-logo-accent/10"
              >
                <BookCheck className="h-4 w-4 mr-1" />
                {texts.explore}
              </Link>
            </li>
            <li>
              <Link 
                to="/achievements" 
                className="flex items-center text-sm font-medium text-logo-text hover:text-logo-accent transition-colors duration-200 p-2 rounded-md hover:bg-logo-accent/10"
              >
                <Trophy className="h-4 w-4 mr-1" />
                {texts.achievements}
              </Link>
            </li>
            <li>
              <Link 
                to="/reading-list" 
                className="flex items-center text-sm font-medium text-logo-text hover:text-logo-accent transition-colors duration-200 p-2 rounded-md hover:bg-logo-accent/10"
              >
                <BookCheck className="h-4 w-4 mr-1" />
                {texts.readingList}
              </Link>
            </li>
            <li>
              <Link 
                to="/admin" 
                className="flex items-center text-sm font-medium text-logo-text hover:text-logo-accent transition-colors duration-200 p-2 rounded-md hover:bg-logo-accent/10"
              >
                <Shield className="h-4 w-4 mr-1" />
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
