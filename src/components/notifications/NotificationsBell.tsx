import React, { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  getNotifications, 
  subscribeToNotifications, 
  type VreadNotification 
} from "@/services/social/notificationsService";
import { NotificationsInbox } from "./NotificationsInbox";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";

export function NotificationsBell() {
  const [notifications, setNotifications] = useState<VreadNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Load notifications
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const data = await getNotifications();
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.read_at).length);
      } catch (error) {
        console.error("Error loading notifications:", error);
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, []);

  // Subscribe to real-time notifications
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    
    const setupSubscription = () => {
      const subscription = subscribeToNotifications((newNotification) => {
        setNotifications(prev => [newNotification, ...prev]);
        setUnreadCount(prev => prev + 1);

        // Show toast for new notification
        const getNotificationMessage = (notif: VreadNotification) => {
          switch (notif.type) {
            case "laurier_received":
              return `${notif.actor?.username || "Quelqu'un"} t'a donné un Laurier pour ${notif.book_title}`;
            case "friend_finished":
              return `${notif.actor?.username || "Quelqu'un"} a terminé ${notif.book_title}`;
            case "streak_nudge":
              return notif.meta?.msg || "Tu n'as pas validé aujourd'hui. Garde ta série.";
            case "streak_kept":
              return notif.meta?.msg || "Série maintenue. Continue.";
            case "streak_lost":
              return notif.meta?.msg || "Série interrompue. On relance ce soir.";
            case "weekly_digest":
              return notif.meta?.msg || "Ton résumé hebdomadaire est prêt";
            default:
              return "Nouvelle notification";
          }
        };

        toast({
          title: "📢 Notification",
          description: getNotificationMessage(newNotification),
        });
      });
      
      unsubscribe = subscription.unsubscribe;
    };

    setupSubscription();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [toast]);

  const handleMarkAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, read_at: new Date().toISOString() } : n
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative"
          aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} non lues)` : ''}`}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent 
        className="w-96 p-0" 
        align="end"
        sideOffset={8}
      >
        <NotificationsInbox 
          notifications={notifications}
          loading={loading}
          onMarkAsRead={handleMarkAsRead}
        />
      </PopoverContent>
    </Popover>
  );
}