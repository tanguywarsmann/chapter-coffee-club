import React, { useState } from "react";
import { 
  Flame, 
  ThumbsUp, 
  BookOpen, 
  BarChart3, 
  CheckCircle,
  AlertCircle 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { type VreadNotification } from "@/services/social/notificationsService";
import { markAsRead } from "@/services/social/notificationsService";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

interface NotificationsInboxProps {
  notifications: VreadNotification[];
  loading: boolean;
  onMarkAsRead: (id: string) => void;
}

export function NotificationsInbox({ 
  notifications, 
  loading, 
  onMarkAsRead 
}: NotificationsInboxProps) {
  const [processingRead, setProcessingRead] = useState<string | null>(null);
  const navigate = useNavigate();

  const streakNotifications = notifications.filter(n => 
    ['streak_nudge', 'streak_kept', 'streak_lost'].includes(n.type)
  );
  
  const socialNotifications = notifications.filter(n => 
    ['booky_received', 'friend_finished'].includes(n.type)
  );
  
  const digestNotifications = notifications.filter(n => 
    n.type === 'weekly_digest'
  );

  const handleMarkAsRead = async (notification: VreadNotification) => {
    if (notification.read_at || processingRead === notification.id) return;

    setProcessingRead(notification.id);
    try {
      await markAsRead(notification.id);
      onMarkAsRead(notification.id);
    } catch (error) {
      console.error("Erreur lors du marquage en lu :", error);
    } finally {
      setProcessingRead(null);
    }
  };

  const getNotificationIcon = (type: VreadNotification['type']) => {
    switch (type) {
      case 'streak_nudge':
      case 'streak_kept':
      case 'streak_lost':
        return <Flame className="h-4 w-4 text-orange-500" />;
      case 'booky_received':
        return <ThumbsUp className="h-4 w-4" style={{ color: '#AE6841' }} />;
      case 'friend_finished':
        return <BookOpen className="h-4 w-4 text-green-600" />;
      case 'weekly_digest':
        return <BarChart3 className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getNotificationMessage = (notification: VreadNotification) => {
    switch (notification.type) {
      case 'booky_received':
        return (
          <span>
            <strong>{notification.actor?.username || "Quelqu'un"}</strong> t'a donné un Booky pour{" "}
            <strong>{notification.book_title}</strong>
          </span>
        );
      case 'friend_finished':
        return (
          <span>
            <strong>{notification.actor?.username || "Quelqu'un"}</strong> a terminé{" "}
            <strong>{notification.book_title}</strong>
          </span>
        );
      case 'streak_nudge':
      case 'streak_kept':
      case 'streak_lost':
        return notification.meta?.msg || "Notification de série";
      case 'weekly_digest':
        return notification.meta?.msg || "Ton résumé hebdomadaire est prêt";
      default:
        return "Notification";
    }
  };

  const getNotificationAction = (notification: VreadNotification) => {
    switch (notification.type) {
      case 'friend_finished':
      case 'booky_received':
        return notification.book_id ? "Voir l'activité" : null;
      case 'streak_nudge':
        return "Lire maintenant";
      case 'weekly_digest':
        return "Voir les stats";
      default:
        return null;
    }
  };

  const handleNotificationAction = (notification: VreadNotification) => {
    switch (notification.type) {
      case 'friend_finished':
      case 'booky_received':
        navigate('/discover');
        break;
      case 'streak_nudge':
        navigate('/reading-list');
        break;
      case 'weekly_digest':
        navigate('/achievements');
        break;
    }
  };

  const NotificationItem = ({ notification }: { notification: VreadNotification }) => {
    const isRead = !!notification.read_at;
    const timeAgo = formatDistanceToNow(new Date(notification.created_at), { 
      addSuffix: true, 
      locale: fr 
    });
    const actionText = getNotificationAction(notification);

    return (
      <div 
        className={`p-3 border-b border-border last:border-b-0 transition-colors ${
          isRead ? 'opacity-60' : 'bg-muted/30'
        }`}
      >
        <div className="flex items-start gap-3">
          <div className="mt-1 flex-shrink-0">
            {getNotificationIcon(notification.type)}
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-sm text-foreground">
              {getNotificationMessage(notification)}
            </p>
            
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-muted-foreground">{timeAgo}</span>
              
              <div className="flex items-center gap-2">
                {actionText && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleNotificationAction(notification)}
                    className="text-xs h-7"
                  >
                    {actionText}
                  </Button>
                )}
                
                {!isRead && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleMarkAsRead(notification)}
                    disabled={processingRead === notification.id}
                    className="text-xs h-7"
                  >
                    {processingRead === notification.id ? (
                      <CheckCircle className="h-3 w-3 animate-spin" />
                    ) : (
                      <CheckCircle className="h-3 w-3" />
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.read_at).length;
  const streakUnread = streakNotifications.filter(n => !n.read_at).length;
  const socialUnread = socialNotifications.filter(n => !n.read_at).length;

  return (
    <div className="w-full">
      <div className="p-4 border-b border-border">
        <h3 className="font-medium text-foreground">Notifications</h3>
        {unreadCount > 0 && (
          <p className="text-xs text-muted-foreground mt-1">
            {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
          </p>
        )}
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3 rounded-none">
          <TabsTrigger value="all" className="text-xs relative">
            Tous
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2 h-4 w-4 p-0 text-[10px]">
                {unreadCount > 9 ? '9+' : unreadCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="streaks" className="text-xs relative">
            Séries
            {streakUnread > 0 && (
              <Badge variant="destructive" className="ml-2 h-4 w-4 p-0 text-[10px]">
                {streakUnread}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="social" className="text-xs relative">
            Social
            {socialUnread > 0 && (
              <Badge variant="destructive" className="ml-2 h-4 w-4 p-0 text-[10px]">
                {socialUnread}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="m-0">
          <ScrollArea className="h-96">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Aucune notification</p>
              </div>
            ) : (
              <div>
                {notifications.map(notification => (
                  <NotificationItem 
                    key={notification.id} 
                    notification={notification} 
                  />
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="streaks" className="m-0">
          <ScrollArea className="h-96">
            {streakNotifications.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Flame className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Aucune notification de série</p>
              </div>
            ) : (
              <div>
                {streakNotifications.map(notification => (
                  <NotificationItem 
                    key={notification.id} 
                    notification={notification} 
                  />
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="social" className="m-0">
          <ScrollArea className="h-96">
            {[...socialNotifications, ...digestNotifications].length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <ThumbsUp className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Aucune notification sociale</p>
              </div>
            ) : (
              <div>
                {[...socialNotifications, ...digestNotifications]
                  .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                  .map(notification => (
                    <NotificationItem 
                      key={notification.id} 
                      notification={notification} 
                    />
                  ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
