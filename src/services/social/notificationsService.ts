import { supabase } from "@/integrations/supabase/client";

export type SocialNotification = {
  id: string;
  recipient_id: string;
  actor_id: string;
  type: "friend_finished" | "laurier_received";
  progress_id?: string | null;
  book_id?: string | null;
  book_title?: string | null;
  created_at: string;
  read_at?: string | null;
  actor?: { id: string; username: string; avatar_url: string | null };
};

export async function getNotifications(): Promise<SocialNotification[]> {
  const { data, error } = await supabase
    .from("notifications")
    .select("*, actor:actor_id(id, username, avatar_url)")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  return data as any;
}

export async function markAsRead(id: string) {
  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export async function subscribeToNotifications(onNew: (n: SocialNotification)=>void) {
  const { data: session } = await supabase.auth.getSession();
  const uid = session?.session?.user?.id;
  if (!uid) return { unsubscribe: () => {} };

  const channel = supabase.channel("notif-"+uid)
    .on("postgres_changes", {
      event: "INSERT", schema: "public", table: "notifications",
      filter: `recipient_id=eq.${uid}`
    }, (payload) => onNew(payload.new as SocialNotification))
    .subscribe();

  return { unsubscribe: () => supabase.removeChannel(channel) };
}