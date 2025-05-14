import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
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

// Validate a reading segment ("Valider un segment de lecture")
export const validateReading = async (
  request: ValidateReadingRequest
): Promise<ValidateReadingResponse & { newBadges?: Badge[] }> => {
  try {
    // Vérifier si le segment a déjà été validé
    const alreadyValidated = await isSegmentAlreadyValidated(
      request.user_id, 
      request.book_id, 
      request.segment
    );
    
    if (alreadyValidated) {
      console.log('Segment already validated, returning early', request);
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

    // Get the question for this book and segment
    const question = await getQuestionForBookSegment(request.book_id, request.segment);

    if (!question) {
      console.warn(`No question found for book ${request.book_id}, segment ${request.segment}`);
      // We'll continue and use a fallback question in the UI
    }

    let progress = await getBookReadingProgress(request.user_id, request.book_id);

    if (!progress) {
      // Need to initialize progress
      const { initializeNewBookReading } = await import("./syncService");
      progress = await initializeNewBookReading(request.user_id, request.book_id);
      if (!progress) {
        throw new Error("Impossible d'initialiser la progression de lecture");
      }
    }

    // Calculate new current page using segment * 8000 instead of segment * 30
    const newCurrentPage = request.segment * 8000;
    const newStatus = newCurrentPage >= book.pages ? 'completed' : 'in_progress';

    // Update reading progress
    console.log('Updating reading progress:', {
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

    // Insert validation record
    const { error: validationError } = await supabase
      .from('reading_validations')
      .insert({
        user_id: request.user_id,
        book_id: request.book_id,
        segment: request.segment,
        question_id: question?.id || null,
        correct: true
      });

    if (validationError) {
      console.error('Error inserting validation record:', validationError);
      throw validationError;
    }

    // Record reading activity for streaks
    await recordReadingActivity(request.user_id);
    
    // Ajout des points XP pour la validation d'un segment (10 XP)
    await addXP(request.user_id, 10);

    // Get question for next segment, if any
    const nextSegment = request.segment + 1;
    const nextQuestion = await getQuestionForBookSegment(request.book_id, nextSegment);
    
    // Check if any new badges have been earned
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

    return {
      message: "Segment validé avec succès",
      current_page: newCurrentPage,
      already_validated: false,
      next_segment_question: nextQuestion ? nextQuestion.question : null,
      newBadges: newBadges.length > 0 ? newBadges : undefined
    };

  } catch (error: any) {
    console.error('Error validating reading:', error);
    throw error;
  }
};

// Get all validations for a book+user
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
