import { supabase } from "@/integrations/supabase/client";

export async function requestAccountDeletion() {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError || !session?.access_token) {
    throw new Error('No valid session found');
  }

  const { data, error } = await supabase.functions.invoke('delete-account', {
    headers: {
      Authorization: `Bearer ${session.access_token}`
    }
  });

  if (error) {
    throw new Error('Deletion failed: ' + error.message);
  }

  return data;
}