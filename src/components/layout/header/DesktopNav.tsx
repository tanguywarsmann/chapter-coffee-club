import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { buildNav } from "./nav.config";
import { useTranslation } from "@/i18n/LanguageContext";

interface DesktopNavProps {
  isAdmin?: boolean;
  isPremium?: boolean;
}

export const DesktopNav = ({ isAdmin, isPremium }: DesktopNavProps) => {
  const { t } = useTranslation();
  const items = buildNav({ isAdmin, isPremium, t });

  return (
    <nav className="hidden md:flex items-center space-x-6 text-body-sm font-medium flex-1">
      {items.map(({ to, label, icon: Icon, ariaLabel }) => (
        <Link key={to} to={to}>
          <Button variant="ghost" className="hover:text-logo-accent gap-2" aria-label={ariaLabel ?? label}>
            {Icon && <Icon className="h-4 w-4" />}
            {label}
            {to === "/request-book" && !isPremium && (
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                Premium
              </span>
            )}
          </Button>
        </Link>
      ))}
    </nav>
  );
};
