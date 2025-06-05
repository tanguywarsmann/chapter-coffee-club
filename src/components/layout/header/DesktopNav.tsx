
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { texts } from "@/i18n/texts";

interface DesktopNavProps {
  isAdmin?: boolean;
}

export const DesktopNav = ({ isAdmin }: DesktopNavProps) => {
  return (
    <nav className="hidden md:flex items-center space-x-6 text-sm font-medium flex-1">
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
    </nav>
  );
};
