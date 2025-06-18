
/**
 * Classes d'erreur typées pour la Reading List
 * Permet une gestion d'erreur précise et des messages utilisateur adaptés
 */

export class ReadingListError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'ReadingListError';
  }
}

export class AlreadyInListError extends ReadingListError {
  constructor(bookTitle: string) {
    super(`Le livre "${bookTitle}" est déjà dans votre liste de lecture`, 'ALREADY_EXISTS');
    this.name = 'AlreadyInListError';
  }
}

export class BookNotFoundError extends ReadingListError {
  constructor(bookId: string) {
    super(`Le livre avec l'ID "${bookId}" n'existe pas dans la base de données`, 'BOOK_NOT_FOUND');
    this.name = 'BookNotFoundError';
  }
}

export class InvalidBookError extends ReadingListError {
  constructor(reason: string) {
    super(`Livre invalide: ${reason}`, 'INVALID_BOOK');
    this.name = 'InvalidBookError';
  }
}

export class AuthenticationRequiredError extends ReadingListError {
  constructor() {
    super('Vous devez être connecté pour ajouter un livre à votre liste', 'AUTH_REQUIRED');
    this.name = 'AuthenticationRequiredError';
  }
}

/**
 * Utilitaire pour identifier les types d'erreur
 */
export const isReadingListError = (error: unknown): error is ReadingListError => {
  return error instanceof ReadingListError;
};

export const getErrorMessage = (error: unknown): string => {
  if (isReadingListError(error)) {
    return error.message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'Une erreur inattendue est survenue';
};

export const getErrorToastType = (error: unknown): 'error' | 'info' => {
  if (error instanceof AlreadyInListError) {
    return 'info'; // Déjà dans la liste n'est pas vraiment une erreur
  }
  
  return 'error';
};
