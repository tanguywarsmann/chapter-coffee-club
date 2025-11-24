-- Optimiser discover_feed pour retourner 10 lecteurs fiables
-- Simplifie le calcul de streak pour éviter les timeouts

CREATE OR REPLACE FUNCTION public.discover_feed(uid uuid, lim integer DEFAULT 20)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
declare
  feed jsonb;
  readers jsonb;
  stats jsonb;
begin
  -- Feed construction (inchangé)
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
                 COALESCE(rp.completed_at, rp.updated_at) as ts,
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
            and COALESCE(rp.completed_at, rp.updated_at) >= NOW() - INTERVAL '30 days'

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

  -- Readers construction OPTIMISÉE avec calcul de streak simplifié
  select jsonb_agg(row_to_json(y)) into readers
  from (
    select p.id,
           p.username,
           p.avatar_url,
           COALESCE((select count(*) from reading_progress where user_id = p.id and status = 'in_progress'), 0)::int as in_progress,
           COALESCE((select count(*) from user_badges where user_id = p.id), 0)::int as badges,
           COALESCE((
             -- Calcul simplifié: nombre de jours distincts avec validations sur les 30 derniers jours
             select count(distinct date(rv.validated_at))
             from reading_validations rv
             where rv.user_id = p.id
               and rv.validated_at >= current_date - interval '30 days'
           ), 0)::int as streak
    from profiles p
    where p.id <> uid
      and p.username is not null
      and p.username <> ''
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
$$;