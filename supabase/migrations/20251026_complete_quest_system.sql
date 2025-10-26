-- ============================================================================
-- COMPLETE QUEST SYSTEM MIGRATION
-- Creates quests table, user_quests table, and populates with 14 challenges
-- ============================================================================

-- ============================================================================
-- 1. CREATE QUESTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.quests (
  slug TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT '🏆',
  category TEXT NOT NULL,
  xp_reward INTEGER NOT NULL DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add category constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'quests_category_check'
  ) THEN
    ALTER TABLE public.quests
    ADD CONSTRAINT quests_category_check
    CHECK (category IN ('marathons', 'vitesse', 'variete', 'regularite', 'horaires'));
  END IF;
END $$;

-- Add index on slug for faster lookups
CREATE INDEX IF NOT EXISTS idx_quests_slug ON public.quests(slug);

-- ============================================================================
-- 2. CREATE USER_QUESTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.user_quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quest_slug TEXT NOT NULL REFERENCES public.quests(slug) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add unique constraint to prevent duplicate quest unlocks
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'user_quests_user_id_quest_slug_key'
  ) THEN
    ALTER TABLE public.user_quests
    ADD CONSTRAINT user_quests_user_id_quest_slug_key UNIQUE (user_id, quest_slug);
  END IF;
END $$;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_quests_user_id ON public.user_quests(user_id);
CREATE INDEX IF NOT EXISTS idx_user_quests_quest_slug ON public.user_quests(quest_slug);
CREATE INDEX IF NOT EXISTS idx_user_quests_unlocked_at ON public.user_quests(unlocked_at);

-- ============================================================================
-- 3. INSERT 14 CHALLENGING QUESTS
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
-- 4. ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS on quests table
ALTER TABLE public.quests ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view quests
CREATE POLICY IF NOT EXISTS "Quests are viewable by everyone"
  ON public.quests FOR SELECT
  TO authenticated, anon
  USING (true);

-- Enable RLS on user_quests table
ALTER TABLE public.user_quests ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own quests
CREATE POLICY IF NOT EXISTS "Users can view their own quests"
  ON public.user_quests FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own quests
CREATE POLICY IF NOT EXISTS "Users can insert their own quests"
  ON public.user_quests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy: Service role can do everything
CREATE POLICY IF NOT EXISTS "Service role has full access to user_quests"
  ON public.user_quests
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- 5. GRANT PERMISSIONS
-- ============================================================================

-- Grant permissions on quests table
GRANT SELECT ON public.quests TO authenticated;
GRANT SELECT ON public.quests TO anon;

-- Grant permissions on user_quests table
GRANT SELECT, INSERT ON public.user_quests TO authenticated;

-- ============================================================================
-- 6. COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE public.quests IS 'All available challenging quests in the system (different from badges - more difficult and event-based)';
COMMENT ON COLUMN public.quests.slug IS 'Unique identifier for the quest (used in user_quests)';
COMMENT ON COLUMN public.quests.category IS 'Quest category: marathons (intense), vitesse (speed), variete (variety), regularite (consistency), horaires (timing)';
COMMENT ON COLUMN public.quests.xp_reward IS 'XP points awarded when quest is completed (75-300 XP for challenging quests)';

COMMENT ON TABLE public.user_quests IS 'User quest completion records - tracks which quests each user has unlocked';
COMMENT ON COLUMN public.user_quests.user_id IS 'Reference to the user who unlocked the quest';
COMMENT ON COLUMN public.user_quests.quest_slug IS 'Reference to the quest that was unlocked';
COMMENT ON COLUMN public.user_quests.unlocked_at IS 'Timestamp when the quest was completed';
