import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

type UserSettings = {
  enable_streak: boolean;
  enable_social: boolean;
  enable_digest: boolean;
  nudge_hour: number;
  quiet_start: number;
  quiet_end: number;
  daily_push_cap: number;
};

export function EmailNotificationSettings() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<UserSettings>({
    enable_streak: true,
    enable_social: true,
    enable_digest: true,
    nudge_hour: 20,
    quiet_start: 22,
    quiet_end: 8,
    daily_push_cap: 3,
  });

  useEffect(() => {
    loadSettings();
  }, [user]);

  const loadSettings = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;
      if (data) setSettings(data);
    } catch (error) {
      console.error("Error loading settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key: keyof UserSettings, value: boolean | number) => {
    if (!user) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from("user_settings")
        .update({ [key]: value })
        .eq("user_id", user.id);

      if (error) throw error;
      
      setSettings(prev => ({ ...prev, [key]: value }));
      toast.success("Préférences enregistrées");
    } catch (error) {
      console.error("Error updating settings:", error);
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Notifications par email</CardTitle>
          <CardDescription>
            Configure les rappels et notifications que tu souhaites recevoir
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Streak notifications */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="enable_streak">Rappels de série</Label>
              <p className="text-sm text-muted-foreground">
                Reçois un rappel quotidien pour maintenir ta série
              </p>
            </div>
            <Switch
              id="enable_streak"
              checked={settings.enable_streak}
              onCheckedChange={(checked) => updateSetting("enable_streak", checked)}
              disabled={saving}
            />
          </div>

          {settings.enable_streak && (
            <div className="ml-6 space-y-4 border-l-2 border-border pl-4">
              <div className="space-y-2">
                <Label htmlFor="nudge_hour">Heure du rappel</Label>
                <Select
                  value={settings.nudge_hour.toString()}
                  onValueChange={(value) => updateSetting("nudge_hour", parseInt(value))}
                  disabled={saving}
                >
                  <SelectTrigger id="nudge_hour">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }, (_, i) => (
                      <SelectItem key={i} value={i.toString()}>
                        {i}:00
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Heures silencieuses</Label>
                <div className="flex items-center gap-2">
                  <Select
                    value={settings.quiet_start.toString()}
                    onValueChange={(value) => updateSetting("quiet_start", parseInt(value))}
                    disabled={saving}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 24 }, (_, i) => (
                        <SelectItem key={i} value={i.toString()}>
                          {i}:00
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span className="text-sm text-muted-foreground">à</span>
                  <Select
                    value={settings.quiet_end.toString()}
                    onValueChange={(value) => updateSetting("quiet_end", parseInt(value))}
                    disabled={saving}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 24 }, (_, i) => (
                        <SelectItem key={i} value={i.toString()}>
                          {i}:00
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <p className="text-xs text-muted-foreground">
                  Aucune notification durant cette période
                </p>
              </div>
            </div>
          )}

          {/* Social notifications */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="enable_social">Notifications sociales</Label>
              <p className="text-sm text-muted-foreground">
                Bookys reçus, amis qui terminent un livre
              </p>
            </div>
            <Switch
              id="enable_social"
              checked={settings.enable_social}
              onCheckedChange={(checked) => updateSetting("enable_social", checked)}
              disabled={saving}
            />
          </div>

          {/* Weekly digest */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="enable_digest">Bilan hebdomadaire</Label>
              <p className="text-sm text-muted-foreground">
                Reçois un résumé de ta semaine chaque lundi
              </p>
            </div>
            <Switch
              id="enable_digest"
              checked={settings.enable_digest}
              onCheckedChange={(checked) => updateSetting("enable_digest", checked)}
              disabled={saving}
            />
          </div>

          {/* Daily cap */}
          <div className="space-y-2">
            <Label htmlFor="daily_push_cap">Limite quotidienne</Label>
            <Select
              value={settings.daily_push_cap.toString()}
              onValueChange={(value) => updateSetting("daily_push_cap", parseInt(value))}
              disabled={saving}
            >
              <SelectTrigger id="daily_push_cap">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 notification par jour</SelectItem>
                <SelectItem value="3">3 notifications par jour</SelectItem>
                <SelectItem value="5">5 notifications par jour</SelectItem>
                <SelectItem value="10">10 notifications par jour</SelectItem>
                <SelectItem value="999">Illimité</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Nombre maximum de notifications par jour
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
