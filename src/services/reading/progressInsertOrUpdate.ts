
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type ReadingProgressRecord = Database['public']['Tables']['reading_progress']['Insert'] & { id?: string };

export async function insertReadingProgress(user_id: string, book_id: string, clampedPage: number, totalPages: number, newStatus: string) {
  const newProgressData: ReadingProgressRecord = {
    user_id,
    book_id,
    current_page: clampedPage,
    total_pages: totalPages,
    status: newStatus as any,
    started_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  const { data: newProgress, error: insertError } = await supabase
    .from('reading_progress')
    .insert(newProgressData)
    .select('id, current_page, status')
    .maybeSingle();

  if (insertError) {
    if (insertError.message.includes('duplicate key') || insertError.code === '23505') {
      const { data: conflictData, error: conflictError } = await supabase
        .from("reading_progress")
        .select("id, current_page, status")
        .eq("user_id", user_id)
        .eq("book_id", book_id)
        .maybeSingle();
      if (conflictError || !conflictData) {
        throw new Error("Échec de création de la progression de lecture");
      }
      return conflictData;
    }
    throw new Error("Échec de création de la progression de lecture");
  } else if (!newProgress || !newProgress.id) {
    throw new Error("❌ ID de progression non récupéré après insertion");
  }
  return newProgress;
}

export async function updateReadingProgress(progressId: string, clampedPage: number, newStatus: string) {
  const updateData = {
    current_page: clampedPage,
    status: newStatus as "to_read" | "in_progress" | "completed",
    updated_at: new Date().toISOString()
  };
  const { data: updatedProgress, error: progressError } = await supabase
    .from('reading_progress')
    .update(updateData)
    .eq('id', progressId)
    .select('id, current_page, status')
    .maybeSingle();

  if (progressError) {
    throw new Error("Échec de mise à jour de la progression");
  }
  if (!updatedProgress || !updatedProgress.id) {
    throw new Error("❌ ID de progression non récupéré après mise à jour");
  }
  return updatedProgress;
}
