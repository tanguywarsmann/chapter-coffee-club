
-- ============================================
-- ADMIN METRICS DASHBOARD — ALL RPCs
-- ============================================

-- 1. KPIs Overview
CREATE OR REPLACE FUNCTION admin_get_kpis(p_days int DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_start timestamptz;
  v_prev_start timestamptz;
  v_prev_end timestamptz;
BEGIN
  IF NOT get_current_user_admin_status() THEN
    RETURN '{"error":"unauthorized"}'::jsonb;
  END IF;

  IF p_days IS NOT NULL THEN
    v_start := now() - make_interval(days => p_days);
    v_prev_end := v_start;
    v_prev_start := v_start - make_interval(days => p_days);
  END IF;

  RETURN (
    WITH cp AS (
      SELECT
        (SELECT count(*) FROM profiles) AS total_users,
        (SELECT count(DISTINCT user_id) FROM reading_validations WHERE v_start IS NULL OR validated_at >= v_start) AS active_users,
        (SELECT count(*) FROM profiles WHERE is_premium = true) AS premium_users,
        (SELECT count(*) FROM reading_validations WHERE correct = true AND (v_start IS NULL OR validated_at >= v_start)) AS segments,
        (SELECT count(*) FROM reading_progress WHERE status = 'completed' AND (v_start IS NULL OR completed_at >= v_start)) AS books,
        (SELECT coalesce(round(avg(xp)::numeric, 0), 0) FROM user_levels ul
         WHERE EXISTS(SELECT 1 FROM reading_validations rv WHERE rv.user_id = ul.user_id AND (v_start IS NULL OR rv.validated_at >= v_start))) AS avg_xp
    ),
    pp AS (
      SELECT
        (SELECT count(DISTINCT user_id) FROM reading_validations WHERE v_prev_start IS NOT NULL AND validated_at >= v_prev_start AND validated_at < v_prev_end) AS active_users,
        (SELECT count(*) FROM reading_validations WHERE correct = true AND v_prev_start IS NOT NULL AND validated_at >= v_prev_start AND validated_at < v_prev_end) AS segments,
        (SELECT count(*) FROM reading_progress WHERE status = 'completed' AND v_prev_start IS NOT NULL AND completed_at >= v_prev_start AND completed_at < v_prev_end) AS books
    )
    SELECT jsonb_build_object(
      'total_users', cp.total_users,
      'active_users', cp.active_users,
      'premium_users', cp.premium_users,
      'conversion_rate', CASE WHEN cp.total_users > 0 THEN round(cp.premium_users::numeric / cp.total_users * 100, 1) ELSE 0 END,
      'segments_validated', cp.segments,
      'books_completed', cp.books,
      'north_star', CASE WHEN cp.active_users > 0 THEN round(cp.segments::numeric / cp.active_users / GREATEST(coalesce(p_days, 365)::numeric / 7, 1), 2) ELSE 0 END,
      'avg_xp', cp.avg_xp,
      'delta_active', CASE WHEN pp.active_users > 0 THEN round((cp.active_users - pp.active_users)::numeric / pp.active_users * 100, 1) END,
      'delta_segments', CASE WHEN pp.segments > 0 THEN round((cp.segments - pp.segments)::numeric / pp.segments * 100, 1) END,
      'delta_books', CASE WHEN pp.books > 0 THEN round((cp.books - pp.books)::numeric / pp.books * 100, 1) END
    )
    FROM cp, pp
  );
END; $$;

-- 2. Cohort Retention
CREATE OR REPLACE FUNCTION admin_get_cohort_retention(p_weeks int DEFAULT 12)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT get_current_user_admin_status() THEN RETURN '{"error":"unauthorized"}'::jsonb; END IF;

  RETURN (
    WITH cohort_users AS (
      SELECT id AS user_id, created_at AS signup_at,
             date_trunc('week', created_at)::date AS cohort_week
      FROM profiles
      WHERE created_at >= now() - make_interval(weeks => p_weeks)
    ),
    user_retention AS (
      SELECT cu.cohort_week, cu.user_id,
        bool_or(rv.validated_at::date - cu.signup_at::date between 0 and 0) AS d0,
        bool_or(rv.validated_at::date - cu.signup_at::date between 0 and 1) AS d1,
        bool_or(rv.validated_at::date - cu.signup_at::date between 0 and 3) AS d3,
        bool_or(rv.validated_at::date - cu.signup_at::date between 0 and 7) AS d7,
        bool_or(rv.validated_at::date - cu.signup_at::date between 0 and 14) AS d14,
        bool_or(rv.validated_at::date - cu.signup_at::date between 0 and 30) AS d30,
        bool_or(rv.validated_at::date - cu.signup_at::date between 0 and 60) AS d60,
        bool_or(rv.validated_at::date - cu.signup_at::date between 0 and 90) AS d90
      FROM cohort_users cu
      LEFT JOIN reading_validations rv ON rv.user_id = cu.user_id AND rv.validated_at >= cu.signup_at
      GROUP BY cu.cohort_week, cu.user_id
    )
    SELECT coalesce(jsonb_agg(row_to_json(r)::jsonb ORDER BY r.cohort_week DESC), '[]'::jsonb)
    FROM (
      SELECT cohort_week,
        count(*) AS cohort_size,
        count(*) FILTER (WHERE d0) AS d0,
        count(*) FILTER (WHERE d1) AS d1,
        count(*) FILTER (WHERE d3) AS d3,
        count(*) FILTER (WHERE d7) AS d7,
        count(*) FILTER (WHERE d14) AS d14,
        count(*) FILTER (WHERE d30) AS d30,
        count(*) FILTER (WHERE d60) AS d60,
        count(*) FILTER (WHERE d90) AS d90,
        round(extract(epoch from (now() - cohort_week::timestamptz)) / 86400)::int AS cohort_age_days
      FROM user_retention
      GROUP BY cohort_week
    ) r
  );
END; $$;

-- 3. Activation Funnel
CREATE OR REPLACE FUNCTION admin_get_activation_funnel(p_days int DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE v_start timestamptz;
BEGIN
  IF NOT get_current_user_admin_status() THEN RETURN '{"error":"unauthorized"}'::jsonb; END IF;
  IF p_days IS NOT NULL THEN v_start := now() - make_interval(days => p_days); END IF;

  RETURN (
    WITH target_users AS (
      SELECT id FROM profiles WHERE v_start IS NULL OR created_at >= v_start
    )
    SELECT jsonb_build_array(
      jsonb_build_object('step', 'Inscrits', 'value', (SELECT count(*) FROM target_users)),
      jsonb_build_object('step', '1er livre choisi', 'value', (SELECT count(DISTINCT rp.user_id) FROM reading_progress rp JOIN target_users u ON u.id = rp.user_id)),
      jsonb_build_object('step', '1 segment validé', 'value', (SELECT count(DISTINCT rv.user_id) FROM reading_validations rv JOIN target_users u ON u.id = rv.user_id WHERE rv.correct = true)),
      jsonb_build_object('step', '3 segments validés', 'value', (SELECT count(*) FROM (SELECT rv.user_id FROM reading_validations rv JOIN target_users u ON u.id = rv.user_id WHERE rv.correct = true GROUP BY rv.user_id HAVING count(*) >= 3) x)),
      jsonb_build_object('step', '10 segments validés', 'value', (SELECT count(*) FROM (SELECT rv.user_id FROM reading_validations rv JOIN target_users u ON u.id = rv.user_id WHERE rv.correct = true GROUP BY rv.user_id HAVING count(*) >= 10) x)),
      jsonb_build_object('step', '1 livre complété', 'value', (SELECT count(DISTINCT rp.user_id) FROM reading_progress rp JOIN target_users u ON u.id = rp.user_id WHERE rp.status = 'completed')),
      jsonb_build_object('step', 'Premium', 'value', (SELECT count(*) FROM profiles p JOIN target_users u ON u.id = p.id WHERE p.is_premium = true))
    )
  );
END; $$;

-- 4. Engagement Stats
CREATE OR REPLACE FUNCTION admin_get_engagement(p_days int DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE v_start timestamptz;
BEGIN
  IF NOT get_current_user_admin_status() THEN RETURN '{"error":"unauthorized"}'::jsonb; END IF;
  IF p_days IS NOT NULL THEN v_start := now() - make_interval(days => p_days); END IF;

  RETURN (
    WITH
    freq_dist AS (
      SELECT bucket, count(*) AS cnt FROM (
        SELECT user_id,
          LEAST(width_bucket(
            count(DISTINCT validated_at::date)::numeric / GREATEST(coalesce(p_days, 90)::numeric / 7, 1),
            0, 7.01, 7
          ), 7) AS bucket
        FROM reading_validations
        WHERE v_start IS NULL OR validated_at >= v_start
        GROUP BY user_id
      ) x GROUP BY bucket
    ),
    wau_mau_data AS (
      SELECT
        date_trunc('week', w.week_start)::date AS week,
        (SELECT count(DISTINCT user_id) FROM reading_validations WHERE validated_at >= w.week_start AND validated_at < w.week_start + interval '7 days') AS wau,
        (SELECT count(DISTINCT user_id) FROM reading_validations WHERE validated_at >= w.week_start - interval '23 days' AND validated_at < w.week_start + interval '7 days') AS mau
      FROM generate_series(
        date_trunc('week', now() - interval '11 weeks'),
        date_trunc('week', now()),
        interval '1 week'
      ) AS w(week_start)
    ),
    seg_dist AS (
      SELECT
        CASE
          WHEN cnt <= 5 THEN '0-5'
          WHEN cnt <= 10 THEN '6-10'
          WHEN cnt <= 20 THEN '11-20'
          WHEN cnt <= 50 THEN '21-50'
          ELSE '50+'
        END AS bucket,
        count(*) AS users
      FROM (
        SELECT user_id, count(*) AS cnt FROM reading_validations
        WHERE correct = true AND (v_start IS NULL OR validated_at >= v_start)
        GROUP BY user_id
      ) x GROUP BY 1
    ),
    avg_gap AS (
      SELECT round(avg(gap_hours) / 24, 1) AS avg_days FROM (
        SELECT extract(epoch from (validated_at - lag(validated_at) OVER (PARTITION BY user_id, book_id ORDER BY validated_at))) / 3600 AS gap_hours
        FROM reading_validations
        WHERE v_start IS NULL OR validated_at >= v_start
      ) x WHERE gap_hours IS NOT NULL AND gap_hours > 0.1
    ),
    bip AS (
      SELECT round(avg(cnt)::numeric, 1) AS avg_books FROM (
        SELECT user_id, count(*) AS cnt FROM reading_progress
        WHERE status = 'in_progress'
          AND user_id IN (SELECT DISTINCT user_id FROM reading_validations WHERE v_start IS NULL OR validated_at >= v_start)
        GROUP BY user_id
      ) x
    ),
    streak_dist AS (
      SELECT
        CASE WHEN longest_streak = 0 THEN '0'
             WHEN longest_streak <= 3 THEN '1-3'
             WHEN longest_streak <= 7 THEN '4-7'
             WHEN longest_streak <= 14 THEN '8-14'
             WHEN longest_streak <= 30 THEN '15-30'
             ELSE '30+' END AS bucket,
        count(*) AS cnt
      FROM user_companion GROUP BY 1
    ),
    streak_stats AS (
      SELECT
        round(count(*) FILTER (WHERE longest_streak > 7)::numeric / GREATEST(count(*), 1) * 100, 1) AS pct_7,
        round(count(*) FILTER (WHERE longest_streak > 30)::numeric / GREATEST(count(*), 1) * 100, 1) AS pct_30,
        round(avg(current_streak)::numeric, 1) AS avg_current
      FROM user_companion
    )
    SELECT jsonb_build_object(
      'frequency_distribution', (SELECT coalesce(jsonb_agg(jsonb_build_object('bucket', bucket, 'count', cnt) ORDER BY bucket), '[]'::jsonb) FROM freq_dist),
      'wau_mau', (SELECT coalesce(jsonb_agg(jsonb_build_object('week', week, 'wau', wau, 'mau', mau, 'ratio', CASE WHEN mau > 0 THEN round(wau::numeric / mau * 100, 1) ELSE 0 END) ORDER BY week), '[]'::jsonb) FROM wau_mau_data),
      'segments_distribution', (SELECT coalesce(jsonb_agg(jsonb_build_object('bucket', bucket, 'users', users)), '[]'::jsonb) FROM seg_dist),
      'avg_gap_days', (SELECT avg_days FROM avg_gap),
      'avg_books_in_progress', (SELECT avg_books FROM bip),
      'streak_distribution', (SELECT coalesce(jsonb_agg(jsonb_build_object('bucket', bucket, 'count', cnt)), '[]'::jsonb) FROM streak_dist),
      'pct_streak_7', (SELECT pct_7 FROM streak_stats),
      'pct_streak_30', (SELECT pct_30 FROM streak_stats),
      'avg_current_streak', (SELECT avg_current FROM streak_stats)
    )
  );
END; $$;

-- 5. Social Retention Split
CREATE OR REPLACE FUNCTION admin_get_social_retention()
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT get_current_user_admin_status() THEN RETURN '{"error":"unauthorized"}'::jsonb; END IF;

  RETURN (
    WITH social_set AS (
      SELECT DISTINCT x.uid FROM (
        SELECT follower_id AS uid FROM followers
        UNION
        SELECT following_id AS uid FROM followers
      ) x
    ),
    user_ret AS (
      SELECT p.id AS user_id,
        EXISTS(SELECT 1 FROM social_set s WHERE s.uid = p.id) AS has_social,
        EXISTS(SELECT 1 FROM reading_validations rv WHERE rv.user_id = p.id AND rv.validated_at::date - p.created_at::date BETWEEN 0 AND 7) AS d7,
        EXISTS(SELECT 1 FROM reading_validations rv WHERE rv.user_id = p.id AND rv.validated_at::date - p.created_at::date BETWEEN 0 AND 14) AS d14,
        EXISTS(SELECT 1 FROM reading_validations rv WHERE rv.user_id = p.id AND rv.validated_at::date - p.created_at::date BETWEEN 0 AND 30) AS d30
      FROM profiles p
    )
    SELECT jsonb_build_object(
      'social', jsonb_build_object(
        'count', count(*) FILTER (WHERE has_social),
        'd7', round(count(*) FILTER (WHERE has_social AND d7)::numeric / GREATEST(count(*) FILTER (WHERE has_social), 1) * 100, 1),
        'd14', round(count(*) FILTER (WHERE has_social AND d14)::numeric / GREATEST(count(*) FILTER (WHERE has_social), 1) * 100, 1),
        'd30', round(count(*) FILTER (WHERE has_social AND d30)::numeric / GREATEST(count(*) FILTER (WHERE has_social), 1) * 100, 1)
      ),
      'no_social', jsonb_build_object(
        'count', count(*) FILTER (WHERE NOT has_social),
        'd7', round(count(*) FILTER (WHERE NOT has_social AND d7)::numeric / GREATEST(count(*) FILTER (WHERE NOT has_social), 1) * 100, 1),
        'd14', round(count(*) FILTER (WHERE NOT has_social AND d14)::numeric / GREATEST(count(*) FILTER (WHERE NOT has_social), 1) * 100, 1),
        'd30', round(count(*) FILTER (WHERE NOT has_social AND d30)::numeric / GREATEST(count(*) FILTER (WHERE NOT has_social), 1) * 100, 1)
      )
    ) FROM user_ret
  );
END; $$;

-- 6. Conversion Stats
CREATE OR REPLACE FUNCTION admin_get_conversion(p_days int DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE v_start timestamptz;
BEGIN
  IF NOT get_current_user_admin_status() THEN RETURN '{"error":"unauthorized"}'::jsonb; END IF;
  IF p_days IS NOT NULL THEN v_start := now() - make_interval(days => p_days); END IF;

  RETURN (
    WITH cohort_conv AS (
      SELECT
        date_trunc('week', created_at)::date AS cohort_week,
        count(*) AS total,
        count(*) FILTER (WHERE is_premium = true) AS premium
      FROM profiles
      WHERE v_start IS NULL OR created_at >= v_start
      GROUP BY 1 ORDER BY 1 DESC
    ),
    delay AS (
      SELECT round(avg(extract(epoch from (premium_since - created_at)) / 86400)::numeric, 1) AS avg_days
      FROM profiles WHERE is_premium = true AND premium_since IS NOT NULL
    ),
    seg_before AS (
      SELECT
        round(avg(cnt)::numeric, 1) AS avg_seg,
        round(percentile_cont(0.5) WITHIN GROUP (ORDER BY cnt)::numeric, 0) AS median_seg
      FROM (
        SELECT p.id, count(rv.id) AS cnt
        FROM profiles p
        LEFT JOIN reading_validations rv ON rv.user_id = p.id AND rv.validated_at < p.premium_since
        WHERE p.is_premium = true AND p.premium_since IS NOT NULL
        GROUP BY p.id
      ) x
    ),
    churn AS (
      SELECT
        count(*) FILTER (WHERE status = 'canceled') AS canceled,
        count(*) AS total
      FROM customer
    )
    SELECT jsonb_build_object(
      'cohort_conversion', (SELECT coalesce(jsonb_agg(jsonb_build_object('week', cohort_week, 'total', total, 'premium', premium, 'rate', CASE WHEN total > 0 THEN round(premium::numeric / total * 100, 1) ELSE 0 END) ORDER BY cohort_week DESC), '[]'::jsonb) FROM cohort_conv),
      'avg_delay_days', (SELECT avg_days FROM delay),
      'avg_segments_before', (SELECT avg_seg FROM seg_before),
      'median_segments_before', (SELECT median_seg FROM seg_before),
      'premium_active', (SELECT count(*) FROM profiles WHERE is_premium = true),
      'mrr_estimated', round((SELECT count(*) FROM profiles WHERE is_premium = true)::numeric * 3.33, 2),
      'churn_rate', (SELECT CASE WHEN total > 0 THEN round(canceled::numeric / total * 100, 1) END FROM churn),
      'churn_available', (SELECT total > 0 FROM churn)
    )
  );
END; $$;

-- 7. Social Stats
CREATE OR REPLACE FUNCTION admin_get_social_stats()
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT get_current_user_admin_status() THEN RETURN '{"error":"unauthorized"}'::jsonb; END IF;

  RETURN (
    WITH user_conn AS (
      SELECT p.id,
        (SELECT count(*) FROM followers f WHERE f.follower_id = p.id OR f.following_id = p.id) AS connections
      FROM profiles p
    ),
    dist AS (
      SELECT
        CASE
          WHEN connections = 0 THEN '0'
          WHEN connections <= 2 THEN '1-2'
          WHEN connections <= 5 THEN '3-5'
          WHEN connections <= 10 THEN '6-10'
          ELSE '10+'
        END AS bucket,
        count(*) AS cnt
      FROM user_conn GROUP BY 1
    )
    SELECT jsonb_build_object(
      'avg_connections', (SELECT round(avg(connections)::numeric, 2) FROM user_conn),
      'pct_zero', round((SELECT count(*) FROM user_conn WHERE connections = 0)::numeric / GREATEST((SELECT count(*) FROM user_conn), 1) * 100, 1),
      'pct_one_plus', round((SELECT count(*) FROM user_conn WHERE connections >= 1)::numeric / GREATEST((SELECT count(*) FROM user_conn), 1) * 100, 1),
      'pct_three_plus', round((SELECT count(*) FROM user_conn WHERE connections >= 3)::numeric / GREATEST((SELECT count(*) FROM user_conn), 1) * 100, 1),
      'distribution', (SELECT coalesce(jsonb_agg(jsonb_build_object('bucket', bucket, 'count', cnt)), '[]'::jsonb) FROM dist)
    )
  );
END; $$;

-- 8. Catalog Stats
CREATE OR REPLACE FUNCTION admin_get_catalog()
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT get_current_user_admin_status() THEN RETURN '{"error":"unauthorized"}'::jsonb; END IF;

  RETURN (
    WITH book_activity AS (
      SELECT DISTINCT book_id FROM reading_validations
    ),
    top_validated AS (
      SELECT rv.book_id, b.title, b.author, count(*) AS segments
      FROM reading_validations rv JOIN books b ON b.id = rv.book_id
      WHERE rv.correct = true
      GROUP BY rv.book_id, b.title, b.author ORDER BY segments DESC LIMIT 10
    ),
    book_readers AS (
      SELECT book_id, count(*) AS total_readers,
        count(*) FILTER (WHERE status = 'completed') AS completed,
        count(*) FILTER (WHERE status = 'abandoned') AS abandoned
      FROM reading_progress GROUP BY book_id HAVING count(*) >= 3
    ),
    top_completed AS (
      SELECT br.book_id, b.title, b.author,
        round(br.completed::numeric / br.total_readers * 100, 1) AS rate, br.total_readers
      FROM book_readers br JOIN books b ON b.id = br.book_id
      WHERE br.completed > 0
      ORDER BY rate DESC LIMIT 10
    ),
    top_abandoned AS (
      SELECT br.book_id, b.title, b.author,
        round(br.abandoned::numeric / br.total_readers * 100, 1) AS rate, br.total_readers
      FROM book_readers br JOIN books b ON b.id = br.book_id
      WHERE br.abandoned > 0
      ORDER BY rate DESC LIMIT 10
    )
    SELECT jsonb_build_object(
      'total_books', (SELECT count(*) FROM books),
      'published_books', (SELECT count(*) FROM books WHERE is_published = true),
      'books_with_activity', (SELECT count(*) FROM book_activity),
      'books_without_activity', (SELECT count(*) FROM books) - (SELECT count(*) FROM book_activity),
      'avg_expected_segments', (SELECT round(avg(expected_segments)::numeric, 1) FROM books WHERE expected_segments IS NOT NULL),
      'top_validated', (SELECT coalesce(jsonb_agg(row_to_json(tv)::jsonb), '[]'::jsonb) FROM top_validated tv),
      'top_completed', (SELECT coalesce(jsonb_agg(row_to_json(tc)::jsonb), '[]'::jsonb) FROM top_completed tc),
      'top_abandoned', (SELECT coalesce(jsonb_agg(row_to_json(ta)::jsonb), '[]'::jsonb) FROM top_abandoned ta)
    )
  );
END; $$;

-- 9. Alerts
CREATE OR REPLACE FUNCTION admin_get_alerts()
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT get_current_user_admin_status() THEN RETURN '{"error":"unauthorized"}'::jsonb; END IF;

  RETURN (
    WITH
    recent_cohorts AS (
      SELECT id AS user_id, created_at AS signup_at
      FROM profiles
      WHERE created_at >= now() - interval '8 weeks' AND created_at < now() - interval '4 weeks'
    ),
    d30_ret AS (
      SELECT round(
        count(DISTINCT CASE WHEN EXISTS(
          SELECT 1 FROM reading_validations rv
          WHERE rv.user_id = rc.user_id AND rv.validated_at::date - rc.signup_at::date BETWEEN 0 AND 30
        ) THEN rc.user_id END)::numeric / GREATEST(count(DISTINCT rc.user_id), 1) * 100, 1
      ) AS pct FROM recent_cohorts rc
    ),
    activation AS (
      SELECT round(
        (SELECT count(DISTINCT rv.user_id) FROM reading_validations rv WHERE rv.correct = true)::numeric
        / GREATEST((SELECT count(*) FROM profiles), 1) * 100, 1
      ) AS pct
    ),
    wau_mau AS (
      SELECT round(
        (SELECT count(DISTINCT user_id) FROM reading_validations WHERE validated_at >= now() - interval '7 days')::numeric
        / GREATEST((SELECT count(DISTINCT user_id) FROM reading_validations WHERE validated_at >= now() - interval '30 days'), 1) * 100, 1
      ) AS ratio
    ),
    social_density AS (
      SELECT round(
        (SELECT count(*) FROM followers)::numeric * 2 / GREATEST((SELECT count(*) FROM profiles), 1), 2
      ) AS avg_conn
    ),
    stale AS (
      SELECT count(*) AS cnt FROM (
        SELECT rp.book_id FROM reading_progress rp
        GROUP BY rp.book_id HAVING count(*) >= 3
        AND NOT EXISTS (
          SELECT 1 FROM reading_validations rv WHERE rv.book_id = rp.book_id AND rv.validated_at >= now() - interval '30 days'
        )
      ) x
    ),
    conv_trend AS (
      SELECT
        round((SELECT count(*) FILTER (WHERE is_premium) FROM profiles WHERE created_at >= now() - interval '4 weeks')::numeric
          / GREATEST((SELECT count(*) FROM profiles WHERE created_at >= now() - interval '4 weeks'), 1) * 100, 1) AS recent_conv,
        round((SELECT count(*) FILTER (WHERE is_premium) FROM profiles WHERE created_at >= now() - interval '8 weeks' AND created_at < now() - interval '4 weeks')::numeric
          / GREATEST((SELECT count(*) FROM profiles WHERE created_at >= now() - interval '8 weeks' AND created_at < now() - interval '4 weeks'), 1) * 100, 1) AS prev_conv
    )
    SELECT jsonb_build_object(
      'd30_pct', (SELECT pct FROM d30_ret),
      'activation_pct', (SELECT pct FROM activation),
      'wau_mau_ratio', (SELECT ratio FROM wau_mau),
      'avg_connections', (SELECT avg_conn FROM social_density),
      'stale_books', (SELECT cnt FROM stale),
      'recent_conv', (SELECT recent_conv FROM conv_trend),
      'prev_conv', (SELECT prev_conv FROM conv_trend)
    )
  );
END; $$;
