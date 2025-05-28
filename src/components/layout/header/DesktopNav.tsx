
import { Link } from "react-router-dom";
import { Home, Trophy, BookCheck, Shield } from "lucide-react";
import { texts } from "@/i18n/texts";

interface DesktopNavProps {
  isAdmin?: boolean;
}

export const DesktopNav = ({ isAdmin }: DesktopNavProps) => {
  return (
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
  );
};
