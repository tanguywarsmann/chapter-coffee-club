
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Book } from "@/types/book";
import { ReadingProgress, ValidateReadingRequest, ValidateReadingResponse, ReadingValidation } from "@/types/reading";
import { getBookById } from "@/mock/books";
import { getQuestion } from "@/utils/quizQuestions";
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

  // Ajouter le tableau validations vide par défaut aux données
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

// Simule l'API de validation de lecture
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
    
    const newCurrentPage = request.segment * 30;
    const newStatus = newCurrentPage >= book.pages ? 'completed' : 'in_progress';
    
    const { error } = await supabase
      .from('reading_progress')
      .upsert({
        user_id: request.user_id,
        book_id: request.book_id,
        current_page: newCurrentPage,
        status: newStatus as "to_read" | "in_progress" | "completed",
        total_pages: book.pages
      });

    if (error) {
      throw error;
    }
    
    // Record reading activity for streak
    await recordReadingActivity(request.user_id);
    
    // Obtenir la question pour le segment suivant
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

// Récupère tous les livres en cours pour un utilisateur
export const getBooksInProgressFromAPI = async (userId: string): Promise<Book[]> => {
  const userProgress = await getUserReadingProgress(userId);
  return userProgress
    .map(progress => {
      const book = getBookById(progress.book_id);
      if (!book) return null;
      
      // Convertir les pages en chapitres pour la compatibilité avec l'interface existante
      const chaptersRead = Math.floor(progress.current_page / 30);
      return {
        ...book,
        chaptersRead,
        isCompleted: chaptersRead >= book.totalChapters
      };
    })
    .filter((book): book is Book => book !== null);
};

// Récupère les livres terminés pour un utilisateur
export const getCompletedBooksFromAPI = async (userId: string): Promise<Book[]> => {
  const books = await getBooksInProgressFromAPI(userId);
  return books.filter(book => book.isCompleted);
};

// Synchronise un livre spécifique avec l'API
export const syncBookWithAPI = async (userId: string, bookId: string): Promise<Book | null> => {
  const progress = await getBookReadingProgress(userId, bookId);
  const book = getBookById(bookId);
  
  if (!book) return null;
  
  if (!progress) {
    // Si aucune progression n'existe, initialiser une nouvelle
    await initializeBookReading(userId, book);
    return book;
  }
  
  // Convertir les pages en chapitres pour la compatibilité
  const chaptersRead = Math.floor(progress.current_page / 30);
  return {
    ...book,
    chaptersRead,
    isCompleted: chaptersRead >= book.totalChapters
  };
};

// Initialise la progression pour tous les livres en cours de l'utilisateur
export const initializeUserReadingProgress = async (userId: string) => {
  const existingProgress = await getUserReadingProgress(userId);
  
  // Pour chaque livre dans mockBooks qui a des chapitres lus
  // mais pas encore de progression, initialiser une progression
  const mockBooks = getBookById(""); // Passez une chaîne vide pour obtenir tous les livres
  
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
