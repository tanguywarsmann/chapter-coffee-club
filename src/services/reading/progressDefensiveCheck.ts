
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type ReadingProgressRecord = Database['public']['Tables']['reading_progress']['Insert'];

export async function checkDefensiveProgress(user_id: string, book_id: string) {
  const { data: existingProgresses, error: checkError } = await supabase
    .from("reading_progress")
    .select("id, current_page, status")
    .eq("user_id", user_id)
    .eq("book_id", book_id);

  if (checkError) {
    throw new Error("Erreur lors de la vérification des progressions");
  }

  if (existingProgresses && existingProgresses.length > 1) {
    throw new Error("Anomalie: Plusieurs progressions détectées pour le même livre");
  }
  return existingProgresses?.[0] || null;
}
