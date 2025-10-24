
import { Badge } from "@/types/badge";

export const mockBadges: Badge[] = [
  {
    id: "1",
    label: "Premier livre terminé",
    slug: "premier-livre",
    name: "Premier livre terminé",
    description: "Vous avez terminé votre premier livre. Bravo!",
    icon: "📚",
    color: "green-100",
    rarity: "common",
    dateEarned: "12/03/2025"
  },
  {
    id: "2",
    label: "Lecteur Classique",
    slug: "lecteur-classique",
    name: "Lecteur Classique",
    description: "Vous avez lu 3 classiques de la littérature française.",
    icon: "🏛️",
    color: "coffee-light",
    rarity: "rare",
    dateEarned: "15/03/2025"
  },
  {
    id: "3",
    label: "Série de 7 jours",
    slug: "serie-7-jours",
    name: "Série de 7 jours",
    description: "Vous avez lu pendant 7 jours consécutifs.",
    icon: "🔥",
    color: "orange-100",
    rarity: "rare",
    dateEarned: "20/03/2025"
  },
  {
    id: "4",
    label: "Lecteur Nocturne",
    slug: "lecteur-nocturne",
    name: "Lecteur Nocturne",
    description: "Vous avez lu plus de 2 heures après 22h.",
    icon: "🌙",
    color: "purple-100",
    rarity: "common",
    dateEarned: "22/03/2025"
  },
  {
    id: "5",
    label: "Critique Littéraire",
    slug: "critique-litteraire",
    name: "Critique Littéraire",
    description: "Vous avez partagé 5 critiques de livres.",
    icon: "✍️",
    color: "blue-100",
    rarity: "rare",
    dateEarned: "25/03/2025"
  },
  {
    id: "6",
    label: "Marathon Lecture",
    slug: "marathon-lecture",
    name: "Marathon Lecture",
    description: "Vous avez lu pendant plus de 5 heures d'affilée.",
    icon: "🏃",
    color: "red-100",
    rarity: "epic",
    dateEarned: "27/03/2025"
  },
  {
    id: "7",
    label: "Globe-trotter",
    slug: "globe-trotter",
    name: "Globe-trotter",
    description: "Vous avez lu des livres d'auteurs de 3 continents différents.",
    icon: "🌍",
    color: "teal-100",
    rarity: "epic",
    dateEarned: "01/04/2025"
  },
  {
    id: "8",
    label: "Polyglotte",
    slug: "polyglotte",
    name: "Polyglotte",
    description: "Vous avez lu un livre en langue étrangère.",
    icon: "🗣️",
    color: "indigo-100",
    rarity: "rare",
    dateEarned: "03/04/2025"
  },
  {
    id: "9",
    label: "Mentor",
    slug: "mentor",
    name: "Mentor",
    description: "Vous avez recommandé des livres à 3 autres lecteurs.",
    icon: "🎓",
    color: "yellow-100",
    rarity: "common",
    dateEarned: "05/04/2025"
  },
  {
    id: "10",
    label: "Expert en Poésie",
    slug: "expert-poesie",
    name: "Expert en Poésie",
    description: "Vous avez lu 5 recueils de poésie.",
    icon: "🎭",
    color: "pink-100",
    rarity: "legendary",
    dateEarned: "08/04/2025"
  }
];

export const getUserBadges = (): Badge[] => {
  return mockBadges;
};
