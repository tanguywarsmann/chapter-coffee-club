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
CHECK (category IN ('horaire', 'validations', 'livres', 'vitesse', 'regularite'));

-- Add index on slug for faster lookups
CREATE INDEX IF NOT EXISTS idx_quests_slug ON public.quests(slug);

-- ============================================================================
-- 2. INSERT 12 QUESTS
-- ============================================================================

INSERT INTO public.quests (slug, title, description, icon, category, xp_reward) VALUES
  -- LECTURE HORAIRE (4 quests)
  ('early_reader', 'Lecteur matinal', 'Lire un livre avant 7h du matin', 'sunrise', 'horaire', 50),
  ('night_owl', 'Marathon nocturne', 'Lire après 22h (noctambule de la lecture)', 'moon', 'horaire', 50),
  ('sunday_reader', 'Lecteur du dimanche', 'Lire un dimanche (détente garantie)', 'coffee', 'horaire', 50),
  ('weekend_warrior', 'Week-end de lecture', 'Lire le samedi ET le dimanche', 'calendar', 'horaire', 75),

  -- VALIDATIONS (2 quests)
  ('triple_valide', 'Triple validation', 'Valider 3 segments de lecture en une seule journée', 'zap', 'validations', 50),
  ('centurion', 'Centurion', 'Valider 100 segments de lecture au total', 'shield', 'validations', 100),

  -- LIVRES (3 quests)
  ('first_book', 'Premier pas', 'Terminer votre tout premier livre', 'book-open', 'livres', 75),
  ('bibliophile', 'Bibliophile', 'Terminer 5 livres au total', 'library', 'livres', 100),
  ('multi_booker', 'Multi-lecteur', 'Avoir 3 livres en cours de lecture simultanément', 'books', 'livres', 50),

  -- VITESSE & RÉGULARITÉ (3 quests)
  ('speed_reader', 'Vitesse de croisière', 'Terminer un livre en moins de 7 jours', 'rocket', 'vitesse', 75),
  ('fire_streak', 'Série de feu', 'Lire pendant 7 jours consécutifs', 'flame', 'regularite', 100),
  ('back_on_track', 'De retour sur les rails', 'Reprendre la lecture après une pause de 7 jours', 'refresh', 'regularite', 50)

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

COMMENT ON TABLE public.quests IS 'All available quests in the system';
COMMENT ON COLUMN public.quests.slug IS 'Unique identifier for the quest (used in user_quests)';
COMMENT ON COLUMN public.quests.category IS 'Quest category: horaire, validations, livres, vitesse, regularite';
COMMENT ON COLUMN public.quests.xp_reward IS 'XP points awarded when quest is completed';

-- ============================================================================
-- 5. GRANT PERMISSIONS
-- ============================================================================

-- Allow authenticated users to read quests
GRANT SELECT ON public.quests TO authenticated;
GRANT SELECT ON public.quests TO anon;
