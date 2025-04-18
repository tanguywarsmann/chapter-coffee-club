
import { toast } from "sonner";
import { Book } from "@/types/book";
import { ReadingProgress, ValidateReadingRequest, ValidateReadingResponse } from "@/types/reading";
import { getBookById, mockBooks } from "@/mock/books";
import { getQuestion } from "@/utils/quizQuestions";

// Simulation d'une base de données locale
const STORAGE_KEY = "reading_progress";

// Récupère la progression de tous les livres pour un utilisateur
export const getUserReadingProgress = (userId: string): ReadingProgress[] => {
  const storedData = localStorage.getItem(STORAGE_KEY);
  const allProgress: ReadingProgress[] = storedData ? JSON.parse(storedData) : [];
  return allProgress.filter(progress => progress.user_id === userId);
};

// Récupère la progression d'un livre spécifique pour un utilisateur
export const getBookReadingProgress = (userId: string, bookId: string): ReadingProgress | null => {
  const userProgress = getUserReadingProgress(userId);
  return userProgress.find(progress => progress.book_id === bookId) || null;
};

// Initialise la progression de lecture pour un livre
export const initializeBookReading = (userId: string, book: Book): ReadingProgress => {
  const newProgress: ReadingProgress = {
    user_id: userId,
    book_id: book.id,
    total_pages: book.pages,
    current_page: book.chaptersRead * 30, // Conversion des chapitres en pages
    last_validation_date: book.chaptersRead > 0 
      ? new Date().toISOString() 
      : "",
    validations: []
  };

  // Si le livre a déjà des chapitres lus, simuler les validations passées
  if (book.chaptersRead > 0) {
    for (let i = 1; i <= book.chaptersRead; i++) {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - (book.chaptersRead - i + 1));
      
      newProgress.validations.push({
        segment: i,
        question_id: `Auto-generated for segment ${i}`,
        date_validated: pastDate.toISOString()
      });
    }
  }

  // Sauvegarder la progression
  saveReadingProgress(newProgress);
  return newProgress;
};

// Sauvegarde une progression de lecture
const saveReadingProgress = (progress: ReadingProgress): void => {
  const storedData = localStorage.getItem(STORAGE_KEY);
  const allProgress: ReadingProgress[] = storedData ? JSON.parse(storedData) : [];
  
  // Trouver et mettre à jour une progression existante, ou ajouter une nouvelle
  const existingIndex = allProgress.findIndex(
    p => p.user_id === progress.user_id && p.book_id === progress.book_id
  );
  
  if (existingIndex >= 0) {
    allProgress[existingIndex] = progress;
  } else {
    allProgress.push(progress);
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(allProgress));
};

// Simule l'API de validation de lecture
export const validateReading = async (
  request: ValidateReadingRequest
): Promise<ValidateReadingResponse> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        // Récupérer la progression existante ou initialiser une nouvelle
        let progress = getBookReadingProgress(request.user_id, request.book_id);
        const book = getBookById(request.book_id);
        
        if (!book) {
          reject({ error: "Livre non trouvé" });
          return;
        }
        
        if (!progress) {
          progress = initializeBookReading(request.user_id, book);
        }
        
        // Vérifier si le segment est déjà validé
        const segmentAlreadyValidated = progress.validations.some(
          validation => validation.segment === request.segment
        );
        
        if (segmentAlreadyValidated) {
          reject({ error: "Segment déjà validé" });
          return;
        }
        
        // Mettre à jour la progression
        const now = new Date().toISOString();
        progress.current_page = request.segment * 30;
        progress.last_validation_date = now;
        progress.validations.push({
          segment: request.segment,
          question_id: `Question for segment ${request.segment}`,
          date_validated: now
        });
        
        // Sauvegarder la progression mise à jour
        saveReadingProgress(progress);
        
        // Mettre à jour le mockBook pour maintenir la cohérence avec l'interface existante
        const bookIndex = mockBooks.findIndex(b => b.id === book.id);
        if (bookIndex !== -1) {
          const chaptersRead = Math.floor(progress.current_page / 30);
          mockBooks[bookIndex] = {
            ...mockBooks[bookIndex],
            chaptersRead,
            isCompleted: chaptersRead >= mockBooks[bookIndex].totalChapters
          };
        }
        
        // Obtenir la question pour le segment suivant
        const nextSegment = request.segment + 1;
        const nextQuestion = getQuestion(book.title, nextSegment);
        
        resolve({
          message: "Segment validé avec succès",
          current_page: progress.current_page,
          next_segment_question: nextQuestion ? nextQuestion.question : null
        });
      } catch (error) {
        reject({ error: "Erreur lors de la validation du segment" });
      }
    }, 500); // Simuler un délai réseau
  });
};

// Récupère tous les livres en cours pour un utilisateur
export const getBooksInProgressFromAPI = (userId: string): Book[] => {
  const userProgress = getUserReadingProgress(userId);
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
export const getCompletedBooksFromAPI = (userId: string): Book[] => {
  return getBooksInProgressFromAPI(userId)
    .filter(book => book.isCompleted);
};

// Synchronise un livre spécifique avec l'API
export const syncBookWithAPI = (userId: string, bookId: string): Book | null => {
  const progress = getBookReadingProgress(userId, bookId);
  const book = getBookById(bookId);
  
  if (!book) return null;
  
  if (!progress) {
    // Si aucune progression n'existe, initialiser une nouvelle
    initializeBookReading(userId, book);
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
export const initializeUserReadingProgress = (userId: string) => {
  const existingProgress = getUserReadingProgress(userId);
  
  // Pour chaque livre dans mockBooks qui a des chapitres lus
  // mais pas encore de progression, initialiser une progression
  mockBooks
    .filter(book => book.chaptersRead > 0)
    .forEach(book => {
      const hasProgress = existingProgress.some(p => p.book_id === book.id);
      if (!hasProgress) {
        initializeBookReading(userId, book);
      }
    });
};
