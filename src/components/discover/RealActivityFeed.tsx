
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, BookOpen, Award, ThumbsUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { DiscoverFeedItem } from "@/services/user/realDiscoverService";
import { EnhancedAvatar } from "@/components/ui/avatar";
import { useState, useCallback } from "react";
import { useDoubleTap } from "@/hooks/useDoubleTap";
import { BookyOverlay } from "./BookyOverlay";
import { giveBooky, removeBooky } from "@/services/social/bookysService";

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

  if (activity.kind === 'finished') {
    return <FinishedActivityItem activity={activity} timeAgo={timeAgo} />;
  }

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
          {activity.kind === 'badge' && (
            <>a débloqué le badge <Badge variant="secondary" className="inline-flex items-center text-caption bg-coffee-light/20 text-coffee-darker border-coffee-light/30">{activity.payload_title}</Badge></>
          )}
        </p>
        
        <p className="text-coffee-dark/60 text-caption mt-1">{timeAgo}</p>
      </div>

      {/* Icône badge à droite */}
      <div className="flex-shrink-0">
        <Award className="h-4 w-4 text-yellow-500" />
      </div>
    </div>
  );
}

function FinishedActivityItem({ activity, timeAgo }: { activity: DiscoverFeedItem; timeAgo: string }) {
  const [liked, setLiked] = useState<boolean>(!!activity.liked_by_me);
  const [count, setCount] = useState<number>(activity.likes_count ?? 0);
  const [showOverlay, setShowOverlay] = useState(false);

  const toggleBooky = useCallback(async () => {
    if (!activity.activity_id) return;

    setShowOverlay(true);
    setTimeout(() => setShowOverlay(false), 600);

    setCount((prev) => (liked ? prev - 1 : prev + 1));
    const prevLiked = liked;
    setLiked(!liked);

    try {
      if (prevLiked) await removeBooky(activity.activity_id as string);
      else await giveBooky(activity.activity_id as string);
    } catch (e) {
      setLiked(prevLiked);
      setCount(activity.likes_count ?? 0);
      setShowOverlay(false);
      console.error(e);
    }
  }, [liked, count, activity.activity_id]);

  const dtHandlers = useDoubleTap(toggleBooky);

  return (
    <div className="relative rounded-lg bg-gradient-to-r from-coffee-light/5 to-coffee-medium/5 hover:from-coffee-light/10 hover:to-coffee-medium/10 transition-colors overflow-hidden" {...dtHandlers}>
      <BookyOverlay show={showOverlay} />
      
      <div className="flex items-start gap-3 p-3">
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
          
          <p className="text-coffee-dark text-body-sm mb-2">
            a terminé la lecture de <span className="font-medium">{activity.payload_title}</span>
          </p>
          
          <div className="flex items-center justify-between">
            <p className="text-coffee-dark/60 text-caption">{timeAgo}</p>
            
            <button
              aria-label={liked ? "Retirer le Booky" : "Donner un Booky"}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border bg-card hover:bg-accent transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                toggleBooky();
              }}
            >
              <ThumbsUp className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} style={{ color: '#AE6841' }} />
              <span>{count} Booky{count > 1 ? "s" : ""}</span>
            </button>
          </div>
        </div>

        {/* Icône livre à droite */}
        <div className="flex-shrink-0">
          <BookOpen className="h-4 w-4 text-green-600" />
        </div>
      </div>
    </div>
  );
}
