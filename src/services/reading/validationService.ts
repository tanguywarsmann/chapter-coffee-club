
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ReadingValidation, ValidateReadingRequest, ValidateReadingResponse, BookWithProgress } from "@/types/reading";
import { getQuestionForBookSegment, isSegmentAlreadyValidated } from "../questionService";
import { recordReadingActivity } from "../streakService";
import { getBookReadingProgress, clearProgressCache } from "./progressService";
import { Badge } from "@/types/badge";
import { checkBadgesForUser } from "@/services/user/streakBadgeService";
import { checkUserQuests } from "@/services/questService";
import { addXP } from "@/services/user/levelService";
import { checkAndGrantMonthlyReward } from "@/services/monthlyRewardService";
import { Database } from "@/integrations/supabase/types";
import { mutate } from 'swr';

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

    // Vérifier si le segment est déjà validé
    const progress = await getBookReadingProgress(request.user_id, request.book_id);
    
    if (!progress) {
      throw new Error("❌ Impossible de récupérer la progression du livre");
    }
    
    // Utiliser maintenant chaptersRead au lieu de vérifier la DB
    if (request.segment <= progress.chaptersRead) {
      console.log('📝 Segment already validated:', request.segment, 'chaptersRead:', progress.chaptersRead);
      
      return {
        message: "Segment déjà validé",
        current_page: request.segment * 30,
        already_validated: true,
        next_segment_question: null
      };
    }

    const question = await getQuestionForBookSegment(request.book_id, request.segment);
    console.log("📚 Question récupérée :", question);

    const newCurrentPage = request.segment * 30;
    
    // Correction: Déterminer le statut en comparant (chaptersRead + 1) à totalSegments
    // au lieu d'utiliser progress.pages (qui n'existe plus)
    const newStatus = (progress.chaptersRead + 1) >= progress.totalSegments ? 'completed' : 'in_progress';

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
      toast.error("Échec de mise à jour dans Supabase");
      throw progressError;
    }
    
    console.log("✅ Supabase update success - reading_progress");

    const validationRecord: ReadingValidationRecord = {
      user_id: request.user_id,
      book_id: request.book_id,
      segment: request.segment,
      question_id: question?.id ?? null,
      correct: true,
      validated_at: new Date().toISOString(),
      answer: question?.answer ?? undefined,
      progress_id: progress.id
    };

    console.log("🧾 Enregistrement validation :", validationRecord);

    const { error: validationError } = await supabase
      .from('reading_validations')
      .insert(validationRecord);

    if (validationError) {
      console.error('Error inserting validation record:', validationError);
      toast.error("Échec d'enregistrement de la validation dans Supabase");
      throw validationError;
    }
    
    console.log("✅ Supabase insert success - reading_validations");

    await clearProgressCache(request.user_id);
    console.log(`✅ Cache vidé pour l'utilisateur ${request.user_id} après validation d'un segment`);

    // Mutation SWR - force refresh des données pour SWR
    mutate((key) => typeof key === 'string' && key.includes(`reading-progress-${request.user_id}`), undefined, true);
    // Mutation alternative si la première ne fonctionne pas
    mutate(() => getBookReadingProgress(request.user_id, request.book_id));
    
    console.log("✅ SWR cache mutation triggered");

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

    // Get updated progress after validation
    const updatedProgress = await getBookReadingProgress(request.user_id, request.book_id);
    console.debug("[validateReading] New progress", updatedProgress);

    // Success toast only at the end when everything worked
    toast.success("Segment validé avec succès");
    
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
