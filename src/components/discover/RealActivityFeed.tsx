
import { Sparkles, BookOpen, Heart, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { DiscoverFeedItem } from "@/services/user/realDiscoverService";
import { EnhancedAvatar } from "@/components/ui/avatar";
import { useState, useCallback } from "react";
import { useDoubleTap } from "@/hooks/useDoubleTap";
import { BookyOverlay } from "./BookyOverlay";
import { giveBooky, removeBooky } from "@/services/social/bookysService";
import { cn } from "@/lib/utils";

interface RealActivityFeedProps {
  activities: DiscoverFeedItem[];
  loading?: boolean;
}

export function RealActivityFeed({ activities, loading }: RealActivityFeedProps) {
  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex gap-4 p-4 animate-pulse">
             <div className="h-12 w-12 rounded-full bg-muted/50" />
             <div className="space-y-2 flex-1">
                <div className="h-4 w-1/3 bg-muted/50 rounded" />
                <div className="h-16 w-full bg-muted/30 rounded" />
             </div>
          </div>
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center border rounded-2xl border-dashed border-muted-foreground/20">
        <div className="p-3 bg-muted/30 rounded-full mb-4">
            <Sparkles className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-lg font-serif font-medium text-foreground mb-1">Aucune activité récente</p>
        <p className="text-sm text-muted-foreground max-w-xs">
          Les activités de la communauté apparaîtront ici dès qu'il y aura du mouvement.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-0 divide-y divide-border/40">
      {activities.map((activity, index) => (
        <ActivityItem 
          key={`${activity.actor_id}-${activity.ts}-${index}`} 
          activity={activity}
          index={index}
        />
      ))}
    </div>
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
      className="group flex gap-4 py-6 px-2 sm:px-4 transition-all duration-300 hover:bg-muted/20 rounded-xl"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex-shrink-0 pt-1">
        <EnhancedAvatar
          src={activity.avatar_url ?? undefined}
          alt={activity.actor_name}
          fallbackText={activity.actor_name}
          size="md"
          className="border border-border/50 shadow-sm"
        />
      </div>
      
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <span className="font-medium text-foreground text-base">
            {activity.actor_name}
          </span>
          <span className="text-xs text-muted-foreground whitespace-nowrap flex items-center gap-1">
            {timeAgo}
          </span>
        </div>
        
        <div className="text-muted-foreground text-sm leading-relaxed">
          {activity.kind === 'badge' && (
            <span className="inline-flex items-baseline gap-1.5">
               a débloqué le badge 
               <Badge variant="outline" className="font-medium text-xs py-0.5 bg-amber-50/50 text-amber-800 border-amber-200/60">
                 {activity.payload_title}
               </Badge>
            </span>
          )}
          {activity.kind === 'joined' && (
             <span>a rejoint le club !</span>
          )}
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
      className="group relative flex gap-4 py-6 px-2 sm:px-4 transition-all duration-300 hover:bg-muted/20 rounded-xl"
      {...dtHandlers}
    >
      <BookyOverlay show={showOverlay} />
      
      <div className="flex-shrink-0 pt-1">
        <EnhancedAvatar
          src={activity.avatar_url ?? undefined}
          alt={activity.actor_name}
          fallbackText={activity.actor_name}
          size="md"
          className="border border-border/50 shadow-sm"
        />
      </div>
      
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <span className="font-medium text-foreground text-base">
            {activity.actor_name}
          </span>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {timeAgo}
          </span>
        </div>
        
        <div className="text-foreground/80 text-sm">
          a terminé <span className="font-serif font-medium text-foreground italic">{activity.payload_title}</span>
        </div>
        
        <div className="pt-1 flex items-center">
            <button
              aria-label={liked ? "Retirer le Booky" : "Donner un Booky"}
              className={cn(
                "group/btn flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                liked 
                  ? "bg-rose-50 text-rose-600" 
                  : "bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
              onClick={(e) => {
                e.stopPropagation();
                toggleBooky();
              }}
            >
              <Heart 
                className={cn(
                  "h-4 w-4 transition-all", 
                  liked ? "fill-current scale-110" : "group-hover/btn:scale-110"
                )} 
              />
              <span>{count > 0 ? count : "J'aime"}</span>
            </button>
        </div>
      </div>
    </div>
  );
}
