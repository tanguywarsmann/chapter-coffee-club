import { useTranslation } from "@/i18n/LanguageContext";
import { 
  Home, 
  BookCheck, 
  Trophy, 
  Crown, 
  BookPlus, 
  Users, 
  MessageSquare, 
  BookOpen 
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type NavItem = {
  to: string;
  label: string;
  icon?: LucideIcon;
  ariaLabel?: string;
};

export function buildNav(opts: { isPremium?: boolean; isAdmin?: boolean; t?: any } = {}): NavItem[] {
  const { isPremium, t } = opts;

  // Fallback for when t is not provided (should not happen in normal usage)
  const nav = t?.nav || {
    home: "Accueil",
    explore: "Explorer",
    achievements: "Récompenses",
    requestBook: "Demander un livre",
    premium: "Premium",
    readingList: "Ma liste",
    discover: "Lecteurs",
    feedback: "Feedback",
  };

  const items: NavItem[] = [
    { to: "/home", label: nav.home, icon: Home, ariaLabel: `${nav.home}` },
    { to: "/explore", label: nav.explore, icon: BookCheck, ariaLabel: `${nav.explore}` },
    { to: "/achievements", label: nav.achievements, icon: Trophy, ariaLabel: `${nav.achievements}` },
    // 4. Premium / Request Book (conditionnel)
    isPremium
      ? { to: "/request-book", label: nav.requestBook, icon: BookPlus, ariaLabel: nav.requestBook }
      : { to: "/premium", label: nav.premium, icon: Crown, ariaLabel: nav.premium },
    { to: "/reading-list", label: nav.readingList, icon: BookCheck, ariaLabel: `${nav.readingList}` },
    { to: "/discover", label: nav.discover, icon: Users, ariaLabel: `${nav.discover}` },
    { to: "/feedback", label: nav.feedback, icon: MessageSquare, ariaLabel: nav.feedback },
  ];

  return items;
}
