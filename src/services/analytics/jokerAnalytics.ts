// Analytics tracking for joker usage and answer reveals

export interface JokerUsedEvent {
  bookId: string;
  segment: number;
  attemptsBefore: number;
  timeToJokerMs: number;
}

export interface AnswerRevealedEvent {
  bookId: string;
  segment: number;
  correctAnswerLength: number;
}

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

export function trackJokerUsed(props: JokerUsedEvent) {
  // Track joker usage event
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'joker_used', {
      book_id: props.bookId,
      segment: props.segment,
      attempts_before: props.attemptsBefore,
      time_to_joker_ms: props.timeToJokerMs,
      event_category: 'reading_validation',
      custom_parameters: {
        joker_usage: true
      }
    });
  }
  
  console.log('📊 Analytics: Joker used', props);
}

export function trackAnswerRevealed(props: AnswerRevealedEvent) {
  // Track answer reveal event
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'answer_revealed', {
      book_id: props.bookId,
      segment: props.segment,
      answer_length: props.correctAnswerLength,
      event_category: 'reading_validation',
      custom_parameters: {
        answer_revealed: true,
        was_correct_before: false
      }
    });
  }
  
  console.log('📊 Analytics: Answer revealed', props);
}