
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { texts } from "@/i18n/texts";
import { BookPlus, Crown } from "lucide-react";

interface DesktopNavProps {
  isAdmin?: boolean;
  isPremium?: boolean;
}

export const DesktopNav = ({ isAdmin, isPremium }: DesktopNavProps) => {
  return (
    <nav className="hidden md:flex items-center space-x-6 text-body-sm font-medium flex-1">
      <Link to="/home">
        <Button variant="ghost" className="hover:text-logo-accent">
          {texts.home}
        </Button>
      </Link>
      <Link to="/explore">
        <Button variant="ghost" className="hover:text-logo-accent">
          {texts.explore}
        </Button>
      </Link>
      <Link to="/achievements">
        <Button variant="ghost" className="hover:text-logo-accent">
          {texts.achievements}
        </Button>
      </Link>
      <Link to="/reading-list">
        <Button variant="ghost" className="hover:text-logo-accent">
          {texts.readingList}
        </Button>
      </Link>
      <Link to="/discover">
        <Button variant="ghost" className="hover:text-logo-accent">
          {texts.discover}
        </Button>
      </Link>
      <Link to="/blog">
        <Button variant="ghost" className="hover:text-logo-accent">
          Blog
        </Button>
      </Link>
      <Link to="/a-propos">
        <Button variant="ghost" className="hover:text-logo-accent">
          À propos
        </Button>
      </Link>
      <Link to="/presse">
        <Button variant="ghost" className="hover:text-logo-accent">
          Presse
        </Button>
      </Link>
      {!isPremium && (
        <Link to="/premium">
          <Button variant="ghost" className="hover:text-logo-accent">
            <Crown className="mr-2 h-4 w-4 text-yellow-500" />
            Premium
          </Button>
        </Link>
      )}
      {isPremium && (
        <Link to="/request-book">
          <Button variant="ghost" className="hover:text-logo-accent">
            <BookPlus className="mr-2 h-4 w-4" />
            Demander un livre
          </Button>
        </Link>
      )}
    </nav>
  );
};
