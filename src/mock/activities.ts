import { User } from "@/types/user";
import type { Comment } from "@/types/comment";

const mockUsers: User[] = [
  {
    id: "1",
    name: "Sophie Martin",
    email: "sophie@example.com",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80",
    preferences: {
      favoriteGenres: ["Romans classiques", "Poésie"],
      readingGoal: 30
    }
  },
  {
    id: "2",
    name: "Thomas Dubois",
    email: "thomas@example.com",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e",
    preferences: {
      favoriteGenres: ["Science-fiction", "Thriller"],
      readingGoal: 24
    }
  },
  {
    id: "3",
    name: "Emma Petit",
    email: "emma@example.com",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
    preferences: {
      favoriteGenres: ["Romance", "Biographies"],
      readingGoal: 20
    }
  },
  {
    id: "4",
    name: "Lucas Bernard",
    email: "lucas@example.com",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e",
    preferences: {
      favoriteGenres: ["Fantasy", "Policier"],
      readingGoal: 15
    }
  },
  {
    id: "5",
    name: "Camille Roux",
    email: "camille@example.com",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2",
    preferences: {
      favoriteGenres: ["Philosophie", "Essais"],
      readingGoal: 40
    }
  }
];

const mockComments: { [key: string]: Comment[] } = {
  "1": [
    {
      id: "c1",
      userId: "2",
      userName: "Thomas Dubois",
      userAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e",
      content: "Super choix ! Un de mes livres préférés.",
      timestamp: "Il y a 1 heure"
    },
    {
      id: "c2",
      userId: "3",
      userName: "Emma Petit",
      userAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
      content: "J'ai adoré ce livre aussi !",
      timestamp: "Il y a 30 minutes"
    }
  ],
  "2": [
    {
      id: "c3",
      userId: "4",
      userName: "Lucas Bernard",
      content: "Bravo ! Continue comme ça !",
      timestamp: "Il y a 2 heures"
    }
  ]
};

export interface Activity {
  id: string;
  user: User;
  type: "finished" | "started" | "badge" | "streak";
  content: string;
  bookTitle?: string;
  badgeIcon?: string;
  timestamp: string;
  likes: number;
  comments: number;
  hasLiked: boolean;
  commentsList?: Comment[];
}

export const mockActivities: Activity[] = [
  {
    id: "1",
    user: mockUsers[0],
    type: "finished",
    content: "a terminé la lecture de",
    bookTitle: "Le Petit Prince",
    timestamp: "Il y a 2 heures",
    likes: 12,
    comments: 2,
    hasLiked: false,
    commentsList: mockComments["1"]
  },
  {
    id: "2",
    user: mockUsers[1],
    type: "badge",
    content: "a obtenu le badge Lecteur Nocturne",
    badgeIcon: "🌙",
    timestamp: "Il y a 4 heures",
    likes: 8,
    comments: 1,
    hasLiked: true
  },
  {
    id: "3",
    user: mockUsers[2],
    type: "started",
    content: "a commencé la lecture de",
    bookTitle: "La Chatte",
    timestamp: "Il y a 6 heures",
    likes: 5,
    comments: 2,
    hasLiked: false
  },
  {
    id: "4",
    user: mockUsers[3],
    type: "streak",
    content: "maintient une série de lecture de 10 jours !",
    timestamp: "Il y a 8 heures",
    likes: 15,
    comments: 4,
    hasLiked: true
  },
  {
    id: "5",
    user: mockUsers[4],
    type: "badge",
    content: "a obtenu le badge Expert en Poésie",
    badgeIcon: "🎭",
    timestamp: "Il y a 12 heures",
    likes: 10,
    comments: 2,
    hasLiked: false
  },
  {
    id: "6",
    user: mockUsers[0],
    type: "finished",
    content: "a terminé la lecture de",
    bookTitle: "Un amour de Swann",
    timestamp: "Il y a 1 jour",
    likes: 18,
    comments: 5,
    hasLiked: true
  }
];

export const getActivities = () => {
  return mockActivities;
};

export const getUserActivities = () => {
  return mockActivities;
};
