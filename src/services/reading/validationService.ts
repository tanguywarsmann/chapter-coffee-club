
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ReadingValidation, ValidateReadingRequest, ValidateReadingResponse } from "@/types/reading";
import { getBookById } from "@/services/books/bookQueries";
import { getQuestionForBookSegment, isSegmentAlreadyValidated } from "../questionService";
import { recordReadingActivity } from "../streakService";
import { getBookReadingProgress } from "./progressService";

// Validate a reading segment ("Valider un segment de lecture")
export const validateReading = async (
  request: ValidateReadingRequest
): Promise<ValidateReadingResponse> => {
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

    // Get question for next segment, if any
    const nextSegment = request.segment + 1;
    const nextQuestion = await getQuestionForBookSegment(request.book_id, nextSegment);

    toast.success("Segment validé avec succès !");

    return {
      message: "Segment validé avec succès",
      current_page: newCurrentPage,
      already_validated: false,
      next_segment_question: nextQuestion ? nextQuestion.question : null
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
