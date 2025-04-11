
import { User } from "@/types/user";

interface Activity {
  id: string;
  user: User;
  type: "finished" | "started" | "badge" | "streak";
  content: string;
  timestamp: string;
  bookTitle?: string;
  bookId?: string;
  badgeIcon?: string;
  likes: number;
  comments: number;
  hasLiked: boolean;
}

const currentUser: User = {
  id: "1",
  name: "Sophie Martin",
  email: "sophie@example.com",
  avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=100&ixid=MnwxfDB8MXxyYW5kb218MHx8cGVvcGxlfHx8fHx8MTY4MzU1MDYwMg&ixlib=rb-4.0.3&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=100"
};

const otherUsers: User[] = [
  {
    id: "2",
    name: "Thomas Dubois",
    email: "thomas@example.com",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=100&ixid=MnwxfDB8MXxyYW5kb218MHx8cGVvcGxlfHx8fHx8MTY4MzU1MDYwMg&ixlib=rb-4.0.3&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=100"
  },
  {
    id: "3",
    name: "Julie Lefebvre",
    email: "julie@example.com",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=100&ixid=MnwxfDB8MXxyYW5kb218MHx8cGVvcGxlfHx8fHx8MTY4MzU1MDYwMg&ixlib=rb-4.0.3&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=100"
  }
];

export const mockActivities: Activity[] = [
  {
    id: "1",
    user: currentUser,
    type: "finished",
    content: "a terminé la lecture de",
    bookTitle: "Le Comte de Monte-Cristo",
    bookId: "2",
    timestamp: "Aujourd'hui à 10:23",
    likes: 5,
    comments: 2,
    hasLiked: false
  },
  {
    id: "2",
    user: otherUsers[0],
    type: "started",
    content: "a commencé la lecture de",
    bookTitle: "Les Misérables",
    bookId: "1",
    timestamp: "Hier à 19:45",
    likes: 3,
    comments: 0,
    hasLiked: true
  },
  {
    id: "3",
    user: currentUser,
    type: "badge",
    content: "a obtenu le badge \"Lecteur Classique\"",
    badgeIcon: "🏛️",
    timestamp: "Il y a 2 jours",
    likes: 7,
    comments: 1,
    hasLiked: false
  },
  {
    id: "4",
    user: otherUsers[1],
    type: "streak",
    content: "maintient une série de lecture de 14 jours!",
    timestamp: "Il y a 3 jours",
    likes: 12,
    comments: 4,
    hasLiked: true
  }
];

export const getUserActivities = (): Activity[] => {
  return mockActivities;
};
