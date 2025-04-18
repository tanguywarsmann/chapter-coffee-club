export interface ReadingValidation {
  segment: number;
  question_id: string;
  date_validated: string;
}

export interface ReadingProgress {
  user_id: string;
  book_id: string;
  total_pages: number;
  current_page: number;
  last_validation_date: string;
  validations: ReadingValidation[];
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
