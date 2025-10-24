-- Enhanced Badge System with Auto-Attribution
-- This migration adds 20+ badges and automatic attribution logic

-- ============================================================================
-- 1. ENSURE BADGES TABLE EXISTS AND HAS ALL REQUIRED COLUMNS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  label text NOT NULL,
  description text,
  icon_url text,
  created_at timestamptz DEFAULT now()
);

-- Add missing columns to existing badges table
DO $$
BEGIN
  -- Add icon column for emoji icons (separate from icon_url)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'badges'
    AND column_name = 'icon'
  ) THEN
    ALTER TABLE public.badges ADD COLUMN icon text;
  END IF;

  -- Add color column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'badges'
    AND column_name = 'color'
  ) THEN
    ALTER TABLE public.badges ADD COLUMN color text NOT NULL DEFAULT 'gray-500';
  END IF;

  -- Add rarity column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'badges'
    AND column_name = 'rarity'
  ) THEN
    ALTER TABLE public.badges ADD COLUMN rarity text NOT NULL DEFAULT 'common';
  END IF;

  -- Add category column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'badges'
    AND column_name = 'category'
  ) THEN
    ALTER TABLE public.badges ADD COLUMN category text NOT NULL DEFAULT 'general';
  END IF;
END $$;

-- Add rarity constraint after column is created
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'badges_rarity_check'
  ) THEN
    ALTER TABLE public.badges
    ADD CONSTRAINT badges_rarity_check
    CHECK (rarity IN ('common', 'rare', 'epic', 'legendary'));
  END IF;
END $$;

-- ============================================================================
-- 2. INSERT 25 COMPREHENSIVE BADGES
-- ============================================================================

-- Clear existing test badges
DELETE FROM public.badges WHERE slug IN ('badge_test_insertion');

-- Insert all badges (use ON CONFLICT to allow re-running)
INSERT INTO public.badges (slug, label, description, icon, color, rarity, category) VALUES
  -- LIVRES COMPLÉTÉS (Books Completed)
  ('premier-livre', 'Premier Livre', 'Félicitations ! Vous avez terminé votre premier livre.', '🎉', 'green-500', 'common', 'books'),
  ('lecteur-debutant', 'Lecteur Débutant', 'Vous avez terminé 3 livres. Continue !', '📗', 'green-600', 'common', 'books'),
  ('lecteur-regulier', 'Lecteur Régulier', 'Vous avez terminé 5 livres. Excellent rythme !', '📘', 'blue-500', 'rare', 'books'),
  ('lecteur-passione', 'Lecteur Passionné', 'Vous avez terminé 10 livres. Impressionnant !', '📚', 'blue-600', 'epic', 'books'),
  ('bibliothecaire', 'Bibliothécaire', 'Vous avez terminé 20 livres. Vous êtes une référence !', '📖', 'purple-500', 'epic', 'books'),
  ('erudit', 'Érudit', 'Vous avez terminé 50 livres. Maître de la lecture !', '🏛️', 'amber-500', 'legendary', 'books'),

  -- VALIDATIONS (Segments validated)
  ('premiers-pas', 'Premiers Pas', 'Vous avez validé 10 segments de lecture.', '👣', 'gray-500', 'common', 'validations'),
  ('lecteur-assidu', 'Lecteur Assidu', 'Vous avez validé 50 segments de lecture.', '✅', 'blue-500', 'rare', 'validations'),
  ('marathonien', 'Marathonien', 'Vous avez validé 100 segments de lecture.', '🏃', 'purple-500', 'epic', 'validations'),
  ('champion', 'Champion', 'Vous avez validé 250 segments de lecture.', '🏆', 'amber-500', 'epic', 'validations'),
  ('legendaire', 'Légendaire', 'Vous avez validé 500 segments de lecture.', '👑', 'yellow-500', 'legendary', 'validations'),

  -- STREAKS (Reading streaks)
  ('constance', 'Constance', 'Vous avez lu pendant 3 jours consécutifs.', '💪', 'orange-400', 'common', 'streaks'),
  ('serie-7-jours', 'Série de 7 Jours', 'Vous avez lu pendant 7 jours consécutifs.', '🔥', 'orange-500', 'rare', 'streaks'),
  ('serie-14-jours', 'Série de 14 Jours', 'Vous avez lu pendant 2 semaines consécutives.', '🔥🔥', 'red-500', 'epic', 'streaks'),
  ('serie-30-jours', 'Série de 30 Jours', 'Vous avez lu pendant 30 jours consécutifs. Incroyable !', '🔥🔥🔥', 'red-600', 'epic', 'streaks'),
  ('serie-100-jours', 'Série de 100 Jours', 'Vous avez lu pendant 100 jours consécutifs. Légende !', '⚡', 'yellow-500', 'legendary', 'streaks'),

  -- PAGES (Pages read)
  ('cent-pages', 'Cent Pages', 'Vous avez lu 100 pages.', '📄', 'gray-500', 'common', 'pages'),
  ('cinq-cents-pages', 'Cinq Cents Pages', 'Vous avez lu 500 pages.', '📑', 'blue-500', 'rare', 'pages'),
  ('mille-pages', 'Mille Pages', 'Vous avez lu 1 000 pages. Bravo !', '📚', 'purple-500', 'epic', 'pages'),
  ('cinq-mille-pages', 'Cinq Mille Pages', 'Vous avez lu 5 000 pages. Extraordinaire !', '📖', 'amber-500', 'legendary', 'pages'),

  -- VITESSE (Speed)
  ('lecteur-rapide', 'Lecteur Rapide', 'Vous avez terminé un livre en moins de 7 jours.', '⚡', 'yellow-500', 'rare', 'speed'),
  ('lecture-eclair', 'Lecture Éclair', 'Vous avez terminé un livre en moins de 3 jours.', '⚡⚡', 'yellow-600', 'epic', 'speed'),

  -- VARIÉTÉ (Variety)
  ('explorateur', 'Explorateur', 'Vous avez terminé 3 livres différents en un mois.', '🗺️', 'green-500', 'rare', 'variety'),

  -- RÉGULARITÉ (Regularity)
  ('quotidien', 'Quotidien', 'Vous avez validé au moins 1 segment tous les jours pendant 30 jours.', '📅', 'blue-600', 'epic', 'regularity'),

  -- EARLY ADOPTER
  ('pionnier', 'Pionnier', 'Vous étiez là dès les débuts de VREAD !', '🚀', 'purple-600', 'legendary', 'special')

ON CONFLICT (slug) DO UPDATE SET
  label = EXCLUDED.label,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  color = EXCLUDED.color,
  rarity = EXCLUDED.rarity,
  category = EXCLUDED.category;

-- ============================================================================
-- 3. CREATE ELIGIBILITY VIEWS
-- ============================================================================

-- Helper view: user statistics
CREATE OR REPLACE VIEW v_user_badge_stats AS
SELECT
  p.id AS user_id,

  -- Books completed
  (SELECT COUNT(DISTINCT book_id)
   FROM reading_progress
   WHERE user_id = p.id AND status = 'completed') AS books_completed,

  -- Total validations
  (SELECT COUNT(*)
   FROM reading_validations
   WHERE user_id = p.id) AS total_validations,

  -- Total pages read
  (SELECT COALESCE(SUM(current_page), 0)::int
   FROM reading_progress
   WHERE user_id = p.id) AS pages_read,

  -- Current and best streak
  (SELECT (get_user_streaks(p.id)->>'current')::int) AS streak_current,
  (SELECT (get_user_streaks(p.id)->>'best')::int) AS streak_best,

  -- Books completed this month
  (SELECT COUNT(DISTINCT book_id)
   FROM reading_progress
   WHERE user_id = p.id
     AND status = 'completed'
     AND updated_at >= date_trunc('month', CURRENT_DATE)) AS books_this_month,

  -- Has book completed in less than 7 days
  (SELECT EXISTS(
    SELECT 1 FROM reading_progress
    WHERE user_id = p.id
      AND status = 'completed'
      AND updated_at - started_at < INTERVAL '7 days'
  )) AS has_fast_read_7d,

  -- Has book completed in less than 3 days
  (SELECT EXISTS(
    SELECT 1 FROM reading_progress
    WHERE user_id = p.id
      AND status = 'completed'
      AND updated_at - started_at < INTERVAL '3 days'
  )) AS has_fast_read_3d,

  -- User creation date (for pioneer badge)
  p.created_at AS user_created_at

FROM profiles p;

-- View: All badges users should have but don't
CREATE OR REPLACE VIEW v_missing_badges AS
SELECT
  s.user_id,
  b.id AS badge_id,
  b.slug,
  b.label,
  b.category
FROM v_user_badge_stats s
CROSS JOIN badges b
LEFT JOIN user_badges ub ON ub.user_id = s.user_id AND ub.badge_id = b.id
WHERE ub.id IS NULL  -- User doesn't have this badge yet
AND (
  -- Books badges
  (b.slug = 'premier-livre' AND s.books_completed >= 1) OR
  (b.slug = 'lecteur-debutant' AND s.books_completed >= 3) OR
  (b.slug = 'lecteur-regulier' AND s.books_completed >= 5) OR
  (b.slug = 'lecteur-passione' AND s.books_completed >= 10) OR
  (b.slug = 'bibliothecaire' AND s.books_completed >= 20) OR
  (b.slug = 'erudit' AND s.books_completed >= 50) OR

  -- Validations badges
  (b.slug = 'premiers-pas' AND s.total_validations >= 10) OR
  (b.slug = 'lecteur-assidu' AND s.total_validations >= 50) OR
  (b.slug = 'marathonien' AND s.total_validations >= 100) OR
  (b.slug = 'champion' AND s.total_validations >= 250) OR
  (b.slug = 'legendaire' AND s.total_validations >= 500) OR

  -- Streak badges
  (b.slug = 'constance' AND s.streak_best >= 3) OR
  (b.slug = 'serie-7-jours' AND s.streak_best >= 7) OR
  (b.slug = 'serie-14-jours' AND s.streak_best >= 14) OR
  (b.slug = 'serie-30-jours' AND s.streak_best >= 30) OR
  (b.slug = 'serie-100-jours' AND s.streak_best >= 100) OR

  -- Pages badges
  (b.slug = 'cent-pages' AND s.pages_read >= 100) OR
  (b.slug = 'cinq-cents-pages' AND s.pages_read >= 500) OR
  (b.slug = 'mille-pages' AND s.pages_read >= 1000) OR
  (b.slug = 'cinq-mille-pages' AND s.pages_read >= 5000) OR

  -- Speed badges
  (b.slug = 'lecteur-rapide' AND s.has_fast_read_7d) OR
  (b.slug = 'lecture-eclair' AND s.has_fast_read_3d) OR

  -- Variety badge
  (b.slug = 'explorateur' AND s.books_this_month >= 3) OR

  -- Pioneer badge (users created before a certain date)
  (b.slug = 'pionnier' AND s.user_created_at < '2025-11-01'::date)
);

-- ============================================================================
-- 4. AUTO-ATTRIBUTION FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION auto_grant_badges(p_user_id uuid DEFAULT NULL)
RETURNS TABLE(granted_user_id uuid, granted_badge_id uuid, badge_name text, newly_granted boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- If user_id specified, grant only for that user. Otherwise, grant for all users.
  RETURN QUERY
  INSERT INTO user_badges (user_id, badge_id, earned_at)
  SELECT
    mb.user_id,
    mb.badge_id,
    NOW()
  FROM v_missing_badges mb
  WHERE (p_user_id IS NULL OR mb.user_id = p_user_id)
  ON CONFLICT (user_id, badge_id) DO NOTHING
  RETURNING
    user_badges.user_id,
    user_badges.badge_id,
    (SELECT label FROM badges WHERE id = user_badges.badge_id),
    true;
END;
$$;

-- Add constraint to ensure unique user-badge combination
ALTER TABLE user_badges
DROP CONSTRAINT IF EXISTS user_badges_user_id_badge_id_key;

ALTER TABLE user_badges
ADD CONSTRAINT user_badges_user_id_badge_id_key UNIQUE (user_id, badge_id);

-- ============================================================================
-- 5. COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE badges IS 'All available badges in the system';
COMMENT ON VIEW v_user_badge_stats IS 'Computed statistics for each user to determine badge eligibility';
COMMENT ON VIEW v_missing_badges IS 'Badges that users are eligible for but haven''t been granted yet';
COMMENT ON FUNCTION auto_grant_badges(uuid) IS 'Automatically grants all eligible badges to users. Call with NULL to process all users, or with user_id for specific user.';

-- ============================================================================
-- 6. GRANT ALL MISSING BADGES TO EXISTING USERS (ONE-TIME)
-- ============================================================================

-- Run auto-attribution for all users
SELECT * FROM auto_grant_badges(NULL);
