-- Fix streaks calculation to use reading_validations instead of reading_progress
-- This replaces the buggy localStorage-based streak system with proper SQL calculation

-- Function to calculate user streaks based on daily validation activity
CREATE OR REPLACE FUNCTION public.get_user_streaks(p_user uuid)
RETURNS JSONB
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
WITH daily_validations AS (
  -- Get distinct days where user had validation activity
  SELECT DISTINCT DATE(validated_at AT TIME ZONE 'Europe/Paris') AS day
  FROM reading_validations
  WHERE user_id = p_user
  ORDER BY day DESC
),
streak_calc AS (
  -- Calculate streak groups using gap and islands technique
  -- Consecutive days will have the same group value
  SELECT
    day,
    day - (ROW_NUMBER() OVER (ORDER BY day))::int AS grp
  FROM daily_validations
),
runs AS (
  -- Aggregate consecutive days into runs/streaks
  SELECT
    MIN(day) AS start_day,
    MAX(day) AS end_day,
    COUNT(*)::int AS len
  FROM streak_calc
  GROUP BY grp
)
SELECT jsonb_build_object(
  -- Current streak: number of consecutive days up to today
  'current', COALESCE((
    SELECT len
    FROM runs
    WHERE end_day = CURRENT_DATE
  ), 0),

  -- Best streak: longest historical streak
  'best', COALESCE((
    SELECT MAX(len)
    FROM runs
  ), 0),

  -- Whether user has activity today
  'todayHasActivity', EXISTS(
    SELECT 1
    FROM daily_validations
    WHERE day = CURRENT_DATE
  ),

  -- Yesterday's activity (for notifications)
  'yesterdayHasActivity', EXISTS(
    SELECT 1
    FROM daily_validations
    WHERE day = CURRENT_DATE - INTERVAL '1 day'
  )
);
$$;

-- Update get_user_stats to use the new streak calculation
CREATE OR REPLACE FUNCTION public.get_user_stats(uid uuid)
RETURNS TABLE(
  books_read integer,
  pages_read integer,
  badges_count integer,
  streak_current integer,
  streak_best integer,
  quests_done integer,
  xp integer,
  lvl integer
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  WITH user_streaks AS (
    SELECT get_user_streaks(uid) AS streaks
  )
  SELECT
    /* Livres terminés */
    (SELECT count(*)::int
       FROM reading_progress
      WHERE user_id = uid
        AND status = 'completed') AS books_read,

    /* Pages lues en temps réel (= somme des current_page) */
    (SELECT coalesce(sum(current_page), 0)::int
       FROM reading_progress
      WHERE user_id = uid) AS pages_read,

    /* Badges */
    (SELECT count(*)::int
       FROM user_badges
      WHERE user_id = uid) AS badges_count,

    /* Streaks - NOW USING get_user_streaks() */
    (SELECT (streaks->>'current')::int FROM user_streaks) AS streak_current,
    (SELECT (streaks->>'best')::int FROM user_streaks) AS streak_best,

    /* Quêtes accomplies */
    (SELECT count(*)::int
       FROM user_quests
      WHERE user_id = uid) AS quests_done,

    /* XP & Niveau */
    (SELECT coalesce(xp, 0)::int FROM user_levels WHERE user_id = uid) AS xp,
    (SELECT coalesce(level, 1)::int FROM user_levels WHERE user_id = uid) AS lvl
$function$;

-- Add helpful comment
COMMENT ON FUNCTION public.get_user_streaks(uuid) IS
'Calculates current and best reading streaks based on daily validation activity. Returns JSON with current, best, todayHasActivity, and yesterdayHasActivity.';

COMMENT ON FUNCTION public.get_user_stats(uuid) IS
'Returns comprehensive user statistics including books read, pages read, badges, streaks, quests, XP and level. Streaks are calculated from reading_validations table.';
