
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
  },
  {
    id: "4",
    name: "Lecteur Nocturne",
    description: "Vous avez lu plus de 2 heures après 22h.",
    icon: "🌙",
    color: "purple-100",
    dateEarned: "22/03/2025"
  },
  {
    id: "5",
    name: "Critique Littéraire",
    description: "Vous avez partagé 5 critiques de livres.",
    icon: "✍️",
    color: "blue-100",
    dateEarned: "25/03/2025"
  },
  {
    id: "6",
    name: "Marathon Lecture",
    description: "Vous avez lu pendant plus de 5 heures d'affilée.",
    icon: "🏃",
    color: "red-100",
    dateEarned: "27/03/2025"
  },
  {
    id: "7",
    name: "Globe-trotter",
    description: "Vous avez lu des livres d'auteurs de 3 continents différents.",
    icon: "🌍",
    color: "teal-100",
    dateEarned: "01/04/2025"
  },
  {
    id: "8",
    name: "Polyglotte",
    description: "Vous avez lu un livre en langue étrangère.",
    icon: "🗣️",
    color: "indigo-100",
    dateEarned: "03/04/2025"
  },
  {
    id: "9",
    name: "Mentor",
    description: "Vous avez recommandé des livres à 3 autres lecteurs.",
    icon: "🎓",
    color: "yellow-100",
    dateEarned: "05/04/2025"
  },
  {
    id: "10",
    name: "Expert en Poésie",
    description: "Vous avez lu 5 recueils de poésie.",
    icon: "🎭",
    color: "pink-100",
    dateEarned: "08/04/2025"
  }
];

export const getUserBadges = (): Badge[] => {
  return mockBadges;
};
