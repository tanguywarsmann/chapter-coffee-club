

/* ----------  Types de base  ---------- */

export interface ReadingQuestion {
  id: string
  book_slug: string
  segment: number
  question: string
  answer: string
  created_at?: string
}

export interface ReadingValidation {
  id: string
  user_id: string
  book_id: string
  segment: number
  question_id: string | null
  answer: string | null
  correct: boolean
  validated_at: string
  date_validated?: string
}

/* Structure brute provenant de Supabase */
export interface ReadingProgressRow {
  id: string
  user_id: string
  book_id: string
  total_pages: number
  current_page: number
  started_at: string
  updated_at: string
  status: "to_read" | "in_progress" | "completed"
  streak_current: number
  streak_best: number
  validations?: ReadingValidation[]
  total_chapters?: number
  expected_segments?: number

  /* métadonnées livre */
  book_title?: string
  book_author?: string
  book_slug?: string
  book_cover?: string | null
}

/* ----------  Type enrichi utilisé partout  ---------- */

// Supprimé l'import qui crée le conflit de nom
import type { Database } from "@/integrations/supabase/types"

/* lignes à ajouter pour que les Row soient reconnues */
type BookRow = Database["public"]["Tables"]["books"]["Row"]
type ProgressRow = Database["public"]["Tables"]["reading_progress"]["Row"]

/* alias internes --------------------------------------------------- */
export type Book = Partial<BookRow> & {
  id:    string
  title: string
  author:string

  /* ces champs deviennent optionnels pour éviter les casts forcés */
  cover_url?:      string
  description?:    string
  totalChapters?:  number
  isCompleted?:    boolean
}

/* Type pour gérer les flags d'état du livre */
type AvailabilityFlags = {
  isUnavailable?:       boolean
  isStableUnavailable?: boolean
  isCompleted?:         boolean
}

/* enrichi par les services ---------------------------------------- */
export type BookWithProgress =
  Book &
  ProgressRow &
  AvailabilityFlags & {
    /* dérivés (requis) */
    chaptersRead:     number
    progressPercent:  number
    expectedSegments: number
    totalSegments:    number
    nextSegmentPage:  number
    currentSegment:   number // Changé de optionnel à requis

    
    /* legacy (tous optionnels) */
    book_id?:     string
    book_title?:  string
    book_author?: string
    book_cover?:  string

    /* autres éventuels */
    language?:    string
    categories?:  string[]
    pages?:       number
  }

/* Helper utilitaire pour créer un objet vide sans casser le typage */
export const EMPTY_BOOK_PROGRESS = {} as BookWithProgress

/* Alias publics (usage dans les services / hooks / composants) */
export type ReadingProgress = BookWithProgress
export type ReadingListItem  = BookWithProgress

/* ----------  Autres petits types  ---------- */

export interface ValidateReadingRequest {
  user_id: string
  book_id: string
  segment: number
}

export interface ValidateReadingResponse {
  message: string
  current_page: number
  already_validated?: boolean
  next_segment_question: string | null
}

export interface ReadingList {
  user_id: string
  book_id: string
  status: "to_read" | "in_progress" | "completed"
  added_at: string
}

export interface ReadingActivity {
  user_id: string
  date: string            // ISO
}

export interface ReadingStreak {
  current_streak: number
  longest_streak: number
  last_validation_date: string
}

