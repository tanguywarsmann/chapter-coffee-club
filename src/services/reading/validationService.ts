
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ReadingValidation, ValidateReadingRequest, ValidateReadingResponse } from "@/types/reading";
import { getBookById } from "@/mock/books";
import { getQuestionForBookSegment } from "../questionService";
import { recordReadingActivity } from "../streakService";
import { getBookReadingProgress } from "./progressService";

// Validate a reading segment ("Valider un segment de lecture")
export const validateReading = async (
  request: ValidateReadingRequest
): Promise<ValidateReadingResponse> => {
  try {
    const book = getBookById(request.book_id);

    if (!book) {
      throw new Error("Livre non trouvé");
    }

    // Get the question for this book and segment
    const question = await getQuestionForBookSegment(request.book_id, request.segment);

    if (!question) {
      throw new Error("Aucune question trouvée pour ce segment");
    }

    let progress = await getBookReadingProgress(request.user_id, request.book_id);

    if (!progress) {
      // Need to initialize progress (relies on mock/books for initial data)
      const { initializeBookReading } = await import("./syncService");
      progress = await initializeBookReading(request.user_id, book);
    }

    const { data: existingValidation } = await supabase
      .from('reading_validations')
      .select('*')
      .eq('user_id', request.user_id)
      .eq('book_id', request.book_id)
      .eq('segment', request.segment)
      .maybeSingle();

    if (existingValidation) {
      throw new Error("Segment déjà validé");
    }

    const newCurrentPage = request.segment * 30;
    const newStatus = newCurrentPage >= book.pages ? 'completed' : 'in_progress';

    const { error: progressError } = await supabase
      .from('reading_progress')
      .upsert({
        user_id: request.user_id,
        book_id: request.book_id,
        current_page: newCurrentPage,
        status: newStatus as "to_read" | "in_progress" | "completed",
        total_pages: book.pages
      });

    if (progressError) {
      throw progressError;
    }

    const { error: validationError } = await supabase
      .from('reading_validations')
      .insert({
        user_id: request.user_id,
        book_id: request.book_id,
        segment: request.segment,
        question_id: question.id,
        correct: true
      });

    if (validationError) {
      throw validationError;
    }

    await recordReadingActivity(request.user_id);

    const nextSegment = request.segment + 1;
    const nextQuestion = await getQuestionForBookSegment(book.title, nextSegment);

    return {
      message: "Segment validé avec succès",
      current_page: newCurrentPage,
      next_segment_question: nextQuestion ? nextQuestion.question : null
    };

  } catch (error: any) {
    console.error('Error validating reading:', error);
    throw error;
  }
};


// Get all validations for a book+user
export const getBookValidations = async (userId: string, bookId: string): Promise<ReadingValidation[]> => {
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
