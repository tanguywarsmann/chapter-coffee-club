-- Tighten profiles table RLS to protect email addresses and add safe public profile RPCs

-- 1) Drop overly-permissive public read policy on profiles
DROP POLICY IF EXISTS "Allow read of profiles" ON public.profiles;

-- 2) Allow users to read ONLY their own profile rows
CREATE POLICY "Users can read their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- Keep existing INSERT/UPDATE policies as-is (already present in DB)

-- 3) Add SECURITY DEFINER RPCs that expose only non-sensitive public fields
-- Single profile (no email)
CREATE OR REPLACE FUNCTION public.get_public_profile(target_id uuid)
RETURNS TABLE (
  id uuid,
  username text,
  avatar_url text,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT p.id, p.username, p.avatar_url, p.created_at
  FROM public.profiles p
  WHERE p.id = target_id
$$;

-- Multiple profiles by ids (no email)
CREATE OR REPLACE FUNCTION public.get_public_profiles_for_ids(ids uuid[])
RETURNS TABLE (
  id uuid,
  username text,
  avatar_url text,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT p.id, p.username, p.avatar_url, p.created_at
  FROM public.profiles p
  WHERE p.id = ANY(ids)
$$;

-- 4) Ensure discover_feed function can access profiles despite stricter RLS
-- Recreate discover_feed as SECURITY DEFINER (same logic, just with definer)
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