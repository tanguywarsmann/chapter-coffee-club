import { Button } from "@/components/ui/button";
import { useTranslation } from "@/i18n/LanguageContext";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";
import { buildNav } from "./nav.config";

interface DesktopNavProps {
  isAdmin?: boolean;
  isPremium?: boolean;
}

export const DesktopNav = ({ isAdmin, isPremium }: DesktopNavProps) => {
  const { t } = useTranslation();
  const location = useLocation();
  const items = buildNav({ isAdmin, isPremium, t });

  return (
    <nav className="hidden md:flex items-center gap-2 text-body-sm font-medium flex-1">
      {items.map(({ to, label, icon: Icon, ariaLabel }) => {
        const isActive = location.pathname === to;

        return (
          <Link key={to} to={to}>
            <Button
              variant="ghost"
              className={cn(
                "gap-2 transition-all duration-200 group",
                isActive
                  ? "bg-logo-background/15 text-primary font-semibold shadow-sm hover:bg-white/25"
                  : "text-muted-foreground hover:text-primary hover:bg-white/25"
              )}
              aria-label={ariaLabel ?? label}
            >
              {Icon && (
                <Icon
                  className={cn(
                    "h-4 w-4",
                    isActive ? "text-logo-background" : "text-muted-foreground/70 group-hover:text-primary"
                  )}
                />
              )}
              {label}
              {to === "/request-book" && !isPremium && (
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full ml-1">
                  Premium
                </span>
              )}
            </Button>
          </Link>
        );
      })}
    </nav>
  );
};
