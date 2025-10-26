-- Quest System Database Migration
-- This migration creates a quests table and migrates existing quests to database

-- ============================================================================
-- 1. CREATE QUESTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.quests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL,
  category text NOT NULL,
  xp_reward integer NOT NULL DEFAULT 50,
  created_at timestamptz DEFAULT now()
);

-- Add category constraint
ALTER TABLE public.quests
ADD CONSTRAINT quests_category_check
CHECK (category IN ('marathons', 'vitesse', 'variete', 'regularite', 'horaires'));

-- Add index on slug for faster lookups
CREATE INDEX IF NOT EXISTS idx_quests_slug ON public.quests(slug);

-- ============================================================================
-- 2. INSERT 14 CHALLENGING QUESTS
-- ============================================================================

INSERT INTO public.quests (slug, title, description, icon, category, xp_reward) VALUES
  -- MARATHONS - Défis intenses (3 quests)
  ('marathon_reader', 'Marathon du Lecteur', 'Valider 10 segments en une seule journée', 'trophy', 'marathons', 150),
  ('binge_reading', 'Binge Reading', 'Terminer 3 livres en moins de 7 jours', 'flame', 'marathons', 200),
  ('night_marathon', 'Marathon Nocturne', 'Valider 5 segments entre 22h et 6h du matin', 'moon-star', 'marathons', 150),

  -- VITESSE & PERFORMANCE - Défis de rapidité (3 quests)
  ('lightning_reader', 'Éclair Littéraire', 'Terminer un livre de 300+ pages en moins de 3 jours', 'zap', 'vitesse', 200),
  ('speed_demon', 'Démon de Vitesse', 'Terminer un livre en moins de 24 heures', 'rocket', 'vitesse', 250),
  ('sprinter', 'Sprint de Lecture', 'Lire 50 pages ou plus en une seule session', 'gauge', 'vitesse', 100),

  -- VARIÉTÉ & EXPLORATION - Défis de diversité (2 quests)
  ('explorer', 'Explorateur Littéraire', 'Terminer 3 livres de genres différents en 30 jours', 'compass', 'variete', 150),
  ('completionist', 'Complétiste', 'Terminer 3 livres ou plus du même auteur', 'library', 'variete', 150),

  -- RÉGULARITÉ EXTRÊME - Défis de constance (3 quests)
  ('unstoppable', 'Inarrêtable', 'Lire pendant 30 jours consécutifs sans interruption', 'fire', 'regularite', 300),
  ('punctual', 'Ponctuel', 'Lire à la même heure (±1h) pendant 7 jours consécutifs', 'clock', 'regularite', 150),
  ('perfect_month', 'Mois Parfait', 'Valider au moins 1 segment chaque jour pendant 30 jours', 'calendar-check', 'regularite', 250),

  -- HORAIRES SPÉCIAUX - Défis de timing (3 quests)
  ('early_bird', 'Lève-tôt Littéraire', 'Lire avant 7h du matin', 'sunrise', 'horaires', 75),
  ('night_owl', 'Hibou de Nuit', 'Lire après 23h', 'moon', 'horaires', 75),
  ('weekend_warrior', 'Guerrier du Week-end', 'Lire le samedi ET le dimanche du même week-end', 'calendar-days', 'horaires', 100)

ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  category = EXCLUDED.category,
  xp_reward = EXCLUDED.xp_reward;

-- ============================================================================
-- 3. ENSURE USER_QUESTS TABLE IS CORRECT
-- ============================================================================

-- Verify user_quests table exists and has proper constraints
DO $$
BEGIN
  -- Add foreign key if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'user_quests_quest_slug_fkey'
  ) THEN
    ALTER TABLE public.user_quests
    ADD CONSTRAINT user_quests_quest_slug_fkey
    FOREIGN KEY (quest_slug) REFERENCES public.quests(slug)
    ON DELETE CASCADE;
  END IF;
END $$;

-- ============================================================================
-- 4. COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE public.quests IS 'All available challenging quests in the system (different from badges - more difficult and event-based)';
COMMENT ON COLUMN public.quests.slug IS 'Unique identifier for the quest (used in user_quests)';
COMMENT ON COLUMN public.quests.category IS 'Quest category: marathons (intense), vitesse (speed), variete (variety), regularite (consistency), horaires (timing)';
COMMENT ON COLUMN public.quests.xp_reward IS 'XP points awarded when quest is completed (75-300 XP for challenging quests)';

-- ============================================================================
-- 5. GRANT PERMISSIONS
-- ============================================================================

-- Allow authenticated users to read quests
GRANT SELECT ON public.quests TO authenticated;
GRANT SELECT ON public.quests TO anon;
