
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ReadingValidation, ValidateReadingRequest, ValidateReadingResponse } from "@/types/reading";
import { getBookById } from "@/services/books/bookQueries";
import { getQuestionForBookSegment, isSegmentAlreadyValidated } from "../questionService";
import { recordReadingActivity } from "../streakService";
import { getBookReadingProgress } from "./progressService";
import { Badge } from "@/types/badge";
import { checkBadgesForUser } from "@/services/user/streakBadgeService";
import { checkUserQuests } from "@/services/questService";
import { addXP } from "@/services/user/levelService";
import { checkAndGrantMonthlyReward } from "@/services/monthlyRewardService";
import { Database } from "@/integrations/supabase/types";
import { clearProgressCache } from "@/services/reading/progressService";

type ReadingValidationRecord = Database['public']['Tables']['reading_validations']['Insert'];

/**
 * Valide un segment de lecture
 * @param request Requête de validation
 * @returns Réponse de validation avec potentiellement des badges
 */
export const validateReading = async (
  request: ValidateReadingRequest
): Promise<ValidateReadingResponse & { newBadges?: Badge[] }> => {
  try {
    console.log('🔍 Début de validateReading pour segment:', request.segment);

    const alreadyValidated = await isSegmentAlreadyValidated(
      request.user_id,
      request.book_id,
      request.segment
    );

    if (alreadyValidated) {
      console.log('📝 Segment already validated, refreshing progress data', request);
      await clearProgressCache(request.user_id);

      return {
        message: "Segment déjà validé",
        current_page: request.segment * 30,
        already_validated: true,
        next_segment_question: null
      };
    }

    const book = await getBookById(request.book_id);
    if (!book) throw new Error("Livre non trouvé");

    const question = await getQuestionForBookSegment(request.book_id, request.segment);
    console.log("📚 Question récupérée :", question);

    let progress = await getBookReadingProgress(request.user_id, request.book_id);
    if (!progress) {
      const { initializeNewBookReading } = await import("./syncService");
      try {
        progress = await initializeNewBookReading(request.user_id, request.book_id);
        console.log("[INIT] Résultat initializeNewBookReading :", progress);
      } catch (e) {
        console.error("[INIT] Échec initializeNewBookReading :", e);
      }

      if (!progress) {
        throw new Error("❌ Impossible d'initialiser la progression de lecture (aucune ligne créée)");
      }
    }

    const newCurrentPage = request.segment * 30;
    const newStatus = newCurrentPage >= book.pages ? 'completed' : 'in_progress';

    console.log('📊 Updating reading progress:', {
      user_id: request.user_id,
      book_id: request.book_id,
      current_page: newCurrentPage,
      status: newStatus,
      progress_id: progress.id
    });

    const { error: progressError } = await supabase
      .from('reading_progress')
      .update({
        current_page: newCurrentPage,
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', request.user_id)
      .eq('book_id', request.book_id);

    if (progressError) {
      console.error('Error updating reading progress:', progressError);
      throw progressError;
    }

    const validationRecord: ReadingValidationRecord = {
      user_id: request.user_id,
      book_id: request.book_id,
      segment: request.segment,
      question_id: question?.id ?? null,
      correct: true,
      validated_at: new Date().toISOString(),
      answer: question?.answer ?? undefined,
      progress_id: progress?.id ?? undefined
    };

    console.log("🧾 Enregistrement validation :", validationRecord);

    const { error: validationError } = await supabase
      .from('reading_validations')
      .insert(validationRecord);

    if (validationError) {
      console.error('Error inserting validation record:', validationError);
      throw validationError;
    }

    await clearProgressCache(request.user_id);
    console.log(`✅ Cache vidé pour l'utilisateur ${request.user_id} après validation d'un segment`);

    await recordReadingActivity(request.user_id);
    await addXP(request.user_id, 10);

    const nextSegment = request.segment + 1;
    const nextQuestion = await getQuestionForBookSegment(request.book_id, nextSegment);

    const newBadges = await checkBadgesForUser(request.user_id, true);

    setTimeout(async () => {
      try {
        await checkUserQuests(request.user_id);
      } catch (error) {
        console.error("Erreur lors de la vérification des quêtes:", error);
      }
    }, 0);

    setTimeout(async () => {
      try {
        const monthlyReward = await checkAndGrantMonthlyReward(request.user_id);
        if (monthlyReward) {
          console.log("Récompense mensuelle obtenue :", monthlyReward);
        }
      } catch (error) {
        console.error("Erreur lors de la vérification des récompenses mensuelles:", error);
      }
    }, 0);

    console.log('✅ Validation du segment réussie:', {
      segment: request.segment,
      currentPage: newCurrentPage,
      progress_id: progress?.id,
      newBadges: newBadges.length
    });

    return {
      message: "Segment validé avec succès",
      current_page: newCurrentPage,
      already_validated: false,
      next_segment_question: nextQuestion?.question ?? null,
      newBadges: newBadges.length > 0 ? newBadges : undefined
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
    console.error('Error validating reading:', error);
    throw new Error(errorMessage);
  }
};
