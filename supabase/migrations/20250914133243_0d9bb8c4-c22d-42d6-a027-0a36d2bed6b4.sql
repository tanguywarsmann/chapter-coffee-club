begin;

-- Like = Laurier
create table if not exists public.activity_likes (
  id uuid primary key default gen_random_uuid(),
  progress_id uuid not null references public.reading_progress(id) on delete cascade,
  liker_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (progress_id, liker_id)
);
alter table public.activity_likes enable row level security;

create policy "likes_select_all_auth"
on public.activity_likes for select
using (auth.role() = 'authenticated');

create policy "likes_insert_own"
on public.activity_likes for insert
with check (auth.uid() = liker_id);

create policy "likes_delete_own"
on public.activity_likes for delete
using (auth.uid() = liker_id);

-- Enum + table notifications
do $$
begin
  if not exists (select 1 from pg_type where typname = 'notification_type') then
    create type public.notification_type as enum ('friend_finished','laurier_received');
  elsif not exists (select 1 from pg_enum where enumlabel='laurier_received' and enumtypid='notification_type'::regtype) then
    alter type public.notification_type add value if not exists 'laurier_received';
  end if;
end$$;

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  actor_id uuid not null references public.profiles(id) on delete cascade,
  type public.notification_type not null,
  progress_id uuid references public.reading_progress(id) on delete cascade,
  book_id text,
  book_title text,
  created_at timestamptz not null default now(),
  read_at timestamptz
);
alter table public.notifications enable row level security;

create index if not exists idx_notifications_recipient on public.notifications(recipient_id, created_at desc);

create policy "notifications_select_own"
on public.notifications for select
using (auth.uid() = recipient_id);

create policy "notifications_update_read_own"
on public.notifications for update
using (auth.uid() = recipient_id)
with check (auth.uid() = recipient_id);

-- Trigger: à la création d'un Laurier, notifier l'auteur du progress
create or replace function public.notify_laurier_received() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  target_user uuid;
  b_id text;
  b_title text;
begin
  select rp.user_id, rp.book_id, b.title
    into target_user, b_id, b_title
  from public.reading_progress rp
  join public.books b on b.id = rp.book_id
  where rp.id = new.progress_id;

  if target_user is null or target_user = new.liker_id then
    return new;
  end if;

  insert into public.notifications(recipient_id, actor_id, type, progress_id, book_id, book_title)
  values (target_user, new.liker_id, 'laurier_received', new.progress_id, b_id, b_title);

  return new;
end $$;

drop trigger if exists trg_activity_laurier on public.activity_likes;
create trigger trg_activity_laurier
after insert on public.activity_likes
for each row execute procedure public.notify_laurier_received();

-- Trigger: quand un livre passe à completed, notifier tous les followers
create or replace function public.notify_followers_on_completion() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  b_title text;
begin
  if new.status = 'completed' and coalesce(old.status, '') <> 'completed' then
    select title into b_title from public.books where id = new.book_id;

    insert into public.notifications(recipient_id, actor_id, type, progress_id, book_id, book_title)
    select f.follower_id, new.user_id, 'friend_finished', new.id, new.book_id, b_title
    from public.followers f
    where f.following_id = new.user_id
      and f.follower_id <> new.user_id;
  end if;
  return new;
end $$;

drop trigger if exists trg_notify_completion on public.reading_progress;
create trigger trg_notify_completion
after update on public.reading_progress
for each row when (old.status is distinct from new.status)
execute procedure public.notify_followers_on_completion();

-- Update discover_feed to include likes info
create or replace function public.discover_feed(uid uuid, lim integer default 20)
returns jsonb
language plpgsql
stable security definer
set search_path = public
as $$
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
                 rp.updated_at as ts,
                 rp.id::text as activity_id,
                 coalesce(likes_data.likes_count, 0) as likes_count,
                 coalesce(likes_data.liked_by_me, false) as liked_by_me
          from reading_progress rp
          join books    b on b.id = rp.book_id
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

          /* badge gagné */
          select p.id        as actor_id,
                 p.username  as actor_name,
                 p.avatar_url as avatar_url,
                 'badge'     as kind,
                 bd.id::text as book_id,
                 bd.label    as payload_title,
                 ub.earned_at as ts,
                 null::text as activity_id,
                 0 as likes_count,
                 false as liked_by_me
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
$$;

commit;