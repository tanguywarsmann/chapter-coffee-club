
export interface ReadingQuestion {
  id: string;
  book_slug: string;
  segment: number;
  question: string;
  answer: string;
  created_at?: string;
}

export interface ReadingValidation {
  id: string;
  user_id: string;
  book_id: string;
  segment: number;
  question_id: string | null;
  answer: string | null;
  correct: boolean;
  validated_at: string;
  date_validated?: string; // Optional for backward compatibility
}

export interface ReadingProgress {
  id: string;
  user_id: string;
  book_id: string;
  total_pages: number;
  current_page: number;
  started_at: string;
  updated_at: string;
  status: "to_read" | "in_progress" | "completed";
  streak_current: number;
  streak_best: number;
  validations?: ReadingValidation[]; // Maintenant optionnel
}

export interface ValidateReadingRequest {
  user_id: string;
  book_id: string;
  segment: number;
}

export interface ValidateReadingResponse {
  message: string;
  current_page: number;
  next_segment_question: string | null;
}

export interface ReadingList {
  user_id: string;
  book_id: string;
  status: "to_read" | "in_progress" | "completed";
  added_at: string;
}

// New interfaces for reading activity
export interface ReadingActivity {
  user_id: string;
  date: string; // ISO string
}

export interface ReadingStreak {
  current_streak: number;
  longest_streak: number;
  last_validation_date: string;
}
