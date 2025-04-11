
import { Badge } from "@/types/badge";

export const mockBadges: Badge[] = [
  {
    id: "1",
    name: "Premier livre terminé",
    description: "Vous avez terminé votre premier livre. Bravo!",
    icon: "📚",
    color: "green-100",
    dateEarned: "12/03/2025"
  },
  {
    id: "2",
    name: "Lecteur Classique",
    description: "Vous avez lu 3 classiques de la littérature française.",
    icon: "🏛️",
    color: "coffee-light",
    dateEarned: "15/03/2025"
  },
  {
    id: "3",
    name: "Série de 7 jours",
    description: "Vous avez lu pendant 7 jours consécutifs.",
    icon: "🔥",
    color: "orange-100",
    dateEarned: "20/03/2025"
  }
];

export const getUserBadges = (): Badge[] => {
  return mockBadges;
};
