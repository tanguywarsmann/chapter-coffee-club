import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell } from "lucide-react";
import { toast } from "sonner";
import { 
  askNotifPermission, 
  scheduleDailyReadingReminder, 
  cancelDailyReminder, 
  checkNotificationEnabled 
} from "@/native/notifications";

export function NotificationSettings() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState("20:00");
  const [isNative, setIsNative] = useState(false);

  useEffect(() => {
    // Check if we're in a Capacitor app
    const isCapacitor = !!(window as any).Capacitor;
    setIsNative(isCapacitor);

    if (isCapacitor) {
      checkNotificationEnabled().then(setNotificationsEnabled);
    }

    // Load saved preference
    const savedTime = localStorage.getItem('reminder-time');
    if (savedTime) {
      setReminderTime(savedTime);
    }
  }, []);

  const handleToggleNotifications = async (enabled: boolean) => {
    if (!isNative) {
      toast.error("Les notifications ne sont disponibles que dans l'application mobile");
      return;
    }

    try {
      if (enabled) {
        await askNotifPermission();
        const [hour, minute] = reminderTime.split(':').map(Number);
        await scheduleDailyReadingReminder(hour, minute);
        toast.success("Rappels de lecture activés");
      } else {
        await cancelDailyReminder();
        toast.success("Rappels de lecture désactivés");
      }
      setNotificationsEnabled(enabled);
    } catch (error) {
      toast.error("Erreur lors de la configuration des notifications");
      console.error("Notification error:", error);
    }
  };

  const handleTimeChange = async (newTime: string) => {
    setReminderTime(newTime);
    localStorage.setItem('reminder-time', newTime);

    if (notificationsEnabled && isNative) {
      try {
        // Cancel existing reminder and schedule new one
        await cancelDailyReminder();
        const [hour, minute] = newTime.split(':').map(Number);
        await scheduleDailyReadingReminder(hour, minute);
        toast.success("Heure du rappel mise à jour");
      } catch (error) {
        toast.error("Erreur lors de la mise à jour du rappel");
        console.error("Time update error:", error);
      }
    }
  };

  if (!isNative) {
    return (
      <Card className="border-coffee-light">
        <CardHeader>
          <CardTitle className="text-xl font-serif text-coffee-darker flex items-center gap-2">
            <Bell className="h-5 w-5 text-coffee-dark" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-coffee-darker/80">
            Les notifications de rappel sont disponibles uniquement dans l'application mobile VREAD.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-coffee-light">
      <CardHeader>
        <CardTitle className="text-xl font-serif text-coffee-darker flex items-center gap-2">
          <Bell className="h-5 w-5 text-coffee-dark" />
          Rappels de lecture
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="notifications-toggle" className="text-coffee-darker font-medium">
              Rappel quotidien
            </Label>
            <p className="text-sm text-coffee-darker/80">
              Recevez un rappel pour votre session de lecture
            </p>
          </div>
          <Switch
            id="notifications-toggle"
            checked={notificationsEnabled}
            onCheckedChange={handleToggleNotifications}
          />
        </div>

        {notificationsEnabled && (
          <div className="space-y-2">
            <Label htmlFor="reminder-time" className="text-coffee-darker font-medium">
              Heure du rappel
            </Label>
            <Select value={reminderTime} onValueChange={handleTimeChange}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="18:00">18h00</SelectItem>
                <SelectItem value="19:00">19h00</SelectItem>
                <SelectItem value="20:00">20h00</SelectItem>
                <SelectItem value="21:00">21h00</SelectItem>
                <SelectItem value="22:00">22h00</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </CardContent>
    </Card>
  );
}