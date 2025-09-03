
import { toast } from "sonner";
import { ValidateReadingRequest, ValidateReadingResponse } from "@/types/reading";
import { getQuestionForBookSegment } from "../questionService";
import { checkUserSession } from "./validationSessionUtils";
import { checkDefensiveProgress } from "./progressDefensiveCheck";
import { insertReadingProgress, updateReadingProgress } from "./progressInsertOrUpdate";
import { insertReadingValidation } from "./readingValidationInsert";
import { handleBadgeAndQuestWorkflow } from "./badgeAndQuestWorkflow";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { mutate } from 'swr';
import { PAGES_PER_SEGMENT } from "@/utils/constants";

type ReadingProgressStatus = Database['public']['Enums']['reading_status'];

/**
 * Calcule le nombre de jokers autorisés selon le nombre de segments
 */
function calculateJokersAllowed(expectedSegments: number): number {
  return Math.floor(expectedSegments / 10) + 1;
}

/**
 * Compte le nombre de jokers déjà utilisés pour une lecture
 */
async function getUsedJokersCount(progressId: string): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('reading_validations')
      .select('id')
      .eq('progress_id', progressId)
      .eq('used_joker', true);
    if (error) return 0;
    return data?.length || 0;
  } catch {
    return 0;
  }
}

async function getSegmentsRead(progressId: string): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('reading_validations')
      .select('segment')
      .eq('progress_id', progressId);
    if (error) return 0;
    return data?.length || 0;
  } catch {
    return 0;
  }
}

/**
 * Valide un segment de lecture
 */
export const validateReading = async (
  request: ValidateReadingRequest
): Promise<ValidateReadingResponse & { newBadges?: any[] }> => {
  try {
    await checkUserSession(request.user_id);

    // Defensive check for progress record
    const currentProgress = await checkDefensiveProgress(request.user_id, request.book_id);
    let progressId = currentProgress?.id;

    // Get book info
    const { data: bookData, error: bookError } = await supabase
      .from('books')
      .select('total_pages, total_chapters, expected_segments, slug')
      .eq('id', request.book_id)
      .maybeSingle();
    if (bookError || !bookData) throw new Error("❌ Impossible de récupérer les informations du livre");
    const totalPages = bookData.total_pages || 0;

    // Fixed page calculation
    const calculatedPage = (request.segment + 1) * PAGES_PER_SEGMENT;
    const newCurrentPage = Math.min(calculatedPage, totalPages);
    const updatedCurrentPage = Math.max(newCurrentPage, currentProgress?.current_page || 0);
    const clampedPage = Math.min(updatedCurrentPage, totalPages);

    const newStatus: ReadingProgressStatus = clampedPage >= totalPages ? 'completed' : 'in_progress';

    // Insert new progress if needed
    let progressRow = currentProgress;
    if (!progressId) {
      progressRow = await insertReadingProgress(
        request.user_id, request.book_id, clampedPage, totalPages, newStatus
      );
      progressId = progressRow.id;
    } else {
      if (request.segment <= (await getSegmentsRead(progressId))) {
        return {
          message: "Segment déjà validé",
          current_page: currentProgress.current_page || 0,
          already_validated: true,
          next_segment_question: null
        };
      }
      progressRow = await updateReadingProgress(progressId, clampedPage, newStatus);
    }

    // Get question for segment using book slug
    const question = await getQuestionForBookSegment(bookData.slug || request.book_id, request.segment);

    // The correct answer and joker logic are now handled by the calling code
    // We accept the used_joker parameter directly
    const correct = request.correct !== undefined ? request.correct : true;
    const used_joker = request.used_joker || false;

    // Insert reading validation
    await insertReadingValidation(
      request.user_id,
      request.book_id,
      request.segment,
      question,
      progressId,
      used_joker
    );

    // Badge/XP/Quest workflow and cache invalidation
    const newBadges = await handleBadgeAndQuestWorkflow(
      request,
      progressId,
      clampedPage,
      request.segment + 1,
      request.book_id,
      request.user_id,
      question
    );

    // Updated progress
    // No longer: await clearProgressCache(request.user_id); (done in workflow)
    return {
      message: "Segment validé avec succès",
      current_page: clampedPage,
      already_validated: false,
      next_segment_question: null, // filled by getQuestionForBookSegment if needed
      newBadges,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
    toast.error(`Échec de la validation: ${errorMessage}`);
    throw new Error(errorMessage);
  }
};
