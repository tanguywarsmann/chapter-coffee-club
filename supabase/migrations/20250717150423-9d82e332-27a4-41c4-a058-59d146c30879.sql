
-- Fonction principale : feed + compteurs en un appel
create or replace function public.discover_feed(uid uuid, lim int default 20)
returns jsonb
language plpgsql stable
as $$
declare
  feed jsonb;
  readers jsonb;
  stats jsonb;
begin
  /* ACTIVITÉ */
  select jsonb_agg(row_to_json(x)) into feed
  from (
      /* livre terminé */
      select p.id        as actor_id,
             p.username  as actor_name,
             '/placeholder.svg'::text as avatar_url,
             'finished'  as kind,
             b.id        as book_id,
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
      select p.id,
             p.username,
             '/placeholder.svg'::text as avatar_url,
             'badge',
             bd.id,
             bd.label,
             ub.earned_at
      from user_badges ub
      join badges   bd on bd.id = ub.badge_id::uuid
      join profiles p  on p.id = ub.user_id
      where ub.user_id <> uid
        and ub.earned_at >= NOW() - INTERVAL '30 days'
  ) x
  order by ts desc
  limit lim;

  /* LECTEURS À DÉCOUVRIR (non suivis) */
  select jsonb_agg(row_to_json(y)) into readers
  from (
    select p.id,
           p.username,
           '/placeholder.svg'::text as avatar_url,
           /* sous-requêtes compactes */
           (select count(*) from reading_progress where user_id = p.id and status = 'in_progress') as in_progress,
           (select count(*) from user_badges       where user_id = p.id)                            as badges,
           coalesce((select max(streak_current) from reading_progress where user_id = p.id),0)     as streak
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
    'readers',       (select count(*) from profiles where username is not null),
    'followers',     (select count(*) from followers where following_id = uid),
    'following',     (select count(*) from followers where follower_id  = uid)
  ) into stats;

  return jsonb_build_object(
    'feed',    coalesce(feed, '[]'::jsonb),
    'readers', coalesce(readers, '[]'::jsonb),
    'stats',   stats
  );
end;
$$;
