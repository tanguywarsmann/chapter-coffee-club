-- Migration: Add revealed_answer_at column and index for joker answer reveal feature
ALTER TABLE public.reading_validations 
  ADD COLUMN IF NOT EXISTS revealed_answer_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_reading_validations_joker_revealed 
ON public.reading_validations (user_id, used_joker, revealed_answer_at) 
WHERE used_joker = true;