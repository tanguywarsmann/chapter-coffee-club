
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { User, LogOut, Shield } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { texts } from "@/i18n/texts";

export const AvatarDropdown = () => {
  const navigate = useNavigate();
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

  if (!user) return null;

  return (
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
  );
};
