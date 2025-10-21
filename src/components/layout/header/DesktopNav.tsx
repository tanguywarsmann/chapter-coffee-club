import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { buildNav } from "./nav.config";

interface DesktopNavProps {
  isAdmin?: boolean;
  isPremium?: boolean;
}

export const DesktopNav = ({ isAdmin, isPremium }: DesktopNavProps) => {
  const items = buildNav({ isAdmin, isPremium });

  return (
    <nav className="hidden md:flex items-center space-x-6 text-body-sm font-medium flex-1">
      {items.map(({ to, label, icon: Icon, ariaLabel }) => (
        <Link key={to} to={to}>
          <Button variant="ghost" className="hover:text-logo-accent" aria-label={ariaLabel ?? label}>
            {Icon && <Icon className="mr-2 h-4 w-4" />}
            {label}
          </Button>
        </Link>
      ))}
    </nav>
  );
};
