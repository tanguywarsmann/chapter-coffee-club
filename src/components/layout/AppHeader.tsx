
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { MobileMenu } from "./header/MobileMenu";
import { DesktopNav } from "./header/DesktopNav";
import { AvatarDropdown } from "./header/AvatarDropdown";
import { HeaderLogo } from "./header/HeaderLogo";

export function AppHeader() {
  const isMobile = useIsMobile();
  const { user, isAdmin } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-logo-accent/20 bg-logo-background/95 backdrop-blur">
      <div className="container flex h-16 sm:h-14 items-center gap-4">
        {isMobile && <MobileMenu isAdmin={isAdmin} />}
        
        <HeaderLogo />
        
        <DesktopNav isAdmin={isAdmin} />
        
        {user ? (
          <AvatarDropdown />
        ) : (
          <Button variant="default" className="bg-logo-accent hover:bg-logo-accent/90 text-logo-background" asChild>
            <Link to="/">Se connecter</Link>
          </Button>
        )}
      </div>
    </header>
  );
}
