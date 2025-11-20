
import { PremiumBadge } from "@/components/premium/PremiumBadge";
import { EnhancedAvatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { texts } from "@/i18n/texts";
import { LogOut, Shield, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export const AvatarDropdown = () => {
  const navigate = useNavigate();
  const { user, isPremium, signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Déconnexion réussie");
      setTimeout(() => {
        navigate("/");
      }, 100);
    } catch {
      toast.error("Erreur inattendue lors de la déconnexion");
    }
  };


  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:ring-2 hover:ring-logo-accent">
          <EnhancedAvatar
            src="/avatar.png"
            alt="Avatar"
            fallbackText={user?.email || "Utilisateur"}
            size="sm"
            className="border border-logo-accent"
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-background border border-border" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-2">
            <p className="text-body-sm font-medium leading-none">{user.email}</p>
            <p className="text-caption leading-none text-muted-foreground">
              {user.email}
            </p>
            {isPremium && (
              <div className="pt-1">
                <PremiumBadge size="sm" variant="full" />
              </div>
            )}
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
