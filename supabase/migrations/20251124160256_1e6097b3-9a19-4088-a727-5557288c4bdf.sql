-- =============================================
-- Migration: Ajouter completed_at à reading_progress
-- Objectif: Timestamp dédié pour la fin de lecture (vs updated_at)
-- Date: 2025-11-24
-- =============================================

-- Ajouter la colonne completed_at si elle n'existe pas
ALTER TABLE public.reading_progress
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

-- Créer un index pour améliorer les performances du feed
CREATE INDEX IF NOT EXISTS idx_reading_progress_completed_at 
ON public.reading_progress(completed_at DESC) 
WHERE status = 'completed';

-- Remplir completed_at pour les livres déjà terminés (utiliser updated_at comme fallback)
UPDATE public.reading_progress
SET completed_at = updated_at
WHERE status = 'completed' 
  AND completed_at IS NULL;

COMMENT ON COLUMN public.reading_progress.completed_at IS 
  'Timestamp exact de fin de lecture. Distinct de updated_at qui change à chaque modification.';