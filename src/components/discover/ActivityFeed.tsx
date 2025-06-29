
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ActivityFeedItem } from "./ActivityFeedItem";
import { Sparkles } from "lucide-react";

// Données fictives pour le fil d'actualité
const mockActivities = [
  {
    user: {
      id: "user1",
      name: "Marie Dubois",
      avatar: "/placeholder.svg"
    },
    activity: {
      type: 'book_completed' as const,
      content: "a terminé la lecture de Candide de Voltaire",
      details: "Un classique incontournable sur l'optimisme et la philosophie !",
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString() // 15 min ago
    }
  },
  {
    user: {
      id: "user2", 
      name: "Thomas Martin",
      avatar: "/placeholder.svg"
    },
    activity: {
      type: 'badge_earned' as const,
      content: "a débloqué un nouveau badge",
      timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 min ago
      badge: {
        name: "Lecteur assidu",
        icon: "📚",
        rarity: 'epic' as const
      }
    }
  },
  {
    user: {
      id: "user3",
      name: "Sophie Chen",
      avatar: "/placeholder.svg"
    },
    activity: {
      type: 'streak_milestone' as const,
      content: "atteint une série de 15 jours de lecture !",
      details: "Félicitations pour cette constance dans la lecture quotidienne",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2h ago
    }
  },
  {
    user: {
      id: "user4",
      name: "Alexandre Petit",
      avatar: "/placeholder.svg"
    },
    activity: {
      type: 'book_completed' as const,
      content: "a terminé Les Fleurs du Mal de Baudelaire",
      details: "Une plongée intense dans la poésie symboliste",
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString() // 3h ago
    }
  },
  {
    user: {
      id: "user5",
      name: "Emma Rodriguez",
      avatar: "/placeholder.svg"
    },
    activity: {
      type: 'badge_earned' as const,
      content: "a débloqué un nouveau badge",
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4h ago
      badge: {
        name: "Premier livre terminé",
        icon: "🎉",
        rarity: 'common' as const
      }
    }
  },
  {
    user: {
      id: "user6",
      name: "Lucas Dubois",
      avatar: "/placeholder.svg"
    },
    activity: {
      type: 'reading_session' as const,
      content: "a lu pendant 45 minutes",
      details: "Progression dans Un amour de Swann de Proust",
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString() // 5h ago
    }
  },
  {
    user: {
      id: "user7",
      name: "Camille Moreau",
      avatar: "/placeholder.svg"
    },
    activity: {
      type: 'badge_earned' as const,
      content: "a débloqué un nouveau badge",
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6h ago
      badge: {
        name: "Série de 7 jours",
        icon: "🔥",
        rarity: 'rare' as const
      }
    }
  }
];

export function ActivityFeed() {
  return (
    <Card className="border-coffee-light bg-white/70 backdrop-blur-md">
      <CardHeader className="bg-gradient-to-r from-coffee-light/20 to-coffee-medium/10 border-b border-coffee-light/30">
        <CardTitle className="font-serif text-coffee-darker flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-coffee-medium/20 to-coffee-light/20 rounded-xl">
            <Sparkles className="h-5 w-5 text-coffee-dark" />
          </div>
          <span>Fil d'actualité</span>
        </CardTitle>
        <p className="text-coffee-dark font-light text-sm">
          Découvrez les dernières activités de la communauté
        </p>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {mockActivities.map((item, index) => (
            <ActivityFeedItem
              key={`${item.user.id}-${index}`}
              user={item.user}
              activity={item.activity}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
