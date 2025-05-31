
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
type ReadingProgressRecord = Database['public']['Tables']['reading_progress']['Insert'] & { id?: string };

/**
 * Valide un segment de lecture
 * @param request Requête de validation
 * @returns Réponse de validation avec potentiellement des badges
 */
export const validateReading = async (
  request: ValidateReadingRequest
): Promise<ValidateReadingResponse & { newBadges?: Badge[] }> => {
  let toastDisplayed = false; // Pour éviter les toasts contradictoires

  try {
    console.log('🚀 [validateReading] Validation démarrée pour user_id:', request.user_id, 'livre:', request.book_id, 'segment:', request.segment);
    
    // Vérifier si l'utilisateur est connecté
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      console.error('❌ [validateReading] Erreur session:', sessionError);
      toast.error("Erreur de session: " + sessionError.message);
      toastDisplayed = true;
      throw sessionError;
    }
    
    if (!sessionData?.session) {
      const errorMsg = "❌ Utilisateur non authentifié lors de la validation";
      console.error(errorMsg);
      toast.error(errorMsg);
      toastDisplayed = true;
      throw new Error(errorMsg);
    }
    console.log('✅ [validateReading] Session utilisateur valide');

    // Vérification défensive - Rechercher TOUTES les progressions existantes pour ce couple user_id/book_id
    console.log('🔍 [validateReading] Vérification défensive pour détecter les progressions multiples...');
    const { data: existingProgresses, error: checkError } = await supabase
      .from("reading_progress")
      .select("id, current_page, status")
      .eq("user_id", request.user_id)
      .eq("book_id", request.book_id);
    
    if (checkError) {
      console.error('❌ [validateReading] Erreur lors de la vérification défensive:', checkError);
      toast.error("Erreur lors de la vérification des progressions existantes: " + checkError.message);
      toastDisplayed = true;
      throw new Error("Erreur lors de la vérification des progressions");
    }

    // Alerte si plusieurs progressions sont détectées
    if (existingProgresses && existingProgresses.length > 1) {
      console.error('⚠️ [validateReading] ALERTE: Plusieurs progressions détectées pour le même livre et utilisateur:', existingProgresses);
      toast.error("Anomalie détectée: plusieurs progressions pour le même livre. Contactez le support.", { duration: 10000 });
      toastDisplayed = true;
      throw new Error("Anomalie: Plusieurs progressions détectées pour le même livre");
    }
    
    // Utiliser la progression existante si elle existe
    let progressId: string | undefined;
    let currentProgress = existingProgresses?.[0] || null;
    
    if (currentProgress) {
      progressId = currentProgress.id;
      console.log('🔄 [validateReading] Utilisation de la progression existante ID:', progressId);
    }
    
    // Récupérer les informations du livre pour connaître total_pages
    console.log('📚 [validateReading] Récupération des infos du livre', request.book_id);
    const { data: bookData, error: bookError } = await supabase
      .from('books')
      .select('total_pages, total_chapters, expected_segments')
      .eq('id', request.book_id)
      .maybeSingle();
    
    if (bookError) {
      console.error('❌ [validateReading] Erreur lors de la récupération du livre:', bookError);
      toast.error("Impossible de récupérer les informations du livre: " + bookError.message);
      toastDisplayed = true;
      throw new Error("❌ Impossible de récupérer les informations du livre");
    }
    
    if (!bookData) {
      console.error('❌ [validateReading] Livre non trouvé:', request.book_id);
      toast.error("Livre non trouvé dans la base de données");
      toastDisplayed = true;
      throw new Error("❌ Livre non trouvé dans la base de données");
    }
    
    console.log('📚 [validateReading] Infos du livre récupérées:', bookData);
    const totalPages = bookData.total_pages || 0;
    
    // CORRECTION: Calcul avec bornes strictes selon les exigences
    const calculatedPage = (request.segment + 1) * 8000;
    const newCurrentPage = Math.min(calculatedPage, totalPages);
    const updatedCurrentPage = Math.max(newCurrentPage, currentProgress?.current_page || 0);
    const clampedPage = Math.min(updatedCurrentPage, totalPages);
    
    // Déterminer le statut selon la page finale
    const newStatus: ReadingProgressStatus = clampedPage >= totalPages ? 'completed' : 'in_progress';
    
    // Log explicite du calcul final
    console.info(`[VALIDATION] current_page = ${clampedPage}, total_pages = ${totalPages}, status = ${newStatus}`);
    
    // Si pas de progression existante, en créer une nouvelle
    if (!progressId) {
      // Vérification finale avant de créer une nouvelle progression
      console.log('🔍 [validateReading] Vérification finale avant création de nouvelle progression...');
      const { data: finalCheck, error: finalCheckError } = await supabase
        .from("reading_progress")
        .select("id, current_page, status")
        .eq("user_id", request.user_id)
        .eq("book_id", request.book_id)
        .maybeSingle();
        
      if (finalCheckError) {
        console.error('❌ [validateReading] Erreur lors de la vérification finale:', finalCheckError);
      }
      
      // Si une progression a été trouvée lors de la vérification finale, l'utiliser
      if (finalCheck && finalCheck.id) {
        console.log('🔄 [validateReading] Progression trouvée lors de la vérification finale, ID:', finalCheck.id);
        progressId = finalCheck.id;
        currentProgress = finalCheck;
      } else {
        console.log('📚 [validateReading] Aucune progression existante, création d\'une nouvelle entrée');
        
        // Créer une nouvelle entrée de progression
        const newProgressData: ReadingProgressRecord = {
          user_id: request.user_id,
          book_id: request.book_id,
          current_page: clampedPage,
          total_pages: totalPages,
          status: newStatus,
          started_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        console.log('📝 [validateReading] Insertion reading_progress avec données:', newProgressData);
        const { data: newProgress, error: insertError } = await supabase
          .from('reading_progress')
          .insert(newProgressData)
          .select('id, current_page, status')
          .maybeSingle();
        
        if (insertError) {
          // Si l'erreur indique un conflit (duplicate key), essayer de récupérer l'entrée existante
          if (insertError.message.includes('duplicate key') || insertError.code === '23505') {
            console.warn('⚠️ [validateReading] Conflit lors de l\'insertion, tentative de récupération...');
            const { data: conflictData, error: conflictError } = await supabase
              .from("reading_progress")
              .select("id, current_page, status")
              .eq("user_id", request.user_id)
              .eq("book_id", request.book_id)
              .maybeSingle();
              
            if (conflictError || !conflictData) {
              console.error('❌ [validateReading] Échec de récupération après conflit:', conflictError);
              toast.error("Échec de création de la progression de lecture");
              toastDisplayed = true;
              throw new Error("Échec de création de la progression de lecture");
            }
            
            console.log('✅ [validateReading] Progression récupérée après conflit:', conflictData);
            progressId = conflictData.id;
            currentProgress = conflictData;
          } else {
            console.error('❌ [validateReading] Erreur création reading_progress:', insertError);
            toast.error("Échec de création de la progression de lecture");
            toastDisplayed = true;
            throw new Error("Échec de création de la progression de lecture");
          }
        } else if (!newProgress || !newProgress.id) {
          const errorMsg = "❌ ID de progression non récupéré après insertion";
          console.error(errorMsg);
          toast.error(errorMsg);
          toastDisplayed = true;
          throw new Error(errorMsg);
        } else {
          console.log('✅ [validateReading] reading_progress créé avec succès:', newProgress);
          progressId = newProgress.id;
          currentProgress = newProgress;
        }
      }
    } else if (currentProgress) {
      // Vérifier si le segment est déjà validé
      if (request.segment <= (await getSegmentsRead(currentProgress.id))) {
        console.log('📝 [validateReading] Segment déjà validé:', request.segment);
        return {
          message: "Segment déjà validé",
          current_page: currentProgress.current_page || 0,
          already_validated: true,
          next_segment_question: null
        };
      }
      
      // Mettre à jour la progression existante avec les nouvelles bornes
      const updateData = {
        current_page: clampedPage,
        status: newStatus,
        updated_at: new Date().toISOString()
      };
      
      console.log('📝 [validateReading] Mise à jour reading_progress avec données:', updateData);
      const { data: updatedProgress, error: progressError } = await supabase
        .from('reading_progress')
        .update(updateData)
        .eq('id', progressId)
        .select('id, current_page, status')
        .maybeSingle();

      if (progressError) {
        console.error('❌ [validateReading] Erreur mise à jour reading_progress:', progressError);
        toast.error("Échec de mise à jour de la progression");
        toastDisplayed = true;
        throw new Error("Échec de mise à jour de la progression");
      }

      if (!updatedProgress || !updatedProgress.id) {
        const errorMsg = "❌ ID de progression non récupéré après mise à jour";
        console.error(errorMsg);
        toast.error(errorMsg);
        toastDisplayed = true;
        throw new Error(errorMsg);
      }
      
      console.log('✅ [validateReading] reading_progress mis à jour avec succès:', updatedProgress);
      progressId = updatedProgress.id;
      currentProgress = updatedProgress;
    }

    // Vérification finale que nous avons bien un progress_id valide
    if (!progressId) {
      const errorMsg = "❌ Impossible d'obtenir un progress_id valide pour user_id: " + request.user_id + ", book_id: " + request.book_id;
      console.error(errorMsg);
      toast.error("Erreur critique: ID de progression manquant");
      toastDisplayed = true;
      throw new Error(errorMsg);
    }

    console.log('🔍 [validateReading] Récupération de la question pour segment suivant...');
    const question = await getQuestionForBookSegment(request.book_id, request.segment);
    console.log("📚 [validateReading] Question récupérée:", question);

    // Log explicite pour le progress_id utilisé
    console.log("🔑 [validateReading] progress_id utilisé:", progressId);
    
    // Validation des préconditions avant de créer l'enregistrement de validation
    if (!question) {
      console.warn("⚠️ [validateReading] Aucune question trouvée pour ce segment");
      // Continuer car on peut valider sans question
    }

    // Vérification du segment (la base a une contrainte check segment >= 0)
    if (request.segment < 0) {
      const segmentError = `❌ [validateReading] Segment invalide (${request.segment}), doit être >= 0`;
      console.error(segmentError);
      toast.error("Échec de validation: segment invalide");
      toastDisplayed = true;
      throw new Error(segmentError);
    }
    
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
      .insert(validationRecord)
      .select('id');

    if (validationError) {
      console.error('❌ [validateReading] Erreur insertion reading_validations:', validationError);
      
      if (validationError.message.includes('violates foreign key constraint')) {
        toast.error("Erreur de contrainte : le progress_id n'est pas valide. Contacter le support.", { duration: 8000 });
        toastDisplayed = true;
      } else if (validationError.message.includes('reading_validations_segment_check')) {
        toast.error("Erreur de validation : segment invalide", { duration: 5000 });
        toastDisplayed = true;
      } else {
        toast.error("Échec d'enregistrement de la validation: " + validationError.message);
        toastDisplayed = true;
      }
      throw validationError;
    }
    
    console.log("✅ [validateReading] reading_validations inséré avec succès:", validationData);

    await clearProgressCache(request.user_id);
    console.log(`✅ [validateReading] Cache vidé pour l'utilisateur ${request.user_id}`);

    // Mutation SWR - force refresh des données pour SWR
    mutate((key) => typeof key === 'string' && key.includes(`reading-progress-${request.user_id}`), undefined, true);
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

    // Utilisation de EdgeRuntime.waitUntil équivalent pour les tâches en arrière-plan
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

    // Success toast only at the end when everything worked and only if no error toast has been shown
    if (!toastDisplayed) {
      toast.success("Segment validé avec succès!");
    }
    
    console.log("🏁 [validateReading] Processus de validation terminé avec succès");
    return {
      message: "Segment validé avec succès",
      current_page: clampedPage,
      already_validated: false,
      next_segment_question: nextQuestion?.question ?? null,
      newBadges: newBadges.length > 0 ? newBadges : undefined
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
    console.error('❌ [validateReading] Erreur finale de validation:', error);
    
    // N'afficher le toast d'erreur que si aucun toast n'a été affiché précédemment
    if (!toastDisplayed) {
      toast.error(`Échec de la validation: ${errorMessage}`);
    }
    throw new Error(errorMessage);
  }
};

/**
 * Récupère le nombre de segments lus pour une progression
 * @param progressId ID de la progression de lecture
 * @returns Nombre de segments validés
 */
async function getSegmentsRead(progressId: string): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('reading_validations')
      .select('segment')
      .eq('progress_id', progressId);
      
    if (error) {
      console.error("❌ [getSegmentsRead] Erreur lors de la récupération des validations:", error);
      return 0;
    }
    
    return data?.length || 0;
  } catch (error) {
    console.error("❌ [getSegmentsRead] Erreur:", error);
    return 0;
  }
}
