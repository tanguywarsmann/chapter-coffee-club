import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Book } from "@/types/book";
import { ReadingProgress, ValidateReadingRequest, ValidateReadingResponse, ReadingValidation } from "@/types/reading";
import { getBookById } from "@/mock/books";
import { getQuestion, checkAnswer } from "@/utils/quizQuestions";
import { recordReadingActivity } from "./streakService";

export const getUserReadingProgress = async (userId: string): Promise<ReadingProgress[]> => {
  const { data, error } = await supabase
    .from('reading_progress')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching reading progress:', error);
    return [];
  }

  return (data || []).map(item => ({
    ...item,
    validations: []
  }));
};

export const getBookReadingProgress = async (userId: string, bookId: string): Promise<ReadingProgress | null> => {
  const { data, error } = await supabase
    .from('reading_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('book_id', bookId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching book progress:', error);
    return null;
  }

  return data ? { ...data, validations: [] } : null;
};

export const initializeBookReading = async (userId: string, book: Book): Promise<ReadingProgress | null> => {
  const newProgress = {
    user_id: userId,
    book_id: book.id,
    total_pages: book.pages,
    current_page: book.chaptersRead * 30,
    status: book.chaptersRead > 0 ? 'in_progress' : 'to_read'
  };

  const { data, error } = await supabase
    .from('reading_progress')
    .insert({
      ...newProgress,
      status: newProgress.status as "to_read" | "in_progress" | "completed"
    })
    .select()
    .single();

  if (error) {
    console.error('Error initializing reading progress:', error);
    return null;
  }

  return { ...data, validations: [] };
};

export const validateReading = async (
  request: ValidateReadingRequest
): Promise<ValidateReadingResponse> => {
  try {
    const book = getBookById(request.book_id);
    
    if (!book) {
      throw new Error("Livre non trouvé");
    }
    
    let progress = await getBookReadingProgress(request.user_id, request.book_id);
    
    if (!progress) {
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
    
    const question = getQuestion(book.title, request.segment);
    
    const { error: validationError } = await supabase
      .from('reading_validations')
      .insert({
        user_id: request.user_id,
        book_id: request.book_id,
        segment: request.segment,
        question_id: question.question,
        correct: true
      });

    if (validationError) {
      throw validationError;
    }
    
    await recordReadingActivity(request.user_id);
    
    const nextSegment = request.segment + 1;
    const nextQuestion = getQuestion(book.title, nextSegment);
    
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

export const getBooksInProgressFromAPI = async (userId: string): Promise<Book[]> => {
  const userProgress = await getUserReadingProgress(userId);
  return userProgress
    .map(progress => {
      const book = getBookById(progress.book_id);
      if (!book) return null;
      
      const chaptersRead = Math.floor(progress.current_page / 30);
      return {
        ...book,
        chaptersRead,
        isCompleted: chaptersRead >= book.totalChapters
      };
    })
    .filter((book): book is Book => book !== null);
};

export const getCompletedBooksFromAPI = async (userId: string): Promise<Book[]> => {
  const books = await getBooksInProgressFromAPI(userId);
  return books.filter(book => book.isCompleted);
};

export const syncBookWithAPI = async (userId: string, bookId: string): Promise<Book | null> => {
  const progress = await getBookReadingProgress(userId, bookId);
  const book = getBookById(bookId);
  
  if (!book) return null;
  
  if (!progress) {
    await initializeBookReading(userId, book);
    return book;
  }
  
  const chaptersRead = Math.floor(progress.current_page / 30);
  return {
    ...book,
    chaptersRead,
    isCompleted: chaptersRead >= book.totalChapters
  };
};

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

export const initializeUserReadingProgress = async (userId: string) => {
  const existingProgress = await getUserReadingProgress(userId);
  
  const mockBooks = getBookById("");
  
  if (Array.isArray(mockBooks)) {
    mockBooks
      .filter(book => book.chaptersRead > 0)
      .forEach(async (book) => {
        const hasProgress = existingProgress.some(p => p.book_id === book.id);
        if (!hasProgress) {
          await initializeBookReading(userId, book);
        }
      });
  }
};
