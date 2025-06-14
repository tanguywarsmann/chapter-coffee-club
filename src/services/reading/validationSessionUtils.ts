
import { supabase } from "@/integrations/supabase/client";

export async function checkUserSession(user_id: string) {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) {
    throw sessionError;
  }
  if (!sessionData?.session) {
    throw new Error("❌ Utilisateur non authentifié lors de la validation");
  }
  return true;
}
