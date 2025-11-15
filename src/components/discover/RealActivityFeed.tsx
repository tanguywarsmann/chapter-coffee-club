
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, BookOpen, Award, Heart } from "lucide-react";
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
        <div className="space-y-4">
          {activities.length === 0 ? (
            <div className="text-center py-12 text-coffee-dark">
              <div className="mx-auto w-20 h-20 mb-6 rounded-full bg-gradient-to-br from-coffee-light/30 to-coffee-medium/20 flex items-center justify-center">
                <Sparkles className="h-10 w-10 text-coffee-medium" />
              </div>
              <p className="text-lg font-medium text-coffee-darker mb-2">Aucune activité récente</p>
              <p className="text-body-sm text-coffee-dark/70 mb-6">
                Les activités de la communauté apparaîtront ici
              </p>
              <button className="px-6 py-2 rounded-full bg-gradient-to-r from-coffee-medium to-coffee-dark text-white hover:shadow-lg transition-all hover:scale-105">
                Découvrir des lecteurs
              </button>
            </div>
          ) : (
            activities.map((activity, index) => (
              <ActivityItem 
                key={`${activity.actor_id}-${activity.ts}-${index}`} 
                activity={activity}
                index={index}
              />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function ActivityItem({ activity, index }: { activity: DiscoverFeedItem; index: number }) {
  const timeAgo = formatDistanceToNow(new Date(activity.ts), { 
    addSuffix: true, 
    locale: fr 
  });

  if (activity.kind === 'finished') {
    return <FinishedActivityItem activity={activity} timeAgo={timeAgo} index={index} />;
  }

  return (
    <div 
      className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-r from-amber-50/50 to-yellow-50/30 border border-amber-200/40 hover:border-amber-300/60 hover:shadow-md transition-all animate-fade-in"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Avatar */}
      <div className="flex-shrink-0">
        <EnhancedAvatar
          src={activity.avatar_url ?? undefined}
          alt={activity.actor_name}
          fallbackText={activity.actor_name}
          size="md"
          className="border-2 border-amber-200/60"
        />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-coffee-darker">
            {activity.actor_name}
          </span>
        </div>
        
        <p className="text-coffee-dark">
          {activity.kind === 'badge' && (
            <>a débloqué le badge <Badge variant="secondary" className="inline-flex items-center font-medium bg-amber-100/80 text-amber-900 border-amber-300/60">{activity.payload_title}</Badge></>
          )}
        </p>
        
        <p className="text-coffee-dark/60 text-caption mt-2">{timeAgo}</p>
      </div>

      {/* Icône badge à droite - plus grande */}
      <div className="flex-shrink-0">
        <div className="p-2 rounded-xl bg-amber-100/60">
          <Award className="h-6 w-6 text-amber-600" />
        </div>
      </div>
    </div>
  );
}

function FinishedActivityItem({ activity, timeAgo, index }: { activity: DiscoverFeedItem; timeAgo: string; index: number }) {
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
    <div 
      className="activity-card relative rounded-xl bg-gradient-to-r from-brand-100/50 to-brand-50/30 border border-brand-200/40 hover:border-brand-300/60 hover:shadow-md transition-all overflow-hidden animate-fade-in" 
      {...dtHandlers}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <BookyOverlay show={showOverlay} />
      
      <div className="flex items-start gap-4 p-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <EnhancedAvatar
            src={activity.avatar_url ?? undefined}
            alt={activity.actor_name}
            fallbackText={activity.actor_name}
            size="md"
            className="border-2 border-brand-200/60"
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-coffee-darker">
              {activity.actor_name}
            </span>
          </div>
          
          <p className="text-coffee-dark mb-3">
            a terminé la lecture de <span className="font-semibold text-brand-600">{activity.payload_title}</span>
          </p>
          
          <div className="flex items-center justify-between">
            <p className="text-coffee-dark/60 text-caption">{timeAgo}</p>
            
            <button
              aria-label={liked ? "Retirer le Booky" : "Donner un Booky"}
              className="flex items-center gap-2 px-4 py-2 rounded-full border-2 border-coffee-medium/30 bg-white/80 hover:bg-coffee-light/20 hover:border-coffee-medium/50 hover:scale-105 transition-all shadow-sm"
              onClick={(e) => {
                e.stopPropagation();
                toggleBooky();
              }}
            >
              <Heart className={`h-5 w-5 transition-transform ${liked ? 'fill-current scale-110' : ''}`} style={{ color: '#AE6841' }} />
              <span className="font-medium">{count} Booky{count > 1 ? "s" : ""}</span>
            </button>
          </div>
        </div>

        {/* Icône livre à droite - plus grande */}
        <div className="flex-shrink-0">
          <div className="p-2 rounded-xl bg-brand-100/60">
            <BookOpen className="h-6 w-6 text-brand-600" />
          </div>
        </div>
      </div>
    </div>
  );
}
