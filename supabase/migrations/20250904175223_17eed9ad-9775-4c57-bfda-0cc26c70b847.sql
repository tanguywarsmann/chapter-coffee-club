-- Restaurer toutes les fonctions à SECURITY DEFINER

CREATE OR REPLACE FUNCTION public.get_public_profile(target_id uuid)
 RETURNS TABLE(id uuid, username text, avatar_url text, created_at timestamp with time zone)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT p.id, p.username, p.avatar_url, p.created_at
  FROM public.profiles p
  WHERE p.id = target_id
$function$;

CREATE OR REPLACE FUNCTION public.get_public_profiles_for_ids(ids uuid[])
 RETURNS TABLE(id uuid, username text, avatar_url text, created_at timestamp with time zone)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT p.id, p.username, p.avatar_url, p.created_at
  FROM public.profiles p
  WHERE p.id = ANY(ids)
$function$;

CREATE OR REPLACE FUNCTION public.get_public_profile_safe(target_user_id uuid)
 RETURNS TABLE(id uuid, username text, avatar_url text, created_at timestamp with time zone)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT p.id, p.username, p.avatar_url, p.created_at
  FROM public.profiles p
  WHERE p.id = target_user_id
    AND p.username IS NOT NULL 
    AND p.username != '';
$function$;

CREATE OR REPLACE FUNCTION public.get_all_public_profiles(profile_limit integer DEFAULT 55)
 RETURNS TABLE(id uuid, username text, avatar_url text, created_at timestamp with time zone)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT p.id, p.username, p.avatar_url, p.created_at
  FROM public.profiles p
  WHERE p.username IS NOT NULL 
    AND p.username != ''
  ORDER BY p.created_at DESC
  LIMIT profile_limit;
$function$;

CREATE OR REPLACE FUNCTION public.get_activity_feed(uid uuid, lim integer DEFAULT 20)
 RETURNS TABLE(actor_id uuid, actor_name text, actor_avatar text, kind text, payload_id text, payload_title text, posted_at timestamp with time zone)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  -- Livres terminés
  SELECT
    p.id as actor_id,
    p.username as actor_name,
    '/placeholder.svg'::text as actor_avatar,
    'finished'::text as kind,
    rp.book_id as payload_id,
    b.title as payload_title,
    rp.updated_at as posted_at
  FROM reading_progress rp
  JOIN books b ON b.id = rp.book_id
  JOIN profiles p ON p.id = rp.user_id
  WHERE rp.status = 'completed'
    AND rp.user_id <> uid
    AND rp.updated_at >= NOW() - INTERVAL '30 days'

  UNION ALL
  
  -- Badges gagnés
  SELECT
    p.id as actor_id,
    p.username as actor_name,
    '/placeholder.svg'::text as actor_avatar,
    'badge'::text as kind,
    ub.badge_id::text as payload_id,
    bd.label as payload_title,
    ub.earned_at as posted_at
  FROM user_badges ub
  JOIN badges bd ON bd.id = ub.badge_id::uuid
  JOIN profiles p ON p.id = ub.user_id
  WHERE ub.user_id <> uid
    AND ub.earned_at >= NOW() - INTERVAL '30 days'

  UNION ALL
  
  -- Nouveaux livres commencés
  SELECT
    p.id as actor_id,
    p.username as actor_name,
    '/placeholder.svg'::text as actor_avatar,
    'started'::text as kind,
    rp.book_id as payload_id,
    b.title as payload_title,
    rp.started_at as posted_at
  FROM reading_progress rp
  JOIN books b ON b.id = rp.book_id
  JOIN profiles p ON p.id = rp.user_id
  WHERE rp.status = 'in_progress'
    AND rp.user_id <> uid
    AND rp.started_at >= NOW() - INTERVAL '7 days'

  ORDER BY posted_at DESC
  LIMIT lim;
$function$;

CREATE OR REPLACE FUNCTION public.get_user_stats(uid uuid)
 RETURNS TABLE(books_read integer, pages_read integer, badges_count integer, streak_current integer, streak_best integer, quests_done integer, xp integer, lvl integer)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select
    /* Livres terminés */
    (select count(*)::int
       from reading_progress
      where user_id = uid
        and status   = 'completed')                                  as books_read,

    /* Pages lues en temps réel (= somme des current_page) */
    (select coalesce(sum(current_page),0)::int
       from reading_progress
      where user_id = uid)                                           as pages_read,

    /* Badges */
    (select count(*)::int
       from user_badges
      where user_id = uid)                                           as badges_count,

    /* Streaks */
    (select coalesce(max(streak_current),0)::int
       from reading_progress
      where user_id = uid)                                           as streak_current,

    (select coalesce(max(streak_best),0)::int
       from reading_progress
      where user_id = uid)                                           as streak_best,

    /* Quêtes accomplies */
    (select count(*)::int
       from user_quests
      where user_id = uid)                                           as quests_done,

    /* XP & Niveau */
    (select coalesce(xp,0)::int  from user_levels where user_id = uid) as xp,
    (select coalesce(level,1)::int from user_levels where user_id = uid) as lvl
$function$;

CREATE OR REPLACE FUNCTION public.discover_feed(uid uuid, lim integer DEFAULT 20)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  feed jsonb;
  readers jsonb;
  stats jsonb;
begin
  /* ACTIVITÉ */
  select jsonb_agg(row_to_json(x)) into feed
  from (
      select *
      from (
          /* livre terminé */
          select p.id        as actor_id,
                 p.username  as actor_name,
                 p.avatar_url as avatar_url,
                 'finished'  as kind,
                 b.id::text  as book_id,
                 b.title     as payload_title,
                 rp.updated_at as ts
          from reading_progress rp
          join books    b on b.id = rp.book_id
          join profiles p on p.id = rp.user_id
          where rp.status = 'completed'
            and rp.user_id <> uid
            and rp.updated_at >= NOW() - INTERVAL '30 days'

          union all

          /* badge gagné */
          select p.id        as actor_id,
                 p.username  as actor_name,
                 p.avatar_url as avatar_url,
                 'badge'     as kind,
                 bd.id::text as book_id,
                 bd.label    as payload_title,
                 ub.earned_at as ts
          from user_badges ub
          join badges   bd on bd.id = ub.badge_id::uuid
          join profiles p  on p.id = ub.user_id
          where ub.user_id <> uid
            and ub.earned_at >= NOW() - INTERVAL '30 days'
      ) as merged
      order by ts desc
      limit lim
  ) x;

  /* LECTEURS À DÉCOUVRIR (non suivis) */
  select jsonb_agg(row_to_json(y)) into readers
  from (
    select p.id,
           p.username,
           p.avatar_url,
           /* in_progress */
           (select count(*) from reading_progress where user_id = p.id and current_page > 0) as in_progress,
           /* Badges */
           (select count(*) from user_badges where user_id = p.id) as badges,
           /* streak basé sur reading_validations */
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

  /* STATISTIQUES COMMUNAUTÉ */
  select jsonb_build_object(
    'readers',   (select count(*) from profiles where username is not null),
    'followers', (select count(*) from followers where following_id = uid),
    'following', (select count(*) from followers where follower_id  = uid)
  ) into stats;

  return jsonb_build_object(
    'feed',    coalesce(feed, '[]'::jsonb),
    'readers', coalesce(readers, '[]'::jsonb),
    'stats',   stats
  );
end;
$function$;