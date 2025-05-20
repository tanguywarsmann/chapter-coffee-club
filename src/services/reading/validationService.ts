
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ValidateReadingRequest, ValidateReadingResponse } from "@/types/reading";
import { getQuestionForBookSegment } from "../questionService";
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
type ReadingProgressStatus = Database['public']['Enums']['reading_status'];

/**
 * Valide un segment de lecture
 * @param request Requête de validation
 * @returns Réponse de validation avec potentiellement des badges
 */
export const validateReading = async (
  request: ValidateReadingRequest
): Promise<ValidateReadingResponse & { newBadges?: Badge[] }> => {
  try {
    console.log('🚀 [validateReading] Validation démarrée pour user_id:', request.user_id, 'livre:', request.book_id, 'segment:', request.segment);
    
    // Vérifier si l'utilisateur est connecté
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData?.session) {
      const errorMsg = "❌ Utilisateur non authentifié lors de la validation";
      console.error(errorMsg);
      toast.error(errorMsg);
      throw new Error(errorMsg);
    }
    console.log('✅ [validateReading] Session utilisateur valide');

    // Vérifier si le segment est déjà validé
    const progress = await getBookReadingProgress(request.user_id, request.book_id);
    console.log('📊 [validateReading] Progression existante:', progress ? `ID: ${progress.id}, chaptersRead: ${progress.chaptersRead}` : 'Aucune');
    
    // Récupérer les informations du livre pour connaître total_pages
    console.log('📚 [validateReading] Récupération des infos du livre', request.book_id);
    const { data: bookData, error: bookError } = await supabase
      .from('books')
      .select('total_pages')
      .eq('id', request.book_id)
      .single();
    
    if (bookError) {
      console.error('❌ [validateReading] Erreur lors de la récupération du livre:', bookError);
      toast.error("Impossible de récupérer les informations du livre: " + bookError.message);
      throw new Error("❌ Impossible de récupérer les informations du livre");
    }
    
    console.log('📚 [validateReading] Infos du livre récupérées:', bookData);
    const totalPages = bookData?.total_pages || 0;
    const newCurrentPage = (request.segment + 1) * 8000;
    
    // Déterminer si le livre sera complété après cette validation
    const newStatus: ReadingProgressStatus = newCurrentPage >= totalPages ? 'completed' : 'in_progress';
    console.log(`📘 [validateReading] Status calculé: ${newStatus} (newCurrentPage: ${newCurrentPage}, totalPages: ${totalPages})`);
    
    let progressId: string;
    
    if (!progress) {
      console.log('📚 [validateReading] Aucune progression existante, création d\'une nouvelle entrée');
      
      // Créer une nouvelle entrée de progression si elle n'existe pas
      const newProgressData = {
        user_id: request.user_id,
        book_id: request.book_id,
        current_page: newCurrentPage,
        total_pages: totalPages,
        status: newStatus,
        started_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      console.log('📝 [validateReading] Insertion reading_progress avec données:', newProgressData);
      const { data: newProgress, error: insertError } = await supabase
        .from('reading_progress')
        .insert(newProgressData)
        .select()
        .single();
      
      if (insertError) {
        console.error('❌ [validateReading] Erreur création reading_progress:', insertError);
        toast.error("Échec de création de la progression de lecture: " + insertError.message);
        throw insertError;
      }
      
      console.log('✅ [validateReading] reading_progress créé avec succès:', newProgress);
      progressId = newProgress.id;
      toast.success("Nouvelle progression de lecture créée!");
      
    } else {
      // Utiliser la progression existante et la mettre à jour si nécessaire
      progressId = progress.id;
      
      // Ne mettre à jour current_page que si la nouvelle valeur est supérieure
      const updatedCurrentPage = Math.max(newCurrentPage, progress.current_page || 0);
      
      // Vérifier si le segment est déjà validé
      if (request.segment <= progress.chaptersRead) {
        console.log('📝 [validateReading] Segment already validated:', request.segment, 'chaptersRead:', progress.chaptersRead);
        
        return {
          message: "Segment déjà validé",
          current_page: progress.current_page,
          already_validated: true,
          next_segment_question: null
        };
      }
      
      const updateData = {
        current_page: updatedCurrentPage,
        status: newStatus,
        updated_at: new Date().toISOString()
      };
      
      console.log('📝 [validateReading] Mise à jour reading_progress avec données:', updateData);
      const { data: updatedProgress, error: progressError } = await supabase
        .from('reading_progress')
        .update(updateData)
        .eq('user_id', request.user_id)
        .eq('book_id', request.book_id)
        .select();

      if (progressError) {
        console.error('❌ [validateReading] Erreur mise à jour reading_progress:', progressError);
        toast.error("Échec de mise à jour de la progression: " + progressError.message);
        throw progressError;
      }
      
      console.log('✅ [validateReading] reading_progress mis à jour avec succès:', updatedProgress);
      toast.success("Progression de lecture mise à jour!");
    }

    console.log('🔍 [validateReading] Récupération de la question pour segment suivant...');
    const question = await getQuestionForBookSegment(request.book_id, request.segment);
    console.log("📚 [validateReading] Question récupérée:", question);

    const validationRecord: ReadingValidationRecord = {
      user_id: request.user_id,
      book_id: request.book_id,
      segment: request.segment,
      question_id: question?.id ?? null,
      correct: true,
      validated_at: new Date().toISOString(),
      answer: question?.answer ?? undefined,
      progress_id: progressId
    };

    console.log("📝 [validateReading] Insertion reading_validations avec données:", validationRecord);
    const { data: validationData, error: validationError } = await supabase
      .from('reading_validations')
      .insert(validationRecord);

    if (validationError) {
      console.error('❌ [validateReading] Erreur insertion reading_validations:', validationError);
      toast.error("Échec d'enregistrement de la validation: " + validationError.message);
      throw validationError;
    }
    
    console.log("✅ [validateReading] reading_validations inséré avec succès:", validationData);
    toast.success("Validation enregistrée avec succès!");

    await clearProgressCache(request.user_id);
    console.log(`✅ [validateReading] Cache vidé pour l'utilisateur ${request.user_id}`);

    // Mutation SWR - force refresh des données pour SWR
    mutate((key) => typeof key === 'string' && key.includes(`reading-progress-${request.user_id}`), undefined, true);
    // Mutation alternative si la première ne fonctionne pas
    mutate(() => getBookReadingProgress(request.user_id, request.book_id));
    
    console.log("✅ [validateReading] SWR cache mutation triggered");

    console.log("📊 [validateReading] Enregistrement de l'activité de lecture...");
    await recordReadingActivity(request.user_id);
    console.log("📊 [validateReading] Ajout d'XP...");
    await addXP(request.user_id, 10);

    const nextSegment = request.segment + 1;
    const nextQuestion = await getQuestionForBookSegment(request.book_id, nextSegment);

    console.log("🏆 [validateReading] Vérification des badges...");
    const newBadges = await checkBadgesForUser(request.user_id, true);
    if(newBadges && newBadges.length > 0) {
      console.log("🏆 [validateReading] Nouveaux badges obtenus:", newBadges);
    }

    setTimeout(async () => {
      try {
        console.log("🎯 [validateReading] Vérification des quêtes en arrière-plan...");
        await checkUserQuests(request.user_id);
      } catch (error) {
        console.error("❌ [validateReading] Erreur lors de la vérification des quêtes:", error);
      }
    }, 0);

    setTimeout(async () => {
      try {
        console.log("🎁 [validateReading] Vérification des récompenses mensuelles en arrière-plan...");
        const monthlyReward = await checkAndGrantMonthlyReward(request.user_id);
        if (monthlyReward) {
          console.log("🎁 [validateReading] Récompense mensuelle obtenue:", monthlyReward);
        }
      } catch (error) {
        console.error("❌ [validateReading] Erreur lors de la vérification des récompenses mensuelles:", error);
      }
    }, 0);

    // Get updated progress after validation
    const updatedProgress = await getBookReadingProgress(request.user_id, request.book_id);
    console.log("📊 [validateReading] Progression mise à jour:", updatedProgress);

    // Success toast only at the end when everything worked
    toast.success("Segment validé avec succès!");
    
    console.log("🏁 [validateReading] Processus de validation terminé avec succès");
    return {
      message: "Segment validé avec succès",
      current_page: newCurrentPage,
      already_validated: false,
      next_segment_question: nextQuestion?.question ?? null,
      newBadges: newBadges.length > 0 ? newBadges : undefined
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
    console.error('❌ [validateReading] Erreur finale de validation:', error);
    toast.error(`Échec de la validation: ${errorMessage}`);
    throw new Error(errorMessage);
  }
};
