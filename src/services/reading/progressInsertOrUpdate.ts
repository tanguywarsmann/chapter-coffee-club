
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type ReadingProgressRow = Database['public']['Tables']['reading_progress']['Row'];
type ReadingProgressInsert = Database['public']['Tables']['reading_progress']['Insert'];

function logPgError(ctx: string, err: any) {
  // Affiche code, details, hint, message si dispo
  // Ne jamais masquer l'erreur originale : ça aide à corriger RLS/policies
  // eslint-disable-next-line no-console
  console.error(`[progress] ${ctx}:`, {
    message: err?.message,
    code: err?.code,
    details: err?.details,
    hint: err?.hint,
  });
}

export async function insertReadingProgress(
  user_id: string,
  book_id: string,
  clampedPage: number,
  totalPages: number,
  newStatus: ReadingProgressRow['status']
) {
  const payload: ReadingProgressInsert = {
    user_id,
    book_id,
    current_page: clampedPage,
    total_pages: totalPages,
    status: newStatus ?? "in_progress",
    started_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("reading_progress")
    .insert(payload)
    .select("id, current_page, status")
    .maybeSingle();

  if (error) {
    logPgError("insert", error);
    if (error.message.includes('duplicate key') || error.code === '23505') {
      const { data: conflictData, error: conflictError } = await supabase
        .from("reading_progress")
        .select("id, current_page, status")
        .eq("user_id", user_id)
        .eq("book_id", book_id)
        .maybeSingle();
      if (conflictError || !conflictData) {
        logPgError("conflict resolution", conflictError);
        throw new Error("Échec de création de la progression de lecture");
      }
      return conflictData;
    }
    throw new Error("Échec de création de la progression");
  }
  if (!data?.id) {
    throw new Error("ID progression manquant après insertion");
  }
  return data;
}

export async function updateReadingProgress(
  progressId: string,
  user_id: string,
  clampedPage: number,
  newStatus: ReadingProgressRow['status']
) {
  const updateData = {
    current_page: clampedPage,
    status: newStatus ?? "in_progress",
    updated_at: new Date().toISOString(),
  };

  // Filtre supplémentaire par user_id pour éviter toute collision de RLS
  const { data, error } = await supabase
    .from("reading_progress")
    .update(updateData)
    .eq("id", progressId)
    .eq("user_id", user_id)
    .select("id, current_page, status")
    .maybeSingle();

  if (error) {
    logPgError("update", error);
    throw new Error("Échec de mise à jour de la progression");
  }
  if (!data?.id) {
    // Fallback: si la ligne n'est pas visible, on tente un refetch
    const { data: refetch, error: refetchErr } = await supabase
      .from("reading_progress")
      .select("id, user_id, book_id, current_page, status")
      .eq("id", progressId)
      .maybeSingle();

    if (refetchErr) {
      logPgError("refetch after empty update", refetchErr);
      throw new Error("Progression introuvable après update");
    }

    if (!refetch) {
      // Dernier filet de sécurité: la progression n'existe pas sous RLS
      throw new Error("Progression absente: impossible de faire un upsert sans book_id/total_pages");
    }
    return { id: refetch.id, current_page: clampedPage, status: newStatus ?? "in_progress" } as Pick<ReadingProgressRow,"id"|"current_page"|"status">;
  }

  return data;
}
