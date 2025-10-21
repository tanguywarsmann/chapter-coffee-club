import { texts } from "@/i18n/texts";
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

export function buildNav(opts: { isPremium?: boolean; isAdmin?: boolean } = {}): NavItem[] {
  const { isPremium } = opts;

  const items: NavItem[] = [
    { to: "/home", label: texts.home, icon: Home, ariaLabel: `Aller à ${texts.home}` },
    { to: "/explore", label: texts.explore, icon: BookCheck, ariaLabel: `Aller à ${texts.explore}` },
    { to: "/achievements", label: texts.achievements, icon: Trophy, ariaLabel: `Aller à ${texts.achievements}` },
    // 4. Premium / Request Book (conditionnel)
    isPremium
      ? { to: "/request-book", label: "Demander un livre", icon: BookPlus, ariaLabel: "Demander un livre" }
      : { to: "/premium", label: "Premium", icon: Crown, ariaLabel: "Passer Premium" },
    { to: "/reading-list", label: texts.readingList, icon: BookCheck, ariaLabel: `Aller à ${texts.readingList}` },
    { to: "/discover", label: texts.discover, icon: Users, ariaLabel: `Aller à ${texts.discover}` },
    { to: "/feedback", label: "Feedback", icon: MessageSquare, ariaLabel: "Aller au Feedback" },
    { to: "/blog", label: "Blog", icon: BookOpen, ariaLabel: "Aller au Blog" },
    { to: "/a-propos", label: "À propos", icon: Users, ariaLabel: "Aller à À propos" },
    { to: "/presse", label: "Presse", icon: Users, ariaLabel: "Aller à Presse" },
  ];

  return items;
}
