import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ActivityFeedItem } from "@/services/discoverService";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { BookOpen, Award, Play } from "lucide-react";

interface ActivityCardProps {
  item: ActivityFeedItem;
}

export function ActivityCard({ item }: ActivityCardProps) {
  const getIcon = () => {
    switch (item.kind) {
      case 'finished':
        return <BookOpen className="h-4 w-4 text-green-600" />;
      case 'badge':
        return <Award className="h-4 w-4 text-yellow-600" />;
      case 'started':
        return <Play className="h-4 w-4 text-blue-600" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  const getAction = () => {
    switch (item.kind) {
      case 'finished':
        return 'a terminé';
      case 'badge':
        return 'a débloqué le badge';
      case 'started':
        return 'a commencé';
      default:
        return 'action';
    }
  };

  const getBorderColor = () => {
    switch (item.kind) {
      case 'finished':
        return 'border-l-green-500 bg-green-50';
      case 'badge':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'started':
        return 'border-l-blue-500 bg-blue-50';
      default:
        return 'border-l-gray-300 bg-gray-50';
    }
  };

  const timeAgo = formatDistanceToNow(new Date(item.posted_at), {
    addSuffix: true,
    locale: fr,
  });

  return (
    <Card className={`border-l-4 p-4 ${getBorderColor()}`}>
      <div className="flex items-start gap-3">
        <Avatar className="h-12 w-12">
          <AvatarImage src={item.actor_avatar} alt={item.actor_name} />
          <AvatarFallback className="bg-coffee-medium text-coffee-lightest">
            {item.actor_name?.charAt(0).toUpperCase() || '?'}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {getIcon()}
            <p className="text-sm text-coffee-darker">
              <span className="font-semibold">{item.actor_name}</span>
              {' '}
              <span className="text-coffee-dark">{getAction()}</span>
              {' '}
              <span className="font-medium">"{item.payload_title}"</span>
            </p>
          </div>
          
          <p className="text-xs text-coffee-medium">{timeAgo}</p>
        </div>
      </div>
    </Card>
  );
}