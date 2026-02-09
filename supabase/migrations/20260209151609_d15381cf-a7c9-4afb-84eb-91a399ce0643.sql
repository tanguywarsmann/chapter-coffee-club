
-- Phase 0: Indexes
CREATE INDEX IF NOT EXISTS idx_user_badges_earned_at ON user_badges(earned_at);
CREATE INDEX IF NOT EXISTS idx_book_completion_awards_awarded_at ON book_completion_awards(awarded_at);
CREATE INDEX IF NOT EXISTS idx_user_monthly_rewards_user_unlocked ON user_monthly_rewards(user_id, unlocked_at);

-- Phase 1: Cleanup (no auto_grant_badges since v_missing_badges view doesn't exist)
DO $$
DECLARE
  v_count INTEGER;
  v_user RECORD;
  v_reading_days INTEGER;
  v_last_date DATE;
  v_segments_week INTEGER;
  v_current_streak INTEGER;
  v_longest_streak INTEGER;
  v_stage INTEGER;
BEGIN
  SET LOCAL lock_timeout = '2s';
  SET LOCAL statement_timeout = '10min';

  CREATE TEMP TABLE tmp_fake_users AS
    SELECT id FROM profiles WHERE created_at >= '2024-01-01' AND created_at < '2025-01-01';

  CREATE TEMP TABLE tmp_impacted_real_users AS
    SELECT DISTINCT u.id FROM profiles u
    WHERE u.id NOT IN (SELECT id FROM tmp_fake_users)
      AND (
        EXISTS (SELECT 1 FROM user_badges ub WHERE ub.user_id = u.id AND ub.earned_at >= '2025-10-01' AND ub.earned_at < '2025-11-01')
        OR EXISTS (SELECT 1 FROM reading_validations rv WHERE rv.user_id = u.id AND rv.validated_at >= '2025-10-01' AND rv.validated_at < '2025-11-01')
        OR EXISTS (SELECT 1 FROM feed_events fe WHERE fe.actor_id = u.id AND fe.created_at >= '2025-10-01' AND fe.created_at < '2025-11-01')
        OR EXISTS (SELECT 1 FROM book_completion_awards bca WHERE bca.user_id = u.id AND bca.awarded_at >= '2025-10-01' AND bca.awarded_at < '2025-11-01')
        OR EXISTS (SELECT 1 FROM user_monthly_rewards umr WHERE umr.user_id = u.id AND umr.unlocked_at >= '2025-10-01' AND umr.unlocked_at < '2025-11-01')
      );

  SELECT COUNT(*) INTO v_count FROM tmp_impacted_real_users;
  RAISE NOTICE 'Impacted real users: %', v_count;

  -- Guard rails
  SELECT COUNT(*) INTO v_count FROM user_badges WHERE user_id IN (SELECT id FROM tmp_impacted_real_users) AND earned_at >= '2025-10-01' AND earned_at < '2025-11-01';
  IF v_count > 2612 THEN RAISE EXCEPTION 'ABORT: user_badges count % exceeds 2x', v_count; END IF;
  RAISE NOTICE 'user_badges to delete: %', v_count;

  SELECT COUNT(*) INTO v_count FROM reading_validations WHERE user_id IN (SELECT id FROM tmp_impacted_real_users) AND validated_at >= '2025-10-01' AND validated_at < '2025-11-01';
  IF v_count > 292 THEN RAISE EXCEPTION 'ABORT: reading_validations count % exceeds 2x', v_count; END IF;
  RAISE NOTICE 'reading_validations to delete: %', v_count;

  SELECT COUNT(*) INTO v_count FROM feed_events WHERE actor_id IN (SELECT id FROM tmp_impacted_real_users) AND created_at >= '2025-10-01' AND created_at < '2025-11-01';
  IF v_count > 1040 THEN RAISE EXCEPTION 'ABORT: feed_events count % exceeds 2x', v_count; END IF;
  RAISE NOTICE 'feed_events to delete: %', v_count;

  -- Deletions
  DELETE FROM feed_bookys WHERE event_id IN (SELECT fe.id FROM feed_events fe WHERE fe.actor_id IN (SELECT id FROM tmp_impacted_real_users) AND fe.created_at >= '2025-10-01' AND fe.created_at < '2025-11-01');
  GET DIAGNOSTICS v_count = ROW_COUNT; RAISE NOTICE 'Deleted % feed_bookys', v_count;

  DELETE FROM feed_events WHERE actor_id IN (SELECT id FROM tmp_impacted_real_users) AND created_at >= '2025-10-01' AND created_at < '2025-11-01';
  GET DIAGNOSTICS v_count = ROW_COUNT; RAISE NOTICE 'Deleted % feed_events', v_count;

  DELETE FROM user_badges WHERE user_id IN (SELECT id FROM tmp_impacted_real_users) AND earned_at >= '2025-10-01' AND earned_at < '2025-11-01';
  GET DIAGNOSTICS v_count = ROW_COUNT; RAISE NOTICE 'Deleted % user_badges', v_count;

  DELETE FROM book_completion_awards WHERE user_id IN (SELECT id FROM tmp_impacted_real_users) AND awarded_at >= '2025-10-01' AND awarded_at < '2025-11-01';
  GET DIAGNOSTICS v_count = ROW_COUNT; RAISE NOTICE 'Deleted % book_completion_awards', v_count;

  DELETE FROM user_monthly_rewards WHERE user_id IN (SELECT id FROM tmp_impacted_real_users) AND unlocked_at >= '2025-10-01' AND unlocked_at < '2025-11-01';
  GET DIAGNOSTICS v_count = ROW_COUNT; RAISE NOTICE 'Deleted % user_monthly_rewards', v_count;

  DELETE FROM reading_validations WHERE user_id IN (SELECT id FROM tmp_impacted_real_users) AND validated_at >= '2025-10-01' AND validated_at < '2025-11-01';
  GET DIAGNOSTICS v_count = ROW_COUNT; RAISE NOTICE 'Deleted % reading_validations', v_count;

  -- Orphan progress
  DELETE FROM reading_progress WHERE user_id IN (SELECT id FROM tmp_impacted_real_users) AND NOT EXISTS (SELECT 1 FROM reading_validations rv WHERE rv.progress_id = reading_progress.id);
  GET DIAGNOSTICS v_count = ROW_COUNT; RAISE NOTICE 'Deleted % orphan reading_progress', v_count;

  -- Recalculate progress
  UPDATE reading_progress
  SET current_page = sub.max_seg * 30,
      status = (CASE WHEN sub.vcnt >= sub.expected THEN 'completed' ELSE 'in_progress' END)::reading_status,
      completed_at = CASE WHEN sub.vcnt >= sub.expected THEN sub.last_v ELSE NULL END,
      updated_at = NOW()
  FROM (
    SELECT rv.progress_id, MAX(rv.segment) AS max_seg, COUNT(DISTINCT rv.segment) AS vcnt, MAX(rv.validated_at) AS last_v, COALESCE(b.expected_segments, 999999) AS expected
    FROM reading_validations rv JOIN reading_progress rp2 ON rp2.id = rv.progress_id JOIN books b ON b.id = rp2.book_id
    WHERE rv.user_id IN (SELECT id FROM tmp_impacted_real_users)
    GROUP BY rv.progress_id, b.expected_segments
  ) sub
  WHERE reading_progress.id = sub.progress_id AND reading_progress.user_id IN (SELECT id FROM tmp_impacted_real_users);
  GET DIAGNOSTICS v_count = ROW_COUNT; RAISE NOTICE 'Recalculated % reading_progress', v_count;

  -- Companion recalc
  FOR v_user IN SELECT id FROM tmp_impacted_real_users LOOP
    SELECT COUNT(DISTINCT DATE(validated_at)) INTO v_reading_days FROM reading_validations WHERE user_id = v_user.id;
    SELECT MAX(DATE(validated_at)) INTO v_last_date FROM reading_validations WHERE user_id = v_user.id;
    SELECT COUNT(*) INTO v_segments_week FROM reading_validations WHERE user_id = v_user.id AND validated_at >= date_trunc('week', CURRENT_DATE);

    WITH daily AS (SELECT DISTINCT DATE(validated_at) AS day FROM reading_validations WHERE user_id = v_user.id ORDER BY day DESC),
    numbered AS (SELECT day, day - (ROW_NUMBER() OVER (ORDER BY day DESC))::int AS grp FROM daily),
    runs AS (SELECT MAX(day) AS end_day, COUNT(*)::int AS len FROM numbered GROUP BY grp)
    SELECT COALESCE((SELECT len FROM runs WHERE end_day >= CURRENT_DATE - 1 ORDER BY end_day DESC LIMIT 1), 0) INTO v_current_streak;

    WITH daily AS (SELECT DISTINCT DATE(validated_at) AS day FROM reading_validations WHERE user_id = v_user.id),
    numbered AS (SELECT day, day - (ROW_NUMBER() OVER (ORDER BY day))::int AS grp FROM daily),
    runs AS (SELECT COUNT(*)::int AS len FROM numbered GROUP BY grp)
    SELECT COALESCE(MAX(len), 0) INTO v_longest_streak FROM runs;

    v_stage := CASE WHEN v_reading_days >= 50 THEN 5 WHEN v_reading_days >= 21 THEN 4 WHEN v_reading_days >= 7 THEN 3 WHEN v_reading_days >= 1 THEN 2 ELSE 1 END;

    UPDATE user_companion SET total_reading_days = v_reading_days, current_streak = v_current_streak, longest_streak = v_longest_streak, last_reading_date = v_last_date, segments_this_week = v_segments_week, current_stage = v_stage, updated_at = NOW() WHERE user_id = v_user.id;
  END LOOP;
  RAISE NOTICE 'Recalculated user_companion';

  -- XP only (auto_grant_badges skipped: v_missing_badges view missing)
  FOR v_user IN SELECT id FROM tmp_impacted_real_users LOOP
    PERFORM rebuild_user_xp(v_user.id);
  END LOOP;
  RAISE NOTICE 'Rebuilt XP for all impacted users';

  DROP TABLE tmp_fake_users;
  DROP TABLE tmp_impacted_real_users;
END $$;
