
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
import { clearProgressCache } from "@/services/progressService";

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
    
    // Vérifier si le segment a déjà été validé
    const alreadyValidated = await isSegmentAlreadyValidated(
      request.user_id, 
      request.book_id, 
      request.segment
    );
    
    if (alreadyValidated) {
      console.log('📝 Segment already validated, refreshing progress data', request);
      
      // Même si le segment est déjà validé, forcer un rafraîchissement des données
      // pour s'assurer que l'UI reflète l'état réel
      await clearProgressCache(request.user_id);
      console.log(`✅ Cache vidé pour l'utilisateur ${request.user_id} (segment déjà validé)`);
      
      return {
        message: "Segment déjà validé",
        current_page: request.segment * 8000, // Updated to use segment * 8000
        already_validated: true,
        next_segment_question: null
      };
    }
    
    const book = await getBookById(request.book_id);

    if (!book) {
      console.error('Book not found:', request.book_id);
      throw new Error("Livre non trouvé");
    }

    // Récupérer la question pour ce livre et ce segment
    const question = await getQuestionForBookSegment(request.book_id, request.segment);

    if (!question) {
      console.warn(`No question found for book ${request.book_id}, segment ${request.segment}`);
      // Nous continuerons et utiliserons une question de secours dans l'UI
    }

    let progress = await getBookReadingProgress(request.user_id, request.book_id);

    if (!progress) {
      // Besoin d'initialiser la progression
      const { initializeNewBookReading } = await import("./syncService");
      progress = await initializeNewBookReading(request.user_id, request.book_id);
      if (!progress) {
        throw new Error("Impossible d'initialiser la progression de lecture");
      }
    }

    // Calculer la nouvelle page actuelle en utilisant segment * 8000 au lieu de segment * 30
    const newCurrentPage = request.segment * 8000;
    const newStatus = newCurrentPage >= book.pages ? 'completed' : 'in_progress';

    // Mettre à jour la progression de lecture
    console.log('📊 Updating reading progress:', {
      user_id: request.user_id,
      book_id: request.book_id,
      current_page: newCurrentPage,
      status: newStatus
    });

    const { error: progressError } = await supabase
      .from('reading_progress')
      .update({
        current_page: newCurrentPage,
        status: newStatus as "to_read" | "in_progress" | "completed",
        updated_at: new Date().toISOString()
      })
      .eq('user_id', request.user_id)
      .eq('book_id', request.book_id);

    if (progressError) {
      console.error('Error updating reading progress:', progressError);
      throw progressError;
    }

    // Insérer l'enregistrement de validation
    const validationRecord: ReadingValidationRecord = {
      user_id: request.user_id,
      book_id: request.book_id,
      segment: request.segment,
      question_id: question?.id || null,
      correct: true,
      validated_at: new Date().toISOString()
    };

    const { error: validationError } = await supabase
      .from('reading_validations')
      .insert(validationRecord);

    if (validationError) {
      console.error('Error inserting validation record:', validationError);
      throw validationError;
    }

    // Vider le cache de progression pour s'assurer que les données seront rafraîchies
    // IMPORTANT: Utiliser await pour s'assurer que le cache est vidé avant de continuer
    await clearProgressCache(request.user_id);
    console.log(`✅ Cache vidé pour l'utilisateur ${request.user_id} après validation d'un segment`);
    
    // Enregistrer l'activité de lecture pour les séries
    await recordReadingActivity(request.user_id);
    
    // Ajouter des points XP pour la validation d'un segment (10 XP)
    await addXP(request.user_id, 10);

    // Récupérer la question pour le segment suivant, s'il y en a une
    const nextSegment = request.segment + 1;
    const nextQuestion = await getQuestionForBookSegment(request.book_id, nextSegment);
    
    // Vérifier si de nouveaux badges ont été gagnés
    const newBadges = await checkBadgesForUser(request.user_id, true);

    // Vérifier les quêtes en arrière-plan pour ne pas bloquer la réponse
    setTimeout(async () => {
      try {
        await checkUserQuests(request.user_id);
      } catch (error) {
        console.error("Erreur lors de la vérification des quêtes:", error);
      }
    }, 0);
    
    // Vérifier si l'utilisateur peut recevoir une récompense mensuelle
    setTimeout(async () => {
      try {
        const monthlyReward = await checkAndGrantMonthlyReward(request.user_id);
        if (monthlyReward) {
          // Si une récompense mensuelle est obtenue, elle sera affichée à l'utilisateur
          // lors du prochain rechargement via les badges obtenus
          console.log("Récompense mensuelle obtenue :", monthlyReward);
        }
      } catch (error) {
        console.error("Erreur lors de la vérification des récompenses mensuelles:", error);
      }
    }, 0);

    console.log('✅ Validation du segment réussie:', {
      segment: request.segment,
      currentPage: newCurrentPage,
      newBadges: newBadges.length
    });

    return {
      message: "Segment validé avec succès",
      current_page: newCurrentPage,
      already_validated: false,
      next_segment_question: nextQuestion ? nextQuestion.question : null,
      newBadges: newBadges.length > 0 ? newBadges : undefined
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
    console.error('Error validating reading:', error);
    throw new Error(errorMessage);
  }
};

/**
 * Récupère toutes les validations pour un livre et un utilisateur
 * @param userId ID de l'utilisateur
 * @param bookId ID du livre
 * @returns Liste des validations
 */
export const getBookValidations = async (userId: string, bookId: string): Promise<ReadingValidation[]> => {
  if (!userId || !bookId) {
    console.error('Invalid parameters for getBookValidations:', { userId, bookId });
    return [];
  }

  const { data, error } = await supabase
    .from('reading_validations')
    .select('*')
    .eq('user_id', userId)
    .eq('book_id', bookId)
    .order('validated_at', { ascending: false });

  if (error) {
    console.error('Error fetching validations:', error);
    return [];
  }

  return data ? data.map(item => ({
    ...item,
    date_validated: item.validated_at
  })) : [];
};
