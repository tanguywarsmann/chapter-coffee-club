
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Book, Award, Clock } from "lucide-react";

interface ActivityFeedItemProps {
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  activity: {
    type: 'book_completed' | 'badge_earned' | 'reading_session' | 'streak_milestone';
    content: string;
    details?: string;
    timestamp: string;
    badge?: {
      name: string;
      icon: string;
      rarity: 'common' | 'rare' | 'epic' | 'legendary';
    };
  };
}

export function ActivityFeedItem({ user, activity }: ActivityFeedItemProps) {
  const getActivityIcon = () => {
    switch (activity.type) {
      case 'book_completed':
        return <Book className="h-4 w-4 text-coffee-dark" />;
      case 'badge_earned':
        return <Award className="h-4 w-4 text-coffee-darker" />;
      case 'reading_session':
        return <Clock className="h-4 w-4 text-coffee-medium" />;
      case 'streak_milestone':
        return <span className="text-sm">🔥</span>;
      default:
        return <Book className="h-4 w-4 text-coffee-medium" />;
    }
  };

  const getBadgeColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return 'bg-coffee-darker/10 text-coffee-darker border-coffee-darker/30';
      case 'epic':
        return 'bg-coffee-dark/10 text-coffee-dark border-coffee-dark/30';
      case 'rare':
        return 'bg-coffee-medium/10 text-coffee-medium border-coffee-medium/30';
      default:
        return 'bg-coffee-light/20 text-coffee-darker border-coffee-light/40';
    }
  };

  const getRelativeTime = (timestamp: string) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - activityTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `il y a ${diffInMinutes}min`;
    } else if (diffInMinutes < 1440) {
      return `il y a ${Math.floor(diffInMinutes / 60)}h`;
    } else {
      return `il y a ${Math.floor(diffInMinutes / 1440)}j`;
    }
  };

  return (
    <Card className="border-coffee-light/50 bg-white/80 backdrop-blur-sm hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <Avatar className="h-10 w-10 border border-coffee-light">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="bg-coffee-medium text-white text-sm">
              {user.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              {getActivityIcon()}
              <span className="font-medium text-coffee-darker text-sm">{user.name}</span>
              <span className="text-coffee-medium text-xs">{getRelativeTime(activity.timestamp)}</span>
            </div>
            
            <p className="text-coffee-dark text-sm mb-2 leading-relaxed">
              {activity.content}
            </p>
            
            {activity.details && (
              <p className="text-coffee-medium text-xs mb-2 italic">
                {activity.details}
              </p>
            )}
            
            {activity.badge && (
              <Badge className={`text-xs ${getBadgeColor(activity.badge.rarity)}`}>
                {activity.badge.icon} {activity.badge.name}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
