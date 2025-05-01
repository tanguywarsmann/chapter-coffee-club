
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

export function AppHeader() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { user, isAdmin } = useAuth();
  
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

  const getUserInitials = () => {
    if (!user?.email) return "U";
    return user.email.charAt(0).toUpperCase();
  };

  const MobileMenu = () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72">
        <SheetHeader>
          <SheetTitle className="text-left">Menu</SheetTitle>
        </SheetHeader>
        <nav className="mt-4">
          <ul className="space-y-2">
            <li>
              <Button variant="ghost" className="w-full justify-start" onClick={() => navigate("/home")}>
                <Home className="h-4 w-4 mr-2" />
                Accueil
              </Button>
            </li>
            <li>
              <Button variant="ghost" className="w-full justify-start" onClick={() => navigate("/explore")}>
                <BookCheck className="h-4 w-4 mr-2" />
                Explorer
              </Button>
            </li>
            <li>
              <Button variant="ghost" className="w-full justify-start" onClick={() => navigate("/achievements")}>
                <Trophy className="h-4 w-4 mr-2" />
                Récompenses
              </Button>
            </li>
            <li>
              <Button variant="ghost" className="w-full justify-start" onClick={() => navigate("/reading-list")}>
                <BookCheck className="h-4 w-4 mr-2" />
                Ma liste
              </Button>
            </li>
            {isAdmin && (
              <li>
                <Button variant="ghost" className="w-full justify-start" onClick={() => navigate("/admin")}>
                  <Shield className="h-4 w-4 mr-2" />
                  Administration
                </Button>
              </li>
            )}
          </ul>
        </nav>
      </SheetContent>
    </Sheet>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-logo-accent/20 bg-logo-background/95 backdrop-blur">
      <div className="container flex h-14 items-center gap-4">
        {isMobile && <MobileMenu />}
        
        <Link to="/home" className="flex items-center gap-2">
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
              <Link to="/home" className="flex items-center text-sm font-medium text-logo-text hover:text-logo-accent">
                <Home className="h-4 w-4 mr-1" />
                Accueil
              </Link>
            </li>
            <li>
              <Link to="/explore" className="flex items-center text-sm font-medium text-logo-text hover:text-logo-accent">
                <BookCheck className="h-4 w-4 mr-1" />
                Explorer
              </Link>
            </li>
            <li>
              <Link to="/achievements" className="flex items-center text-sm font-medium text-logo-text hover:text-logo-accent">
                <Trophy className="h-4 w-4 mr-1" />
                Récompenses
              </Link>
            </li>
            <li>
              <Link to="/reading-list" className="flex items-center text-sm font-medium text-logo-text hover:text-logo-accent">
                <BookCheck className="h-4 w-4 mr-1" />
                Ma liste
              </Link>
            </li>
            {isAdmin && (
              <li>
                <Link to="/admin" className="flex items-center text-sm font-medium text-logo-text hover:text-logo-accent">
                  <Shield className="h-4 w-4 mr-1" />
                  Administration
                </Link>
              </li>
            )}
          </ul>
        </nav>
        
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8 border border-logo-accent">
                  <AvatarImage src="/avatar.png" alt="Avatar" />
                  <AvatarFallback className="bg-logo-accent text-primary-foreground">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.email}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/profile")}>
                <User className="mr-2 h-4 w-4" />
                <span>Profil</span>
              </DropdownMenuItem>
              {isAdmin && (
                <DropdownMenuItem onClick={() => navigate("/admin")}>
                  <Shield className="mr-2 h-4 w-4" />
                  <span>Administration</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => navigate("/settings")}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Paramètres</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
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
