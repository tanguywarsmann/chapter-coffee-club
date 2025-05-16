
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

/* alias internes --------------------------------------------------- */
export type Book = Partial<Database["public"]["Tables"]["books"]["Row"]> & {
  id: string            // Ces quatre champs restent requis
  title: string
  author: string
  cover_url: string
  description: string   // Maintenant requis
  totalChapters: number // Nouveau champ requis pour BookPage.tsx
  
  /** nouveau champ optionnel pour compatibilité avec BookPage */
  publicationYear?: number
  
  /** alias front de cover_url */
  coverImage?: string
  /** garde le snake_case venant de la BDD */
  expected_segments?: number
  total_chapters?: number
}

/* enrichi par les services ---------------------------------------- */
export type BookWithProgress =
  Book &
  ProgressRow & {
    /* -------- champs dérivés (requis) -------- */
    chaptersRead:     number
    progressPercent:  number
    expectedSegments: number
    totalSegments:    number
    nextSegmentPage:  number

    /* -------- compat / legacy -------- */
    book_id?:     string          // 🔄  désormais optionnel
    book_title?:  string
    book_author?: string
    book_cover?:  string

    /* -------- autres champs attendus -------- */
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
