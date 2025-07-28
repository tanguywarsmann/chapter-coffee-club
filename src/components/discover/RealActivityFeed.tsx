
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, BookOpen, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { DiscoverFeedItem } from "@/services/user/realDiscoverService";
import { EnhancedAvatar } from "@/components/ui/avatar";

interface RealActivityFeedProps {
  activities: DiscoverFeedItem[];
  loading?: boolean;
}

export function RealActivityFeed({ activities, loading }: RealActivityFeedProps) {
  if (loading) {
    return (
      <Card className="border-coffee-light bg-white/70 backdrop-blur-md">
        <CardHeader className="bg-gradient-to-r from-coffee-light/20 to-coffee-medium/10 border-b border-coffee-light/30">
          <CardTitle className="font-serif text-coffee-darker flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-coffee-medium/20 to-coffee-light/20 rounded-xl">
              <Sparkles className="h-5 w-5 text-coffee-dark" />
            </div>
            <span>Fil d'actualité</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-coffee-light/20 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-coffee-light bg-white/70 backdrop-blur-md">
      <CardHeader className="bg-gradient-to-r from-coffee-light/20 to-coffee-medium/10 border-b border-coffee-light/30">
        <CardTitle className="font-serif text-coffee-darker flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-coffee-medium/20 to-coffee-light/20 rounded-xl">
            <Sparkles className="h-5 w-5 text-coffee-dark" />
          </div>
          <span>Fil d'actualité</span>
        </CardTitle>
        <p className="text-coffee-dark font-light text-body-sm">
          Découvrez les dernières activités de la communauté
        </p>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {activities.length === 0 ? (
            <div className="text-center py-8 text-coffee-dark">
              <Sparkles className="h-12 w-12 mx-auto mb-4 text-coffee-light" />
              <p>Aucune activité récente à afficher</p>
              <p className="text-body-sm text-coffee-dark/70 mt-2">
                Les activités de la communauté apparaîtront ici
              </p>
            </div>
          ) : (
            activities.map((activity, index) => (
              <ActivityItem key={`${activity.actor_id}-${activity.ts}-${index}`} activity={activity} />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function ActivityItem({ activity }: { activity: DiscoverFeedItem }) {
  const timeAgo = formatDistanceToNow(new Date(activity.ts), { 
    addSuffix: true, 
    locale: fr 
  });

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-r from-coffee-light/5 to-coffee-medium/5 hover:from-coffee-light/10 hover:to-coffee-medium/10 transition-colors">
      {/* Avatar */}
      <div className="flex-shrink-0">
        <EnhancedAvatar
          src={activity.avatar_url ?? undefined}
          alt={activity.actor_name}
          fallbackText={activity.actor_name}
          size="sm"
          className="border border-coffee-light/20"
        />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-coffee-darker text-body-sm">
            {activity.actor_name}
          </span>
        </div>
        
        <p className="text-coffee-dark text-body-sm">
          {activity.kind === 'finished' && (
            <>a terminé la lecture de <span className="font-medium">{activity.payload_title}</span></>
          )}
          {activity.kind === 'badge' && (
            <>a débloqué le badge <Badge variant="secondary" className="inline-flex items-center text-caption bg-coffee-light/20 text-coffee-darker border-coffee-light/30">{activity.payload_title}</Badge></>
          )}
        </p>
        
        <p className="text-coffee-dark/60 text-caption mt-1">{timeAgo}</p>
      </div>

      {/* Icône livre à droite */}
      <div className="flex-shrink-0">
        {activity.kind === 'finished' && (
          <BookOpen className="h-4 w-4 text-green-600" />
        )}
        {activity.kind === 'badge' && (
          <Award className="h-4 w-4 text-yellow-500" />
        )}
      </div>
    </div>
  );
}
