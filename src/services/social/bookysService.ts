import { supabase } from "@/integrations/supabase/client";

export async function giveBooky(progressId: string) {
  const { data: session } = await supabase.auth.getSession();
  const uid = session?.session?.user?.id;
  if (!uid) throw new Error("Not authenticated");
  const { error } = await supabase.from("activity_likes").insert({ progress_id: progressId, liker_id: uid });
  if (error && error.code !== "23505") throw error;
}

export async function removeBooky(progressId: string) {
  const { data: session } = await supabase.auth.getSession();
  const uid = session?.session?.user?.id;
  if (!uid) throw new Error("Not authenticated");
  const { error } = await supabase
    .from("activity_likes")
    .delete()
    .eq("progress_id", progressId)
    .eq("liker_id", uid);
  if (error) throw error;
}