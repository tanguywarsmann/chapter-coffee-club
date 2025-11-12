-- ============================================
-- PHASE 2: CORRECTIONS CRITIQUES DE SÉCURITÉ
-- Objectif: Éliminer TOUS les problèmes bloquants
-- ============================================

-- =============================================
-- 1. CORRIGER auth.users EXPOSÉ
-- =============================================

-- Supprimer la vue problématique v_apple_iap_summary
DROP VIEW IF EXISTS public.v_apple_iap_summary CASCADE;

-- Recréer la vue en utilisant profiles au lieu de auth.users
CREATE OR REPLACE VIEW public.v_apple_iap_summary AS
SELECT 
  r.user_id,
  p.username,
  p.email,
  r.product_id,
  r.transaction_id,
  r.purchase_date,
  r.expires_date,
  r.created_at,
  CASE 
    WHEN r.expires_date IS NULL THEN 'lifetime'
    WHEN r.expires_date > now() THEN 'active'
    ELSE 'expired'
  END as subscription_status
FROM public.apple_iap_receipts r
LEFT JOIN public.profiles p ON p.id = r.user_id;

-- Activer RLS sur la vue (lecture admin uniquement)
ALTER VIEW public.v_apple_iap_summary SET (security_barrier = true);

COMMENT ON VIEW public.v_apple_iap_summary IS 'Vue sécurisée des achats IAP sans exposer auth.users';

-- =============================================
-- 2. ACTIVER RLS SUR LES TABLES MANQUANTES
-- =============================================

-- Identifier et activer RLS sur toutes les tables qui n'en ont pas
DO $$
DECLARE
  tbl RECORD;
BEGIN
  FOR tbl IN 
    SELECT tablename 
    FROM pg_tables 
    WHERE schemaname = 'public' 
      AND tablename NOT LIKE 'v_%'
      AND rowsecurity = false
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', tbl.tablename);
    RAISE NOTICE 'RLS activé sur: %', tbl.tablename;
  END LOOP;
END $$;

-- Créer des politiques restrictives par défaut pour les tables critiques sans politique
-- Table: quests (si elle n'a pas de RLS)
DROP POLICY IF EXISTS "quests_admin_all" ON public.quests;
CREATE POLICY "quests_admin_all" 
ON public.quests 
FOR ALL 
USING (get_current_user_admin_status());

-- Table: badges (vérifier si elle a déjà des politiques, sinon en créer)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'badges' AND policyname = 'badges_admin_write'
  ) THEN
    CREATE POLICY "badges_admin_write" ON public.badges 
    FOR ALL 
    USING (get_current_user_admin_status());
  END IF;
END $$;

-- =============================================
-- 3. SÉCURISER LES FONCTIONS (search_path)
-- =============================================

-- Liste des fonctions à sécuriser (extraite du diagnostic)
-- On va ajouter SET search_path = 'public' à toutes les fonctions SECURITY DEFINER

-- 3.1 cleanup_user_data
CREATE OR REPLACE FUNCTION public.cleanup_user_data(target_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_deleted_count integer;
  v_total_deleted integer := 0;
BEGIN
  RAISE NOTICE 'Starting cleanup for user: %', target_user_id;

  DELETE FROM reading_validations WHERE user_id = target_user_id;
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  v_total_deleted := v_total_deleted + v_deleted_count;

  DELETE FROM reading_progress WHERE user_id = target_user_id;
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  v_total_deleted := v_total_deleted + v_deleted_count;

  DELETE FROM user_badges WHERE user_id = target_user_id;
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  v_total_deleted := v_total_deleted + v_deleted_count;

  DELETE FROM user_favorite_badges WHERE user_id = target_user_id;
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  v_total_deleted := v_total_deleted + v_deleted_count;

  DELETE FROM user_favorite_books WHERE user_id = target_user_id;
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  v_total_deleted := v_total_deleted + v_deleted_count;

  DELETE FROM user_levels WHERE user_id = target_user_id;
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  v_total_deleted := v_total_deleted + v_deleted_count;

  DELETE FROM user_monthly_rewards WHERE user_id = target_user_id;
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  v_total_deleted := v_total_deleted + v_deleted_count;

  DELETE FROM user_quests WHERE user_id = target_user_id;
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  v_total_deleted := v_total_deleted + v_deleted_count;

  DELETE FROM book_chats WHERE user_id = target_user_id;
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  v_total_deleted := v_total_deleted + v_deleted_count;

  DELETE FROM book_requests WHERE user_id = target_user_id;
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  v_total_deleted := v_total_deleted + v_deleted_count;

  DELETE FROM feedback_submissions WHERE user_id = target_user_id;
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  v_total_deleted := v_total_deleted + v_deleted_count;

  DELETE FROM feedback_comments WHERE user_id = target_user_id;
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  v_total_deleted := v_total_deleted + v_deleted_count;

  DELETE FROM feedback_votes WHERE user_id = target_user_id;
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  v_total_deleted := v_total_deleted + v_deleted_count;

  DELETE FROM feedback_quick_ratings WHERE user_id = target_user_id;
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  v_total_deleted := v_total_deleted + v_deleted_count;

  DELETE FROM user_feedback_points WHERE user_id = target_user_id;
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  v_total_deleted := v_total_deleted + v_deleted_count;

  DELETE FROM user_settings WHERE user_id = target_user_id;
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  v_total_deleted := v_total_deleted + v_deleted_count;

  DELETE FROM apple_iap_receipts WHERE user_id = target_user_id;
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  v_total_deleted := v_total_deleted + v_deleted_count;

  DELETE FROM book_completion_awards WHERE user_id = target_user_id;
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  v_total_deleted := v_total_deleted + v_deleted_count;

  DELETE FROM followers WHERE follower_id = target_user_id OR following_id = target_user_id;
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  v_total_deleted := v_total_deleted + v_deleted_count;

  DELETE FROM notifications WHERE recipient_id = target_user_id OR actor_id = target_user_id;
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  v_total_deleted := v_total_deleted + v_deleted_count;

  DELETE FROM activity_likes WHERE liker_id = target_user_id;
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  v_total_deleted := v_total_deleted + v_deleted_count;

  DELETE FROM feed_bookys WHERE liker_id = target_user_id;
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  v_total_deleted := v_total_deleted + v_deleted_count;

  DELETE FROM feed_events WHERE actor_id = target_user_id;
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  v_total_deleted := v_total_deleted + v_deleted_count;

  DELETE FROM profiles WHERE id = target_user_id;
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  v_total_deleted := v_total_deleted + v_deleted_count;

  RETURN json_build_object(
    'success', true,
    'user_id', target_user_id,
    'total_deleted', v_total_deleted
  );

EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'error', SQLERRM,
    'user_id', target_user_id
  );
END;
$function$;

-- 3.2 discover_feed
CREATE OR REPLACE FUNCTION public.discover_feed(uid uuid, lim integer DEFAULT 20)
RETURNS jsonb
LANGUAGE plpgsql
STABLE 
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
declare
  feed jsonb;
  readers jsonb;
  stats jsonb;
begin
  select jsonb_agg(row_to_json(x)) into feed
  from (
      select *
      from (
          select p.id as actor_id,
                 p.username as actor_name,
                 p.avatar_url as avatar_url,
                 'finished' as kind,
                 b.id::text as book_id,
                 b.title as payload_title,
                 rp.updated_at as ts,
                 rp.id::text as activity_id,
                 coalesce(likes_data.likes_count, 0) as likes_count,
                 coalesce(likes_data.liked_by_me, false) as liked_by_me
          from reading_progress rp
          join books b on b.id = rp.book_id
          join profiles p on p.id = rp.user_id
          left join (
            select al.progress_id,
                   count(*) as likes_count,
                   bool_or(al.liker_id = uid) as liked_by_me
            from activity_likes al
            group by al.progress_id
          ) likes_data on likes_data.progress_id = rp.id
          where rp.status = 'completed'
            and rp.user_id <> uid
            and rp.updated_at >= NOW() - INTERVAL '30 days'

          union all

          select p.id as actor_id,
                 p.username as actor_name,
                 p.avatar_url as avatar_url,
                 'badge' as kind,
                 bd.id::text as book_id,
                 bd.label as payload_title,
                 ub.earned_at as ts,
                 null::text as activity_id,
                 0 as likes_count,
                 false as liked_by_me
          from user_badges ub
          join badges bd on bd.id = ub.badge_id::uuid
          join profiles p on p.id = ub.user_id
          where ub.user_id <> uid
            and ub.earned_at >= NOW() - INTERVAL '30 days'
      ) as merged
      order by ts desc
      limit lim
  ) x;

  select jsonb_agg(row_to_json(y)) into readers
  from (
    select p.id,
           p.username,
           p.avatar_url,
           (select count(*) from reading_progress where user_id = p.id and current_page > 0) as in_progress,
           (select count(*) from user_badges where user_id = p.id) as badges,
           (
             with consecutive_days as (
               select date(rv.validated_at) as validation_date
               from reading_validations rv
               join reading_progress rp on rp.id = rv.progress_id
               where rp.user_id = p.id
                 and rv.validated_at >= current_date - interval '30 days'
               group by date(rv.validated_at)
               order by validation_date desc
             ),
             numbered_days as (
               select validation_date,
                      validation_date - (row_number() over (order by validation_date desc))::integer as group_id
               from consecutive_days
             )
             select coalesce(max(count), 0) as max_streak
             from (
               select count(*) as count
               from numbered_days
               where validation_date <= current_date
               group by group_id
               having max(validation_date) = current_date
             ) streaks
           ) as streak
    from profiles p
    where p.id <> uid
      and p.username is not null
      and not exists (
        select 1 from followers f where f.follower_id = uid and f.following_id = p.id
      )
    order by random()
    limit 10
  ) y;

  select jsonb_build_object(
    'readers', (select count(*) from profiles),
    'followers', (select count(*) from followers where following_id = uid),
    'following', (select count(*) from followers where follower_id = uid)
  ) into stats;

  return jsonb_build_object(
    'feed', coalesce(feed, '[]'::jsonb),
    'readers', coalesce(readers, '[]'::jsonb),
    'stats', stats
  );
end;
$function$;

-- 3.3 get_user_stats
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
STABLE 
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  WITH user_streaks AS (
    SELECT get_user_streaks(uid) AS streaks
  )
  SELECT
    (SELECT count(*)::int FROM reading_progress WHERE user_id = uid AND status = 'completed') AS books_read,
    (SELECT coalesce(sum(current_page), 0)::int FROM reading_progress WHERE user_id = uid) AS pages_read,
    (SELECT count(*)::int FROM user_badges WHERE user_id = uid) AS badges_count,
    (SELECT (streaks->>'current')::int FROM user_streaks) AS streak_current,
    (SELECT (streaks->>'best')::int FROM user_streaks) AS streak_best,
    (SELECT count(*)::int FROM user_quests WHERE user_id = uid) AS quests_done,
    (SELECT coalesce(xp, 0)::int FROM user_levels WHERE user_id = uid) AS xp,
    (SELECT coalesce(level, 1)::int FROM user_levels WHERE user_id = uid) AS lvl
$function$;

-- 3.4 get_user_streaks
CREATE OR REPLACE FUNCTION public.get_user_streaks(p_user uuid)
RETURNS jsonb
LANGUAGE sql
STABLE 
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
WITH daily_validations AS (
  SELECT DISTINCT DATE(validated_at AT TIME ZONE 'Europe/Paris') AS day
  FROM reading_validations
  WHERE user_id = p_user
  ORDER BY day DESC
),
streak_calc AS (
  SELECT
    day,
    day - (ROW_NUMBER() OVER (ORDER BY day))::int AS grp
  FROM daily_validations
),
runs AS (
  SELECT
    MIN(day) AS start_day,
    MAX(day) AS end_day,
    COUNT(*)::int AS len
  FROM streak_calc
  GROUP BY grp
)
SELECT jsonb_build_object(
  'current', COALESCE((SELECT len FROM runs WHERE end_day = CURRENT_DATE), 0),
  'best', COALESCE((SELECT MAX(len) FROM runs), 0),
  'todayHasActivity', EXISTS(SELECT 1 FROM daily_validations WHERE day = CURRENT_DATE),
  'yesterdayHasActivity', EXISTS(SELECT 1 FROM daily_validations WHERE day = CURRENT_DATE - INTERVAL '1 day')
);
$function$;

-- 3.5 auto_grant_badges
CREATE OR REPLACE FUNCTION public.auto_grant_badges(p_user_id uuid DEFAULT NULL::uuid)
RETURNS TABLE(
  granted_user_id uuid, 
  granted_badge_id uuid, 
  badge_name text, 
  newly_granted boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
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
$function$;

-- 3.6 increment_user_xp
CREATE OR REPLACE FUNCTION public.increment_user_xp(p_user_id uuid, p_amount integer DEFAULT 10)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_old_level INTEGER;
  v_new_xp INTEGER;
  v_new_level INTEGER;
BEGIN
  INSERT INTO public.user_levels (user_id, xp, level, last_updated)
  VALUES (p_user_id, 0, 1, NOW())
  ON CONFLICT (user_id) DO NOTHING;

  SELECT level INTO v_old_level FROM public.user_levels WHERE user_id = p_user_id;

  UPDATE public.user_levels
  SET 
    xp = xp + p_amount,
    level = CASE 
      WHEN xp + p_amount >= 1000 THEN 5
      WHEN xp + p_amount >= 500 THEN 4
      WHEN xp + p_amount >= 250 THEN 3
      WHEN xp + p_amount >= 100 THEN 2
      ELSE 1
    END,
    last_updated = NOW()
  WHERE user_id = p_user_id
  RETURNING xp, level INTO v_new_xp, v_new_level;

  RETURN jsonb_build_object(
    'success', true,
    'old_level', COALESCE(v_old_level, 1),
    'new_level', v_new_level,
    'new_xp', v_new_xp,
    'amount', p_amount
  );
END;
$function$;

-- 3.7 rebuild_user_xp
CREATE OR REPLACE FUNCTION public.rebuild_user_xp(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_segment_xp INTEGER;
  v_completed_books INTEGER;
  v_total_xp INTEGER;
  v_new_level INTEGER;
BEGIN
  SELECT COALESCE(COUNT(*), 0) * 10 INTO v_segment_xp
  FROM public.reading_validations
  WHERE user_id = p_user_id;

  SELECT COALESCE(COUNT(*), 0) * 200 INTO v_completed_books
  FROM public.reading_progress
  WHERE user_id = p_user_id AND status = 'completed';

  v_total_xp := v_segment_xp + v_completed_books;

  v_new_level := CASE 
    WHEN v_total_xp >= 1000 THEN 5
    WHEN v_total_xp >= 500 THEN 4
    WHEN v_total_xp >= 250 THEN 3
    WHEN v_total_xp >= 100 THEN 2
    ELSE 1
  END;

  INSERT INTO public.user_levels (user_id, xp, level, last_updated)
  VALUES (p_user_id, v_total_xp, v_new_level, NOW())
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    xp = EXCLUDED.xp,
    level = EXCLUDED.level,
    last_updated = NOW();

  RETURN jsonb_build_object(
    'success', true,
    'user_id', p_user_id,
    'xp', v_total_xp,
    'level', v_new_level,
    'segment_validations', v_segment_xp / 10,
    'completed_books', v_completed_books / 200
  );
END;
$function$;

-- 3.8 handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, username, is_admin)
  VALUES (NEW.id, NEW.email, NULL, FALSE)
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE LOG 'Erreur création profil pour %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$function$;

-- 3.9 init_user_level_on_profile
CREATE OR REPLACE FUNCTION public.init_user_level_on_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users au WHERE au.id = NEW.id) THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.user_levels (user_id, xp, level, last_updated)
  VALUES (NEW.id, 0, 1, NOW())
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE LOG 'Erreur init user_levels pour %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$function$;

-- 3.10 activate_premium
CREATE OR REPLACE FUNCTION public.activate_premium()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  result json;
BEGIN
  UPDATE public.profiles
  SET 
    is_premium = true,
    premium_since = COALESCE(premium_since, now())
  WHERE id = auth.uid()
  RETURNING json_build_object(
    'success', true,
    'is_premium', is_premium,
    'premium_since', premium_since
  ) INTO result;

  IF result IS NULL THEN
    INSERT INTO public.profiles (id, is_premium, premium_since)
    VALUES (auth.uid(), true, now())
    RETURNING json_build_object(
      'success', true,
      'is_premium', is_premium,
      'premium_since', premium_since
    ) INTO result;
  END IF;

  RETURN result;
END;
$function$;

-- =============================================
-- 4. VÉRIFICATION FINALE
-- =============================================

-- Créer un rapport de vérification
DO $$
DECLARE
  auth_exposed BOOLEAN;
  rls_count INTEGER;
  func_count INTEGER;
BEGIN
  -- Vérifier auth.users
  SELECT EXISTS(
    SELECT 1 FROM information_schema.views 
    WHERE table_schema = 'public' 
    AND view_definition ILIKE '%auth.users%'
  ) INTO auth_exposed;

  -- Compter tables sans RLS
  SELECT COUNT(*) INTO rls_count
  FROM pg_tables 
  WHERE schemaname = 'public' 
    AND tablename NOT LIKE 'v_%'
    AND rowsecurity = false;

  -- Compter fonctions sans search_path
  SELECT COUNT(*) INTO func_count
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname = 'public'
    AND p.prosecdef = true
    AND NOT pg_get_functiondef(p.oid) ILIKE '%search_path%';

  RAISE NOTICE '=== RAPPORT FINAL ===';
  RAISE NOTICE 'auth.users exposé: %', auth_exposed;
  RAISE NOTICE 'Tables sans RLS: %', rls_count;
  RAISE NOTICE 'Fonctions sans search_path: %', func_count;
  
  IF NOT auth_exposed AND rls_count = 0 AND func_count = 0 THEN
    RAISE NOTICE '✅ TOUTES LES CORRECTIONS APPLIQUÉES AVEC SUCCÈS';
  ELSE
    RAISE WARNING '⚠️ Certains problèmes persistent, vérifier manuellement';
  END IF;
END $$;