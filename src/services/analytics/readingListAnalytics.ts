
/**
 * Service d'analytics pour la Reading List
 * Track les événements d'ajout/suppression de livres
 */

interface ReadingListEvent {
  book_id: string;
  book_title?: string;
  outcome: 'success' | 'error' | 'already_exists' | 'invalid_book' | 'auth_required';
  error_code?: string;
  user_id?: string;
}

class ReadingListAnalytics {
  private events: ReadingListEvent[] = [];

  /**
   * Enregistre un événement d'ajout à la reading list
   */
  trackAddToReadingList(event: ReadingListEvent) {
    const enrichedEvent = {
      ...event,
      timestamp: new Date().toISOString(),
    };

    this.events.push(enrichedEvent);

    // En développement, log dans la console
    if (process.env.NODE_ENV === 'development') {
      console.log('[ANALYTICS] reading_list_add:', enrichedEvent);
    }

    // En production, ici on pourrait envoyer à un service d'analytics
    // comme Google Analytics, Mixpanel, etc.
  }

  /**
   * Récupère les événements pour debug/monitoring
   */
  getEvents(): ReadingListEvent[] {
    return [...this.events];
  }

  /**
   * Nettoie les événements (utile pour les tests)
   */
  clearEvents() {
    this.events = [];
  }
}

export const readingListAnalytics = new ReadingListAnalytics();

/**
 * Helper pour tracker facilement les événements
 */
export const trackReadingListAdd = (
  bookId: string,
  outcome: ReadingListEvent['outcome'],
  options: {
    bookTitle?: string;
    errorCode?: string;
    userId?: string;
  } = {}
) => {
  readingListAnalytics.trackAddToReadingList({
    book_id: bookId,
    book_title: options.bookTitle,
    outcome,
    error_code: options.errorCode,
    user_id: options.userId,
  });
};
