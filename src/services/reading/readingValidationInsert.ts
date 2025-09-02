
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { ReadingQuestion } from "@/types/reading";

type ReadingValidationRecord = Database['public']['Tables']['reading_validations']['Insert'];

export async function insertReadingValidation(
  user_id: string, 
  book_id: string,
  segment: number,
  question: ReadingQuestion | null,
  progressId: string,
  usedJoker: boolean = false
) {
  const validationRecord: ReadingValidationRecord = {
    user_id,
    book_id,
    segment,
    question_id: question?.id ?? null,
    correct: true,
    validated_at: new Date().toISOString(),
    answer: question?.answer ?? undefined,
    progress_id: progressId,
    used_joker: usedJoker
  };

  const { data: validationData, error: validationError } = await supabase
    .from('reading_validations')
    .insert(validationRecord)
    .select('id');

  if (validationError) {
    if (validationError.message.includes('violates foreign key constraint')) {
      throw new Error("Erreur de contrainte : le progress_id n'est pas valide. Contacter le support.");
    } else if (validationError.message.includes('reading_validations_segment_check')) {
      throw new Error("Erreur de validation : segment invalide");
    } else {
      throw new Error("Échec d'enregistrement de la validation: " + validationError.message);
    }
  }
  return validationData;
}
